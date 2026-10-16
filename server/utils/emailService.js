
function getEmailConfig() {
  const required = ["BREVO_API_KEY", "EMAIL_FROM"];

  const missing = required.filter(
    (key) => !process.env[key]?.trim()
  );

  if (missing.length) {
    throw new Error(
      `Email configuration is missing: ${missing.join(", ")}`
    );
  }

  return {
    apiKey: process.env.BREVO_API_KEY,
    senderEmail: process.env.EMAIL_FROM,
    senderName: process.env.EMAIL_FROM_NAME || "HavenEstate",
  };
}

export async function sendEmail({ to, subject, text, html }) {
  const config = getEmailConfig();

  const recipients = (Array.isArray(to) ? to : [to]).map(
    (recipient) =>
      typeof recipient === "string"
        ? { email: recipient }
        : recipient
  );

  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
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
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();

    console.error(
      "Brevo email API failed:",
      response.status,
      errorBody
    );

    throw new Error(
      `Brevo email API returned HTTP ${response.status}`
    );
  }

  return response.json();
}

export async function verifyEmailTransport() {
  const config = getEmailConfig();

  const response = await fetch(
    "https://api.brevo.com/v3/account",
    {
      headers: {
        "api-key": config.apiKey,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Brevo API verification failed with HTTP ${response.status}`
    );
  }

  return true;
}
