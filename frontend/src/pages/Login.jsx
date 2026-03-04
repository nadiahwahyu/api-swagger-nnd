import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";
// import { login } from "../axios"; // aktifkan jika backend siap

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userAvatar, setUserAvatar] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      let user;

      // 1. Cek apakah ini Akun Admin Utama (Hardcoded)
      if (email === "admin@gmail.com" && password === "admnnd") {
        user = {
          name: "Administrator",
          email: "admin@gmail.com",
          role: "admin", 
          avatar: "https://ui-avatars.com/api/?name=Admin&background=3182ce&color=fff"
        };
      } else {
        // 2. Cari di LocalStorage (Untuk Admin yang didaftarkan lewat Register)
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const foundUser = users.find(
          (u) => u.email === email && u.password === password
        );

        if (!foundUser) {
          alert("Email atau password salah!");
          return;
        }

        // PEMBATASAN: Hanya izinkan jika role-nya adalah 'admin'
        if (foundUser.role !== "admin") {
          alert("Akses Ditolak! Halaman ini khusus untuk Administrator.");
          return;
        }

        user = foundUser;
      }

      // ======== SIMPAN SESSION ========
      localStorage.setItem("token", "admin-session-token");
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Tampilkan preview sukses
      setUserAvatar(user.avatar || "https://ui-avatars.com/api/?name=Admin");

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);

    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat login");
    }
  };

  return (
    <div className="card">
      <h2 className="gradient-text">Admin Login</h2>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '-10px', marginBottom: '20px' }}>
        Silakan masuk untuk mengelola konten E-MUSLIM
      </p>

      {/* AVATAR PREVIEW */}
      {userAvatar && (
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <img
            src={userAvatar}
            alt="Avatar"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #3182ce",
            }}
          />
          <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", color: "#2d3748", fontWeight: "bold" }}>
            Selamat Datang, Admin!
          </p>
        </div>
      )}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          className="input-field"
          placeholder="Email Admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="input-field"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn">Masuk Sebagai Admin</button>
      </form>

      {/* Link Register tetap ada namun bisa disembunyikan/dihapus jika tidak diperlukan lagi */}
      <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
        <Link to="/dashboard" className="text-link" style={{ display: 'block', marginBottom: '10px', color: '#718096' }}>
          ← Kembali ke Dashboard (Tamu)
        </Link>
      </div>
    </div>
  );
};

export default Login;