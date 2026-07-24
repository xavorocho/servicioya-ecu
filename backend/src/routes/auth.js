import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import { authenticate } from "../middleware/auth.js";
import { uploadFields } from "../middleware/upload.js";
import { sendTransactionalEmail } from "../services/email.js";

const router = Router();
const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const PUBLIC_ROLES = new Set(["cliente", "proveedor"]);
const TERMS_VERSION = process.env.TERMS_VERSION || "2026-07-23";
const normalizeEmail = (value = "") => value.trim().toLowerCase();
const hashToken = (value) => crypto.createHash("sha256").update(value).digest("hex");
const newCode = () => String(crypto.randomInt(100000, 1000000));
const safeUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, city: user.city, status: user.status, providerId: user.providerId, profileImage: user.profileImage, emailVerified: user.emailVerified });
const signToken = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" });

async function sendVerification(user, code) {
  await sendTransactionalEmail({
    to: user.email,
    subject: "Verifica tu cuenta de ServicioYa ECU",
    html: `<h2>Hola ${user.name}</h2><p>Tu código de verificación es:</p><p style="font-size:28px;font-weight:bold">${code}</p><p>Caduca en 15 minutos.</p>`,
  });
}

router.post("/register", uploadFields, async (req, res) => {
  try {
    const { name, password, phone, city } = req.body;
    const termsAccepted = req.body.termsAccepted === true || req.body.termsAccepted === "true";
    const email = normalizeEmail(req.body.email);
    const role = req.body.role || "cliente";
    if (!name?.trim() || !email || !password || !phone?.trim() || !city?.trim()) return res.status(400).json({ error: "Completa todos los datos personales obligatorios" });
    if (!PUBLIC_ROLES.has(role)) return res.status(400).json({ error: "Tipo de cuenta no permitido" });
    if (!/^09\d{8}$/.test(phone.trim())) return res.status(400).json({ error: "Ingresa un teléfono ecuatoriano válido de 10 dígitos" });
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres, una letra y un número" });
    if (termsAccepted !== true) return res.status(400).json({ error: "Debes aceptar los términos y el tratamiento de datos" });
    if (await prisma.user.findUnique({ where: { email } })) return res.status(409).json({ error: "El correo ya está registrado" });
    if (role === "proveedor") {
      const labels = { docCedula: "cédula", docAntecedentes: "antecedentes", docOficio: "certificado de experiencia", profileImage: "foto de perfil", verificationFrontImage: "foto frontal", verificationSideImage: "foto lateral" };
      const missing = Object.keys(labels).filter((field) => !req.files?.[field]?.[0]);
      if (missing.length) return res.status(400).json({ error: `Faltan archivos: ${missing.map((field) => labels[field]).join(", ")}` });
    }

    const code = newCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({ data: {
        name: name.trim(), email, password: await bcrypt.hash(password, 12), role, phone: phone.trim(), city: city.trim(),
        status: role === "proveedor" ? "Pendiente" : "Pendiente de verificación", emailVerified: false,
        verificationToken: hashToken(code), verificationExpiresAt: expiresAt,
        termsAccepted: true, termsAcceptedAt: new Date(), termsVersion: TERMS_VERSION,
      }});
      if (role === "proveedor") {
        const category = req.body.category;
        const categoryName = category === "otra" ? req.body.customCategory?.trim() : req.body.categoryName?.trim();
        const fileUrl = (field) => {
          const file = req.files?.[field]?.[0];
          return file?.path?.startsWith("http") ? file.path : file?.filename || "";
        };
        if (!category || !categoryName || !req.body.sector || !req.body.description) throw new Error("PROVIDER_DATA_REQUIRED");
        const documents = { cedula: fileUrl("docCedula"), antecedentes: fileUrl("docAntecedentes"), oficio: fileUrl("docOficio"), ruc: fileUrl("docRuc") };
        const provider = await tx.provider.create({ data: { userEmail: email, name: name.trim(), category, categoryName, city: city.trim(), sector: req.body.sector.trim(), experience: `${Number(req.body.experience) || 0} años de experiencia`, experienceYears: Number(req.body.experience) || 0, price: Number(req.body.price) || 0, baseReferencePrice: Number(req.body.price) || 0, phone: phone.trim(), description: req.body.description.trim(), documents: JSON.stringify(documents), profileImage: fileUrl("profileImage"), verificationFrontImage: fileUrl("verificationFrontImage"), verificationSideImage: fileUrl("verificationSideImage") } });
        await tx.user.update({ where: { id: created.id }, data: { providerId: provider.id, profileImage: fileUrl("profileImage") } });
        if (category === "otra") await tx.pendingSpecialty.create({ data: { providerId: provider.id, providerEmail: email, providerName: name.trim(), specialtyName: categoryName } });
      }
      return created;
    });
    let emailResult;
    try {
      emailResult = await sendVerification(user, code);
    } catch (emailError) {
      console.warn(`[REGISTER EMAIL] ${emailError.message}. La cuenta queda pendiente de verificación administrativa.`);
      return res.status(201).json({
        requiresVerification: true,
        pendingAdminVerification: true,
        deliveryMode: "admin",
        email: user.email,
        role: user.role,
        message: "Cuenta creada. Un administrador debe verificarla desde el panel de usuarios.",
      });
    }
    const exposeLocalCode = process.env.NODE_ENV !== "production";
    res.status(201).json({
      requiresVerification: true,
      email: user.email,
      role: user.role,
      message: emailResult?.development ? "Usa el código mostrado en pantalla" : "Revisa tu correo para activar la cuenta",
      deliveryMode: emailResult?.development ? "development" : "email",
      ...(exposeLocalCode && { hint: code }),
    });
  } catch (err) {
    console.error("[REGISTER]", err);
    if (err.message === "PROVIDER_DATA_REQUIRED") return res.status(400).json({ error: "Completa todos los datos profesionales" });
    if (err.message === "PROVIDER_DOCS_REQUIRED") return res.status(400).json({ error: "Adjunta los documentos y fotografías obligatorios" });
    res.status(500).json({ error: "No se pudo crear la cuenta" });
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code || "").trim();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    if (user.emailVerified) return res.json({ message: "Correo ya verificado" });
    if (!user.verificationExpiresAt || user.verificationExpiresAt < new Date()) return res.status(400).json({ error: "El código caducó. Solicita uno nuevo" });
    if (!user.verificationToken || user.verificationToken !== hashToken(code)) return res.status(400).json({ error: "Código incorrecto" });
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, verificationToken: null, verificationExpiresAt: null, status: user.role === "proveedor" ? "Pendiente" : "Activo" } });
    res.json({ message: "Correo verificado correctamente", next: user.role === "proveedor" ? "complete_provider_profile" : "login" });
  } catch (err) {
    console.error("[VERIFY EMAIL]", err);
    res.status(500).json({ error: "No se pudo verificar el correo" });
  }
});

router.post("/resend-verification", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    if (user.emailVerified) return res.json({ message: "El correo ya está verificado" });
    const code = newCode();
    await prisma.user.update({ where: { id: user.id }, data: { verificationToken: hashToken(code), verificationExpiresAt: new Date(Date.now() + 15 * 60 * 1000) } });
    let emailResult;
    try {
      emailResult = await sendVerification(user, code);
    } catch (emailError) {
      return res.status(202).json({
        pendingAdminVerification: true,
        deliveryMode: "admin",
        message: "El correo no está disponible. Solicita a un administrador que verifique tu cuenta.",
      });
    }
    const exposeLocalCode = process.env.NODE_ENV !== "production";
    res.json({
      message: emailResult?.development ? "Código de desarrollo generado" : "Código reenviado. Revisa tu correo",
      deliveryMode: emailResult?.development ? "development" : "email",
      ...(exposeLocalCode && { hint: code }),
    });
  } catch (err) {
    console.error("[RESEND EMAIL]", err);
    res.status(503).json({ error: "No se pudo reenviar el código" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password))) return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    if (!user.emailVerified) return res.status(403).json({ error: "Debes verificar tu correo electrónico", requiresVerification: true, email });
    if (["Suspendido", "Bloqueado"].includes(user.status)) return res.status(403).json({ error: "La cuenta no está habilitada" });
    res.json({ token: signToken(user), user: safeUser(user) });
  } catch (err) {
    console.error("[LOGIN]", err);
    res.status(500).json({ error: "No se pudo iniciar sesión" });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { credential, role, termsAccepted } = req.body;
    if (!credential) return res.status(400).json({ error: "Token de Google requerido" });
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = normalizeEmail(payload.email);
    let user = await prisma.user.findUnique({ where: { email } });
    let requiresProviderProfile = false;
    if (!user) {
      if (!PUBLIC_ROLES.has(role)) return res.status(409).json({ requiresRoleSelection: true, error: "Selecciona si deseas registrarte como cliente o proveedor" });
      if (termsAccepted !== true) return res.status(400).json({ error: "Debes aceptar los términos y el tratamiento de datos" });
      user = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({ data: { name: payload.name, email, password: await bcrypt.hash(crypto.randomUUID(), 12), role, status: role === "proveedor" ? "Pendiente" : "Activo", emailVerified: true, profileImage: payload.picture || "", authProvider: "google", termsAccepted: true, termsAcceptedAt: new Date(), termsVersion: TERMS_VERSION } });
        if (role !== "proveedor") return created;
        const provider = await tx.provider.create({ data: { userEmail: email, name: payload.name, category: "pendiente", categoryName: "Perfil por completar", city: "", sector: "", phone: "", description: "Completa tu perfil profesional y carga los documentos requeridos.", profileImage: payload.picture || "" } });
        return tx.user.update({ where: { id: created.id }, data: { providerId: provider.id } });
      });
      requiresProviderProfile = role === "proveedor";
    } else if (!user.profileImage && payload.picture) user = await prisma.user.update({ where: { id: user.id }, data: { profileImage: payload.picture } });
    if (user.role === "proveedor" && !requiresProviderProfile) {
      const provider = await prisma.provider.findUnique({ where: { userEmail: email }, select: { category: true } });
      requiresProviderProfile = !provider || provider.category === "pendiente";
    }
    res.json({ token: signToken(user), user: safeUser(user), requiresProviderProfile });
  } catch (err) {
    console.error("[GOOGLE AUTH]", err);
    res.status(401).json({ error: "No se pudo autenticar con Google" });
  }
});

router.post("/forgot-password", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.authProvider === "local") {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({ where: { id: user.id }, data: { passwordResetToken: hashToken(token), passwordResetExpiresAt: new Date(Date.now() + 30 * 60 * 1000) } });
    const url = `${process.env.FRONTEND_URL || "http://localhost:5173"}/restablecer-contrasena?token=${token}&email=${encodeURIComponent(email)}`;
    await sendTransactionalEmail({ to: email, subject: "Restablece tu contraseña", html: `<p>Usa este enlace dentro de los próximos 30 minutos:</p><p><a href="${url}">Restablecer contraseña</a></p>` });
  }
  res.json({ message: "Si el correo está registrado, recibirás instrucciones" });
});

router.post("/reset-password", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { token, password } = req.body;
  if (!token || !password || password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return res.status(400).json({ error: "Datos o contraseña no válidos" });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.passwordResetToken !== hashToken(token) || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) return res.status(400).json({ error: "El enlace no es válido o caducó" });
  await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(password, 12), passwordResetToken: null, passwordResetExpiresAt: null } });
  res.json({ message: "Contraseña actualizada" });
});

router.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(safeUser(user));
});

router.get("/user/:email", authenticate, async (req, res) => {
  const email = normalizeEmail(req.params.email);
  if (req.user.role === "cliente" && req.user.email !== email) return res.status(403).json({ error: "No autorizado" });
  const user = await prisma.user.findUnique({ where: { email }, select: { name: true, email: true, phone: true, city: true, role: true, profileImage: true, createdAt: true } });
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  const requests = await prisma.request.findMany({ where: { clientEmail: email }, select: { id: true, service: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 5 });
  const reviews = await prisma.review.findMany({ where: { clientEmail: email }, select: { rating: true, comment: true, createdAt: true } });
  res.json({ ...user, requests, reviews });
});

export default router;
