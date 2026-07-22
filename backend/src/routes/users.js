import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, phone: true, city: true, status: true, providerId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/profile", authenticate, async (req, res) => {
  try {
    const { name, phone, city } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, city },
      select: { id: true, name: true, email: true, role: true, phone: true, city: true, status: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
