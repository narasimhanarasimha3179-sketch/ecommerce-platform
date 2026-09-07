import axios from "axios";

// Fallback to localhost:5000 if VITE_API_URL is undefined, and prevent duplicate '/api' paths
const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const API_URL = `${BASE_URL}/api/products`;

// Robust array unwrap helper to ensure UI components always receive an Array
const unwrapProductList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const getProducts = async (
  page = 1,
  limit = 100,
  search = "",
  category = "",
  brand = "",
  sort = ""
) => {
  try {
    const params = {
      page,
      limit,
    };

    if (search && search.trim()) params.search = search.trim();
    if (category && category.trim() && category !== "All Categories") {
      params.category = category.trim();
    }
    if (brand && brand.trim() && brand !== "All Brands") {
      params.brand = brand.trim();
    }
    if (sort && sort.trim() && sort !== "Default") {
      params.sort = sort.trim();
    }

    const response = await axios.get(API_URL, { params });
    return unwrapProductList(response.data);
  } catch (error) {
    console.error("Error in getProducts service:", error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return (
      response.data?.product ||
      response.data?.data ||
      response.data ||
      null
    );
  } catch (error) {
    console.error(`Error fetching product by ID (${id}):`, error);
    return null;
  }
};

export const getFeaturedProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/featured`);
    const list = unwrapProductList(response.data);
    if (list.length > 0) return list;
    throw new Error("No featured products on primary endpoint");
  } catch {
    try {
      const fallback = await axios.get(API_URL, { params: { featured: true, limit: 12 } });
      return unwrapProductList(fallback.data);
    } catch (fallbackError) {
      console.error("Error fetching featured products:", fallbackError);
      return [];
    }
  }
};

export const getLatestProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/latest`);
    const list = unwrapProductList(response.data);
    if (list.length > 0) return list;
    throw new Error("No latest products on primary endpoint");
  } catch {
    try {
      const fallback = await axios.get(API_URL, { params: { sort: "newest", limit: 12 } });
      return unwrapProductList(fallback.data);
    } catch (fallbackError) {
      console.error("Error fetching latest products:", fallbackError);
      return [];
    }
  }
};