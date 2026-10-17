import "dotenv/config";

const to = process.argv[2];

if (!to) {
  console.error("Usage: node utils/testEmail.js you@example.com");
  process.exit(1);
}

const missing = ["BREVO_API_KEY", "EMAIL_FROM"].filter(
  (name) => !process.env[name]
);

if (missing.length > 0) {
  console.error(`Missing in .env: ${missing.join(", ")}`);
  process.exit(1);
}

const response = await fetch("https://api.brevo.com/v3/smtp/email", {
  method: "POST",
  headers: {
    "api-key": process.env.BREVO_API_KEY.trim(),
    "Content-Type": "application/json",
    accept: "application/json",
  },
  body: JSON.stringify({
    sender: {
      email: process.env.EMAIL_FROM.trim(),
      name: process.env.EMAIL_FROM_NAME || "HavenEstate",
    },
    to: [{ email: to }],
    subject: "HavenEstate test email",
    htmlContent: "<p>If you can read this, Brevo is working.</p>",
  }),
});

console.log(`Status: ${response.status}`);
console.log(await response.text());
