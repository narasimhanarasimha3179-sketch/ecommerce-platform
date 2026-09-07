import express from "express";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Razorpay payment order
router.post(
  "/create-order",
  protect,
  createRazorpayOrder
);

// Verify Razorpay payment and create ecommerce order
router.post(
  "/verify",
  protect,
  verifyRazorpayPayment
);

export default router;