import axios from "axios";

const API_URL = "http://localhost:5000/api/reviews";

// Get reviews for a product
export const getReviews = async (productId) => {
  const response = await axios.get(`${API_URL}/product/${productId}`);
  return response.data;
};

// Create review
export const createReview = async (reviewData) => {
  const response = await axios.post(API_URL, reviewData);
  return response.data;
};

// Delete review
export const deleteReview = async (reviewId) => {
  const response = await axios.delete(`${API_URL}/${reviewId}`);
  return response.data;
};