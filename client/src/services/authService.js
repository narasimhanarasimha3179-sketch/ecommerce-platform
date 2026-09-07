import api from "../api/axios";

// Register
export const register = async (userData) => {
  const { data } = await api.post("/api/auth/register", userData);

  return data;
};

// Login
export const login = async (userData) => {
  const { data } = await api.post("/api/auth/login", userData);

  return data;
};

// Get Current User
export const getProfile = async () => {
  const { data } = await api.get("/api/auth/profile");

  return data;
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
};