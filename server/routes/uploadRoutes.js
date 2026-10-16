
import express from "express";
import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";
import uploadImages from "../middleware/uploadImages.js";
import {
  uploadPropertyImages,
  uploadAgentProfilePhoto,
} from "../controllers/uploadController.js";

const router = express.Router();

// Existing property image upload — preserved.
router.post(
  "/properties",
  protect,
  authorize("agent", "admin"),
  uploadImages.array("images", 10),
  uploadPropertyImages
);

// New agent profile photo upload.
router.post(
  "/agent-profile",
  protect,
  authorize("agent"),
  uploadImages.single("image"),
  uploadAgentProfilePhoto
);

export default router;
