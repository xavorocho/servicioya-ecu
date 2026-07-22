import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "servicioya/documentos",
    allowed_formats: ["pdf", "jpg", "jpeg", "png"],
    public_id: () => uuidv4(),
  },
});

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido. Solo PDF, JPG y PNG."), false);
  }
};

export const upload = multer({
  storage: isProduction ? cloudinaryStorage : localStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadFields = upload.fields([
  { name: "docCedula", maxCount: 1 },
  { name: "docAntecedentes", maxCount: 1 },
  { name: "docOficio", maxCount: 1 },
  { name: "docRuc", maxCount: 1 },
]);
