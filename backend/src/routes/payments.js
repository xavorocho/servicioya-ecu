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

router.post("/:id/process", authenticate, async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment) return res.status(404).json({ error: "Pago no encontrado" });

    const { transactionId, method } = req.body;
    const updated = await prisma.payment.update({
      where: { id: req.params.id },
      data: {
        paymentStatus: "completado",
        transactionId: transactionId || `PP-${Date.now()}`,
        paymentMethod: method || "payphone",
      },
    });

    await prisma.request.update({ where: { id: payment.requestId }, data: { status: "confirmada_pagada" } });

    res.json(updated);
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
