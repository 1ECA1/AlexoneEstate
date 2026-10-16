import mongoose from "mongoose";
import User from "../models/User.js";

async function createProductionAdmin() {
  try {
    const uri = process.env.MONGO_URI;
    const email = "admin@gmail.com";
    const password = process.env.ADMIN_PASSWORD;
    const name = "Alexone Administrator";

    if (!uri || !password) {
      throw new Error(
        "MONGO_URI and ADMIN_PASSWORD must be provided."
      );
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    await mongoose.connect(uri);

    // Refuse to run against local MongoDB.
    if (!mongoose.connection.host.endsWith("mongodb.net")) {
      throw new Error(
        "Refusing to modify a non-Atlas database."
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(
        "An account with this email already exists."
      );
      console.log(`Current role: ${existingUser.role}`);
      console.log("No account was changed.");
      return;
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
      isActive: true,
    });

    console.log("Production admin created successfully.");
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log("Password was hashed by the User model.");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

await createProductionAdmin();