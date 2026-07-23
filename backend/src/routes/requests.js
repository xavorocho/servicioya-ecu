import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();
const requestImages = upload.array("images", 5);
const prisma = new PrismaClient();
const addHistory = (request, status, by, note = "") => JSON.stringify([
  ...JSON.parse(request.statusHistory || "[]"),
  { status, by, note, at: new Date().toISOString() },
]);

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
    res.json(
      requests.map((r) => ({
        ...r,
        images: JSON.parse(r.images || "[]"),
        evidence: JSON.parse(r.evidence || "[]"),
        statusHistory: JSON.parse(r.statusHistory || "[]"),
      }))
    );
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

router.post("/", authenticate, authorize("cliente"), requestImages, async (req, res) => {
  try {
    const { providerId, client, phone, city, address, addressReference, latitude, longitude, description, preferredDate, preferredTimeRange } = req.body;
    if (!providerId || !description?.trim() || !address?.trim() || !addressReference?.trim()) return res.status(400).json({ error: "Proveedor, descripción, dirección y referencia son obligatorios" });
    if (!/^09\d{8}$/.test(phone || "")) return res.status(400).json({ error: "Ingresa un teléfono ecuatoriano válido" });
    if (!preferredDate || !preferredTimeRange) return res.status(400).json({ error: "Selecciona fecha y rango horario" });
    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) return res.status(400).json({ error: "Selecciona la ubicación en el mapa" });
    if (!req.files?.length) return res.status(400).json({ error: "Adjunta al menos una imagen del problema" });
    if (req.files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.mimetype))) return res.status(400).json({ error: "Las imágenes deben ser JPG, PNG o WEBP" });

    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider || provider.status !== "Aprobado") return res.status(400).json({ error: "Proveedor no disponible" });

    const imageUrls = (req.files || []).map((f) => f.path || f.filename);

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
        addressReference: addressReference || "",
        latitude: Number(latitude),
        longitude: Number(longitude),
        description,
        phone: phone || "",
        preferredDate: preferredDate || "",
        preferredTimeRange: preferredTimeRange || "",
        status: "pendiente_cotizacion",
        images: JSON.stringify(imageUrls),
        statusHistory: JSON.stringify([{ status: "pendiente_cotizacion", by: req.user.email, note: "Solicitud creada", at: new Date().toISOString() }]),
      },
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/admin-detail", authenticate, authorize("admin"), async (req, res) => {
  const request = await prisma.request.findUnique({ where: { id: req.params.id }, include: { quotes: { orderBy: { createdAt: "desc" } }, payments: { orderBy: { createdAt: "desc" } } } });
  if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });
  res.json({ ...request, images: JSON.parse(request.images || "[]"), evidence: JSON.parse(request.evidence || "[]"), statusHistory: JSON.parse(request.statusHistory || "[]") });
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
      data: { status, statusHistory: addHistory(existing, status, req.user.email) },
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
    const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
    if (!provider || existing.providerId !== provider.id) return res.status(403).json({ error: "No autorizado" });
    if (existing.status !== "confirmada_pagada") return res.status(400).json({ error: "La reserva debe estar pagada antes de iniciar" });
    if (!existing.acceptedPriceOption || !existing.agreedTime || !existing.address || !existing.workConditions) return res.status(400).json({ error: "Falta completar precio, horario, dirección o condiciones del trabajo" });
    const request = await prisma.request.update({ where: { id: req.params.id }, data: { status: "en_proceso", startedAt: new Date(), statusHistory: addHistory(existing, "en_proceso", req.user.email, "Trabajo iniciado") } });
    await prisma.notification.create({ data: { userEmail: existing.clientEmail, title: "Trabajo iniciado", message: `${provider.name} confirmó el inicio del trabajo.`, type: "work", link: `/cliente/solicitud/${existing.id}` } });
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
    if (JSON.parse(existing.evidence || "[]").length < 2) return res.status(400).json({ error: "Adjunta al menos dos evidencias fotográficas antes de completar el trabajo" });
    const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
    if (!provider || existing.providerId !== provider.id) return res.status(403).json({ error: "No autorizado" });
    const request = await prisma.request.update({ where: { id: req.params.id }, data: { status: "completada", completedAt: new Date(), statusHistory: addHistory(existing, "completada", req.user.email, "Trabajo finalizado") } });
    await prisma.notification.create({ data: { userEmail: existing.clientEmail, title: "Trabajo finalizado", message: "El proveedor marcó el trabajo como finalizado. Revisa las evidencias y califica el servicio.", type: "success", link: `/cliente/solicitud/${existing.id}` } });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
