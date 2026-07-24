import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, async (req, res) => {
  try {
    let payments;
    if (req.user.role === "cliente") {
      payments = await prisma.payment.findMany({
        where: { clientEmail: req.user.email },
        include: { request: true, quote: true },
        orderBy: { createdAt: "desc" },
      });
    } else if (req.user.role === "proveedor") {
      const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
      if (!provider) return res.json([]);
      payments = await prisma.payment.findMany({
        where: { providerId: provider.id },
        include: { request: true, quote: true },
        orderBy: { createdAt: "desc" },
      });
    } else {
      payments = await prisma.payment.findMany({
        include: { request: true, quote: true },
        orderBy: { createdAt: "desc" },
      });
    }
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats", authenticate, authorize("admin"), async (req, res) => {
  try {
    const total = await prisma.payment.aggregate({ _sum: { amount: true, platformFee: true }, _count: true });
    const completed = await prisma.payment.aggregate({ where: { paymentStatus: "completado" }, _sum: { amount: true, platformFee: true }, _count: true });
    const pending = await prisma.payment.count({ where: { paymentStatus: "pendiente" } });
    res.json({
      totalAmount: total._sum.amount || 0,
      totalFees: total._sum.platformFee || 0,
      totalPayments: total._count,
      completedAmount: completed._sum.amount || 0,
      completedFees: completed._sum.platformFee || 0,
      completedCount: completed._count,
      pendingCount: pending,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/webhook/payphone", async (req, res) => {
  try {
    if (!process.env.PAYPHONE_WEBHOOK_SECRET || req.get("x-webhook-secret") !== process.env.PAYPHONE_WEBHOOK_SECRET) return res.status(401).json({ error: "Webhook no autorizado" });
    const { clientTransactionId, transactionId, status } = req.body;

    if (status === "Approved") {
      await prisma.payment.update({
        where: { id: clientTransactionId },
        data: { paymentStatus: "completado", transactionId: String(transactionId) },
      });
      const payment = await prisma.payment.findUnique({ where: { id: clientTransactionId } });
      if (payment) {
        await prisma.request.update({
          where: { id: payment.requestId },
          data: { status: "confirmada_pagada" },
        });
      }
    } else {
      await prisma.payment.update({
        where: { id: clientTransactionId },
        data: { paymentStatus: "fallido" },
      });
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/simulate", authenticate, authorize("cliente"), async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });
    if (request.clientEmail !== req.user.email) return res.status(403).json({ error: "No autorizado" });
    if (!["confirmada", "confirmada_pagada"].includes(request.status)) return res.status(400).json({ error: "La cotización debe estar confirmada antes de pagar" });

    const quote = await prisma.quote.findFirst({ where: { requestId, status: "aceptada" }, orderBy: { updatedAt: "desc" } });
    if (!quote) return res.status(404).json({ error: "Cotización aceptada no encontrada" });
    const amount = quote.acceptedOption === "with_materials" ? quote.totalWithMaterials : quote.totalWithoutMaterials;
    const platformFee = Math.round(amount * 0.05 * 100) / 100;
    const existing = await prisma.payment.findFirst({ where: { requestId }, orderBy: { createdAt: "desc" } });
    const transactionId = existing?.transactionId || `SIM-${Date.now()}`;

    const payment = await prisma.$transaction(async (tx) => {
      const completed = existing
        ? await tx.payment.update({ where: { id: existing.id }, data: { quoteId: quote.id, amount, platformFee, paymentMethod: "simulacion", paymentStatus: "completado", transactionId } })
        : await tx.payment.create({ data: { requestId, quoteId: quote.id, clientEmail: req.user.email, providerId: request.providerId, amount, platformFee, paymentMethod: "simulacion", paymentStatus: "completado", transactionId, description: "Reserva simulada para proyecto educativo" } });
      if (request.status !== "confirmada_pagada") {
        const history = JSON.parse(request.statusHistory || "[]");
        await tx.request.update({ where: { id: requestId }, data: { status: "confirmada_pagada", statusHistory: JSON.stringify([...history, { status: "confirmada_pagada", by: req.user.email, note: "Pago simulado confirmado", at: new Date().toISOString() }]) } });
        const provider = await tx.provider.findUnique({ where: { id: request.providerId }, select: { userEmail: true } });
        if (provider) await tx.notification.create({ data: { userEmail: provider.userEmail, title: "Reserva pagada", message: `El pago simulado de la solicitud ${request.displayId} fue confirmado. Ya puedes iniciar el trabajo.`, type: "payment", link: `/proveedor/solicitud/${requestId}` } });
      }
      return completed;
    });

    res.json({ success: true, simulation: true, payment, transactionId, message: "Pago simulado correctamente. El proveedor ya puede iniciar el trabajo." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/process", authenticate, async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment) return res.status(404).json({ error: "Pago no encontrado" });
    if (payment.clientEmail !== req.user.email) return res.status(403).json({ error: "No autorizado" });

    const PAYPHONE_TOKEN = process.env.PAYPHONE_TOKEN;

    if (!PAYPHONE_TOKEN && process.env.NODE_ENV !== "production") {
      const txId = `SIM-${Date.now()}`;
      await prisma.payment.update({
        where: { id: req.params.id },
        data: { paymentStatus: "completado", transactionId: txId },
      });
      await prisma.request.update({
        where: { id: payment.requestId },
        data: { status: "confirmada_pagada" },
      });
      return res.json({
        success: true,
        transactionId: txId,
        simulation: true,
        message: "Pago simulado (PayPhone no configurado)",
      });
    }
    if (!PAYPHONE_TOKEN) return res.status(503).json({ error: "El servicio de pagos no está configurado" });

    const payphoneResponse = await fetch("https://pay.payphonemodule.com/api/button/Session", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYPHONE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(payment.amount * 100),
        amountWithoutTax: Math.round(payment.amount * 100),
        amountWithTax: 0,
        tax: 0,
        service: 0,
        tip: 0,
        clientTransactionId: payment.id,
        storeId: process.env.PAYPHONE_STORE_ID || "1",
        reference: `ServicioYa - ${payment.requestId}`,
      }),
    });

    if (!payphoneResponse.ok) {
      throw new Error("Error al crear transacción en PayPhone");
    }

    const { id: payphoneTxId, paymentId } = await payphoneResponse.json();

    await prisma.payment.update({
      where: { id: req.params.id },
      data: { transactionId: String(payphoneTxId) },
    });

    res.json({
      success: true,
      payphoneId: payphoneTxId,
      paymentId,
      redirectUrl: `https://pay.payphonemodule.com/Payment?paymentId=${paymentId}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/status", authenticate, async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment) return res.status(404).json({ error: "Pago no encontrado" });
    const provider = req.user.role === "proveedor" ? await prisma.provider.findUnique({ where: { userEmail: req.user.email } }) : null;
    if (req.user.role !== "admin" && payment.clientEmail !== req.user.email && payment.providerId !== provider?.id) return res.status(403).json({ error: "No autorizado" });
    res.json({ status: payment.paymentStatus, transactionId: payment.transactionId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/refund", authenticate, authorize("admin"), async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment) return res.status(404).json({ error: "Pago no encontrado" });

    const updated = await prisma.payment.update({
      where: { id: req.params.id },
      data: { paymentStatus: "reembolsado" },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
