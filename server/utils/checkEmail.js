import "dotenv/config";
import { verifyEmailTransport } from "./emailService.js";

try {
  await verifyEmailTransport();
  console.log("Brevo key is valid.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}