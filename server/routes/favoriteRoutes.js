
import express from "express";

import {
  getMyFavorites,
  addFavorite,
  removeFavorite,
} from "../controllers/favoriteController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All favorite operations require a logged-in customer.
router.use(protect, authorize("customer"));

router.get("/", getMyFavorites);
router.post("/:propertyId", addFavorite);
router.delete("/:propertyId", removeFavorite);

export default router;
