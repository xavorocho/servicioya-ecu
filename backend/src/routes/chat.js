import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// Get messages for a request
router.get("/:requestId", authenticate, async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { requestId: req.params.requestId },
      orderBy: { createdAt: "asc" },
    });

    // Mark unread messages as read
    await prisma.chatMessage.updateMany({
      where: { requestId: req.params.requestId, read: false, senderEmail: { not: req.user.email } },
      data: { read: true },
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a message
router.post("/:requestId", authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Mensaje requerido" });

    const request = await prisma.request.findUnique({ where: { id: req.params.requestId } });
    if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });

    // Verify user is part of this request
    if (req.user.role === "cliente" && request.clientEmail !== req.user.email) {
      return res.status(403).json({ error: "No autorizado" });
    }
    if (req.user.role === "proveedor") {
      const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
      if (!provider || request.providerId !== provider.id) {
        return res.status(403).json({ error: "No autorizado" });
      }
    }

    const msg = await prisma.chatMessage.create({
      data: {
        requestId: req.params.requestId,
        senderEmail: req.user.email,
        senderName: req.user.name,
        senderRole: req.user.role,
        message: message.trim(),
      },
    });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread count for a request
router.get("/:requestId/unread", authenticate, async (req, res) => {
  try {
    const count = await prisma.chatMessage.count({
      where: {
        requestId: req.params.requestId,
        read: false,
        senderEmail: { not: req.user.email },
      },
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all conversations for current user
router.get("/", authenticate, async (req, res) => {
  try {
    let requests;
    if (req.user.role === "cliente") {
      requests = await prisma.request.findMany({ where: { clientEmail: req.user.email } });
    } else if (req.user.role === "proveedor") {
      const provider = await prisma.provider.findUnique({ where: { userEmail: req.user.email } });
      requests = provider ? await prisma.request.findMany({ where: { providerId: provider.id } }) : [];
    } else {
      return res.json([]);
    }

    const requestIds = requests.map(r => r.id);
    const conversations = await Promise.all(
      requestIds.map(async (id) => {
        const lastMessage = await prisma.chatMessage.findFirst({
          where: { requestId: id },
          orderBy: { createdAt: "desc" },
        });
        const unread = await prisma.chatMessage.count({
          where: { requestId: id, read: false, senderEmail: { not: req.user.email } },
        });
        const request = requests.find(r => r.id === id);
        return {
          requestId: id,
          displayId: request?.displayId,
          service: request?.service,
          lastMessage: lastMessage?.message || "",
          lastMessageAt: lastMessage?.createdAt,
          unread,
        };
      })
    );

    res.json(conversations.filter(c => c.lastMessage).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
