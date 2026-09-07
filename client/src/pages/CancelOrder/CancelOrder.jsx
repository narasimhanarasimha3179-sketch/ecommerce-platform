import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import MainLayout from "../../layouts/MainLayout";
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaTimesCircle,
  FaCheckCircle,
} from "react-icons/fa";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const REASONS = [
  "Ordered by mistake / duplicate order",
  "Found a better price elsewhere",
  "Delivery time is too long",
  "Need to change shipping address or phone number",
  "Incorrect item or quantity selected",
  "Other (please specify below)",
];

export default function CancelOrder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [customComment, setCustomComment] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/orders/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setOrder(res.data?.order || res.data);
      } catch (err) {
        console.error("Fetch order error:", err);
        setError(err.response?.data?.message || "Failed to load order.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const handleSubmitCancellation = async (e) => {
    e.preventDefault();

    const finalReason =
      selectedReason === "Other (please specify below)"
        ? customComment.trim() || "Customer requested cancellation"
        : selectedReason;

    try {
      setSubmitting(true);
      setError("");
      const token = localStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/api/orders/${id}/cancel`,
        { reason: finalReason },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      navigate(`/orders/${id}`);
    } catch (err) {
      console.error("Cancel order error:", err);
      setError(
        err.response?.data?.message || "Unable to cancel order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-sm font-semibold text-gray-500">Loading cancellation request...</p>
        </div>
      </MainLayout>
    );
  }

  if (error && !order) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto my-16 p-8 bg-white border border-gray-200 rounded-2xl text-center shadow-sm">
          <p className="text-sm font-semibold text-red-600 mb-4">{error}</p>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            <FaArrowLeft /> Return to Orders
          </Link>
        </div>
      </MainLayout>
    );
  }

  const items = Array.isArray(order?.items) ? order.items : order?.orderItems || [];
  const isCancellable = !["Cancelled", "Delivered", "Shipped"].includes(order?.status);

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link
          to={`/orders/${id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 mb-6 transition"
        >
          <FaArrowLeft /> Back to Order Summary
        </Link>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-lg">
              <FaTimesCircle />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">Cancel Order</h1>
              <p className="text-xs text-gray-400 font-mono mt-0.5">Reference ID: #{order?._id}</p>
            </div>
          </div>

          {!isCancellable ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-900">
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                <FaExclamationTriangle className="text-amber-600" />
                This order cannot be cancelled
              </div>
              <p className="text-xs text-amber-800">
                Orders with status &ldquo;{order?.status}&rdquo; have already progressed past the cancellation window.
              </p>
              <div className="mt-4">
                <Link
                  to="/orders"
                  className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                >
                  Return to Orders
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitCancellation} className="space-y-6">
              {/* Items summary */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Items to be cancelled ({items.length})
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 divide-y divide-gray-100">
                  {items.map((item, idx) => (
                    <div key={item._id || idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold text-gray-800 truncate">
                        {item.name || (item.product && item.product.name)}
                      </span>
                      <span className="text-gray-500 font-mono">
                        Qty: {item.quantity || item.qty || 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  Reason for Cancellation *
                </label>
                <div className="space-y-2.5">
                  {REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition text-xs font-medium ${
                        selectedReason === reason
                          ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional comments */}
              {selectedReason === "Other (please specify below)" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Provide additional details
                  </label>
                  <textarea
                    rows={3}
                    value={customComment}
                    onChange={(e) => setCustomComment(e.target.value)}
                    placeholder="Tell us why you want to cancel this order..."
                    className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Link
                  to={`/orders/${id}`}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition"
                >
                  Keep Order
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
}