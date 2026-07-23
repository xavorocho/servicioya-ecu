import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";
import { uploadFields } from "../middleware/upload.js";

const router = Router();
const prisma = new PrismaClient();

const CATEGORIES = [
  { id: "plomeria", name: "Plomería", icon: "wrench" },
  { id: "electricidad", name: "Electricidad", icon: "bolt" },
  { id: "limpieza", name: "Limpieza", icon: "broom" },
  { id: "pintura", name: "Pintura", icon: "paint-roller" },
  { id: "carpinteria", name: "Carpintería", icon: "hammer" },
  { id: "jardineria", name: "Jardinería", icon: "seedling" },
  { id: "electrodomesticos", name: "Electrodomésticos", icon: "plug" },
  { id: "mudanzas", name: "Mudanzas", icon: "truck" },
  { id: "cerrajeria", name: "Cerrajería", icon: "key" },
  { id: "cuidado", name: "Cuidado del hogar", icon: "house-user" },
];

function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || { id, name: id };
}

router.get("/categories", (req, res) => {
  res.json(CATEGORIES);
});

router.get("/", async (req, res) => {
  try {
    const providers = await prisma.provider.findMany({
      where: { status: "Aprobado" },
      orderBy: { rating: "desc" },
    });
    const mapped = providers.map((p) => ({ ...p, services: JSON.parse(p.services || "[]"), documents: JSON.parse(p.documents || "{}"), comments: JSON.parse(p.comments || "[]") }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/all", authenticate, authorize("admin"), async (req, res) => {
  try {
    const providers = await prisma.provider.findMany({ orderBy: { createdAt: "desc" } });
    const mapped = providers.map((p) => ({ ...p, services: JSON.parse(p.services || "[]"), documents: JSON.parse(p.documents || "{}"), comments: JSON.parse(p.comments || "[]") }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/pending", authenticate, authorize("admin"), async (req, res) => {
  try {
    const providers = await prisma.provider.findMany({
      where: { status: "Pendiente" },
      orderBy: { createdAt: "desc" },
    });
    const mapped = providers.map((p) => ({ ...p, services: JSON.parse(p.services || "[]"), documents: JSON.parse(p.documents || "{}"), comments: JSON.parse(p.comments || "[]") }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", authenticate, authorize("proveedor"), async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
    if (!provider) return res.status(404).json({ error: "Perfil de proveedor no encontrado" });
    res.json({ ...provider, services: JSON.parse(provider.services || "[]"), documents: JSON.parse(provider.documents || "{}"), comments: JSON.parse(provider.comments || "[]") });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { id: req.params.id } });
    if (!provider || provider.status !== "Aprobado") return res.status(404).json({ error: "Proveedor no encontrado" });
    res.json({ ...provider, services: JSON.parse(provider.services || "[]"), documents: JSON.parse(provider.documents || "{}"), comments: JSON.parse(provider.comments || "[]") });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getFileUrl(file) {
  if (!file) return "No adjuntado";
  if (file.path) return file.path;
  return file.filename || "No adjuntado";
}

router.put("/register", authenticate, authorize("proveedor"), uploadFields, async (req, res) => {
  try {
    const { category, sector, experience, price, description } = req.body;
    const isCustom = category === "otra";
    const cat = isCustom ? { id: "otra", name: req.body.customCategory || "Otra especialidad" } : getCategory(category);
    const files = req.files || {};

    const docData = {
      cedula: getFileUrl(files.docCedula?.[0]),
      antecedentes: getFileUrl(files.docAntecedentes?.[0]),
      oficio: getFileUrl(files.docOficio?.[0]),
      ruc: getFileUrl(files.docRuc?.[0]),
    };

    const provider = await prisma.provider.upsert({
      where: { userEmail: req.user.email },
      update: {
        category: cat.id,
        categoryName: cat.name,
        sector,
        experience: `${experience} años de experiencia`,
        price: Number(price) || 0,
        description,
        documents: JSON.stringify(docData),
      },
      create: {
        userEmail: req.user.email,
        name: req.user.name,
        category: cat.id,
        categoryName: cat.name,
        city: req.body.city || "",
        sector: sector || "",
        price: Number(price) || 0,
        experience: `${experience || 0} años de experiencia`,
        phone: req.body.phone || "",
        description: description || "",
        services: JSON.stringify([cat.name, "Servicio por confirmar", "Atención bajo solicitud"]),
        documents: JSON.stringify(docData),
      },
    });

    await prisma.user.update({
      where: { email: req.user.email },
      data: { status: "Pendiente", providerId: provider.id },
    });

    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/profile", authenticate, authorize("proveedor"), async (req, res) => {
  try {
    const { name, category, sector, price, available, phone, description } = req.body;
    const cat = getCategory(category);
    const current = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
    if (!current) return res.status(404).json({ error: "Proveedor no encontrado" });

    const provider = await prisma.provider.update({
      where: { userEmail: req.user.email },
      data: {
        name,
        category: cat.id,
        categoryName: cat.name,
        sector,
        price: Number(price),
        available: available === "true" && current.status === "Aprobado",
        phone,
        description,
      },
    });
    res.json({ ...provider, services: JSON.parse(provider.services || "[]"), documents: JSON.parse(provider.documents || "{}"), comments: JSON.parse(provider.comments || "[]") });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/approve", authenticate, authorize("admin"), async (req, res) => {
  try {
    const provider = await prisma.provider.update({
      where: { id: req.params.id },
      data: { status: "Aprobado", verified: true, available: true, rating: 4.5, reviews: 1 },
    });
    await prisma.user.update({
      where: { email: provider.userEmail },
      data: { status: "Aprobado", providerId: provider.id },
    });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/reject", authenticate, authorize("admin"), async (req, res) => {
  try {
    const provider = await prisma.provider.update({
      where: { id: req.params.id },
      data: { status: "Rechazada", verified: false, available: false },
    });
    await prisma.user.update({
      where: { email: provider.userEmail },
      data: { status: "Rechazada" },
    });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
