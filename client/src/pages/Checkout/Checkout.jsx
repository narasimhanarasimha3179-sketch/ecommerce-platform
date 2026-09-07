import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import MainLayout from "../../layouts/MainLayout";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import {
  FaMapMarkerAlt,
  FaPlus,
  FaCheckCircle,
  FaTrashAlt,
  FaTag,
  FaArrowLeft,
} from "react-icons/fa";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

export default function Checkout() {
  const navigate = useNavigate();
  const { cart = [], cartTotal, clearCart } = useCart();
  const { userInfo } = useAuth();

  // Dynamic calculated fallback if cartTotal is undefined or 0
  const calculatedTotal = cart.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity || item.qty || 1);
    return acc + price * qty;
  }, 0);

  const baseTotal = cartTotal > 0 ? cartTotal : calculatedTotal;

  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const discountAmount = appliedCoupon ? Number(appliedCoupon.discount || 0) : 0;
  const finalTotal = Math.max(0, baseTotal - discountAmount);

  // Address Persistence
  const storageKey = `user_addresses_${userInfo?._id || "guest"}`;
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      const list = stored ? JSON.parse(stored) : [];
      return list[0]?.id || "new";
    } catch {
      return "new";
    }
  });

  const [showNewAddressForm, setShowNewAddressForm] = useState(
    savedAddresses.length === 0
  );

  const [formData, setFormData] = useState(() => {
    if (savedAddresses.length > 0) {
      return {
        fullName: savedAddresses[0].fullName || userInfo?.name || "",
        phone: savedAddresses[0].phone || userInfo?.phone || "",
        city: savedAddresses[0].city || "Raichur",
        state: savedAddresses[0].state || "Karnataka",
        pincode: savedAddresses[0].pincode || "584100",
        fullAddress: savedAddresses[0].fullAddress || "",
      };
    }
    return {
      fullName: userInfo?.name || "",
      phone: userInfo?.phone || "",
      city: "Raichur",
      state: "Karnataka",
      pincode: "584100",
      fullAddress: "",
    };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(savedAddresses));
  }, [savedAddresses, storageKey]);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setShowNewAddressForm(false);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      city: addr.city || "Raichur",
      state: addr.state || "Karnataka",
      pincode: addr.pincode || "584100",
      fullAddress: addr.fullAddress || "",
    });
  };

  const handleAddNewClick = () => {
    setSelectedAddressId("new");
    setShowNewAddressForm(true);
    setFormData({
      fullName: userInfo?.name || "",
      phone: userInfo?.phone || "",
      city: "",
      state: "",
      pincode: "",
      fullAddress: "",
    });
  };

  const handleDeleteAddress = (id, e) => {
    e.stopPropagation();
    const filtered = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(filtered);
    if (selectedAddressId === id) {
      if (filtered.length > 0) {
        handleSelectAddress(filtered[0]);
      } else {
        handleAddNewClick();
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Coupon Validator
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    try {
      setCouponLoading(true);
      setCouponError("");
      const res = await axios.post(`${BASE_URL}/api/coupons/validate`, {
        code: couponInput.trim().toUpperCase(),
        orderAmount: baseTotal,
      });
      setAppliedCoupon(res.data);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || "Invalid or expired coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const handlePlaceOrder = async (e) => {
    e?.preventDefault();

    const activeAddress =
      selectedAddressId !== "new" && !showNewAddressForm
        ? savedAddresses.find((a) => a.id === selectedAddressId) || formData
        : formData;

    const fullName = (activeAddress.fullName || userInfo?.name || "").trim();
    const phone = (activeAddress.phone || userInfo?.phone || "").trim();
    const fullAddress = (activeAddress.fullAddress || activeAddress.address || "").trim();
    const city = (activeAddress.city || "Raichur").trim();
    const state = (activeAddress.state || "Karnataka").trim();
    const pincode = (activeAddress.pincode || activeAddress.postalCode || "584100").trim();

    if (!fullName || !phone || !fullAddress) {
      setError("Please ensure name, phone, and delivery address are filled.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (showNewAddressForm || selectedAddressId === "new") {
        const newAddressItem = {
          id: Date.now().toString(),
          fullName,
          phone,
          city,
          state,
          pincode,
          fullAddress,
        };
        setSavedAddresses((prev) => [newAddressItem, ...prev]);
        setSelectedAddressId(newAddressItem.id);
      }

      const token = localStorage.getItem("token");

      // Payload supporting both customer and shippingAddress schemas
      const orderPayload = {
        orderItems: cart.map((item) => ({
          product: item._id || item.product,
          name: item.name,
          qty: Number(item.quantity || item.qty || 1),
          quantity: Number(item.quantity || item.qty || 1),
          image: item.image || (item.images && item.images[0]) || "",
          price: Number(item.price),
        })),
        items: cart.map((item) => ({
          product: item._id || item.product,
          name: item.name,
          quantity: Number(item.quantity || item.qty || 1),
          image: item.image || (item.images && item.images[0]) || "",
          price: Number(item.price),
        })),
        shippingAddress: {
          fullName,
          name: fullName,
          phone,
          address: fullAddress,
          city,
          state,
          pincode,
          postalCode: pincode,
          country: "India",
        },
        customer: {
          name: fullName,
          fullName,
          phone,
          address: fullAddress,
          city,
          state,
          pincode,
          postalCode: pincode,
          email: userInfo?.email || "",
        },
        paymentMethod: "Cash on Delivery",
        itemsPrice: baseTotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code || "",
        shippingPrice: 0,
        totalPrice: finalTotal,
        total: finalTotal,
      };

      const res = await axios.post(`${BASE_URL}/api/orders`, orderPayload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (typeof clearCart === "function") clearCart();

      const orderId = res.data?._id || res.data?.order?._id;
      navigate(orderId ? `/orders/${orderId}` : "/orders");
    } catch (err) {
      console.error("Order error:", err);
      setError(
        err.response?.data?.message || "Failed to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-6">
          <Link to="/cart" className="hover:text-blue-600 flex items-center gap-1">
            <FaArrowLeft /> Back to Cart
          </Link>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ================= LEFT: DELIVERY ADDRESS ================= */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
                  <FaMapMarkerAlt className="text-blue-600" />
                  <span>Delivery Address</span>
                </div>

                <button
                  type="button"
                  onClick={handleAddNewClick}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition"
                >
                  <FaPlus className="text-[10px]" /> Add New Address
                </button>
              </div>

              {/* Saved Address Cards */}
              {savedAddresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id && !showNewAddressForm;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/40 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-gray-900 text-sm">
                              {addr.fullName}
                            </span>
                            {isSelected && (
                              <FaCheckCircle className="text-blue-600 text-sm" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{addr.phone}</p>
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {addr.fullAddress}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {addr.city ? `${addr.city}, ` : ""}{addr.state ? `${addr.state} - ` : ""}{addr.pincode}
                          </p>
                        </div>

                        <div className="flex justify-end mt-3 pt-2 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                            className="text-gray-400 hover:text-red-600 text-xs flex items-center gap-1 transition"
                          >
                            <FaTrashAlt className="text-[10px]" /> Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add New Address Form */}
              {(showNewAddressForm || savedAddresses.length === 0) && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-4">
                    {savedAddresses.length > 0 ? "Add New Delivery Destination" : "Enter Delivery Details"}
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Your Full Name"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="10-digit mobile number"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="City"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          required
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="State"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          required
                          value={formData.pincode}
                          onChange={handleChange}
                          placeholder="6-digit PIN"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Full Street Address *
                      </label>
                      <textarea
                        name="fullAddress"
                        required
                        rows={2}
                        value={formData.fullAddress}
                        onChange={handleChange}
                        placeholder="House / Flat No., Landmark, Area"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                {error}
              </div>
            )}
          </div>

          {/* ================= RIGHT: ORDER SUMMARY & COUPON ================= */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-fit space-y-5">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Order Summary
            </h2>

            {/* Cart Items List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 pr-1">
              {cart.map((item, idx) => (
                <div key={item._id || idx} className="py-2.5 flex justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      Qty: {item.quantity || item.qty || 1}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900 flex-shrink-0">
                    ₹{Number(item.price * (item.quantity || item.qty || 1)).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code Engine */}
            <div className="border-t border-b border-gray-100 py-3 space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <FaTag className="text-blue-600" /> Have a Promo Code?
              </label>

              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="e.g. FLAT10, SAVE100"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs uppercase font-mono outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="text-emerald-800 font-bold">
                    <span>Coupon &quot;{appliedCoupon.code}&quot; applied</span>
                    <p className="text-[10px] text-emerald-600 font-normal">Discount savings active</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] font-semibold text-red-600 mt-1">{couponError}</p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">
                  ₹{Number(baseTotal).toLocaleString("en-IN")}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-3 border-t border-gray-100">
                <span>Total</span>
                <span>₹{Number(finalTotal).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Order Placement Button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading || cart.length === 0}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Creating Order..." : "Place Order (Cash on Delivery)"}
            </button>

            <p className="text-[11px] text-gray-400 text-center">
              By placing this order, you agree to ShopEase terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}