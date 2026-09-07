import crypto from "crypto";

import { getRazorpayClient } from "../config/razorpay.js";

import Product from "../models/Product.js";
import Order from "../models/Order.js";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function validateCustomer(customer) {
  if (!customer) {
    return false;
  }

  return Boolean(
    customer.name &&
      customer.phone &&
      customer.address &&
      customer.city &&
      customer.state &&
      customer.pincode
  );
}

function calculateShipping(subtotal, shipping = 0) {
  /*
   * Free shipping for orders >= ₹500.
   * Otherwise use the supplied shipping amount.
   */

  if (subtotal >= 500) {
    return 0;
  }

  const shippingAmount = Number(shipping);

  if (
    Number.isNaN(shippingAmount) ||
    shippingAmount < 0
  ) {
    return 0;
  }

  return shippingAmount;
}

async function buildOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(
      "Order must contain at least one product"
    );
  }

  const orderItems = [];

  for (const item of items) {
    if (!item || !item._id) {
      throw new Error(
        "Invalid product in cart"
      );
    }

    const quantity = Number(item.quantity);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      throw new Error(
        "Invalid product quantity"
      );
    }

    const product =
      await Product.findById(item._id);

    if (!product) {
      throw new Error(
        "One of the selected products no longer exists"
      );
    }

    if (product.stock < quantity) {
      throw new Error(
        `${product.name} does not have enough stock`
      );
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: Number(product.price),
      quantity,
    });
  }

  return orderItems;
}

function calculateSubtotal(orderItems) {
  return orderItems.reduce(
    (total, item) => {
      return (
        total +
        Number(item.price) *
          Number(item.quantity)
      );
    },
    0
  );
}

/*
|--------------------------------------------------------------------------
| CREATE RAZORPAY ORDER
|--------------------------------------------------------------------------
*/

export const createRazorpayOrder = async (
  req,
  res
) => {
  try {
    const {
      items,
      shipping = 0,
    } = req.body;

    /*
     * Check cart
     */

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    /*
     * Check Razorpay configuration
     */

    const razorpay =
      getRazorpayClient();

    if (!razorpay) {
      return res.status(503).json({
        message:
          "Online payment is not configured on the server",
      });
    }

    /*
     * Get fresh product information
     * from MongoDB.
     */

    const orderItems =
      await buildOrderItems(items);

    /*
     * Calculate price from database.
     *
     * Never trust the price sent by
     * the frontend.
     */

    const subtotal =
      calculateSubtotal(orderItems);

    const calculatedShipping =
      calculateShipping(
        subtotal,
        shipping
      );

    const total =
      subtotal + calculatedShipping;

    if (total <= 0) {
      return res.status(400).json({
        message:
          "Invalid order amount",
      });
    }

    /*
     * Razorpay expects amount in paise.
     */

    const amountInPaise =
      Math.round(total * 100);

    /*
     * Create Razorpay order
     */

    const razorpayOrder =
      await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",

        receipt: `shop_${Date.now()}`,

        notes: {
          userId: String(
            req.user._id
          ),
        },
      });

    /*
     * Send only the public Razorpay
     * key to the frontend.
     *
     * NEVER send RAZORPAY_KEY_SECRET.
     */

    return res.status(201).json({
      success: true,

      id: razorpayOrder.id,

      amount: razorpayOrder.amount,

      currency:
        razorpayOrder.currency,

      keyId:
        process.env.RAZORPAY_KEY_ID,

      subtotal,

      shipping:
        calculatedShipping,

      total,
    });
  } catch (error) {
    console.error(
      "Create Razorpay order error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to start online payment",
    });
  }
};

/*
|--------------------------------------------------------------------------
| VERIFY RAZORPAY PAYMENT
|--------------------------------------------------------------------------
*/

export const verifyRazorpayPayment =
  async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,

        customer,

        items,

        shipping = 0,
      } = req.body;

      /*
       * Validate Razorpay response
       */

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          message:
            "Incomplete payment response",
        });
      }

      /*
       * Validate customer
       */

      if (!validateCustomer(customer)) {
        return res.status(400).json({
          message:
            "Complete delivery details are required",
        });
      }

      /*
       * Check Razorpay configuration
       */

      const razorpay =
        getRazorpayClient();

      if (!razorpay) {
        return res.status(503).json({
          message:
            "Online payment is not configured",
        });
      }

      /*
       * Check whether this payment was
       * already processed.
       *
       * This protects against a user
       * refreshing/submitting twice.
       */

      const existingOrder =
        await Order.findOne({
          paymentReference:
            razorpay_payment_id,
        });

      if (existingOrder) {
        const populatedExisting =
          await Order.findById(
            existingOrder._id
          ).populate(
            "items.product"
          );

        return res.status(200).json({
          success: true,
          alreadyProcessed: true,
          order: populatedExisting,
        });
      }

      /*
       * Get the actual Razorpay order.
       */

      const razorpayOrder =
        await razorpay.orders.fetch(
          razorpay_order_id
        );

      if (!razorpayOrder) {
        return res.status(400).json({
          message:
            "Razorpay order not found",
        });
      }

      /*
       * Make sure this Razorpay order
       * belongs to the logged-in user.
       */

      if (
        razorpayOrder.notes &&
        razorpayOrder.notes.userId &&
        String(
          razorpayOrder.notes.userId
        ) !==
          String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            "Payment does not belong to this account",
        });
      }

      /*
       * Build fresh order items
       * from MongoDB.
       */

      const orderItems =
        await buildOrderItems(items);

      /*
       * Calculate the amount again
       * using database prices.
       */

      const subtotal =
        calculateSubtotal(orderItems);

      const calculatedShipping =
        calculateShipping(
          subtotal,
          shipping
        );

      const calculatedTotal =
        subtotal +
        calculatedShipping;

      const expectedAmount =
        Math.round(
          calculatedTotal * 100
        );

      /*
       * Compare Razorpay amount with
       * our calculated amount.
       */

      if (
        Number(razorpayOrder.amount) !==
        expectedAmount
      ) {
        return res.status(400).json({
          message:
            "Payment amount does not match the order amount",
        });
      }

      /*
       * Verify Razorpay signature.
       */

      const secret =
        process.env
          .RAZORPAY_KEY_SECRET;

      if (!secret) {
        return res.status(500).json({
          message:
            "Razorpay secret is not configured",
        });
      }

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            secret
          )
          .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
          )
          .digest("hex");

      /*
       * Use timingSafeEqual instead
       * of a normal string comparison.
       */

      const signatureBuffer =
        Buffer.from(
          generatedSignature,
          "utf8"
        );

      const receivedSignatureBuffer =
        Buffer.from(
          razorpay_signature,
          "utf8"
        );

      if (
        signatureBuffer.length !==
          receivedSignatureBuffer.length ||
        !crypto.timingSafeEqual(
          signatureBuffer,
          receivedSignatureBuffer
        )
      ) {
        return res.status(400).json({
          message:
            "Payment verification failed",
        });
      }

      /*
       * Verify that the payment itself
       * exists and belongs to this
       * Razorpay order.
       */

      const payment =
        await razorpay.payments.fetch(
          razorpay_payment_id
        );

      if (!payment) {
        return res.status(400).json({
          message:
            "Payment details not found",
        });
      }

      if (
        payment.order_id !==
        razorpay_order_id
      ) {
        return res.status(400).json({
          message:
            "Payment order mismatch",
        });
      }

      /*
       * Payment must be captured.
       */

      if (
        payment.status !==
        "captured"
      ) {
        return res.status(400).json({
          message:
            `Payment is not captured. Current status: ${payment.status}`,
        });
      }

      /*
       * Verify payment amount again.
       */

      if (
        Number(payment.amount) !==
        expectedAmount
      ) {
        return res.status(400).json({
          message:
            "Paid amount does not match order amount",
        });
      }

      /*
       * Reserve/reduce stock.
       *
       * We perform an atomic stock check
       * so two customers cannot buy the
       * same last item simultaneously.
       */

      const reservedItems = [];

      try {
        for (const item of orderItems) {
          const updatedProduct =
            await Product.findOneAndUpdate(
              {
                _id: item.product,
                stock: {
                  $gte:
                    item.quantity,
                },
              },
              {
                $inc: {
                  stock:
                    -item.quantity,
                },
              },
              {
                new: true,
              }
            );

          if (!updatedProduct) {
            throw new Error(
              `${item.name} is no longer available in the requested quantity`
            );
          }

          reservedItems.push(
            item
          );
        }
      } catch (stockError) {
        /*
         * Restore stock if one of the
         * later products fails.
         */

        for (const item of reservedItems) {
          await Product.findByIdAndUpdate(
            item.product,
            {
              $inc: {
                stock:
                  item.quantity,
              },
            }
          );
        }

        throw stockError;
      }

      /*
       * Create ecommerce order.
       */

      let order;

      try {
        order =
          await Order.create({
            user: req.user._id,

            customer: {
              name:
                customer.name,

              email:
                customer.email ||
                req.user.email ||
                "",

              phone:
                customer.phone,

              address:
                customer.address,

              city:
                customer.city,

              state:
                customer.state,

              pincode:
                customer.pincode,
            },

            items: orderItems,

            subtotal,

            shipping:
              calculatedShipping,

            total:
              calculatedTotal,

            paymentMethod:
              "Razorpay Online",

            paymentStatus:
              "Paid",

            paymentReference:
              razorpay_payment_id,

            status:
              "Processing",
          });
      } catch (orderError) {
        /*
         * If MongoDB order creation
         * fails, restore stock.
         */

        for (const item of orderItems) {
          await Product.findByIdAndUpdate(
            item.product,
            {
              $inc: {
                stock:
                  item.quantity,
              },
            }
          );
        }

        throw orderError;
      }

      /*
       * Populate product information.
       */

      const populatedOrder =
        await Order.findById(
          order._id
        ).populate(
          "items.product"
        );

      /*
       * Success response.
       */

      return res.status(201).json({
        success: true,

        message:
          "Payment successful and order created",

        order:
          populatedOrder,
      });
    } catch (error) {
      console.error(
        "Razorpay payment verification error:",
        error
      );

      return res.status(400).json({
        message:
          error.message ||
          "Unable to verify payment",
      });
    }
  };