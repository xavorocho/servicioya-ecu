import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, async (req, res) => {
  const notifications = await prisma.notification.findMany({ where: { userEmail: req.user.email }, orderBy: { createdAt: "desc" }, take: 30 });
  res.json(notifications);
});

router.put("/:id/read", authenticate, async (req, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) return res.status(404).json({ error: "Notificación no encontrada" });
  if (notification.userEmail !== req.user.email) return res.status(403).json({ error: "No autorizado" });
  res.json(await prisma.notification.update({ where: { id: notification.id }, data: { read: true } }));
});

router.put("/mark-all", authenticate, async (req, res) => {
  await prisma.notification.updateMany({ where: { userEmail: req.user.email, read: false }, data: { read: true } });
  res.json({ message: "Notificaciones leídas" });
});

export default router;
