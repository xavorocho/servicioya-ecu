import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// POST /api/support - Send a support message (any authenticated user)
router.post("/", authenticate, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ error: "Asunto y mensaje requeridos" });
    
    const supportMessage = await prisma.supportMessage.create({
      data: {
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        userName: req.user.name,
        subject,
        message,
        status: "nuevo",
      },
    });
    res.status(201).json(supportMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/support - Get all support messages (admin only)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const messages = await prisma.supportMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/support/:id/respond - Admin responds to a message
router.put("/:id/respond", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { response, status } = req.body;
    const message = await prisma.supportMessage.update({
      where: { id: req.params.id },
      data: {
        response: response || "",
        status: status || "respondido",
        respondedAt: new Date(),
        respondedBy: req.user.email,
      },
    });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/support/:id/close - Close a support ticket
router.put("/:id/close", authenticate, authorize("admin"), async (req, res) => {
  try {
    const message = await prisma.supportMessage.update({
      where: { id: req.params.id },
      data: { status: "cerrado" },
    });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
