import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

export default function JadwalAdzan() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));
  
  const [jadwal, setJadwal] = useState(null);
  const [statusLokasi, setStatusLokasi] = useState("Mendeteksi lokasi Anda...");
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes moveLine {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes kenBurns {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      /* Animasi Bulan Sabit & Bintang */
      .moon-container {
        position: fixed;
        top: 100px;
        right: 100px;
        width: 150px;
        height: 150px;
        z-index: 0;
        filter: drop-shadow(0 0 20px rgba(49, 130, 206, 0.4));
        animation: floatMoon 6s ease-in-out infinite;
        pointer-events: none;
      }
      .moon {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        box-shadow: 25px 10px 0 0 #3182ce;
        transform: rotate(-15deg);
      }
      .star {
        position: fixed;
        background: white;
        border-radius: 50%;
        opacity: 0.5;
        z-index: 0;
        pointer-events: none;
        animation: twinkle var(--duration) infinite ease-in-out;
      }
      @keyframes floatMoon {
        0%, 100% { transform: translateY(0) rotate(-15deg); }
        50% { transform: translateY(-20px) rotate(-10deg); }
      }
      @keyframes twinkle {
        0%, 100% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.5); opacity: 1; filter: blur(1px); }
      }
      .spinner {
        width: 40px; height: 40px; border: 4px solid #f3f3f3;
        border-top: 4px solid #3182ce; border-radius: 50%;
        animation: spin 1s linear infinite; margin: 0 auto 10px;
      }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      
      .glass-card {
        background: rgba(255, 255, 255, 0.9) !important;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07) !important;
      }

      .time-text {
        font-family: 'JetBrains Mono', 'Courier New', monospace;
        letter-spacing: 1px;
        font-variant-numeric: tabular-nums;
        display: inline-block;
        min-width: 80px;
      }

      .admin-table tbody tr:hover {
        background-color: rgba(49, 130, 206, 0.03);
      }
    `;
    document.head.appendChild(styleSheet);

    const fetchJadwal = async (lat, lng) => {
      try {
        const response = await axios.get(
          `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=20` 
        );
        setJadwal(response.data.data.timings);
        const tz = response.data.data.meta.timezone;
        setStatusLokasi(tz.split('/')[1]?.replace('_', ' ') || tz);
        setLoading(false);
      } catch (err) {
        setStatusLokasi("Gagal mengambil data jadwal");
        setLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchJadwal(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setStatusLokasi("GPS Mati. Menggunakan Standar Lampung.");
          fetchJadwal("-5.3971", "105.2668");
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      setStatusLokasi("Browser tidak mendukung lokasi.");
      fetchJadwal("-5.3971", "105.2668");
    }

    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  const tanggalSekarang = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date());
  const bgPrayImage = "https://images.unsplash.com/photo-1599011749870-13f50a8a6502?q=80&w=1974&auto=format&fit=crop";

  return (
    <div className="dashboard-layout" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex' }}>
      
      {/* 1. ANIMASI BULAN & BINTANG */}
      <div className="moon-container">
        <div className="moon"></div>
      </div>
      {[...Array(15)].map((_, i) => (
        <div 
          key={i} 
          className="star" 
          style={{
            top: `${Math.random() * 100}vh`,
            left: `${Math.random() * 100}vw`,
            width: `${Math.random() * 3}px`,
            height: `${Math.random() * 3}px`,
            "--duration": `${2 + Math.random() * 4}s`
          }}
        />
      ))}

      {/* 2. ANIMASI GARIS ATAS */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '4px', zIndex: 999, overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: '30%', height: '100%', background: 'linear-gradient(90deg, transparent, #3182ce, transparent)', animation: 'moveLine 3s infinite linear' }} />
      </div>

      {/* 3. BACKGROUND UTAMA */}
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1,
          backgroundImage: `linear-gradient(rgba(245, 247, 251, 0.85), rgba(245, 247, 251, 0.95)), url(${bgPrayImage})`,
          backgroundSize: 'cover', backgroundPosition: 'center', animation: 'kenBurns 25s infinite ease-in-out'
        }}
      />

      {/* SIDEBAR */}
      <aside className="sidebar" style={{ backgroundColor: '#1e2530', color: '#fff', width: '260px', zIndex: 10 }}>
        <div className="sidebar-brand" style={{ padding: '30px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>E MUSLIM</h2>
        </div>
        <nav className="sidebar-nav" style={{ marginTop: '20px', padding: '0 10px' }}>
          <Link to="/dashboard" className="nav-link" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', padding: '12px 15px', textDecoration: 'none', borderRadius: '8px' }}>
            <span style={{ marginRight: '12px' }}>📊</span> Dashboard
          </Link>
          <Link to="/jadwal-adzan" className="nav-link active" style={{ color: '#fff', backgroundColor: '#3182ce', display: 'flex', alignItems: 'center', padding: '12px 15px', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>
            <span style={{ marginRight: '12px' }}>🕌</span> Jadwal Adzan
          </Link>
          <Link to="/doa" className="nav-link" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', padding: '12px 15px', textDecoration: 'none', borderRadius: '8px' }}>
            <span style={{ marginRight: '12px' }}>🤲</span> Doa-Doa Sholat
          </Link>
          <Link to="/riwayat" className="nav-link" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', padding: '12px 15px', textDecoration: 'none', borderRadius: '8px' }}>
            <span style={{ marginRight: '12px' }}>📜</span> Riwayat Belajar
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content" style={{ flex: 1, zIndex: 1, overflowY: 'auto' }}>
        <header className="top-bar" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <div className="breadcrumb" style={{ color: '#718096', fontSize: '0.85rem' }}>
            Jadwal Adzan / <span style={{ color: '#3182ce', fontWeight: '600' }}>{statusLokasi}</span>
          </div>
          
          <div className="user-section-minimal" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '6px 16px', borderRadius: '30px', border: '1px solid #edf2f7' }}>
            <span className="user-name-label" style={{ color: '#1e293b', fontWeight: '600', fontSize: '0.85rem', marginRight: '12px' }}>{user?.name || "User"}</span>
            <div style={{ width: '1px', height: '14px', backgroundColor: '#e2e8f0', marginRight: '12px' }}></div>
            <button onClick={handleLogout} className="logout-icon-btn" style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '800' }}>
              Logout
            </button>
          </div>
        </header>

        <div className="content-inner" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
          <div className="data-card glass-card" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div className="data-card-header" style={{ padding: '25px 30px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1a202c', fontSize: '1.1rem', fontWeight: '800', letterSpacing: '0.5px' }}>WAKTU SHOLAT OTOMATIS</h3>
                <p style={{ color: "#718096", margin: '4px 0 0', fontSize: '0.85rem' }}>{tanggalSekarang}</p>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#3182ce', backgroundColor: '#ebf8ff', padding: '6px 14px', borderRadius: '50px' }}>● LOKASI AKTIF</span>
            </div>
            
            <div className="table-wrapper">
              {loading ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <div className="spinner"></div>
                  <p style={{ color: '#718096' }}>Menyinkronkan koordinat GPS...</p>
                </div>
              ) : (
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '15px 30px', textAlign: 'left', color: '#94a3b8', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Ibadah</th>
                      <th style={{ padding: '15px 30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Waktu (Lokal)</th>
                      <th style={{ padding: '15px 30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { nama: "Subuh", waktu: jadwal?.Fajr },
                      { nama: "Dzuhur", waktu: jadwal?.Dhuhr },
                      { nama: "Ashar", waktu: jadwal?.Asr },
                      { nama: "Maghrib", waktu: jadwal?.Maghrib },
                      { nama: "Isya", waktu: jadwal?.Isha },
                    ].map((item, idx) => (
                      <tr key={item.nama} style={{ borderBottom: idx === 4 ? 'none' : '1px solid #f1f5f9' }}>
                        <td style={{ padding: '20px 30px', fontSize: '0.95rem', color: '#2d3748', fontWeight: '700' }}>{item.nama}</td>
                        <td style={{ padding: '20px 30px', textAlign: 'center' }}>
                          <span className="time-text" style={{ fontSize: '1.4rem', fontWeight: '800', color: '#3182ce' }}>{item.waktu}</span>
                        </td>
                        <td style={{ padding: '20px 30px', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', backgroundColor: '#ecfdf5', padding: '6px 16px', borderRadius: '50px' }}>Tepat Waktu</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
            📍 Sinkronisasi otomatis berdasarkan {statusLokasi}. Pastikan izin lokasi browser dalam posisi <strong>Allow</strong>.
          </p>
        </div>
      </main>

      {/* 4. ANIMASI GARIS BAWAH */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', height: '4px', zIndex: 999, overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: '30%', height: '100%', background: 'linear-gradient(90deg, transparent, #3182ce, transparent)', animation: 'moveLine 4s infinite linear reverse' }} />
      </div>
    </div>
  );
}