
import nodemailer from "nodemailer";

function getEmailConfig() {
  const required = [
    "SMTP_USER",
    "SMTP_PASS",
    "EMAIL_FROM",
  ];

  const missing = required.filter(
    (key) => !process.env[key]?.trim()
  );

  if (missing.length) {
    throw new Error(
      `Email configuration is missing: ${missing.join(", ")}`
    );
  }

  return {
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
}

export async function sendEmail({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport(getEmailConfig());

  return transporter.sendMail({
    from: {
      name: process.env.EMAIL_FROM_NAME || "HavenEstate",
      address: process.env.EMAIL_FROM,
    },
    to,
    subject,
    text,
    html,
  });
}

export async function verifyEmailTransport() {
  const transporter = nodemailer.createTransport(getEmailConfig());

  await transporter.verify();

  return true;
}
