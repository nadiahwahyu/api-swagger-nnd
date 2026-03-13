import React, { useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { SHOLAT_DATA } from "../data/sholat";
import "../App.css";

export default function DetailSholat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sholat = SHOLAT_DATA.find((s) => s.id === parseInt(id));
  
  const getUserData = () => {
    try {
      const data = localStorage.getItem("currentUser");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  };
  const user = getUserData();
  const hasSaved = useRef(false);

  const saveLearningHistory = async () => {
    if (!sholat || hasSaved.current) return;

    hasSaved.current = true; 

    const entryData = {
      // Menggunakan "Guest" jika user null
      user_name: user?.name || user?.username || user?.email || "Guest", 
      materi_nama: sholat.nama,
      status: "Selesai",
      progress: `${sholat.tahapan.length}/${sholat.tahapan.length}`
    };

    try {
      console.log("Mengirim data riwayat ke server...", entryData);

      const response = await fetch("http://localhost:5000/api/riwayat/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData)
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Riwayat Berhasil Disinkronkan");
        
        // Update LocalStorage Backup
        const allHistory = JSON.parse(localStorage.getItem("learning_history")) || [];
        const sekarang = new Date();
        
        const updatedEntry = {
          user: entryData.user_name,
          nama: sholat.nama,
          tanggal: sekarang.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) + ", " + 
                   sekarang.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }),
          status: "Selesai",
          progress: entryData.progress,
          timestamp: sekarang.getTime()
        };

        const existingIndex = allHistory.findIndex(
          (item) => item.user === entryData.user_name && item.nama === sholat.nama
        );

        if (existingIndex !== -1) {
          allHistory[existingIndex] = updatedEntry;
        } else {
          allHistory.unshift(updatedEntry);
        }
        localStorage.setItem("learning_history", JSON.stringify(allHistory));
      } else {
        hasSaved.current = false;
      }
    } catch (error) {
      hasSaved.current = false; 
      console.error("❌ Gagal sinkronisasi:", error);
    }
  };

  useEffect(() => {
    hasSaved.current = false;

    const handleScroll = () => {
      if (hasSaved.current) return;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const currentPos = scrollTop + clientHeight;
      const threshold = scrollHeight * 0.90;

      if (currentPos >= threshold) {
        saveLearningHistory();
      }
    };

    window.addEventListener("scroll", handleScroll);

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
        transition: all 0.3s ease;
      }
      .glass-card:hover { transform: translateY(-5px); border-color: #3182ce; }
      .nav-link:hover { background-color: rgba(255,255,255,0.05); color: #fff !important; }
    `;
    document.head.appendChild(styleSheet);

    return () => { 
      window.removeEventListener("scroll", handleScroll);
      if (document.head.contains(styleSheet)) document.head.removeChild(styleSheet); 
    };
  }, [id, sholat, user]);

  if (!sholat) return <p className="p-6 text-center">Materi tidak ditemukan</p>;

  const handleAuthAction = () => {
    if (user) {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
    }
    navigate("/login");
  };

  return (
    <div className="detail-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fb' }}>
      <aside style={{ width: '260px', backgroundColor: '#1e2530', color: '#fff', position: 'fixed', height: '100vh', zIndex: 10 }}>
        <div style={{ padding: '30px 25px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>E MUSLIM</h2>
        </div>
        <nav style={{ marginTop: '10px' }}>
          <Link to="/dashboard" className="nav-link" style={{ display: 'flex', alignItems: 'center', padding: '15px 25px', textDecoration: 'none', color: '#a0aec0' }}>📊 Dashboard</Link>
          <Link to="/jadwal-adzan" className="nav-link" style={{ display: 'flex', alignItems: 'center', padding: '15px 25px', textDecoration: 'none', color: '#a0aec0' }}>🕌 Jadwal Adzan</Link>
          <Link to="/doa" className="nav-link" style={{ display: 'flex', alignItems: 'center', padding: '15px 25px', textDecoration: 'none', color: '#a0aec0' }}>🤲 Doa-Doa</Link>
          <Link to="/riwayat" className="nav-link" style={{ display: 'flex', alignItems: 'center', padding: '15px 25px', textDecoration: 'none', color: '#a0aec0' }}>📜 Riwayat</Link>
        </nav>
      </aside>

      <main style={{ flex: 1, marginLeft: '260px', position: 'relative' }}>
        <header style={{ backgroundColor: '#fff', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf2f7' }}>
          <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Dashboard / <span style={{ color: '#3182ce' }}>{sholat.nama}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1a202c' }}>
              {user?.name || "Guest"}
            </span>
            <button 
              onClick={handleAuthAction} 
              style={{ 
                color: user ? '#e53e3e' : '#3182ce', 
                border: user ? '1px solid #fed7d7' : '1px solid #bee3f8', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                cursor: 'pointer', 
                backgroundColor: 'transparent' 
              }}
            >
              {user ? "Logout" : "Login"}
            </button>
          </div>
        </header>

        <div className="moon-accent"></div>

        <div style={{ padding: '40px 60px', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1a202c', marginBottom: '30px' }}>TATA CARA {sholat.nama.toUpperCase()}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {sholat.tahapan.map((item, index) => (
              <div key={index} className="glass-card" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '15px' }}>{index + 1}. {item.judul}</h3>
                {item.gambar && (
                  <img 
                    src={item.gambar} 
                    alt={item.judul} 
                    style={{ width: '100%', maxWidth: '500px', borderRadius: '10px', marginBottom: '20px', display: 'block' }} 
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                {item.deskripsi && <p style={{ color: '#4a5568', marginBottom: '20px' }}>{item.deskripsi}</p>}
                {item.arab && <div style={{ textAlign: 'right', fontSize: '1.8rem', marginBottom: '15px', fontFamily: 'serif' }}>{item.arab}</div>}
                {item.latin && <p style={{ color: '#3182ce', fontStyle: 'italic' }}>"{item.latin}"</p>}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <button 
              onClick={() => {
                saveLearningHistory();
                navigate('/dashboard');
              }} 
              style={{ backgroundColor: '#3182ce', color: '#fff', padding: '12px 30px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Selesai Belajar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}