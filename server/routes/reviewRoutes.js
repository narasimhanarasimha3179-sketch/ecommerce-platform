import express from "express";

import {
  getProductReviews,
  createReview,
  getReviewById,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

// GET all reviews for a product
router.get(
  "/product/:productId",
  getProductReviews
);

// CREATE a new review
router.post(
  "/",
  createReview
);

// GET a single review
router.get(
  "/:id",
  getReviewById
);

// DELETE a review
router.delete(
  "/:id",
  deleteReview
);

export default router;