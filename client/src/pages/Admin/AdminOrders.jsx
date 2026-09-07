import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../layouts/MainLayout";
import { FaBox, FaSyncAlt, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(Array.isArray(res.data) ? res.data : res.data?.orders || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Admin Orders Dashboard</h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage fulfillment and update real-time customer shipment tracking
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4">Update Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const customer = order.customer || order.shippingAddress || {};
                  const items = order.items || order.orderItems || [];
                  const total = order.total || order.totalPrice || 0;

                  return (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 font-mono font-semibold text-gray-800">
                        #{order._id.slice(-8)}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">
                          {customer.name || customer.fullName || "Customer"}
                        </div>
                        <div className="text-gray-400 text-[11px]">{customer.phone}</div>
                      </td>
                      <td className="p-4 text-gray-600">
                        {items.length} {items.length === 1 ? "Item" : "Items"}
                      </td>
                      <td className="p-4 font-extrabold text-gray-900">
                        ₹{Number(total).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            order.status === "Delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : order.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : order.status === "Shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          disabled={updatingId === order._id || order.status === "Cancelled"}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-center">
                        <Link
                          to={`/orders/${order._id}`}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold"
                        >
                          <FaEye /> View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}