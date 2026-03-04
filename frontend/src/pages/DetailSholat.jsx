import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { SHOLAT_DATA } from "../data/sholat";
import "../App.css";

export default function DetailSholat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sholat = SHOLAT_DATA.find((s) => s.id === parseInt(id));
  const user = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    // 1. LOGIKA UPDATE RIWAYAT OTOMATIS
    if (user && sholat) {
      const historyData = JSON.parse(localStorage.getItem("learning_history")) || [];
      const newEntry = {
        id: Date.now(),
        user: user.name,
        nama: sholat.nama,
        tanggal: new Date().toLocaleDateString("id-ID"),
        status: "Selesai",
      };
      localStorage.setItem("learning_history", JSON.stringify([...historyData, newEntry]));
    }

    // 2. STYLE UNTUK ELEMEN DEKORATIF (BULAN & ANIMASI)
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      .moon-accent {
        position: fixed; top: 80px; right: 50px; width: 120px; height: 120px;
        background: transparent; border-radius: 50%;
        box-shadow: 20px 10px 0 0 rgba(49, 130, 206, 0.2);
        transform: rotate(-15deg); z-index: 0; pointer-events: none;
      }
      .glass-card {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 15px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
      }
      .materi-badge {
        background-color: #ebf8ff; color: #3182ce;
        padding: 4px 12px; border-radius: 4px;
        font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
      }
    `;
    document.head.appendChild(styleSheet);
    return () => { if (document.head.contains(styleSheet)) document.head.removeChild(styleSheet); };
  }, [sholat, user]);

  if (!sholat) return <p className="p-6 text-center">Sholat tidak ditemukan</p>;

  return (
    <div className="detail-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fb' }}>
      
      {/* SIDEBAR (Sesuai Gambar 1) */}
      <aside style={{ width: '260px', backgroundColor: '#1e2530', color: '#fff', position: 'fixed', height: '100vh', zIndex: 10 }}>
        <div style={{ padding: '30px 25px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '1px' }}>E MUSLIM</h2>
        </div>
        <nav style={{ marginTop: '10px' }}>
          <Link to="/dashboard" className="nav-link" style={{ display: 'flex', alignItems: 'center', padding: '15px 25px', textDecoration: 'none', color: '#a0aec0' }}>
            <span style={{ marginRight: '15px' }}>📊</span> Dashboard
          </Link>
          <Link to="/jadwal-adzan" className="nav-link" style={{ display: 'flex', alignItems: 'center', padding: '15px 25px', textDecoration: 'none', color: '#a0aec0' }}>
            <span style={{ marginRight: '15px' }}>🕌</span> Jadwal Adzan
          </Link>
          <Link to="/doa" className="nav-link" style={{ display: 'flex', alignItems: 'center', padding: '15px 25px', textDecoration: 'none', color: '#a0aec0' }}>
            <span style={{ marginRight: '15px' }}>🤲</span> Doa-Doa Sholat
          </Link>
          <Link to="/riwayat" className="nav-link" style={{ display: 'flex', alignItems: 'center', padding: '15px 25px', textDecoration: 'none', color: '#a0aec0' }}>
            <span style={{ marginRight: '15px' }}>📜</span> Riwayat Belajar
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, marginLeft: '260px', position: 'relative' }}>
        
        {/* HEADER (Sesuai Gambar 2) */}
        <header style={{ backgroundColor: '#fff', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7' }}>
          <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
            Dashboard / <span style={{ color: '#3182ce' }}>Materi {sholat.nama}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4a5568' }}>{user?.name || "User"}</span>
            <button onClick={() => navigate('/login')} style={{ color: '#e53e3e', border: '1px solid #fed7d7', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer', background: '#fff' }}>Logout</button>
          </div>
        </header>

        {/* AKSEN BULAN */}
        <div className="moon-accent"></div>

        {/* ISI MATERI */}
        <div style={{ padding: '40px 60px', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1a202c', marginBottom: '30px', textTransform: 'uppercase' }}>
            TATA CARA {sholat.nama}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {sholat.tahapan.map((item, index) => (
              <div key={index} className="glass-card" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#2d3748' }}>{item.step}. {item.judul}</h3>
                  <span className="materi-badge">Materi</span>
                </div>

                {item.deskripsi && (
                  <p style={{ color: '#4a5568', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>{item.deskripsi}</p>
                )}

                {item.arab && (
                  <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                    <p style={{ fontSize: '1.8rem', color: '#1a202c', lineHeight: '2', fontFamily: 'serif' }}>{item.arab}</p>
                  </div>
                )}

                {item.latin && (
                  <p style={{ color: '#3182ce', fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '5px' }}>"{item.latin}"</p>
                )}

                {item.arti && (
                  <p style={{ color: '#718096', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 'bold' }}>Artinya:</span> {item.arti}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{ backgroundColor: '#3182ce', color: '#fff', padding: '12px 30px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}