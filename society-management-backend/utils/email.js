import nodemailer from "nodemailer";

function hasSmtp() {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

export async function sendEmail({ to, subject, text, html }) {
  if (!to) return { ok: false, skipped: true };

  if (!hasSmtp()) {
    console.log("[email:mock]", { to, subject, text });
    return { ok: true, mocked: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return { ok: true };
}

