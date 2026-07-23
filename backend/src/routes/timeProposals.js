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
    const { quoteId, proposedTime, note } = req.body;
    if (!quoteId || !proposedTime) return res.status(400).json({ error: "quoteId y proposedTime son requeridos" });

    const quote = await prisma.quote.findUnique({ where: { id: quoteId }, include: { request: true } });
    if (!quote) return res.status(404).json({ error: "Cotización no encontrada" });
    const provider = req.user.role === "proveedor" ? await prisma.provider.findUnique({ where: { userEmail: req.user.email } }) : null;
    if (req.user.role !== "admin" && quote.request.clientEmail !== req.user.email && quote.providerId !== provider?.id) return res.status(403).json({ error: "No autorizado" });

    const proposal = await prisma.timeProposal.create({
      data: {
        quoteId,
        proposedBy: req.user.role,
        proposedTime,
        note: note || "",
        status: "pendiente",
      },
    });

    await prisma.quote.update({ where: { id: quoteId }, data: { providerExactTime: proposedTime } });
    await prisma.request.update({ where: { id: quote.requestId }, data: { status: "hora_propuesta_cliente" } });
    const recipient = req.user.role === "cliente" ? (await prisma.provider.findUnique({ where: { id: quote.providerId }, select: { userEmail: true } }))?.userEmail : quote.request.clientEmail;
    if (recipient) await prisma.notification.create({ data: { userEmail: recipient, title: "Nueva propuesta de horario", message: `${req.user.name} propuso la hora ${proposedTime}.`, type: "time", link: req.user.role === "cliente" ? `/proveedor/solicitud/${quote.requestId}` : `/cliente/cotizacion/${quote.requestId}` } });

    res.status(201).json(proposal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/accept", authenticate, async (req, res) => {
  try {
    const proposal = await prisma.timeProposal.findUnique({ where: { id: req.params.id }, include: { quote: true } });
    if (!proposal) return res.status(404).json({ error: "Propuesta no encontrada" });

    const request = await prisma.request.findUnique({ where: { id: proposal.quote.requestId } });
    const provider = req.user.role === "proveedor" ? await prisma.provider.findUnique({ where: { userEmail: req.user.email } }) : null;
    const isCounterparty = proposal.proposedBy !== req.user.role && (request.clientEmail === req.user.email || request.providerId === provider?.id);
    if (req.user.role !== "admin" && !isCounterparty) return res.status(403).json({ error: "Solo la contraparte puede aceptar este horario" });
    await prisma.timeProposal.updateMany({ where: { quoteId: proposal.quoteId, status: "pendiente" }, data: { status: "rechazada" } });
    await prisma.timeProposal.update({ where: { id: req.params.id }, data: { status: "aceptada" } });
    await prisma.quote.update({ where: { id: proposal.quoteId }, data: { providerExactTime: proposal.proposedTime, status: "aceptada" } });
    await prisma.request.update({ where: { id: proposal.quote.requestId }, data: { status: "confirmada", agreedTime: proposal.proposedTime } });
    const recipient = proposal.proposedBy === "cliente" ? (await prisma.user.findUnique({ where: { email: request.clientEmail }, select: { email: true } }))?.email : (await prisma.provider.findUnique({ where: { id: request.providerId }, select: { userEmail: true } }))?.userEmail;
    if (recipient) await prisma.notification.create({ data: { userEmail: recipient, title: "Horario aceptado", message: `La hora ${proposal.proposedTime} fue aceptada.`, type: "success", link: recipient === request.clientEmail ? `/cliente/solicitud/${request.id}` : `/proveedor/solicitud/${request.id}` } });

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
