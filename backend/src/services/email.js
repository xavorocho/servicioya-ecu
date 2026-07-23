export async function sendTransactionalEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[EMAIL DEV] To: ${to} | Subject: ${subject}`);
      console.info(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
      return { delivered: false, development: true };
    }
    throw new Error("El servicio de correo no está configurado");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!response.ok) throw new Error("No se pudo enviar el correo electrónico");
  return { delivered: true };
}
