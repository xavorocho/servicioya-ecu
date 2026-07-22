import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/by-quote/:quoteId", authenticate, async (req, res) => {
  try {
    const proposals = await prisma.timeProposal.findMany({
      where: { quoteId: req.params.quoteId },
      orderBy: { createdAt: "asc" },
    });
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { quoteId, proposedBy, proposedTime, note } = req.body;
    if (!quoteId || !proposedTime) return res.status(400).json({ error: "quoteId y proposedTime son requeridos" });

    const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
    if (!quote) return res.status(404).json({ error: "Cotización no encontrada" });

    const proposal = await prisma.timeProposal.create({
      data: {
        quoteId,
        proposedBy: proposedBy || req.user.role,
        proposedTime,
        note: note || "",
        status: "pendiente",
      },
    });

    await prisma.quote.update({ where: { id: quoteId }, data: { providerExactTime: proposedTime } });
    await prisma.request.update({ where: { id: quote.requestId }, data: { status: "hora_propuesta_cliente" } });

    res.status(201).json(proposal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/accept", authenticate, async (req, res) => {
  try {
    const proposal = await prisma.timeProposal.findUnique({ where: { id: req.params.id }, include: { quote: true } });
    if (!proposal) return res.status(404).json({ error: "Propuesta no encontrada" });

    await prisma.timeProposal.update({ where: { id: req.params.id }, data: { status: "aceptada" } });
    await prisma.quote.update({ where: { id: proposal.quoteId }, data: { providerExactTime: proposal.proposedTime, status: "aceptada" } });
    await prisma.request.update({ where: { id: proposal.quote.requestId }, data: { status: "confirmada" } });

    res.json({ message: "Horario aceptado", proposal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/reject", authenticate, async (req, res) => {
  try {
    const proposal = await prisma.timeProposal.findUnique({ where: { id: req.params.id } });
    if (!proposal) return res.status(404).json({ error: "Propuesta no encontrada" });

    await prisma.timeProposal.update({ where: { id: req.params.id }, data: { status: "rechazada" } });

    res.json({ message: "Horario rechazado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
