import express from "express";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get wishlist
router.get("/", protect, getWishlist);

// Add product
router.post("/", protect, addToWishlist);

// Remove product
router.delete("/:id", protect, removeFromWishlist);

export default router;