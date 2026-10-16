import mongoose from "mongoose";
import Property from "../models/Property.js";
import User from "../models/User.js";

const toUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// GET /api/admin/properties
// Every listing in every state, with the agent's name and contact details
export const getAdminProperties = async (req, res, next) => {
  try {
    const properties = await Property.find()
      .sort({ createdAt: -1 })
      .populate("agent", "name email phone");

    res.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users
export const getUsers = async (req, res, next) => {
  try {
    // The password hash is never returned because the field is select:false
    const users = await User.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users.map(toUserResponse),
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/users/:id/status   body: { "isActive": true | false }
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      res.status(404);
      throw new Error("User not found");
    }

    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error("isActive must be true or false");
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Two safety rules so the platform can never lock itself out
    if (user._id.equals(req.user._id)) {
      res.status(400);
      throw new Error("You cannot change your own account status");
    }

    if (user.role === "admin") {
      res.status(403);
      throw new Error("Admin accounts cannot be deactivated here");
    }

    user.isActive = isActive;
    await user.save();

    res.json({ success: true, data: toUserResponse(user) });
  } catch (error) {
    next(error);
  }
};