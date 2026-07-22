import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, async (req, res) => {
  try {
    let requests;
    if (req.user.role === "cliente") {
      requests = await prisma.request.findMany({
        where: { clientEmail: req.user.email },
        orderBy: { createdAt: "desc" },
      });
    } else if (req.user.role === "proveedor") {
      const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
      if (!provider) return res.json([]);
      requests = await prisma.request.findMany({
        where: { providerId: provider.id },
        orderBy: { createdAt: "desc" },
      });
    } else {
      requests = await prisma.request.findMany({ orderBy: { createdAt: "desc" } });
    }
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats", authenticate, async (req, res) => {
  try {
    let where = {};
    if (req.user.role === "cliente") where = { clientEmail: req.user.email };
    else if (req.user.role === "proveedor") {
      const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
      if (!provider) return res.json({ total: 0, pending: 0, confirmed: 0, inProgress: 0, completed: 0, rated: 0 });
      where = { providerId: provider.id };
    }
    const all = await prisma.request.findMany({ where });
    res.json({
      total: all.length,
      pending: all.filter((r) => r.status === "pendiente_cotizacion").length,
      quoted: all.filter((r) => r.status === "cotizacion_enviada").length,
      timeNegotiation: all.filter((r) => r.status === "hora_propuesta_cliente").length,
      confirmed: all.filter((r) => r.status === "confirmada").length,
      paid: all.filter((r) => r.status === "confirmada_pagada").length,
      inProgress: all.filter((r) => r.status === "en_proceso").length,
      completed: all.filter((r) => r.status === "completada").length,
      rated: all.filter((r) => r.status === "calificada").length,
      cancelled: all.filter((r) => r.status === "cancelada").length,
      rejected: all.filter((r) => r.status === "rechazada").length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticate, authorize("cliente"), async (req, res) => {
  try {
    const { providerId, client, phone, city, address, description, preferredDate, preferredTimeRange } = req.body;
    if (!providerId || !description) return res.status(400).json({ error: "Proveedor y descripción requeridos" });

    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider || provider.status !== "Aprobado") return res.status(400).json({ error: "Proveedor no disponible" });

    const count = await prisma.request.count();
    const displayId = `SY-${String(count + 1001).slice(-6)}`;

    const request = await prisma.request.create({
      data: {
        displayId,
        clientEmail: req.user.email,
        client: client || req.user.name,
        providerId,
        providerName: provider.name,
        service: provider.categoryName,
        categoryId: provider.categoryId,
        city: city || provider.city,
        address: address || "",
        description,
        phone: phone || "",
        preferredDate: preferredDate || "",
        preferredTimeRange: preferredTimeRange || "",
        status: "pendiente_cotizacion",
      },
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/status", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pendiente_cotizacion", "cotizacion_enviada", "hora_propuesta_cliente",
      "confirmada", "confirmada_pagada", "en_proceso", "completada",
      "calificada", "cancelada", "rechazada",
    ];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Estado inválido" });

    const existing = await prisma.request.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Solicitud no encontrada" });

    if (req.user.role === "cliente" && existing.clientEmail !== req.user.email) {
      return res.status(403).json({ error: "No puedes modificar esta solicitud" });
    }
    if (req.user.role === "proveedor") {
      const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
      if (!provider || existing.providerId !== provider.id) {
        return res.status(403).json({ error: "No puedes modificar esta solicitud" });
      }
    }

    const request = await prisma.request.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/start-work", authenticate, authorize("proveedor"), async (req, res) => {
  try {
    const existing = await prisma.request.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Solicitud no encontrada" });
    if (!["confirmada_pagada", "confirmada"].includes(existing.status)) {
      return res.status(400).json({ error: "La solicitud debe estar confirmada para iniciar" });
    }
    const request = await prisma.request.update({ where: { id: req.params.id }, data: { status: "en_proceso" } });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/complete", authenticate, authorize("proveedor"), async (req, res) => {
  try {
    const existing = await prisma.request.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Solicitud no encontrada" });
    if (existing.status !== "en_proceso") {
      return res.status(400).json({ error: "La solicitud debe estar en proceso para completar" });
    }
    const request = await prisma.request.update({ where: { id: req.params.id }, data: { status: "completada" } });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
