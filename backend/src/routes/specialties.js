import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/pending", authenticate, authorize("admin"), async (req, res) => {
  try {
    const specialties = await prisma.pendingSpecialty.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(specialties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/approve", authenticate, authorize("admin"), async (req, res) => {
  try {
    const specialty = await prisma.pendingSpecialty.findUnique({ where: { id: req.params.id } });
    if (!specialty) return res.status(404).json({ error: "No encontrada" });

    const slug = specialty.specialtyName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    
    const category = await prisma.category.create({
      data: {
        slug,
        name: specialty.specialtyName,
        description: `Categoría creada a partir de especialidad personalizada`,
        icon: "wrench",
        active: true,
      },
    });

    await prisma.provider.update({
      where: { userEmail: specialty.providerEmail },
      data: { categoryId: category.id, category: slug, categoryName: category.name },
    });

    await prisma.pendingSpecialty.update({
      where: { id: req.params.id },
      data: { status: "aprobada", reviewedAt: new Date(), associatedCategoryId: category.id },
    });

    res.json({ message: "Especialidad aprobada y categoría creada", category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/associate", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { categoryId } = req.body;
    const specialty = await prisma.pendingSpecialty.findUnique({ where: { id: req.params.id } });
    if (!specialty) return res.status(404).json({ error: "No encontrada" });

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return res.status(404).json({ error: "Categoría no encontrada" });

    await prisma.provider.update({
      where: { userEmail: specialty.providerEmail },
      data: { categoryId: category.id, category: category.slug, categoryName: category.name },
    });

    await prisma.pendingSpecialty.update({
      where: { id: req.params.id },
      data: { status: "asociada", reviewedAt: new Date(), associatedCategoryId: categoryId },
    });

    res.json({ message: "Especialidad asociada a categoría existente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/reject", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { reason } = req.body;
    await prisma.pendingSpecialty.update({
      where: { id: req.params.id },
      data: { status: "rechazada", reviewedAt: new Date(), adminNote: reason || "" },
    });
    res.json({ message: "Especialidad rechazada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
