import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { verifyEmailTransport } from "./utils/emailService.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Ask Brevo whether our API key is accepted. This only warns on failure and
  // never stops the server, so the site keeps working even if email is broken.
  verifyEmailTransport()
    .then(() => console.log("Brevo email key is valid"))
    .catch((error) => console.warn(`Email check failed: ${error.message}`));
};

startServer();