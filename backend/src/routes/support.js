import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// POST /api/support - Send a support message (any authenticated user)
router.post("/", authenticate, async (req, res) => {
  try {
    const { subject, message, priority } = req.body;
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
        priority: ["baja", "media", "alta", "urgente"].includes(priority) ? priority : "media",
      },
    });
    res.status(201).json(supportMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/mine", authenticate, async (req, res) => {
  const messages = await prisma.supportMessage.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" } });
  res.json(messages);
});

router.put("/:id/status", authenticate, authorize("admin"), async (req, res) => {
  const allowed = ["nuevo", "en_revision", "respondido", "cerrado"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: "Estado inválido" });
  res.json(await prisma.supportMessage.update({ where: { id: req.params.id }, data: { status: req.body.status } }));
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
    await prisma.notification.create({ data: { userEmail: message.userEmail, title: "Respuesta de soporte", message: response || "Tu solicitud de soporte fue actualizada.", type: "support", link: "/ayuda" } });
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
