import nodemailer from "nodemailer";
import { Resend } from "resend";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailArgs) {
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: "ELYAN Chicken Hub <onboarding@resend.dev>",
      to,
      subject,
      html,
      ...(text ? { text } : {}),
    });
    if (result.error) throw new Error(result.error.message || "Failed to send email (Resend).");
    return { provider: "resend" as const, id: result.data?.id };
  }

  const host = process.env.MAIL_SERVER;
  const port = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : undefined;
  const username = process.env.MAIL_USERNAME;
  const password = process.env.MAIL_PASSWORD;
  const from = process.env.MAIL_FROM || username;
  const fromName = process.env.MAIL_FROM_NAME;
  const useTls = (process.env.MAIL_USE_TLS ?? "true").toLowerCase() !== "false";
  const useSsl = (process.env.MAIL_USE_SSL ?? "false").toLowerCase() === "true";

  if (!host || !port || !username || !password || !from) {
    throw new Error(
      "Email service not configured. Set RESEND_API_KEY or MAIL_SERVER/MAIL_PORT/MAIL_USERNAME/MAIL_PASSWORD/MAIL_FROM."
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: useSsl,
    auth: { user: username, pass: password },
    ...(useTls ? { requireTLS: true } : {}),
  });

  const info = await transporter.sendMail({
    from: fromName ? `${fromName} <${from}>` : from,
    to,
    subject,
    text,
    html,
  });

  return { provider: "smtp" as const, id: info.messageId };
}

