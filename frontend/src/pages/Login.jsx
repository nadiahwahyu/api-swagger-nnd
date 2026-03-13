import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios"; 
import "../App.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userAvatar, setUserAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      let user = null;
      let token = null;
      let isBackendOffline = false;

      // 1. STRATEGI UTAMA: COBA LOGIN KE BACKEND API
      try {
        const response = await axios.post("http://localhost:5000/api/auth/login", {
          email: cleanEmail,
          password: password,
        });

        if (response.data.success) {
          user = response.data.user;
          // PERBAIKAN: Sesuaikan dengan payload backend Anda (accessToken)
          token = response.data.accessToken || response.data.token; 
          console.log("Login via Backend Berhasil");
        }
      } catch (backendError) {
        // PERBAIKAN: Jika backend merespon (misal 401), jangan nyalakan fallback offline 
        // kecuali jika memang benar-benar koneksi putus (Network Error)
        if (backendError.response) {
          console.warn("Backend merespon error:", backendError.response.data.message);
          // Jika 401 (Salah Password), kita tidak perlu fallback ke LocalStorage
          // Tapi karena Anda ingin jaminan tetap bisa masuk, kita biarkan logic tetap lanjut.
          isBackendOffline = true; 
        } else {
          console.error("Backend offline (Network Error), mencoba fallback...");
          isBackendOffline = true;
        }
      }

      // 2. STRATEGI CADANGAN
      if (!user && isBackendOffline) {
        // Hardcoded Admin (Sebagai jaminan tetap bisa masuk)
        if (cleanEmail === "admin@gmail.com" && password === "admnnd") {
          user = {
            name: "Administrator Utama",
            email: "admin@gmail.com",
            role: "admin",
            avatar: "https://ui-avatars.com/api/?name=Admin&background=3182ce&color=fff"
          };
          token = "session-token-hardcoded";
          console.log("Login via Hardcoded Berhasil");
        } else {
          // Cek di LocalStorage (Untuk user yang daftar saat mode offline)
          const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
          const foundUser = storedUsers.find(
            (u) => u.email.toLowerCase() === cleanEmail && u.password === password
          );

          if (foundUser) {
            user = foundUser;
            token = "session-token-local";
            console.log("Login via LocalStorage Berhasil");
          }
        }
      }

      // FINALISASI LOGIN
      if (user && token) {
        // Simpan token untuk digunakan Axios Interceptor nantinya
        localStorage.setItem("token", token);
        localStorage.setItem("currentUser", JSON.stringify(user));

        const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`;
        setUserAvatar(avatarUrl);
        
        // Animasi sedikit sebelum pindah
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1200);
      } else {
        alert("Email atau password salah! Pastikan data sudah benar.");
      }

    } catch (error) {
      console.error("Login Error Global:", error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2 className="gradient-text" style={{ textAlign: 'center' }}>E-MUSLIM Login</h2>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '-10px', marginBottom: '20px', textAlign: 'center' }}>
        Silakan masuk untuk mengakses fitur penuh
      </p>

      {userAvatar && (
        <div className="fade-in" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <img
            src={userAvatar}
            alt="Avatar"
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #3182ce",
              boxShadow: "0 4px 10px rgba(49, 130, 206, 0.3)"
            }}
          />
          <p style={{ fontSize: "0.9rem", marginTop: "0.5rem", color: "#2d3748", fontWeight: "bold" }}>
            Selamat Datang Kembali!
          </p>
        </div>
      )}

      <form onSubmit={handleLogin} className="form-container">
        <div style={{ textAlign: 'left', marginBottom: '5px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Email Pengguna:</label>
        </div>
        <input
          type="email"
          className="input-field"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div style={{ textAlign: 'left', marginBottom: '5px', marginTop: '15px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Password:</label>
        </div>
        <input
          type="password"
          className="input-field"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button 
          type="submit" 
          className="btn" 
          disabled={loading}
          style={{ 
            marginTop: '20px', 
            width: '100%', 
            padding: '12px',
            backgroundColor: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Memverifikasi..." : "Masuk Sekarang"}
        </button>
      </form>

      <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px', textAlign: 'center' }}>
        <Link to="/register" className="text-link" style={{ fontSize: '13px', display: 'block', marginBottom: '10px', color: '#3182ce', textDecoration: 'none' }}>
            Belum punya akun? <b>Daftar di sini</b>
        </Link>
        <Link to="/dashboard" className="text-link" style={{ fontSize: '13px', color: '#718096', textDecoration: 'none' }}>
          ← Kembali ke Dashboard (Tamu)
        </Link>
      </div>
    </div>
  );
};

export default Login;