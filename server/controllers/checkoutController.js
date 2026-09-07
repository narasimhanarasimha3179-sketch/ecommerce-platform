import Cart from "../models/Cart.js";
import User from "../models/User.js";
import { createOrder } from "./orderController.js";

// Legacy checkout endpoint kept for compatibility with older clients.
// The current React checkout page uses /api/orders for COD and /api/payment for online payment.
export const checkout = async (req, res) => {
  try {
    const { addressIndex = 0, paymentMethod = "Cash on Delivery" } = req.body;
    const user = await User.findById(req.user._id);
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const address = user?.addresses?.[Number(addressIndex)];
    if (!address) {
      return res.status(404).json({ message: "Delivery address not found" });
    }

    if (paymentMethod !== "Cash on Delivery") {
      return res.status(400).json({ message: "Use the payment gateway for online payments" });
    }

    req.body = {
      customer: {
        name: address.fullName || user.name,
        email: user.email,
        phone: address.mobile || user.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
      items: cart.items.map((item) => ({
        _id: item.product._id,
        quantity: item.quantity,
      })),
      paymentMethod: "Cash on Delivery",
    };

    await createOrder(req, res);

    if (res.statusCode === 201) {
      cart.items = [];
      await cart.save();
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
