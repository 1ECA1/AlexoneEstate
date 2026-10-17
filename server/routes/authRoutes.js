import express from "express";
import {
register,
login,
getMe,
updateMe,
forgotPassword,
resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authentication
router.post("/register", register);
router.post("/login", login);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Current user profile
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);

export default router;