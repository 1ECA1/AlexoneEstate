
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const PUBLIC_ROLES = ["customer", "agent"];

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
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    // Public registration must never create an admin account.
    const safeRole = PUBLIC_ROLES.includes(role)
      ? role
      : "customer";

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: typeof phone === "string" ? phone.trim() : "",
      role: safeRole,
    });

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
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

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

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated.",
      });
    }

    return sendAuthResponse(res, 200, user);
  } catch (error) {
    return next(error);
  }
};

// GET /api/auth/me
// Returns the currently authenticated user's profile.
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: formatUser(req.user),
  });
};

// PATCH /api/auth/me
// Updates the authenticated user's personal profile.
// Agent professional fields are available only to agents.
export const updateMe = async (req, res, next) => {
  try {
    const user = req.user;
    const body = req.body || {};

    // Prevent changes to protected account properties.
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

    // Validate name only if the client submitted it.
    if (body.name !== undefined) {
      if (
        typeof body.name !== "string" ||
        body.name.trim().length < 2
      ) {
        return res.status(400).json({
          success: false,
          message: "Name must contain at least 2 characters.",
        });
      }

      if (body.name.trim().length > 80) {
        return res.status(400).json({
          success: false,
          message: "Name cannot exceed 80 characters.",
        });
      }

      user.name = body.name.trim();
    }

    // Validate email only if submitted.
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

      user.email = body.email.trim().toLowerCase();
    }

    if (body.phone !== undefined) {
      if (typeof body.phone !== "string") {
        return res.status(400).json({
          success: false,
          message: "Phone number must be text.",
        });
      }

      user.phone = body.phone.trim();
    }

    const agentFields = [
      "location",
      "specialty",
      "yearsOfExperience",
      "bio",
    ];

    const submittedAgentFields = agentFields.filter(
      (field) =>
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

    // Validate and update experience.
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
