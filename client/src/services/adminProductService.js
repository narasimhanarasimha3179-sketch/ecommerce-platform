import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/products`;

const getToken = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  return userInfo?.token;
};

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
});

// Get all products
export const getAllProducts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Add product
export const createProduct = async (productData) => {
  const response = await axios.post(
    API_URL,
    productData,
    authConfig()
  );
  return response.data;
};

// Update product
export const updateProduct = async (id, productData) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    productData,
    authConfig()
  );
  return response.data;
};

// Delete product
export const deleteProduct = async (id) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    authConfig()
  );
  return response.data;
};