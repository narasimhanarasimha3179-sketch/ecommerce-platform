import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// GET CART
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart) {
      return res.json({
        items: [],
      });
    }

    res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);

    res.status(500).json({
      message: error.message || "Failed to get cart",
    });
  }
};

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const { product, quantity = 1 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    const productExists = await Product.findById(product);

    if (!productExists) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (productExists.stock < quantity) {
      return res.status(400).json({
        message: "Not enough stock available",
      });
    }

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === product.toString()
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + quantity;

      if (newQuantity > productExists.stock) {
        return res.status(400).json({
          message: "Cannot add more than available stock",
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product,
        quantity,
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(
      cart._id
    ).populate("items.product");

    res.json(updatedCart);
  } catch (error) {
    console.error("Add cart error:", error);

    res.status(500).json({
      message: error.message || "Failed to add product",
    });
  }
};

// UPDATE CART ITEM
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.id;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    /*
      First try the cart item's own _id.
      This works for new cart items.
    */
    let item = null;

    if (mongoose.Types.ObjectId.isValid(itemId)) {
      item = cart.items.id(itemId);
    }

    /*
      Fallback:
      Old cart items may not have an _id because
      the previous Cart schema used _id: false.

      Therefore search using the Product ID.
    */
    if (!item) {
      item = cart.items.find(
        (cartItem) =>
          cartItem.product.toString() === itemId
      );
    }

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    const product = await Product.findById(item.product);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: "Quantity exceeds available stock",
      });
    }

    item.quantity = quantity;

    await cart.save();

    const updatedCart = await Cart.findById(
      cart._id
    ).populate("items.product");

    res.json(updatedCart);
  } catch (error) {
    console.error("Update cart error:", error);

    res.status(500).json({
      message: error.message || "Failed to update cart",
    });
  }
};

// REMOVE CART ITEM
export const removeCartItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    /*
      Remove by cart item _id for new items.
    */
    let item = null;

    if (mongoose.Types.ObjectId.isValid(itemId)) {
      item = cart.items.id(itemId);
    }

    /*
      Fallback for old cart items without _id.
    */
    if (!item) {
      item = cart.items.find(
        (cartItem) =>
          cartItem.product.toString() === itemId
      );
    }

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    /*
      Mongoose subdocument delete.
    */
    if (typeof item.deleteOne === "function") {
      item.deleteOne();
    } else {
      cart.items = cart.items.filter(
        (cartItem) =>
          cartItem.product.toString() !== itemId
      );
    }

    await cart.save();

    const updatedCart = await Cart.findById(
      cart._id
    ).populate("items.product");

    res.json(updatedCart);
  } catch (error) {
    console.error("Remove cart error:", error);

    res.status(500).json({
      message:
        error.message || "Failed to remove cart item",
    });
  }
};