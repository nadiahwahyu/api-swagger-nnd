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
  const [selectedProvinsi, setSelectedProvinsi] = useState("");
  const [timezone, setTimezone] = useState(""); 
  const [currentTime, setCurrentTime] = useState(new Date());
  // State baru untuk mencegah duplikasi notifikasi di menit yang sama
  const [lastNotified, setLastNotified] = useState("");

  const daftarProvinsi = [
    "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
    "Jambi", "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung",
    "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta",
    "Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
    "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
    "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara", "Gorontalo", "Sulawesi Barat",
    "Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah", "Papua Pegunungan", "Papua Barat Daya"
  ];

  // --- LOGIKA NOTIFIKASI (AUDIO & FONNTE) ---
  const playAndSendNotif = async (namaSholat) => {
    // 1. Putar Audio (Pastikan file di public/assets/sound/adzan.mp3)
    const audio = new Audio("/assets/sound/adzan.mp3");
    audio.play().catch(() => console.log("Menunggu interaksi user untuk memutar suara."));

    // 2. Kirim WhatsApp Fonnte via Backend
    try {
      await axios.post("http://localhost:5000/api/send-wa", {
        phone: user?.phone || "08123456789", // Pastikan nomor user tersedia
        message: `*Panggilan Adzan*\n\nAssalamu'alaikum, sudah masuk waktu sholat *${namaSholat}* untuk wilayah *${statusLokasi}*. Mari segera tunaikan ibadah.\n\n_E-Muslim Notifikasi_`
      });
      console.log(`Notifikasi WA ${namaSholat} dikirim.`);
    } catch (err) {
      console.error("Gagal mengirim notifikasi Fonnte:", err);
    }
  };

  const getZoneLabel = (tz) => {
    if (!tz) return "";
    if (tz.includes("Jakarta") || tz.includes("Pontianak")) return "WIB";
    if (tz.includes("Makassar") || tz.includes("Bali") || tz.includes("Ujung_Pandang")) return "WITA";
    if (tz.includes("Jayapura") || tz.includes("Ambon")) return "WIT";
    return "WIB"; 
  };

  const formatTimeByZone = (date, tz) => {
    if (!tz) return date.toLocaleTimeString('id-ID');
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: tz,
      hour12: false
    }).format(date);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const fetchJadwalByCity = async (city) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Indonesia&method=20`
      );
      setJadwal(res.data.data.timings);
      setTimezone(res.data.data.meta.timezone);
      setStatusLokasi(city);
      setLoading(false);
    } catch (err) {
      console.error("Gagal mengambil jadwal:", err);
      setLoading(false);
    }
  };

  const detectAndFetchJadwal = async () => {
    setLoading(true);
    const fetchByIP = async () => {
      const apiKey = '14962ADB77A9DD44D8F8321A2A2E1148';
      try {
        const ipRes = await axios.get(`https://api.ip2location.io/?key=${apiKey}`);
        const { latitude, longitude, city_name } = ipRes.data;
        const adzanRes = await axios.get(
          `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=20`
        );
        setJadwal(adzanRes.data.data.timings);
        setTimezone(adzanRes.data.data.meta.timezone);
        setStatusLokasi(city_name);
        setLoading(false);
      } catch (err) {
        fetchJadwalByCity("Lampung");
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await axios.get(
              `https://api.aladhan.com/v1/timings?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&method=20`
            );
            setJadwal(res.data.data.timings);
            const tz = res.data.data.meta.timezone;
            setTimezone(tz);
            setStatusLokasi(tz.split('/')[1]?.replace('_', ' ') || tz);
            setLoading(false);
          } catch (err) {
            fetchByIP();
          }
        },
        () => fetchByIP(),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      fetchByIP();
    }
  };

  const handleProvinsiChange = (e) => {
    const prov = e.target.value;
    setSelectedProvinsi(prov);
    if (prov === "") {
      detectAndFetchJadwal();
    } else {
      fetchJadwalByCity(prov);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // --- CHECKER WAKTU ADZAN ---
    const checkAdzan = setInterval(() => {
      if (jadwal) {
        // Ambil jam sekarang sesuai zona waktu wilayah yang dipilih
        const nowStr = new Intl.DateTimeFormat('id-ID', {
          hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone
        }).format(new Date()).replace('.', ':');

        const adzanList = {
          Subuh: jadwal.Fajr,
          Dzuhur: jadwal.Dhuhr,
          Ashar: jadwal.Asr,
          Maghrib: jadwal.Maghrib,
          Isya: jadwal.Isha
        };

        Object.entries(adzanList).forEach(([nama, waktu]) => {
          // Jika waktu cocok dan belum dinotifikasi pada menit ini
          if (waktu === nowStr && lastNotified !== `${nama}-${waktu}`) {
            playAndSendNotif(nama);
            setLastNotified(`${nama}-${waktu}`);
          }
        });
      }
    }, 10000); // Cek setiap 10 detik agar akurat

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes moveLine { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      @keyframes kenBurns { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
      .moon-container { position: fixed; top: 100px; right: 100px; width: 150px; height: 150px; z-index: 0; filter: drop-shadow(0 0 20px rgba(49, 130, 206, 0.4)); animation: floatMoon 6s ease-in-out infinite; pointer-events: none; }
      .moon { width: 100px; height: 100px; border-radius: 50%; box-shadow: 25px 10px 0 0 #3182ce; transform: rotate(-15deg); }
      .star { position: fixed; background: white; border-radius: 50%; opacity: 0.5; z-index: 0; pointer-events: none; animation: twinkle var(--duration) infinite ease-in-out; }
      @keyframes floatMoon { 0%, 100% { transform: translateY(0) rotate(-15deg); } 50% { transform: translateY(-20px) rotate(-10deg); } }
      @keyframes twinkle { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.5); opacity: 1; filter: blur(1px); } }
      .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3182ce; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .glass-card { background: rgba(255, 255, 255, 0.9) !important; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3) !important; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07) !important; }
      .time-text { font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; font-variant-numeric: tabular-nums; display: inline-block; min-width: 80px; }
      .admin-table tbody tr:hover { background-color: rgba(49, 130, 206, 0.03); }
      .select-provinsi { padding: 10px 15px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none; cursor: pointer; background: white; font-weight: 600; color: #4a5568; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    `;
    document.head.appendChild(styleSheet);
    detectAndFetchJadwal();

    return () => {
      clearInterval(timer);
      clearInterval(checkAdzan);
      if (document.head.contains(styleSheet)) document.head.removeChild(styleSheet);
    };
  }, [jadwal, timezone, lastNotified]); // Penting: Dependency array lengkap

  const tanggalSekarang = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date());
  const bgPrayImage = "https://images.unsplash.com/photo-1599011749870-13f50a8a6502?q=80&w=1974&auto=format&fit=crop";

  return (
    <div className="dashboard-layout" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex' }}>
      
      <div className="moon-container"><div className="moon"></div></div>
      {[...Array(15)].map((_, i) => (
        <div key={i} className="star" style={{ top: `${Math.random() * 100}vh`, left: `${Math.random() * 100}vw`, width: `${Math.random() * 3}px`, height: `${Math.random() * 3}px`, "--duration": `${2 + Math.random() * 4}s` }} />
      ))}

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '4px', zIndex: 999, overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: '30%', height: '100%', background: 'linear-gradient(90deg, transparent, #3182ce, transparent)', animation: 'moveLine 3s infinite linear' }} />
      </div>

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, backgroundImage: `linear-gradient(rgba(245, 247, 251, 0.85), rgba(245, 247, 251, 0.95)), url(${bgPrayImage})`, backgroundSize: 'cover', backgroundPosition: 'center', animation: 'kenBurns 25s infinite ease-in-out' }} />

      <aside className="sidebar" style={{ backgroundColor: '#1e2530', color: '#fff', width: '260px', zIndex: 10 }}>
        <div className="sidebar-brand" style={{ padding: '30px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>E MUSLIM</h2>
        </div>
        <nav className="sidebar-nav" style={{ marginTop: '20px', padding: '0 10px' }}>
          <Link to="/dashboard" className="nav-link" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', padding: '12px 15px', textDecoration: 'none', borderRadius: '8px' }}>📊 Dashboard</Link>
          <Link to="/jadwal-adzan" className="nav-link active" style={{ color: '#fff', backgroundColor: '#3182ce', display: 'flex', alignItems: 'center', padding: '12px 15px', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>🕌 Jadwal Adzan</Link>
          <Link to="/doa" className="nav-link" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', padding: '12px 15px', textDecoration: 'none', borderRadius: '8px' }}>🤲 Doa-Doa Sholat</Link>
        </nav>
      </aside>

      <main className="main-content" style={{ flex: 1, zIndex: 1, overflowY: 'auto' }}>
        <header className="top-bar" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <div className="breadcrumb" style={{ color: '#718096', fontSize: '0.85rem' }}>
            Jadwal Adzan / <span style={{ color: '#3182ce', fontWeight: '600' }}>{statusLokasi}</span>
          </div>
          <div className="user-section-minimal" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '6px 16px', borderRadius: '30px', border: '1px solid #edf2f7' }}>
            <span style={{ color: '#1e293b', fontWeight: '600', fontSize: '0.85rem', marginRight: '12px' }}>{user?.name || "User"}</span>
            <button onClick={handleLogout} style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '800' }}>Logout</button>
          </div>
        </header>

        <div className="content-inner" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <label style={{ fontWeight: '800', fontSize: '0.85rem', color: '#1e2530' }}>PILIH PROVINSI:</label>
            <select className="select-provinsi" value={selectedProvinsi} onChange={handleProvinsiChange}>
              <option value="">Deteksi Otomatis (GPS/IP)</option>
              {daftarProvinsi.map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
            {/* Tombol Test Suara untuk memastikan path file benar */}
            <button 
              onClick={() => playAndSendNotif("Testing")}
              style={{ padding: '8px 15px', borderRadius: '8px', border: 'none', backgroundColor: '#ebf8ff', color: '#3182ce', fontWeight: '800', cursor: 'pointer', fontSize: '0.7rem' }}
            >
              🔊 TEST NOTIFIKASI
            </button>
          </div>

          <div className="data-card glass-card" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div className="data-card-header" style={{ padding: '25px 30px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1a202c', fontSize: '1.1rem', fontWeight: '800' }}>WAKTU SHOLAT {selectedProvinsi ? "WILAYAH" : "OTOMATIS"}</h3>
                <p style={{ color: "#718096", margin: '4px 0 0', fontSize: '0.85rem' }}>{tanggalSekarang}</p>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e2530', fontFamily: 'JetBrains Mono, monospace' }}>
                  {formatTimeByZone(currentTime, timezone)}
                  <span style={{ fontSize: '0.8rem', marginLeft: '8px', color: '#3182ce' }}>{getZoneLabel(timezone)}</span>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#3182ce', backgroundColor: '#ebf8ff', padding: '4px 12px', borderRadius: '50px' }}>
                  ● {statusLokasi.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="table-wrapper">
              {loading ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <div className="spinner"></div>
                  <p style={{ color: '#718096' }}>Menyinkronkan data lokasi...</p>
                </div>
              ) : (
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '15px 30px', textAlign: 'left', color: '#94a3b8', fontSize: '0.7rem', fontWeight: '800' }}>Ibadah</th>
                      <th style={{ padding: '15px 30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem', fontWeight: '800' }}>Waktu</th>
                      <th style={{ padding: '15px 30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem', fontWeight: '800' }}>Status</th>
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
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
                            <span className="time-text" style={{ fontSize: '1.4rem', fontWeight: '800', color: '#3182ce' }}>{item.waktu}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8' }}>{getZoneLabel(timezone)}</span>
                          </div>
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
        </div>
      </main>

      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', height: '4px', zIndex: 999, overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: '30%', height: '100%', background: 'linear-gradient(90deg, transparent, #3182ce, transparent)', animation: 'moveLine 4s infinite linear reverse' }} />
      </div>
    </div>
  );
}