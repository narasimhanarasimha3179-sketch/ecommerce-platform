import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/products`;

export const searchProducts = async (keyword) => {
  if (!keyword?.trim()) return [];

  const response = await axios.get(API_URL, {
    params: {
      search: keyword.trim(),
      page: 1,
      limit: 8,
    },
  });

  return response.data.products || [];
};
