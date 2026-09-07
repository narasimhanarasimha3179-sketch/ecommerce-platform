import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const { category, brand, search, sort } = req.query;

    const filter = {};

    // 1. Category Filter
    if (category && category.trim() && category !== "All Categories") {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
    }

    // 2. Brand Filter
    if (brand && brand.trim() && brand !== "All Brands") {
      filter.brand = { $regex: new RegExp(`^${brand.trim()}$`, "i") };
    }

    // 3. Search Filter
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { brand: { $regex: search.trim(), $options: "i" } },
        { category: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // 4. Sort Mapping
    let sortQuery = { createdAt: -1 };

    switch (sort) {
      case "price-asc":
      case "low-high":
        sortQuery = { price: 1 };
        break;
      case "price-desc":
      case "high-low":
        sortQuery = { price: -1 };
        break;
      case "rating":
      case "top-rated":
        sortQuery = { rating: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const products = await Product.find(filter).sort(sortQuery);

    return res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error retrieving products:", error);
    return res.status(500).json({ message: error.message });
  }
};