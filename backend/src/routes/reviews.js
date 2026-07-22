import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, async (req, res) => {
  try {
    let reviews;
    if (req.user.role === "cliente") {
      reviews = await prisma.review.findMany({ where: { clientEmail: req.user.email }, orderBy: { createdAt: "desc" } });
    } else if (req.user.role === "proveedor") {
      const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
      if (!provider) return res.json([]);
      reviews = await prisma.review.findMany({ where: { providerId: provider.id }, orderBy: { createdAt: "desc" } });
    } else {
      reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
    }
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticate, authorize("cliente"), async (req, res) => {
  try {
    const { requestId, rating, comment } = req.body;
    if (!requestId || !rating || rating < 1 || rating > 5) return res.status(400).json({ error: "requestId y rating (1-5) requeridos" });

    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request || request.clientEmail !== req.user.email) return res.status(403).json({ error: "No autorizado" });
    if (request.status !== "completada") return res.status(400).json({ error: "Solo puedes calificar servicios completados" });

    const existing = await prisma.review.findFirst({ where: { requestId } });
    if (existing) return res.status(400).json({ error: "Ya existe una calificación para esta solicitud" });

    const review = await prisma.review.create({
      data: {
        requestId,
        clientEmail: req.user.email,
        providerId: request.providerId,
        rating: Number(rating),
        comment: comment || "",
      },
    });

    const providerReviews = await prisma.review.findMany({ where: { providerId: request.providerId } });
    const avg = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;

    await prisma.provider.update({
      where: { id: request.providerId },
      data: { rating: Number(avg.toFixed(1)), reviews: providerReviews.length },
    });

    const provider = await prisma.provider.findUnique({ where: { id: request.providerId } });
    const currentComments = JSON.parse(provider.comments || "[]");
    currentComments.push({ requestId: request.id, user: req.user.name, rating: Number(rating), text: comment || "" });
    await prisma.provider.update({ where: { id: request.providerId }, data: { comments: JSON.stringify(currentComments) } });

    await prisma.request.update({ where: { id: requestId }, data: { status: "calificada" } });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
