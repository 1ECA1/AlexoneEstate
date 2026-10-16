import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Requires a valid token. Puts the logged-in user on req.user.
export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Not authorized, no token provided");
    }

    const token = header.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      res.status(401);
      throw new Error("Not authorized, token is invalid or expired");
    }

    // Always re-check the database: the user may have been deleted or disabled
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error("Not authorized, account not available");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Allows only certain roles. Use it AFTER protect.
// Example: authorize("agent", "admin")
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("You do not have permission to perform this action"));
    }
    next();
  };