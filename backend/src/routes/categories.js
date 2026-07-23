import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/all", authenticate, authorize("admin"), async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { slug, name, description, icon, color, active } = req.body;
    if (!name) return res.status(400).json({ error: "Nombre requerido" });
    const autoSlug = slug || name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const category = await prisma.category.create({ data: { slug: autoSlug, name, description: description || "", icon: icon || "wrench", color: color || "from-blue-500 to-cyan-500", active: active !== undefined ? active : true } });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, description, icon, color, active } = req.body;
    const category = await prisma.category.update({ where: { id: req.params.id }, data: { ...(name && { name }), ...(description !== undefined && { description }), ...(icon && { icon }), ...(color && { color }), ...(active !== undefined && { active }) } });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: "Categoría eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
