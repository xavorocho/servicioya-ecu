import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();
const prisma = new PrismaClient();
const evidenceUpload = upload.array("evidence", 10);

router.post("/:requestId", authenticate, authorize("proveedor"), evidenceUpload, async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });
    
    const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
    if (!provider || request.providerId !== provider.id) {
      return res.status(403).json({ error: "No autorizado" });
    }
    if (request.status !== "en_proceso") return res.status(400).json({ error: "Solo puedes adjuntar evidencias mientras el trabajo está en proceso" });
    if (!req.files?.length) return res.status(400).json({ error: "Selecciona al menos una evidencia" });
    if (req.files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.mimetype))) return res.status(400).json({ error: "Las evidencias deben ser JPG, PNG o WEBP" });

    const evidenceUrls = (req.files || []).map(f => f.path || f.filename);
    const existing = JSON.parse(request.evidence || "[]");
    const updated = await prisma.request.update({
      where: { id: requestId },
      data: { evidence: JSON.stringify([...existing, ...evidenceUrls]) },
    });
    res.json({ evidence: [...existing, ...evidenceUrls] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:requestId", authenticate, async (req, res) => {
  try {
    const request = await prisma.request.findUnique({ where: { id: req.params.requestId } });
    if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });
    const provider = req.user.role === "proveedor" ? await prisma.provider.findUnique({ where: { userEmail: req.user.email } }) : null;
    if (req.user.role !== "admin" && request.clientEmail !== req.user.email && request.providerId !== provider?.id) return res.status(403).json({ error: "No autorizado" });
    res.json({ evidence: JSON.parse(request.evidence || "[]") });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
