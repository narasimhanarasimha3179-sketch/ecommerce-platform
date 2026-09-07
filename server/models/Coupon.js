import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, unique: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    discountValue: { type: Number, required: true }, // e.g., 10 for 10% or 500 for ₹500
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: 5000 },
    isActive: { type: Boolean, default: true },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);