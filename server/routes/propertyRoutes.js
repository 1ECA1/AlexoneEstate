
import express from "express";

import {
  createProperty,
  getProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
  updatePropertyApproval,
} from "../controllers/propertyController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public property browsing
router.get("/", getProperties);

router.get(
  "/my-listings",
  protect,
  authorize("agent"),
  getMyProperties
);

router.get("/:id", getPropertyById);

// Agent and admin property creation
router.post("/", protect, authorize("agent", "admin"), createProperty);

// Property management: ownership enforced in controller
router.put("/:id", protect, authorize("agent", "admin"), updateProperty);
router.delete("/:id", protect, authorize("agent", "admin"), deleteProperty);

// Only admins can approve or reject listings
router.patch(
  "/:id/approval",
  protect,
  authorize("admin"),
  updatePropertyApproval
);

export default router;
