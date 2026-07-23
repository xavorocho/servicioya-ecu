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
      select: { id: true, name: true, email: true, role: true, phone: true, city: true, status: true, providerId: true, profileImage: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/profile/image", authenticate, (req, res) => {
  profileUpload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    try {
      if (!req.file) return res.status(400).json({ error: "Imagen requerida" });
      const imageUrl = req.file.path || req.file.filename;
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
