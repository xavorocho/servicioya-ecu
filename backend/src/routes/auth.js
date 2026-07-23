import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone, city } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nombre, correo y contraseña son obligatorios" });
    }
    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) return res.status(400).json({ error: "El correo ya está registrado" });
    if (password.length < 6) return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });

    const hashed = await bcrypt.hash(password, 10);
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
    
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashed,
        role: role || "cliente",
        phone: phone || "",
        city: city || "",
        status: role === "proveedor" ? "Pendiente" : "Activo",
        emailVerified: false,
        verificationToken: verificationCode,
      },
    });

    console.log(`[EMAIL VERIFICATION] ${email.toLowerCase()}: ${verificationCode}`);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, city: user.city, status: user.status, profileImage: "", emailVerified: false },
      requiresVerification: true,
      verificationCode,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Correo y contraseña requeridos" });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(401).json({ error: "Correo o contraseña incorrectos" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Correo o contraseña incorrectos" });

    if (!user.emailVerified) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await prisma.user.update({ where: { id: user.id }, data: { verificationToken: code } });
      console.log(`[EMAIL VERIFICATION] ${user.email}: ${code}`);
      return res.status(403).json({
        error: "Debes verificar tu correo electrónico antes de iniciar sesión",
        requiresVerification: true,
        email: user.email,
        verificationCode: code,
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, city: user.city, status: user.status, providerId: user.providerId, profileImage: user.profileImage },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, phone: true, city: true, status: true, providerId: true, profileImage: true },
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/user/:email", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.params.email },
      select: { name: true, email: true, phone: true, city: true, role: true, profileImage: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    
    const requests = await prisma.request.findMany({
      where: { clientEmail: req.params.email },
      select: { id: true, service: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    
    const reviews = await prisma.review.findMany({
      where: { clientEmail: req.params.email },
      select: { rating: true, comment: true, createdAt: true },
    });
    
    res.json({ ...user, requests, reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "Email y código requeridos" });
    
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    if (user.emailVerified) return res.json({ message: "Correo ya verificado" });
    
    if (user.verificationToken !== code) {
      return res.status(400).json({ error: "Código incorrecto" });
    }
    
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: true, verificationToken: null },
    });
    
    res.json({ message: "Correo verificado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    if (user.emailVerified) return res.json({ message: "Ya verificado" });
    
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await prisma.user.update({ where: { email: email.toLowerCase() }, data: { verificationToken: code } });
    
    console.log(`[EMAIL VERIFICATION] ${email.toLowerCase()}: ${code}`);
    res.json({ message: "Código reenviado", hint: `Código: ${code}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
