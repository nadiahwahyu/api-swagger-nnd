import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SHOLAT_DATA } from "../data/sholat"; // Pastikan path data benar
import "../App.css";

export default function EditSholat() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State untuk formulir
  const [formData, setFormData] = useState({
    nama: "",
    sumber: "",
    deskripsi: ""
  });

  // 1. Ambil data berdasarkan ID saat halaman dimuat
  useEffect(() => {
    const dataAwal = SHOLAT_DATA.find((item) => item.id === parseInt(id));
    if (dataAwal) {
      setFormData({
        nama: dataAwal.nama,
        sumber: dataAwal.sumber,
        deskripsi: dataAwal.deskripsi || ""
      });
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Logika simpan (sementara kita tampilkan alert karena data statis)
    console.log("Data diperbarui:", formData);
    alert("Perubahan berhasil disimpan (Simulasi)");
    
    navigate("/dashboard");
  };

  return (
    <div className="dashboard-layout" style={{ backgroundColor: '#f5f7fb', minHeight: '100vh', padding: '40px' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
        <h2 className="gradient-text" style={{ marginBottom: '20px' }}>Edit Tata Cara Sholat</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '5px' }}>
              Nama Sholat
            </label>
            <input
              type="text"
              className="input-field"
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '5px' }}>
              Sumber / Referensi
            </label>
            <input
              type="text"
              className="input-field"
              value={formData.sumber}
              onChange={(e) => setFormData({...formData, sumber: e.target.value})}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '5px' }}>
              Deskripsi / Panduan
            </label>
            <textarea
              className="input-field"
              style={{ minHeight: '120px', paddingTop: '10px' }}
              value={formData.deskripsi}
              onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn" style={{ flex: 2 }}>
              Simpan Perubahan
            </button>
            <button 
              type="button" 
              onClick={() => navigate("/dashboard")} 
              style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}