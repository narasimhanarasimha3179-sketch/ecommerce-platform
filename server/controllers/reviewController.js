import Review from "../models/Review.js";

// ==========================================
// GET REVIEWS FOR A PRODUCT
// ==========================================

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    }).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// CREATE REVIEW
// ==========================================

export const createReview = async (req, res) => {
  try {
    const {
      product,
      name,
      email,
      rating,
      title,
      comment,
    } = req.body;

    // ------------------------------
    // VALIDATION
    // ------------------------------

    if (!product) {
      return res.status(400).json({
        message: "Product is required",
      });
    }

    if (!name) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!rating) {
      return res.status(400).json({
        message: "Rating is required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    if (!title) {
      return res.status(400).json({
        message: "Review title is required",
      });
    }

    if (!comment) {
      return res.status(400).json({
        message: "Review comment is required",
      });
    }

    // ------------------------------
    // CREATE REVIEW
    // ------------------------------

    const review = await Review.create({
      product,
      name,
      email,
      rating,
      title,
      comment,
    });

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};

// ==========================================
// GET SINGLE REVIEW
// ==========================================

export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(
      req.params.id
    );

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.json(review);
  } catch (error) {
    console.error("Get review error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// DELETE REVIEW
// ==========================================

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(
      req.params.id
    );

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};