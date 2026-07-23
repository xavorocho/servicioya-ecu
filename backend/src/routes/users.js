import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";

let profileStorage;
if (isProduction) {
  const { CloudinaryStorage } = await import("multer-storage-cloudinary");
  const cloudinary = (await import("cloudinary")).default;
  profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
      folder: "servicioya/perfiles",
      allowed_formats: ["jpg", "jpeg", "png"],
      public_id: () => uuidv4(),
    },
  });
} else {
  profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "..", "..", "uploads"));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `profile-${uuidv4()}${ext}`);
    },
  });
}

const profileUpload = multer({
  storage: profileStorage,
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("profileImage");

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, phone: true, city: true, status: true, providerId: true, profileImage: true, emailVerified: true, authProvider: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const ADMIN_ROLES = new Set(["cliente", "proveedor", "admin"]);
const ADMIN_STATUSES = new Set(["Activo", "Suspendido", "Bloqueado"]);

router.put("/:id/status", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!ADMIN_STATUSES.has(status)) return res.status(400).json({ error: "Estado no permitido" });
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: "Usuario no encontrado" });
    if (target.id === req.user.id && status !== "Activo") return res.status(400).json({ error: "No puedes suspender o bloquear tu propia cuenta" });
    if (target.role === "admin" && status !== "Activo") {
      const activeAdmins = await prisma.user.count({ where: { role: "admin", status: "Activo" } });
      if (activeAdmins <= 1) return res.status(400).json({ error: "Debe permanecer al menos un administrador activo" });
    }

    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: target.id },
        data: { status },
        select: { id: true, name: true, email: true, role: true, phone: true, city: true, status: true, providerId: true, profileImage: true, emailVerified: true, createdAt: true },
      });
      if (target.providerId && status !== "Activo") {
        await tx.provider.updateMany({ where: { id: target.providerId }, data: { available: false } });
      }
      return updated;
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/role", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!ADMIN_ROLES.has(role)) return res.status(400).json({ error: "Rol no permitido" });
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: "Usuario no encontrado" });
    if (target.id === req.user.id && role !== "admin") return res.status(400).json({ error: "No puedes retirar tu propio rol de administrador" });
    if (role === "proveedor" && !target.providerId) return res.status(400).json({ error: "El usuario debe completar primero su perfil de proveedor" });
    if (target.role === "admin" && role !== "admin") {
      const admins = await prisma.user.count({ where: { role: "admin", status: "Activo" } });
      if (admins <= 1) return res.status(400).json({ error: "Debe permanecer al menos un administrador activo" });
    }

    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: target.id },
        data: { role },
        select: { id: true, name: true, email: true, role: true, phone: true, city: true, status: true, providerId: true, profileImage: true, emailVerified: true, createdAt: true },
      });
      if (target.providerId && role !== "proveedor") {
        await tx.provider.updateMany({ where: { id: target.providerId }, data: { available: false } });
      }
      return updated;
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/verification", authenticate, authorize("admin"), async (req, res) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: "Usuario no encontrado" });
    const verified = req.body.emailVerified === true;
    const user = await prisma.user.update({
      where: { id: target.id },
      data: { emailVerified: verified, verificationToken: null, verificationExpiresAt: null, ...(verified && target.status === "Pendiente de verificación" ? { status: "Activo" } : {}) },
      select: { id: true, name: true, email: true, role: true, phone: true, city: true, status: true, providerId: true, profileImage: true, emailVerified: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/profile/image", authenticate, (req, res) => {
  profileUpload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    try {
      if (!req.file) return res.status(400).json({ error: "Imagen requerida" });
      const imageUrl = req.file.path?.startsWith("http") ? req.file.path : req.file.filename;
      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { profileImage: imageUrl },
      });
      res.json({ profileImage: user.profileImage });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
});

router.put("/profile", authenticate, async (req, res) => {
  try {
    const { name, phone, city } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, city },
      select: { id: true, name: true, email: true, role: true, phone: true, city: true, status: true, profileImage: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
