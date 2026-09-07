import axios from "axios";

// Normalize base URL to prevent duplicate /api segments or missing fallbacks
const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const API_URL = `${BASE_URL}/api/orders`;

// Inspects all common token storage patterns
const getToken = () => {
  try {
    const rawToken = localStorage.getItem("token");
    if (rawToken && rawToken !== "null" && rawToken !== "undefined") {
      return rawToken;
    }

    const rawUserInfo = localStorage.getItem("userInfo");
    if (rawUserInfo) {
      const parsedUser = JSON.parse(rawUserInfo);
      return parsedUser?.token || parsedUser?.data?.token || null;
    }

    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      return parsed?.token || parsed?.data?.token || null;
    }
  } catch (err) {
    console.error("Error reading token from localStorage:", err);
  }
  return null;
};

const authConfig = () => {
  const token = getToken();
  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
  };
};

// Create Order
export const createOrder = async (orderData) => {
  const token = getToken();
  if (!token) {
    throw new Error("User session expired or not authenticated. Please log in again.");
  }
  const response = await axios.post(API_URL, orderData, authConfig());
  return response.data?.order || response.data?.data || response.data;
};

// My Orders
export const getMyOrders = async () => {
  const response = await axios.get(`${API_URL}/myorders`, authConfig());
  return response.data?.orders || response.data?.data || response.data;
};

// Single Order
export const getOrderById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, authConfig());
  return response.data?.order || response.data?.data || response.data;
};

// Cancel Order
export const cancelOrder = async (id, reason = "") => {
  const response = await axios.put(
    `${API_URL}/${id}/cancel`,
    { reason },
    authConfig()
  );
  return response.data?.order || response.data?.data || response.data;
};