import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function Doa() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));
  
  // Cek apakah user adalah admin
  const isAdmin = user?.role === "admin";

  // --- STATE MANAGEMENT ---
  const [doaList, setDoaList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newDoa, setNewDoa] = useState({ judul: "", arab: "", latin: "", arti: "" });

  // --- INITIAL DATA & PERSISTENCE ---
  useEffect(() => {
    // Mengambil data dari localStorage jika sudah pernah ada
    const savedDoa = JSON.parse(localStorage.getItem("app_doa_list"));
    
    // 12 Data Doa Asli Anda (Tanpa dikurangi)
    const INITIAL_DOA = [
      { id: 1, judul: "Niat Sholat Subuh", arab: "أُصَلِّى fَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى", latin: "Ushalli fardhash shubhi rak'ataini mustaqbilal qiblati ada'an lillahi ta'ala.", arti: "Aku niat sholat fardu Subuh dua rakaat menghadap kiblat karena Allah Ta'ala." },
      { id: 2, judul: "Doa Iftitah", arab: "اللهُ أَكْبَرُ كَبِيْرًا وَالْحَمْدُ لِلّهِ كَثِيْرًا وَسُبْحَانَ اللهِ بُكْرَةً وَأَصِيْلًا", latin: "Allahu akbar kabira, walhamdu lillahi katsira, wa subhanallahi bukratan wa ashila.", arti: "Allah Maha Besar dengan sebesar-besarnya, segala puji bagi Allah dengan pujian yang banyak, dan Maha Suci Allah pada waktu pagi dan petang." },
      { id: 3, judul: "Doa Qunut", arab: "اللّٰهُمَّ اهْدِنِيْ فِيْمَنْ هَدَيْتَ، وَعَافِنِيْ فِيْمَنْ عَافَيْتَ، وَتَوَلَّنِيْ فِيْمَنْ تَوَلَّيْتَ", latin: "Allahummah dinii fii man hadait, wa 'aafinii fii man 'aafait, wa tawallanii fii man tawallait.", arti: "Ya Allah, berilah aku petunjuk sebagaimana orang-orang yang telah Engkau beri petunjuk, berilah aku kesehatan sebagaimana orang yang telah Engkau beri kesehatan..." },
      { id: 4, judul: "Doa Sebelum Makan", arab: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ", latin: "Allahumma baarik lanaa fiimaa razaqtana wa qinaa 'adzaaban naar.", arti: "Ya Allah, berkahilah kami pada rezeki yang telah Engkau berikan kepada kami dan jagalah kami dari siksa api neraka." },
      { id: 5, judul: "Doa Sesudah Makan", arab: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ", latin: "Alhamdu lillahilladzii ath'amanaa wa saqaanaa wa ja'alanaa muslimiin.", arti: "Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami termasuk golongan orang-orang muslim." },
      { id: 6, judul: "Doa Sebelum Tidur", arab: "بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ", latin: "Bismika Allahumma ahyaa wa amuutu.", arti: "Dengan nama-Mu ya Allah aku hidup dan aku mati." },
      { id: 7, judul: "Doa Bangun Tidur", arab: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", latin: "Alhamdu lillahilladzii ahyaanaa ba'da maa amaatanaa wa ilaihin nusyuur.", arti: "Segala puji bagi Allah yang telah menghidupkan kami sesudah mematikan kami (tidur) dan hanya kepada-Nya kami kembali." },
      { id: 8, judul: "Doa Bepergian (Naik Kendaraan)", arab: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ", latin: "Subhaanal ladzii sakhkhara lanaa haadzaa wa maa kunnaa lahu muqriniina wa innaa ilaa rabbinaa lamunqalibuun.", arti: "Maha Suci Allah yang telah menundukkan semua ini bagi kami padahal kami sebelumnya tidak mampu menguasainya, dan sesungguhnya kami akan kembali kepada Tuhan kami." },
      { id: 9, judul: "Doa Masuk Kamar Mandi", arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ", latin: "Allahumma innii a'uudzu bika minal khubutsi wal khabaa-its.", arti: "Ya Allah, aku berlindung kepada-Mu dari godaan setan laki-laki dan setan perempuan." },
      { id: 10, judul: "Doa Keluar Kamar Mandi", arab: "غُفْرَانَكَ الْحَمْدُ لِلَّهِ الَّذِي أَذْهَبَ عَنِّي الْأَذَى وَعَافَانِي", latin: "Ghufraanaka alhamdu lillahilladzii adzhaba 'annil adzaa wa 'aafaanii.", arti: "Aku memohon ampunan-Mu. Segala puji bagi Allah yang telah menghilangkan penyakit dari tubuhku dan menyehatkanku." },
      { id: 11, judul: "Doa Untuk Kedua Orang Tua", arab: "رَبِّ اغْفِرْ لِيْ وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِيْ صَغِيْرًا", latin: "Rabbighfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa.", arti: "Ya Tuhanku, ampunilah dosaku dan dosa kedua orang tuaku, dan sayangilah mereka sebagaimana mereka menyayangiku di waktu kecil." },
      { id: 12, judul: "Doa Sapu Jagad (Kebaikan Dunia Akhirat)", arab: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", latin: "Rabbanaa aatinaa fiddunyaa hasanatan wa fil aakhirati hasanatan wa qinaa 'adzaaban naar.", arti: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari siksa api neraka." }
    ];

    if (savedDoa && savedDoa.length > 0) {
      setDoaList(savedDoa);
    } else {
      setDoaList(INITIAL_DOA);
      localStorage.setItem("app_doa_list", JSON.stringify(INITIAL_DOA));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleAddDoa = (e) => {
    e.preventDefault();
    const updatedList = [...doaList, { ...newDoa, id: Date.now() }];
    setDoaList(updatedList);
    localStorage.setItem("app_doa_list", JSON.stringify(updatedList));
    setShowModal(false);
    setNewDoa({ judul: "", arab: "", latin: "", arti: "" });
  };

  const handleDeleteDoa = (id) => {
    if (window.confirm("Hapus doa ini?")) {
      const updatedList = doaList.filter(item => item.id !== id);
      setDoaList(updatedList);
      localStorage.setItem("app_doa_list", JSON.stringify(updatedList));
    }
  };

  const bgPrayImage = "https://images.unsplash.com/photo-1599011749870-13f50a8a6502?q=80&w=1974&auto=format&fit=crop";

  return (
    <div className="dashboard-layout" style={{ 
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.85)), url(${bgPrayImage})`,
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', minHeight: '100vh', display: 'flex', width: '100%' 
    }}>
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand"><h2> E MUSLIM</h2></div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link"><span className="icon">📊</span> Dashboard</Link>
          <Link to="/jadwal-adzan" className="nav-link"><span className="icon">🕌</span> Jadwal Adzan</Link>
          <Link to="/doa" className="nav-link active"><span className="icon">🤲</span> Doa-Doa Sholat</Link>
          <Link to="/riwayat" className="nav-link"><span className="icon">📜</span> Riwayat Belajar</Link>
        </nav>
      </aside>

      <main className="main-content" style={{ flex: 1, padding: '20px' }}>
        {/* TOP BAR */}
        <header className="top-bar">
          <div className="breadcrumb">Dashboard / <span style={{color: '#2563eb'}}>Doa-Doa Sholat</span></div>
          <div className="user-section-minimal">
            <span className="user-name-label">{user?.name || "User"}</span>
            <button onClick={handleLogout} className="logout-icon-btn">Logout</button>
          </div>
        </header>

        <div className="content-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 className="gradient-text" style={{margin: 0}}>KUMPULAN DOA & NIAT SHOLAT</h2>
            
            {/* TOMBOL TAMBAH DATA (KHUSUS ADMIN) */}
            {isAdmin && (
              <button 
                onClick={() => setShowModal(true)}
                style={{ 
                  backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', 
                  borderRadius: '25px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                + Tambah Data
              </button>
            )}
          </div>
          
          <div className="doa-list-container" style={{ display: 'grid', gap: '20px', paddingBottom: '40px' }}>
            {doaList.map((item, index) => (
              <div key={item.id} className="data-card shadow-sm" style={{ 
                padding: '25px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(5px)', 
                borderRadius: '15px', border: '1px solid #edf2f7', position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ color: '#1a202c', fontSize: '1.1rem', marginBottom: '15px' }}>
                    {index + 1}. {item.judul}
                  </h3>
                  <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    <span style={{ backgroundColor: '#ebf8ff', color: '#2563eb', fontSize: '10px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>MATERI</span>
                    {isAdmin && (
                      <button onClick={() => handleDeleteDoa(item.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px'}}>🗑️</button>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '1.8rem', textAlign: 'right', direction: 'rtl', margin: '20px 0', fontFamily: 'serif', lineHeight: '1.8', color: '#1a1a1a' }}>
                  {item.arab}
                </p>
                <p style={{ fontWeight: '600', color: '#2563eb', marginBottom: '10px', fontStyle: 'italic', fontSize: '1rem' }}>
                  "{item.latin}"
                </p>
                <p style={{ fontSize: '0.95rem', color: '#4a5568', lineHeight: '1.6' }}>
                  <strong style={{ color: '#2d3748' }}>Artinya:</strong> {item.arti}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL TAMBAH DATA (MODAL POPUP) */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '20px', color: '#1a202c' }}>Tambah Doa Baru</h3>
            <form onSubmit={handleAddDoa} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Judul Doa" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
                value={newDoa.judul} onChange={(e) => setNewDoa({...newDoa, judul: e.target.value})} />
              <textarea placeholder="Teks Arab" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', direction: 'rtl', minHeight: '100px' }} 
                value={newDoa.arab} onChange={(e) => setNewDoa({...newDoa, arab: e.target.value})} />
              <input type="text" placeholder="Teks Latin" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
                value={newDoa.latin} onChange={(e) => setNewDoa({...newDoa, latin: e.target.value})} />
              <textarea placeholder="Artinya" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
                value={newDoa.arti} onChange={(e) => setNewDoa({...newDoa, arti: e.target.value})} />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Simpan</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}