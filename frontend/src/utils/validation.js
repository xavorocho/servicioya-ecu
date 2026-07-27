export const cleanText = (value, max = 250) => String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
export const validators = {
  name: (v) => /^[A-Za-z\u00C0-\u024F\u00F1\u00D1' -]{3,80}$/.test(cleanText(v, 80)) || "Ingresa un nombre válido (solo letras, mínimo 3 caracteres).",
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanText(v, 120).toLowerCase()) || "Ingresa un correo válido, por ejemplo nombre@correo.com.",
  phone: (v) => /^09\d{8}$/.test(String(v ?? "").replace(/\D/g, "")) || "El celular debe tener 10 dígitos y comenzar con 09.",
  password: (v) => /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/.test(String(v ?? "")) || "Usa al menos 8 caracteres, con una letra y un número.",
  description: (v) => cleanText(v, 1000).length >= 15 || "Describe el trabajo con al menos 15 caracteres.",
  image: (f) => !f || (["image/jpeg", "image/png", "image/webp"].includes(f.type) && f.size <= 5 * 1024 * 1024) || "Usa una imagen JPG, PNG o WEBP de máximo 5 MB.",
};
export function firstError(fields) { for (const [value, validate] of fields) { const result = validate(value); if (result !== true) return result; } return ""; }
