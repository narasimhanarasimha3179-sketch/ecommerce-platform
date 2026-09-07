import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Get all products with search & category filtering
router.get("/", async (req, res) => {
  try {
    const { keyword, category, brand, featured } = req.query;

    let filter = {};

    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = brand;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Invalid product ID format" });
  }
});

export default router;