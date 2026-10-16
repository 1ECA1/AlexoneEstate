import express from "express";
import {
  createInquiry,
  getMyInquiries,
  getAgentInquiries,
  respondToInquiry,
  getAdminInquiries,
  adminRespondToInquiry,
} from "../controllers/inquiryController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer routes
router.post(
  "/property/:propertyId",
  protect,
  authorize("customer"),
  createInquiry
);
router.get("/customer", protect, authorize("customer"), getMyInquiries);

// Agent routes
router.get("/agent", protect, authorize("agent"), getAgentInquiries);
router.patch(
  "/agent/:id",
  protect,
  authorize("agent"),
  respondToInquiry
);

// Administrator routes
router.get("/admin", protect, authorize("admin"), getAdminInquiries);
router.patch(
  "/admin/:id",
  protect,
  authorize("admin"),
  adminRespondToInquiry
);

export default router;