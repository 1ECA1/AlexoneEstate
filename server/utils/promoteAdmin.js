
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const promoteAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (!email) {
      throw new Error("ADMIN_EMAIL is missing from server/.env");
    }

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      console.error(
        "No account matches ADMIN_EMAIL. No changes were made."
      );
      return;
    }

    if (user.role === "admin") {
      console.log("This account is already an admin.");
      return;
    }

    user.role = "admin";
    await user.save();

    console.log("Admin role assigned successfully.");
    console.log(`Account: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log("Password and property records were not changed.");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

await promoteAdmin();
