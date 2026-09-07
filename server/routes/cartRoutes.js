import express from "express";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../controllers/cartController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user's cart
router.get("/", protect, getCart);

// Add product to cart
router.post("/", protect, addToCart);

// Update quantity
router.put("/:id", protect, updateCartItem);

// Remove item
router.delete("/:id", protect, removeCartItem);

export default router;