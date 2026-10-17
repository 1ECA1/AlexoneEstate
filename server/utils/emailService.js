// Removes spaces and accidental quote marks that often sneak in when a value
// is pasted into a hosting dashboard
const clean = (value) =>
  (value || "").trim().replace(/^["']|["']$/g, "").trim();

function getEmailConfig() {
  const config = {
    apiKey: clean(process.env.BREVO_API_KEY),
    senderEmail: clean(process.env.EMAIL_FROM),
    senderName: clean(process.env.EMAIL_FROM_NAME) || "HavenEstate",
  };

  const missing = [];
  if (!config.apiKey) missing.push("BREVO_API_KEY");
  if (!config.senderEmail) missing.push("EMAIL_FROM");

  if (missing.length) {
    throw new Error(`Email configuration is missing: ${missing.join(", ")}`);
  }

  return config;
}

export async function sendEmail({ to, subject, text, html }) {
  const config = getEmailConfig();

  const recipients = (Array.isArray(to) ? to : [to]).map((recipient) =>
    typeof recipient === "string" ? { email: recipient } : recipient
  );

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    signal: AbortSignal.timeout(10000), // give up after 10 seconds
    headers: {
      "api-key": config.apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: config.senderName,
        email: config.senderEmail,
      },
      to: recipients,
      subject,
      textContent: text,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("Brevo email API failed:", response.status, errorBody);

    throw new Error(`Brevo email API returned HTTP ${response.status}`);
  }

  return response.json();
}

export async function verifyEmailTransport() {
  const config = getEmailConfig();

  const response = await fetch("https://api.brevo.com/v3/account", {
    signal: AbortSignal.timeout(10000),
    headers: {
      "api-key": config.apiKey,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Brevo API verification failed with HTTP ${response.status}`
    );
  }

  return true;
}