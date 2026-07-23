import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/by-request/:requestId", authenticate, async (req, res) => {
  try {
    const request = await prisma.request.findUnique({ where: { id: req.params.requestId } });
    if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });
    const provider = req.user.role === "proveedor" ? await prisma.provider.findUnique({ where: { userEmail: req.user.email } }) : null;
    if (req.user.role !== "admin" && request.clientEmail !== req.user.email && request.providerId !== provider?.id) return res.status(403).json({ error: "No autorizado" });
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
    if (!requestId || !laborPrice || !providerNote?.trim()) return res.status(400).json({ error: "Solicitud, mano de obra y condiciones del trabajo son obligatorias" });

    const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
    if (!provider) return res.status(404).json({ error: "Perfil de proveedor no encontrado" });

    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });
    if (request.providerId !== provider.id) return res.status(403).json({ error: "Esta solicitud no pertenece a tu perfil" });
    if (request.status !== "pendiente_cotizacion") return res.status(400).json({ error: "La solicitud ya no está pendiente de cotización" });
    if (!providerExactTime) return res.status(400).json({ error: "Propón una hora exacta" });

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
    await prisma.notification.create({ data: { userEmail: request.clientEmail, title: "Nueva cotización", message: `${provider.name} envió una cotización para ${request.service}.`, type: "quote", link: `/cliente/cotizacion/${request.id}` } });

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
    if (quote.status !== "enviada") return res.status(400).json({ error: "Esta cotización ya fue respondida" });

    const { option } = req.body;
    if (!["with_materials", "without_materials"].includes(option)) return res.status(400).json({ error: "Selecciona una opción válida" });
    const paymentAmount = option === "with_materials" ? quote.totalWithMaterials : quote.totalWithoutMaterials;
    const fee = Math.round(paymentAmount * 0.05 * 100) / 100;

    await prisma.quote.update({ where: { id: req.params.id }, data: { status: "aceptada", acceptedOption: option } });
    const history = JSON.parse(quote.request.statusHistory || "[]");
    await prisma.request.update({ where: { id: quote.requestId }, data: { status: "confirmada", acceptedPriceOption: option, agreedTime: quote.providerExactTime, workConditions: quote.providerNote, statusHistory: JSON.stringify([...history, { status: "confirmada", by: req.user.email, note: `Cotización aceptada: ${option}`, at: new Date().toISOString() }]) } });

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
    const providerUser = await prisma.provider.findUnique({ where: { id: quote.providerId }, select: { userEmail: true } });
    if (providerUser) await prisma.notification.create({ data: { userEmail: providerUser.userEmail, title: "Cotización aceptada", message: `El cliente aceptó la opción ${option === "with_materials" ? "con materiales" : "sin materiales"}.`, type: "success", link: `/proveedor/solicitud/${quote.requestId}` } });

    res.json({ quote, payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/reject", authenticate, async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({ where: { id: req.params.id }, include: { request: true } });
    if (!quote) return res.status(404).json({ error: "Cotización no encontrada" });
    const provider = req.user.role === "proveedor" ? await prisma.provider.findUnique({ where: { userEmail: req.user.email } }) : null;
    if (req.user.role !== "admin" && quote.request.clientEmail !== req.user.email && quote.providerId !== provider?.id) return res.status(403).json({ error: "No autorizado" });

    await prisma.quote.update({ where: { id: req.params.id }, data: { status: "rechazada" } });
    await prisma.request.update({ where: { id: quote.requestId }, data: { status: "rechazada" } });
    const targetProvider = await prisma.provider.findUnique({ where: { id: quote.providerId }, select: { userEmail: true } });
    if (targetProvider) await prisma.notification.create({ data: { userEmail: targetProvider.userEmail, title: "Cotización rechazada", message: "El cliente rechazó la cotización.", type: "warning", link: `/proveedor/solicitud/${quote.requestId}` } });

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
    await prisma.notification.create({ data: { userEmail: request.clientEmail, title: "Nueva cotización requerida", message: "El proveedor reportó cambios en el trabajo y envió un nuevo precio.", type: "warning", link: `/cliente/cotizacion/${request.id}` } });

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
