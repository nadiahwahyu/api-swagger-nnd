import axios from "axios";

// Sesuaikan URL backend-mu
const API_BASE = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== INTERCEPTORS (PENTING AGAR LOGIN SINKRON) =====
// Otomatis menempelkan token ke setiap request jika user sudah login
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const login = (email, password) =>
  api.post("/auth/login", { email, password });

/** * Register menggunakan multipart/form-data karena di backend kita 
 * mendukung upload avatar (multer).
 */
export const register = (formData) =>
  api.post("/auth/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ===== SHOLAT =====
export const getAllSholat = () => api.get("/sholat");

export const getSholatById = (id) => api.get(`/sholat/${id}`);

// ===== PROTECTED REQUEST EXAMPLE =====
/**
 * Sekarang tidak perlu lagi passing token manual sebagai parameter 
 * karena sudah ditangani oleh Interceptor di atas.
 */
export const getDashboard = () => api.get("/dashboard");

export default api;