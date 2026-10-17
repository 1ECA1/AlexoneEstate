
import { createHash, randomBytes } from "node:crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/emailService.js";

const PUBLIC_ROLES = ["customer", "agent"];

const CLIENT_URL =
  process.env.CLIENT_URL || "https://alexone-estate.vercel.app";

const hashToken = (token) =>
  createHash("sha256").update(token).digest("hex");

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

// Send a password-reset email.
// Email verification is disabled for now.
async function sendPasswordResetEmail(user, token) {
  const link = `${CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const name = escapeHtml(user.name);

  await sendEmail({
    to: user.email,
    subject: "Reset your HavenEstate password",
    text: `Hello ${user.name}, reset your password using this link: ${link}. This link expires in one hour.`,
    html: `
      <h2>Password reset</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your HavenEstate password.</p>
      <p><a href="${link}">Reset my password</a></p>
      <p>This link expires in one hour. If you did not request this, ignore this email.</p>
    `,
  });
}

// Fields returned to the frontend.
// Never expose passwords or internal password hashes.
const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  role: user.role,
  profilePhotoUrl: user.profilePhotoUrl || "",
  location: user.location || "",
  specialty: user.specialty || "",
  yearsOfExperience: user.yearsOfExperience ?? 0,
  bio: user.bio || "",
  createdAt: user.createdAt,
});

// Standard authentication response.
const sendAuthResponse = (res, statusCode, user) => {
  return res.status(statusCode).json({
    success: true,
    token: generateToken(user._id),
    user: formatUser(user),
  });
};

// POST /api/auth/register
// Register a customer or agent without email verification.
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body || {};

    // Validate registration details.
    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 80 ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Enter a valid name, email, and password of 8–128 characters.",
      });
    }

    // Only customer and agent registration is allowed publicly.
    if (role !== undefined && !PUBLIC_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration role.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for an existing account before creating a new one.
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Create the account without requiring email verification.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: typeof phone === "string" ? phone.trim() : "",
      role: role || "customer",
      emailVerified: true,
    });

    // Return the token immediately so the frontend can log the user in.
    return sendAuthResponse(res, 201, user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};

// POST /api/auth/login
// Login without requiring email verification.
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordCorrect = await user.matchPassword(password);

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Continue to prevent deactivated accounts from logging in.
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated.",
      });
    }

    // Email verification is intentionally not checked here.
    return sendAuthResponse(res, 200, user);
  } catch (error) {
    return next(error);
  }
};

// GET /api/auth/me
// Return the currently authenticated user's profile.
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: formatUser(req.user),
  });
};

// PATCH /api/auth/me
// Update the authenticated user's personal profile.
// Agent professional fields are available only to agents.
export const updateMe = async (req, res, next) => {
  try {
    const user = req.user;
    const body = req.body || {};

    const allowedFields = [
      "name",
      "email",
      "phone",
      "location",
      "specialty",
      "yearsOfExperience",
      "bio",
    ];

    const submittedFields = Object.keys(body);

    const unsupportedFields = submittedFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (unsupportedFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Unsupported profile field(s): ${unsupportedFields.join(", ")}.`,
      });
    }

    // Validate and update name.
    if (body.name !== undefined) {
      if (
        typeof body.name !== "string" ||
        body.name.trim().length < 2 ||
        body.name.trim().length > 80
      ) {
        return res.status(400).json({
          success: false,
          message: "Name must contain 2–80 characters.",
        });
      }

      user.name = body.name.trim();
    }

    // Keep the existing email-change restriction.
    // Changing an email address is separate from registration verification.
    if (body.email !== undefined) {
      if (
        typeof body.email !== "string" ||
        !body.email.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "A valid email address is required.",
        });
      }

      const submittedEmail = body.email.trim().toLowerCase();

      if (submittedEmail !== user.email) {
        return res.status(400).json({
          success: false,
          message:
            "Changing your email is not supported through this profile endpoint.",
        });
      }
    }

    // Validate and update phone.
    if (body.phone !== undefined) {
      if (typeof body.phone !== "string") {
        return res.status(400).json({
          success: false,
          message: "Phone number must be text.",
        });
      }

      user.phone = body.phone.trim();
    }

    // Only agents may update professional details.
    const agentFields = [
      "location",
      "specialty",
      "yearsOfExperience",
      "bio",
    ];

    const submittedAgentFields = agentFields.filter((field) =>
      Object.prototype.hasOwnProperty.call(body, field)
    );

    if (
      submittedAgentFields.length > 0 &&
      user.role !== "agent"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only agents can update professional agent details.",
      });
    }

    // Validate and update agent location.
    if (body.location !== undefined) {
      if (
        typeof body.location !== "string" ||
        body.location.trim().length > 120
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Location must be text and cannot exceed 120 characters.",
        });
      }

      user.location = body.location.trim();
    }

    // Validate and update agent specialty.
    if (body.specialty !== undefined) {
      if (
        typeof body.specialty !== "string" ||
        body.specialty.trim().length > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Specialty must be text and cannot exceed 100 characters.",
        });
      }

      user.specialty = body.specialty.trim();
    }

    // Validate and update agent biography.
    if (body.bio !== undefined) {
      if (
        typeof body.bio !== "string" ||
        body.bio.trim().length > 1000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Bio must be text and cannot exceed 1000 characters.",
        });
      }

      user.bio = body.bio.trim();
    }

    // Validate and update years of experience.
    if (body.yearsOfExperience !== undefined) {
      const experience = body.yearsOfExperience;

      const validExperienceType =
        typeof experience === "number" ||
        (typeof experience === "string" &&
          experience.trim() !== "");

      const numericExperience = Number(experience);

      if (
        !validExperienceType ||
        !Number.isInteger(numericExperience) ||
        numericExperience < 0 ||
        numericExperience > 70
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Years of experience must be a whole number from 0 to 70.",
        });
      }

      user.yearsOfExperience = numericExperience;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "Your profile has been updated successfully.",
      user: formatUser(updatedUser),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "That email address is already in use.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};

// POST /api/auth/forgot-password
// Password-reset email remains enabled.
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address.",
      });
    }

    const genericMessage =
      "If an account exists for that email, password-reset instructions will be sent.";

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      isActive: true,
    });

    if (!user) {
      return res.json({
        success: true,
        message: genericMessage,
      });
    }

    const token = randomBytes(32).toString("hex");

    user.passwordResetTokenHash = hashToken(token);
    user.passwordResetExpires = new Date(
      Date.now() + 60 * 60 * 1000
    );

    await user.save();

    try {
      await sendPasswordResetEmail(user, token);
    } catch (emailError) {
      console.error(
        "Password-reset email failed:",
        emailError.message
      );
    }

    return res.json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/auth/reset-password
// Reset the password using the emailed token.
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body || {};

    if (
      typeof token !== "string" ||
      !token ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid reset token and a password of 8–128 characters are required.",
      });
    }

    const user = await User.findOne({
      passwordResetTokenHash: hashToken(token),
      passwordResetExpires: { $gt: new Date() },
      isActive: true,
    }).select(
      "+password +passwordResetTokenHash +passwordResetExpires"
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "This password-reset link is invalid or has expired.",
      });
    }

    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.json({
      success: true,
      message: "Your password has been reset. You can now log in.",
    });
  } catch (error) {
    return next(error);
  }
};
