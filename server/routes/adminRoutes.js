import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getAdminProperties,
  getUsers,
  updateUserStatus,
} from "../controllers/adminController.js";

const router = express.Router();

// Every route in this file is admin-only. Applying it once at the top means a
// route added later can never be left unprotected by mistake.
router.use(protect, authorize("admin"));

router.get("/properties", getAdminProperties);
router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);

export default router;