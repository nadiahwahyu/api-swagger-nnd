import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SHOLAT_DATA } from "../data/sholat";
import "../App.css";

export default function Dashboard() {
  const navigate = useNavigate();
  // Mengambil data user dan mengecek role
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  // Menambahkan Keyframes animasi agar konsisten dengan halaman lain
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
      .glass-card {
        background: rgba(255, 255, 255, 0.9) !important;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07) !important;
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  const bgPrayImage = "https://images.unsplash.com/photo-1599011749870-13f50a8a6502?q=80&w=1974&auto=format&fit=crop";

  return (
    <div className="dashboard-layout" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex' }}>
      
      {/* 1. ANIMASI BACKGROUND */}
      <div className="moon-container"><div className="moon"></div></div>
      {[...Array(15)].map((_, i) => (
        <div key={i} className="star" style={{
            top: `${Math.random() * 100}vh`,
            left: `${Math.random() * 100}vw`,
            width: `${Math.random() * 3}px`,
            height: `${Math.random() * 3}px`,
            "--duration": `${2 + Math.random() * 4}s`
          }}
        />
      ))}

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '400%', zIndex: -1,
          backgroundImage: `linear-gradient(rgba(245, 247, 251, 0.9), rgba(245, 247, 251, 0.9)), url(${bgPrayImage})`,
          backgroundSize: 'cover', backgroundPosition: 'center', animation: 'kenBurns 20s infinite ease-in-out'
        }}
      />

      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar" style={{ backgroundColor: '#1e2530', color: '#fff', width: '260px', zIndex: 10 }}>
        <div className="sidebar-brand" style={{ padding: '30px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>E MUSLIM</h2>
        </div>
        <nav className="sidebar-nav" style={{ marginTop: '20px', padding: '0 10px' }}>
          <Link to="/dashboard" className="nav-link active" style={{ color: '#fff', backgroundColor: '#3182ce', display: 'flex', alignItems: 'center', padding: '12px 15px', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>
            <span style={{ marginRight: '12px' }}>📊</span> Dashboard
          </Link>
          
          <Link to="/jadwal-adzan" className="nav-link" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', padding: '12px 15px', textDecoration: 'none', borderRadius: '8px' }}>
            <span style={{ marginRight: '12px' }}>🕌</span> Jadwal Adzan
          </Link>
          
          <Link to="/doa" className="nav-link" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', padding: '12px 15px', textDecoration: 'none', borderRadius: '8px' }}>
            <span style={{ marginRight: '12px' }}>🤲</span> Doa-Doa Sholat
          </Link>
          
          {/* PROTEKSI: Hanya Admin yang bisa melihat menu Riwayat */}
          {isAdmin && (
            <Link to="/riwayat" className="nav-link" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', padding: '12px 15px', textDecoration: 'none', borderRadius: '8px' }}>
              <span style={{ marginRight: '12px' }}>📜</span> Riwayat Belajar
            </Link>
          )}
        </nav>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content" style={{ flex: 1, zIndex: 1, overflowY: 'auto' }}>
        <header className="top-bar" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <div className="breadcrumb" style={{ color: '#718096', fontSize: '0.85rem' }}>
            Dashboard / <span style={{ color: '#3182ce', fontWeight: '600' }}>Data Tata Cara Sholat</span>
          </div>
          
          <div className="user-section-minimal" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '6px 16px', borderRadius: '30px', border: '1px solid #edf2f7' }}>
            <span className="user-name-label" style={{ color: '#1e293b', fontWeight: '600', fontSize: '0.85rem', marginRight: '12px' }}>
                {isAdmin ? user.name : "Tamu"}
            </span>
            {isAdmin && user?.avatar && (
              <img src={user.avatar} alt="User" style={{ width: '25px', height: '25px', borderRadius: '50%', marginRight: '12px' }} />
            )}
            <div style={{ width: '1px', height: '14px', backgroundColor: '#e2e8f0', marginRight: '12px' }}></div>
            
            {isAdmin ? (
                <button onClick={handleLogout} className="logout-icon-btn" style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '800' }}>
                    Logout
                </button>
            ) : (
                <button onClick={() => navigate("/login")} className="logout-icon-btn" style={{ border: 'none', background: 'none', color: '#3182ce', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '800' }}>
                    Admin Login
                </button>
            )}
          </div>
        </header>

        <div className="content-inner" style={{ padding: '40px' }}>
          <div className="data-card glass-card" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div className="data-card-header" style={{ padding: '25px 30px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#1a202c', fontSize: '1.1rem', fontWeight: '800', letterSpacing: '0.5px' }}>DATA TATA CARA SHOLAT</h3>
              
              {/* PROTEKSI: Tombol Tambah hanya untuk Admin */}
              {isAdmin && (
                <button onClick={() => navigate("/tambah-sholat")} className="btn-add" style={{ backgroundColor: '#3182ce', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '50px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', boxShadow: '0 4px 12px rgba(49, 130, 206, 0.2)' }}>
                    + Tambah Data
                </button>
              )}
            </div>
            
            <div className="table-wrapper">
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th width="80" style={{ padding: '15px 30px', textAlign: 'left', color: '#94a3b8', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>No</th>
                    <th style={{ padding: '15px 30px', textAlign: 'left', color: '#94a3b8', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Nama Sholat</th>
                    <th style={{ padding: '15px 30px', textAlign: 'left', color: '#94a3b8', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Referensi</th>
                    <th width="220" style={{ padding: '15px 30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {SHOLAT_DATA.map((sholat, index) => (
                    <tr key={sholat.id} style={{ borderBottom: index === SHOLAT_DATA.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                      <td style={{ padding: '20px 30px', fontSize: '0.9rem', color: '#718096' }}>{index + 1}</td>
                      <td style={{ padding: '20px 30px', fontSize: '0.95rem', color: '#2d3748', fontWeight: '700' }}>{sholat.nama}</td>
                      <td style={{ padding: '20px 30px', fontSize: '0.9rem', color: '#718096' }}>{sholat.sumber}</td>
                      <td style={{ padding: '20px 30px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <Link to={`/sholat/${sholat.id}`} style={{ fontSize: '0.7rem', fontWeight: '800', color: '#3182ce', backgroundColor: '#ebf8ff', padding: '6px 12px', borderRadius: '50px', textDecoration: 'none' }}>
                                Lihat Detail
                            </Link>

                            {/* PROTEKSI: Tombol Edit & Hapus hanya untuk Admin */}
                            {isAdmin && (
                                <>
                                    <Link to={`/edit-sholat/${sholat.id}`} style={{ fontSize: '0.7rem', fontWeight: '800', color: '#e67e22', backgroundColor: '#fff3e0', padding: '6px 12px', borderRadius: '50px', textDecoration: 'none' }}>
                                        Edit
                                    </Link>
                                    <button style={{ border: 'none', fontSize: '0.7rem', fontWeight: '800', color: '#ef4444', backgroundColor: '#fee2e2', padding: '6px 12px', borderRadius: '50px', cursor: 'pointer' }}>
                                        Hapus
                                    </button>
                                </>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}