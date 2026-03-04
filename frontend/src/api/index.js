import axios from "axios";

// Sesuaikan URL backend-mu
const API_BASE = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== AUTH =====
export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const register = (name, email, password) =>
  api.post("/auth/register", { name, email, password });

// ===== SHOLAT =====
export const getAllSholat = () => api.get("/sholat");

export const getSholatById = (id) => api.get(`/sholat/${id}`);

// ===== PROTECTED REQUEST EXAMPLE =====
// Jika token dibutuhkan
export const getDashboard = (token) =>
  api.get("/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });

export default api;