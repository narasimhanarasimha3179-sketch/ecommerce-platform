import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import MainLayout from "../../layouts/MainLayout";
import {
  FaCheckCircle,
  FaTruck,
  FaBox,
  FaMapMarkerAlt,
  FaTag,
  FaFileInvoice,
  FaTimesCircle,
  FaArrowLeft,
  FaExclamationTriangle,
  FaPrint,
} from "react-icons/fa";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const TRACKING_STAGES = [
  { key: "Pending", label: "Order Confirmed" },
  { key: "Processing", label: "Processing" },
  { key: "Shipped", label: "Shipped" },
  { key: "Delivered", label: "Delivered" },
];

const CANCEL_REASONS = [
  "Ordered by mistake / duplicate order",
  "Found a better price elsewhere",
  "Delivery time is too long",
  "Need to change shipping address or phone",
  "Incorrect item or quantity selected",
  "Other (please specify below)",
];

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

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
        setError(err.response?.data?.message || "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const handleConfirmCancel = async () => {
    const finalReason =
      selectedReason === "Other (please specify below)"
        ? customReason.trim() || "Customer requested cancellation"
        : selectedReason;

    try {
      setCancelling(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${BASE_URL}/api/orders/${id}/cancel`,
        { reason: finalReason },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      setOrder(res.data?.order || res.data);
      setIsCancelModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center">
          <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-sm font-semibold text-gray-500">Loading order status...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !order) {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl border border-gray-200 text-center shadow-sm">
          <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-3" />
          <h2 className="text-base font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-xs text-red-600 mb-6">{error || "Unable to display order details."}</p>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
          >
            <FaArrowLeft /> Back to My Orders
          </Link>
        </div>
      </MainLayout>
    );
  }

  const items = Array.isArray(order.items) ? order.items : order.orderItems || [];
  const customer = order.customer || order.shippingAddress || {};
  const isCancelled = order.status === "Cancelled";

  const subtotal = Number(order.subtotal || order.total || order.totalPrice || 0);
  const total = Number(order.total || order.totalPrice || subtotal);
  const estimatedOriginal = Math.round(subtotal * 1.22);
  const savings = Math.max(0, estimatedOriginal - total);

  const getStageIndex = (status) => {
    switch (status) {
      case "Pending":
        return 0;
      case "Processing":
        return 1;
      case "Shipped":
        return 2;
      case "Delivered":
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = getStageIndex(order.status);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        
        {/* Navigation Breadcrumb & Action Toolbar */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-blue-600 transition"
          >
            <FaArrowLeft /> Back to All Orders
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintInvoice}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <FaPrint className="text-gray-600" /> Print Tax Invoice
            </button>
            <div className="text-xs text-gray-400">
              Placed on: {new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Printable Invoice Header (Visible during Print) */}
        <div className="hidden print:block mb-8 pb-4 border-b-2 border-gray-900">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-950">ShopEase Retail</h1>
              <p className="text-xs text-gray-600 mt-0.5">Tax Invoice / Bill of Supply</p>
              <p className="text-[11px] text-gray-500 font-mono mt-1">Invoice Ref: #{order._id}</p>
            </div>
            <div className="text-right text-xs text-gray-700">
              <p className="font-bold">Date: {new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN")}</p>
              <p className="text-gray-500">Payment: {order.paymentMethod || "Cash on Delivery"}</p>
              <p className="text-gray-500">Status: {order.status}</p>
            </div>
          </div>
        </div>

        {/* Live Tracking Timeline */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8 print:shadow-none print:border-gray-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4 mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase text-gray-400">Order Reference</span>
              <h2 className="text-base font-extrabold text-gray-900 font-mono">#{order._id}</h2>
            </div>
            <div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isCancelled
                    ? "bg-red-100 text-red-700"
                    : order.status === "Delivered"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                ● Status: {order.status}
              </span>
            </div>
          </div>

          {isCancelled ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
              <FaTimesCircle className="text-xl flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">This order has been cancelled</p>
                <p className="text-xs text-red-600 mt-0.5">{order.cancellationReason || "Customer requested cancellation from portal"}</p>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="relative flex items-center justify-between">
                <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 -z-0">
                  <div
                    className="h-1 bg-blue-600 transition-all duration-500"
                    style={{ width: `${(currentStep / (TRACKING_STAGES.length - 1)) * 100}%` }}
                  ></div>
                </div>

                {TRACKING_STAGES.map((stage, idx) => {
                  const completed = idx <= currentStep;
                  return (
                    <div key={stage.key} className="flex flex-col items-center z-10">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition shadow-sm ${
                          completed
                            ? "bg-blue-600 text-white ring-4 ring-blue-100"
                            : "bg-white border-2 border-gray-300 text-gray-400"
                        }`}
                      >
                        {completed ? <FaCheckCircle /> : idx + 1}
                      </div>
                      <span
                        className={`text-xs mt-2 font-semibold ${
                          completed ? "text-blue-600 font-bold" : "text-gray-400"
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Ordered Products */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm print:shadow-none print:border-gray-300">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaBox className="text-blue-600 print:hidden" />
                Items in this Shipment ({items.length})
              </h3>

              <div className="divide-y divide-gray-100">
                {items.map((item, idx) => {
                  const productObj = item.product && typeof item.product === "object" ? item.product : {};
                  const image = item.image || productObj.image || (productObj.images && productObj.images[0]) || "";
                  const qty = Number(item.quantity || item.qty || 1);
                  const price = Number(item.price || 0);

                  return (
                    <div key={item._id || idx} className="py-4 flex gap-4">
                      {image ? (
                        <img
                          src={image}
                          alt={item.name}
                          className="w-20 h-20 object-contain rounded-xl bg-gray-50 p-2 border border-gray-100 flex-shrink-0 print:w-12 print:h-12"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0 print:w-12 print:h-12">
                          Product
                        </div>
                      )}

                      <div className="flex-grow min-w-0">
                        <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">
                          {productObj.brand || "Authentic Item"}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">
                          {item.name || productObj.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Quantity: <span className="font-semibold text-gray-800">{qty}</span> × ₹{price.toLocaleString("en-IN")}
                        </p>

                        <div className="mt-2 flex items-center gap-2 print:hidden">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <FaTag className="text-[9px]" /> 7-Day Replacement Policy
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-base font-extrabold text-gray-900 block">
                          ₹{(price * qty).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cancel Action Trigger (Hidden on Print & If Cancelled) */}
            {!isCancelled && ["Pending", "Processing"].includes(order.status) && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Need to modify or cancel?</h4>
                  <p className="text-xs text-gray-500">Orders can be cancelled before dispatch without cancellation fees.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-4 py-2 border border-red-300 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl transition shadow-sm"
                >
                  Cancel This Order
                </button>
              </div>
            )}
          </div>

          {/* Shipping & Financial Details */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm print:shadow-none print:border-gray-300">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-blue-600 print:hidden" /> Delivery Address
              </h3>
              <p className="text-sm font-extrabold text-gray-900">{customer.name || customer.fullName || "Customer"}</p>
              <p className="text-xs text-gray-600 mt-1 font-semibold">{customer.phone}</p>
              <p className="text-xs text-gray-700 mt-2 leading-relaxed">
                {customer.address || customer.fullAddress || customer.street}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                {customer.city ? `${customer.city}, ` : ""}{customer.state ? `${customer.state} - ` : ""}
                <span className="font-bold text-gray-800">{customer.pincode || customer.postalCode}</span>
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3 print:shadow-none print:border-gray-300">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FaFileInvoice className="text-blue-600 print:hidden" /> Price Details
              </h3>

              <div className="flex justify-between text-xs text-gray-600">
                <span>List Price (MRP)</span>
                <span className="line-through text-gray-400">₹{estimatedOriginal.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                <span>Special Promotional Discount</span>
                <span>- ₹{savings.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-xs text-gray-600">
                <span>Delivery Charges</span>
                <span className="text-emerald-600 font-bold uppercase">Free Delivery</span>
              </div>

              <div className="flex justify-between text-xs text-gray-600">
                <span>Payment Mode</span>
                <span className="font-bold text-gray-800">{order.paymentMethod || "Cash on Delivery"}</span>
              </div>

              <div className="flex justify-between text-xs text-gray-600">
                <span>Payment Status</span>
                <span className="font-semibold text-orange-600">{order.paymentStatus || "Pending"}</span>
              </div>

              <div className="flex justify-between text-base font-black text-gray-900 pt-3 border-t border-gray-100">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>

              {!isCancelled && (
                <div className="pt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-xl p-2.5 text-center print:hidden">
                  🎉 You saved ₹{savings.toLocaleString("en-IN")} on this purchase!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cancellation Modal */}
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center gap-3 text-red-600">
                <FaExclamationTriangle className="text-2xl flex-shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">Cancel Order Request</h3>
                  <p className="text-xs text-gray-400 font-mono">#{order._id}</p>
                </div>
              </div>

              <p className="text-xs text-gray-600">
                Are you sure you want to cancel this order? Once cancelled, this action cannot be undone.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Select a reason for cancellation:
                </label>
                <div className="space-y-2">
                  {CANCEL_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                        selectedReason === reason
                          ? "border-red-600 bg-red-50/50 text-red-900 font-bold"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelModalReason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {selectedReason === "Other (please specify below)" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Describe reason:
                  </label>
                  <textarea
                    rows={2}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter reason for cancellation..."
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={cancelling}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition shadow-sm disabled:opacity-50"
                >
                  {cancelling ? "Processing..." : "Yes, Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Print Rule Injection */}
        <style>{`
          @media print {
            header, footer, nav, button, .print\\:hidden {
              display: none !important;
            }
            body {
              background: white !important;
              color: black !important;
            }
            .max-w-6xl {
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}</style>

      </div>
    </MainLayout>
  );
}