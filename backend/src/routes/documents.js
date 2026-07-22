import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const docs = await prisma.providerDocument.findMany({
      include: { provider: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/pending", authenticate, authorize("admin"), async (req, res) => {
  try {
    const docs = await prisma.providerDocument.findMany({
      where: { reviewStatus: "Pendiente" },
      include: { provider: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my-documents", authenticate, authorize("proveedor"), async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
    if (!provider) return res.json([]);
    const docs = await prisma.providerDocument.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticate, authorize("proveedor"), async (req, res) => {
  try {
    const { documentType, filePath, originalName } = req.body;
    if (!documentType || !filePath) return res.status(400).json({ error: "documentType y filePath requeridos" });

    const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
    if (!provider) return res.status(404).json({ error: "Proveedor no encontrado" });

    const doc = await prisma.providerDocument.create({
      data: {
        providerId: provider.id,
        documentType,
        filePath,
        originalName: originalName || "",
        reviewStatus: "Pendiente",
      },
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/review", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { reviewStatus, rejectionReason } = req.body;
    if (!["Aprobado", "Rechazado"].includes(reviewStatus)) return res.status(400).json({ error: "reviewStatus debe ser Aprobado o Rechazado" });

    const doc = await prisma.providerDocument.update({
      where: { id: req.params.id },
      data: {
        reviewStatus,
        reviewedBy: req.user.email,
        reviewedAt: new Date(),
        rejectionReason: rejectionReason || null,
      },
    });

    if (reviewStatus === "Rechazado") {
      await prisma.provider.update({ where: { id: doc.providerId }, data: { status: "Rechazada" } });
    }

    const allDocs = await prisma.providerDocument.findMany({ where: { providerId: doc.providerId } });
    const allApproved = allDocs.length >= 3 && allDocs.every((d) => d.reviewStatus === "Aprobado");
    if (allApproved) {
      await prisma.provider.update({ where: { id: doc.providerId }, data: { status: "Aprobado", verified: true } });
      await prisma.user.update({ where: { email: (await prisma.provider.findUnique({ where: { id: doc.providerId } })).userEmail }, data: { status: "Aprobado" } });
    }

    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
