import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/products`;

// Get all products
export const getProducts = async () => {
  try {
    const response = await axios.get(API_URL);

    return response.data.products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

// Get single product
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

// Get featured products
export const getFeaturedProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/featured`);

    return response.data;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
};

// Get latest products
export const getLatestProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/latest`);

    return response.data;
  } catch (error) {
    console.error("Error fetching latest products:", error);
    return [];
  }
};