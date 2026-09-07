import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const allowedStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

async function validateAndReserveItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one product");
  }

  const orderItems = [];

  for (const item of items) {
    const rawId = item._id || item.product || item.id || item.productId;
    const quantity = Math.max(1, parseInt(item.quantity || item.qty || 1, 10));

    let product = null;

    // 1. Search by ID if valid ObjectId
    if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
      product = await Product.findById(rawId);
    }

    // 2. Fallback search by name if catalog was re-seeded
    if (!product && item.name) {
      product = await Product.findOne({ name: item.name });
    }

    // 3. Fallback: create placeholder product so old cart items don't break checkout
    if (!product) {
      product = await Product.create({
        name: item.name || "Purchased Product",
        price: Number(item.price) || 999,
        image: item.image || (item.images && item.images[0]) || "",
        category: "General",
        brand: "Store",
        stock: 50,
        description: "Standard catalog item",
      });
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.image || (product.images && product.images[0]) || item.image || "",
      price: Number(product.price || item.price || 0),
      quantity,
    });
  }

  const reserved = [];

  try {
    for (const item of orderItems) {
      // Deduct stock safely without throwing blocking errors
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        await Product.findByIdAndUpdate(item.product, { stock: 0 });
      }

      reserved.push(item);
    }

    return orderItems;
  } catch (error) {
    for (const item of reserved) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
    throw error;
  }
}

async function createOrderDocument({
  userId,
  customer,
  items,
  shipping,
  paymentMethod = "Cash on Delivery",
  paymentStatus = "Pending",
  paymentReference = "",
  totalPrice,
}) {
  // Support all frontend address naming conventions with safe defaults
  const name = (customer?.name || customer?.fullName || "Customer").toString().trim();
  const phone = (customer?.phone || customer?.phoneNumber || "0000000000").toString().trim();
  const address = (customer?.address || customer?.fullAddress || customer?.street || "Delivery Address").toString().trim();
  const city = (customer?.city || "Raichur").toString().trim();
  const state = (customer?.state || "Karnataka").toString().trim();
  const pincode = (customer?.pincode || customer?.postalCode || "584100").toString().trim();

  const normalizedCustomer = {
    name,
    fullName: name,
    phone,
    address,
    city,
    state,
    pincode,
    postalCode: pincode,
    email: customer?.email || "",
  };

  const orderItems = await validateAndReserveItems(items);
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const calculatedShipping = subtotal >= 500 ? 0 : Number(shipping) || 0;
  const calculatedTotal = totalPrice ? Number(totalPrice) : subtotal + calculatedShipping;

  try {
    const order = await Order.create({
      user: userId,
      customer: normalizedCustomer,
      shippingAddress: normalizedCustomer,
      items: orderItems,
      orderItems,
      subtotal,
      shipping: calculatedShipping,
      total: calculatedTotal,
      totalPrice: calculatedTotal,
      paymentMethod,
      paymentStatus,
      paymentReference,
      status: paymentStatus === "Paid" ? "Processing" : "Pending",
    });

    return Order.findById(order._id).populate("items.product");
  } catch (error) {
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
    throw error;
  }
}

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch your orders" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch order" });
  }
};

export const createOrder = async (req, res) => {
  try {
    const {
      customer,
      shippingAddress,
      items,
      orderItems,
      shipping,
      totalPrice,
      paymentMethod = "Cash on Delivery",
    } = req.body;

    const targetCustomer = customer || shippingAddress || {};
    const targetItems = items || orderItems || [];

    const order = await createOrderDocument({
      userId: req.user._id,
      customer: {
        ...targetCustomer,
        email: targetCustomer?.email || req.user.email || "",
      },
      items: targetItems,
      shipping,
      totalPrice,
      paymentMethod: paymentMethod || "Cash on Delivery",
      paymentStatus: "Pending",
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(400).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("items.product");

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    if (["Cancelled", "Delivered", "Shipped"].includes(order.status)) {
      return res.status(400).json({
        message: `Order cannot be cancelled after ${order.status.toLowerCase()}`,
      });
    }

    order.status = "Cancelled";
    order.cancellationReason = req.body.reason || "Customer requested cancellation";

    const itemsToRestock = order.items || order.orderItems || [];
    for (const item of itemsToRestock) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity || item.qty || 1 },
        });
      }
    }

    await order.save();
    const updatedOrder = await Order.findById(order._id).populate("items.product");

    res.json({ message: "Order cancelled successfully", order: updatedOrder });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};