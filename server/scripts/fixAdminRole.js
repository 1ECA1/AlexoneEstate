
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const email = "admin@gmail.com";

async function fixAdminRole() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from your environment.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new Error(`No account found for ${email}.`);
    }

    console.log("Existing account:");
    console.log({
      id: user._id.toString(),
      email: user.email,
      previousRole: user.role,
      isActive: user.isActive,
    });

    if (user.role === "admin") {
      console.log("This account is already an admin. No change needed.");
      return;
    }

    user.role = "admin";
    await user.save();

    console.log("Admin role updated successfully.");
    console.log({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Could not update admin role:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

fixAdminRole();
