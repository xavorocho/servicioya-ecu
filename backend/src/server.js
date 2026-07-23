import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import providerRoutes from "./routes/providers.js";
import requestRoutes from "./routes/requests.js";
import quoteRoutes from "./routes/quotes.js";
import timeProposalRoutes from "./routes/timeProposals.js";
import paymentRoutes from "./routes/payments.js";
import reviewRoutes from "./routes/reviews.js";
import documentRoutes from "./routes/documents.js";
import categoryRoutes from "./routes/categories.js";
import supportRoutes from "./routes/support.js";
import evidenceRoutes from "./routes/evidence.js";
import chatRoutes from "./routes/chat.js";
import specialtyRoutes from "./routes/specialties.js";
import notificationRoutes from "./routes/notifications.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "https://servicioya-ecu.vercel.app",
];
app.use(cors({ origin: (origin, cb) => {
  if (!origin || allowedOrigins.includes(origin)) cb(null, true);
  else cb(new Error("No permitido por CORS"));
}, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/api/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/time-proposals", timeProposalRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/specialties", specialtyRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", version: "2.0.0" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Error interno del servidor" });
});

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
