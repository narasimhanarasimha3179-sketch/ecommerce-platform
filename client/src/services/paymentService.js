import api from "../api/axios";

export const createRazorpayOrder = async (items, shipping) => {
  const { data } = await api.post("/api/payment/create-order", {
    items,
    shipping,
  });
  return data;
};

export const verifyRazorpayPayment = async (payload) => {
  const { data } = await api.post("/api/payment/verify", payload);
  return data;
};
