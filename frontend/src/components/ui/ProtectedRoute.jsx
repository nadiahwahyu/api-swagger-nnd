import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Kita ambil token yang disimpan saat login berhasil tadi
  const token = localStorage.getItem("token");

  // Jika tidak ada token, tendang user kembali ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada token, izinkan mereka melihat halaman (children)
  return children;
};

export default ProtectedRoute;