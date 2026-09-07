import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaBox, 
  FaEye, 
  FaTimesCircle, 
  FaTruck, 
  FaCheckCircle, 
  FaClock, 
  FaReceipt,
  FaExclamationTriangle
} from "react-icons/fa";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axios";

const CANCEL_REASONS = [
  "Ordered by mistake / duplicate order",
  "Found a better price elsewhere",
  "Delivery time is too long",
  "Incorrect items or quantity",
  "Need to change shipping address",
];

function getStatusBadge(status) {
  switch (status) {
    case "Delivered":
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <FaCheckCircle className="text-emerald-500" />,
      };
    case "Shipped":
      return {
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <FaTruck className="text-blue-500" />,
      };
    case "Processing":
      return {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <FaClock className="text-amber-500" />,
      };
    case "Cancelled":
      return {
        bg: "bg-red-50 text-red-700 border-red-200",
        icon: <FaTimesCircle className="text-red-500" />,
      };
    default:
      return {
        bg: "bg-gray-50 text-gray-700 border-gray-200",
        icon: <FaClock className="text-gray-400" />,
      };
  }
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get("/api/orders/myorders")
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.orders || [];
        setOrders(list);
      })
      .catch((err) => setError(err.response?.data?.message || "Unable to load your orders."))
      .finally(() => setLoading(false));
  }, []);

  // Handle final confirmed cancellation
  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;

    try {
      setCancelling(true);
      const res = await api.put(`/api/orders/${cancelModalOrder._id}/cancel`, {
        reason: selectedReason,
      });

      const updatedOrder = res.data?.order || res.data;

      // Update state locally
      setOrders((prev) =>
        prev.map((o) => (o._id === cancelModalOrder._id ? { ...o, status: "Cancelled" } : o))
      );

      setCancelModalOrder(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-sm border border-blue-100">
              <FaBox />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">My Orders</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Track shipments, view invoices, and manage past purchases
              </p>
            </div>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition self-start sm:self-auto"
          >
            Browse Products →
          </Link>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-24">
            <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-t-transparent mb-3"></div>
            <p className="text-sm font-semibold text-gray-500">Fetching your orders...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-sm">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-300 text-3xl">
              <FaReceipt />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">No Orders Placed Yet</h2>
            <p className="text-xs text-gray-400 mb-6 max-w-xs mx-auto">
              Looks like you haven&apos;t ordered anything yet. Explore our catalog to find items you love!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const items = Array.isArray(order.items) ? order.items : order.orderItems || [];
              const totalAmount = Number(order.total ?? order.totalPrice ?? 0);
              const isCancellable = !["Cancelled", "Delivered", "Shipped"].includes(order.status);

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* Order Top Bar */}
                  <div className="bg-gray-50/70 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500">
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Order Placed
                        </span>
                        <span className="font-semibold text-gray-800">
                          {new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Total Amount
                        </span>
                        <span className="font-extrabold text-gray-900 text-sm">
                          ₹{totalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Order ID
                        </span>
                        <span className="font-mono font-medium text-gray-700">
                          #{order._id}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}
                    >
                      {statusBadge.icon}
                      {order.status || "Pending"}
                    </span>
                  </div>

                  {/* Order Products Preview */}
                  <div className="p-6">
                    <div className="divide-y divide-gray-100">
                      {items.map((item, index) => {
                        const productObj = item.product && typeof item.product === "object" ? item.product : {};
                        const itemImage =
                          item.image ||
                          productObj.image ||
                          (productObj.images && productObj.images[0]) ||
                          "";
                        const itemName = item.name || productObj.name || "Purchased Item";
                        const itemQty = Number(item.quantity || item.qty || 1);
                        const itemPrice = Number(item.price || 0);

                        return (
                          <div
                            key={productObj._id || item._id || index}
                            className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4"
                          >
                            <img
                              src={itemImage}
                              alt={itemName}
                              className="w-16 h-16 object-contain rounded-xl bg-gray-50 p-1.5 border border-gray-100 flex-shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-gray-800 truncate">
                                {itemName}
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Quantity: <span className="font-semibold text-gray-700">{itemQty}</span> × ₹{itemPrice.toLocaleString("en-IN")}
                              </p>
                            </div>

                            <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                              ₹{(itemPrice * itemQty).toLocaleString("en-IN")}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/orders/${order._id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                        >
                          <FaEye className="text-[11px]" /> View Order &amp; Tracking
                        </Link>

                        {/* Open confirmation modal instead of cancelling directly */}
                        {isCancellable && (
                          <button
                            type="button"
                            onClick={() => setCancelModalOrder(order)}
                            className="border border-red-200 hover:bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                          >
                            <FaTimesCircle className="text-[11px]" /> Cancel Order
                          </button>
                        )}
                      </div>

                      <span className="text-[11px] text-gray-400">
                        {order.paymentMethod || "Cash on Delivery"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= CANCELLATION CONFIRMATION MODAL ================= */}
        {cancelModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <FaExclamationTriangle className="text-2xl flex-shrink-0" />
                <h3 className="text-base font-bold text-gray-900">
                  Cancel Order Confirmation
                </h3>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Are you sure you want to cancel order <span className="font-mono font-bold text-gray-800">#{cancelModalOrder._id}</span>? This action cannot be reversed.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Select a reason for cancellation:
                </label>
                <div className="space-y-2">
                  {CANCEL_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        selectedReason === reason
                          ? "border-red-600 bg-red-50/50 text-red-900 font-bold"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReasonModal"
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Don&apos;t Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition shadow-sm disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Yes, Cancel Order"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default Orders;