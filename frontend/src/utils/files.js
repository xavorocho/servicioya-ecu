const apiUrl = import.meta.env.VITE_API_URL || "/api";
const backendUrl = apiUrl.startsWith("http") ? apiUrl.replace(/\/api\/?$/, "") : "";

export function getFileUrl(value) {
  if (!value || value === "No adjuntado") return null;
  if (/^https?:\/\//i.test(value)) return value;
  const normalized = String(value).replace(/\\/g, "/");
  const filename = normalized.split("/").filter(Boolean).pop();
  return `${backendUrl}/uploads/${encodeURIComponent(filename)}`;
}
