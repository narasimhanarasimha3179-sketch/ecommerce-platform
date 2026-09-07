import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/cart`;

// Get logged-in user's token
const getToken = () => {
  try {
    const userInfo = JSON.parse(
      localStorage.getItem("userInfo")
    );

    return userInfo?.token || "";
  } catch (error) {
    console.error(
      "Error reading userInfo from localStorage:",
      error
    );

    return "";
  }
};

// Authentication configuration
const authConfig = () => {
  const token = getToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// Get user's cart
export const getCart = async () => {
  const response = await axios.get(
    API_URL,
    authConfig()
  );

  return response.data;
};

// Add product to cart
export const addToCart = async (
  productId,
  quantity = 1
) => {
  const response = await axios.post(
    API_URL,
    {
      product: productId,
      quantity,
    },
    authConfig()
  );

  return response.data;
};

// Update cart item quantity
export const updateCartItem = async (
  cartItemId,
  quantity
) => {
  const response = await axios.put(
    `${API_URL}/${cartItemId}`,
    {
      quantity,
    },
    authConfig()
  );

  return response.data;
};

// Remove item from cart
export const removeCartItem = async (
  cartItemId
) => {
  const response = await axios.delete(
    `${API_URL}/${cartItemId}`,
    authConfig()
  );

  return response.data;
};