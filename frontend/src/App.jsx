import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Halaman Utama
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Category from "./pages/Category";
import DetailSholat from "./pages/DetailSholat";
import RiwayatBelajar from "./pages/RiwayatBelajar"; 
import JadwalAdzan from "./pages/JadwalAdzan";
import Doa from "./pages/Doa";

// Import Halaman Admin
import EditSholat from "./pages/EditSholat"; 
import TambahSholat from "./pages/TambahSholat";

/* ============================================================
    ADMIN ROUTE (Proteksi Ketat untuk Admin)
   ============================================================ */
/**
 * Rute ini menjaga agar halaman CRUD dan Riwayat hanya bisa
 * diakses oleh pengguna dengan token valid dan role 'admin'.
 */
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

  // Validasi: Harus ada token DAN role harus admin
  if (token && user.role === "admin") {
    return children;
  }

  // Jika tamu mencoba akses, lempar ke halaman login
  return <Navigate to="/login" replace />;
};

/* ============================================================
    PUBLIC ROUTE (Hanya untuk tamu/sebelum login)
   ============================================================ */
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" replace /> : children;
};

/* ======================
    APP ROUTER
   ====================== */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== AUTH ROUTES ===== */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* ===== OPEN ROUTES (Akses Pengguna/Tamu Umum) ===== */}
        {/* User hanya bisa melihat, tidak bisa menambah/mengubah */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/categories" element={<Category />} />
        <Route path="/sholat/:id" element={<DetailSholat />} />
        <Route path="/jadwal-adzan" element={<JadwalAdzan />} />
        <Route path="/doa" element={<Doa />} />

        {/* ===== ADMIN ONLY ROUTES (Proteksi CRUD & Riwayat) ===== */}
        {/* Dipindahkan ke AdminRoute agar User tidak bisa akses via URL sekalipun */}
        <Route
          path="/riwayat"
          element={
            <AdminRoute>
              <RiwayatBelajar />
            </AdminRoute>
          }
        />
        
        <Route
          path="/edit-sholat/:id"
          element={
            <AdminRoute>
              <EditSholat />
            </AdminRoute>
          }
        />

        <Route
          path="/tambah-sholat"
          element={
            <AdminRoute>
              <TambahSholat />
            </AdminRoute>
          }
        />

        {/* ===== DEFAULT / FALLBACK ===== */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}