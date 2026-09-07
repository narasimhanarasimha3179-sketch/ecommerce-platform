import Wishlist from "../models/Wishlist.js";

// Get Wishlist
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({
      user: req.user._id,
    }).populate("products");

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });
    }

    res.json(wishlist);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Add Product
export const addToWishlist = async (req, res) => {
  try {
    const { product } = req.body;

    let wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });
    }

    if (!wishlist.products.includes(product)) {
      wishlist.products.push(product);
    }

    await wishlist.save();

    res.json(wishlist);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Remove Product
export const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== req.params.id
    );

    await wishlist.save();

    res.json(wishlist);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};