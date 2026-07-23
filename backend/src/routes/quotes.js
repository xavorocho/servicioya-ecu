import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/by-request/:requestId", authenticate, async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      where: { requestId: req.params.requestId },
      include: { timeProposals: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my-quotes", authenticate, authorize("proveedor"), async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
    if (!provider) return res.json([]);
    const quotes = await prisma.quote.findMany({
      where: { providerId: provider.id },
      include: { request: true, timeProposals: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticate, authorize("proveedor"), async (req, res) => {
  try {
    const { requestId, laborPrice, materialsPrice, materialsDetail, providerNote, providerExactTime } = req.body;
    if (!requestId || !laborPrice) return res.status(400).json({ error: "requestId y laborPrice son requeridos" });

    const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
    if (!provider) return res.status(404).json({ error: "Perfil de proveedor no encontrado" });

    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });

    const mats = Number(materialsPrice) || 0;
    const labor = Number(laborPrice) || 0;

    const quote = await prisma.quote.create({
      data: {
        requestId,
        providerId: provider.id,
        laborPrice: labor,
        materialsPrice: mats,
        totalWithMaterials: labor + mats,
        totalWithoutMaterials: labor,
        materialsDetail: materialsDetail || "",
        providerNote: providerNote || "",
        providerExactTime: providerExactTime || "",
        status: "enviada",
      },
    });

    await prisma.request.update({
      where: { id: requestId },
      data: { status: "cotizacion_enviada" },
    });

    res.status(201).json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/accept", authenticate, authorize("cliente"), async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({ where: { id: req.params.id }, include: { request: true } });
    if (!quote) return res.status(404).json({ error: "Cotización no encontrada" });
    if (quote.request.clientEmail !== req.user.email) return res.status(403).json({ error: "No autorizado" });

    const { option } = req.body;
    const paymentAmount = option === "with_materials" ? quote.totalWithMaterials : quote.totalWithoutMaterials;
    const fee = Math.round(paymentAmount * 0.05 * 100) / 100;

    await prisma.quote.update({ where: { id: req.params.id }, data: { status: "aceptada" } });
    await prisma.request.update({ where: { id: quote.requestId }, data: { status: "confirmada" } });

    const payment = await prisma.payment.create({
      data: {
        requestId: quote.requestId,
        quoteId: quote.id,
        clientEmail: req.user.email,
        providerId: quote.providerId,
        amount: paymentAmount,
        platformFee: fee,
        paymentMethod: "payphone",
        paymentStatus: "pendiente",
        description: `Reserva - ${option === "with_materials" ? "Con materiales" : "Sin materiales"}`,
      },
    });

    res.json({ quote, payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/reject", authenticate, async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({ where: { id: req.params.id }, include: { request: true } });
    if (!quote) return res.status(404).json({ error: "Cotización no encontrada" });

    await prisma.quote.update({ where: { id: req.params.id }, data: { status: "rechazada" } });
    await prisma.request.update({ where: { id: quote.requestId }, data: { status: "rechazada" } });

    res.json({ message: "Cotización rechazada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/new-quote/:requestId", authenticate, authorize("proveedor"), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason, laborPrice, materialsPrice, totalWithMaterials, totalWithoutMaterials, materialsDetail, providerNote, providerExactTime } = req.body;

    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });
    if (request.status !== "en_proceso") return res.status(400).json({ error: "La solicitud debe estar en proceso" });

    const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
    if (!provider || request.providerId !== provider.id) return res.status(403).json({ error: "No autorizado" });

    const quote = await prisma.quote.create({
      data: {
        requestId,
        providerId: provider.id,
        laborPrice: laborPrice || 0,
        materialsPrice: materialsPrice || 0,
        totalWithMaterials: totalWithMaterials || 0,
        totalWithoutMaterials: totalWithoutMaterials || 0,
        materialsDetail: materialsDetail || "",
        providerNote: reason || providerNote || "",
        providerExactTime: providerExactTime || "",
        status: "nueva_cotizacion",
      },
    });

    await prisma.request.update({
      where: { id: requestId },
      data: { status: "nueva_cotizacion_enviada" },
    });

    res.status(201).json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/accept-new-quote", authenticate, authorize("cliente"), async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({ where: { id: req.params.id } });
    if (!quote) return res.status(404).json({ error: "Cotización no encontrada" });
    if (quote.status !== "nueva_cotizacion") return res.status(400).json({ error: "Esta cotización no está pendiente" });

    const request = await prisma.request.findUnique({ where: { id: quote.requestId } });
    if (!request || request.clientEmail !== req.user.email) return res.status(403).json({ error: "No autorizado" });

    await prisma.quote.update({ where: { id: req.params.id }, data: { status: "aceptada" } });
    await prisma.request.update({ where: { id: quote.requestId }, data: { status: "en_proceso" } });

    res.json({ message: "Nueva cotización aceptada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/reject-new-quote", authenticate, authorize("cliente"), async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({ where: { id: req.params.id } });
    if (!quote) return res.status(404).json({ error: "Cotización no encontrada" });

    const request = await prisma.request.findUnique({ where: { id: quote.requestId } });
    if (!request || request.clientEmail !== req.user.email) return res.status(403).json({ error: "No autorizado" });

    await prisma.quote.update({ where: { id: req.params.id }, data: { status: "rechazada" } });
    await prisma.request.update({ where: { id: quote.requestId }, data: { status: "cancelada" } });

    res.json({ message: "Cotización rechazada, solicitud cancelada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
