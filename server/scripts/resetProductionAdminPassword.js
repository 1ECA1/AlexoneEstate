import mongoose from "mongoose";
import User from "../models/User.js";

try {
  if (!process.env.MONGO_URI || !process.env.ADMIN_PASSWORD) {
    throw new Error("Required environment variables are missing.");
  }

  if (process.env.ADMIN_PASSWORD.length < 8) {
    throw new Error("Admin password must be at least 8 characters.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  if (!mongoose.connection.host.endsWith("mongodb.net")) {
    throw new Error("Refusing to modify a non-Atlas database.");
  }

  const admin = await User.findOne({ email: "admin@gmail.com" });

  if (!admin) {
    throw new Error("Admin account was not found.");
  }

  if (admin.role !== "admin") {
    throw new Error("Account is not an admin. No changes made.");
  }

  admin.password = process.env.ADMIN_PASSWORD;
  await admin.save();

  console.log("Production admin password reset successfully.");
} catch (error) {
  console.error("Password reset failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}