import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

export default function TambahSholat() {
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Ambil daftar kategori dari database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/categories");
        if (response.data && response.data.data) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error("Gagal mengambil kategori:", err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Handle Preview Gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        alert("Ukuran file terlalu besar! Maksimal 5MB.");
        e.target.value = null;
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryId) {
      alert("Silakan pilih kategori terlebih dahulu!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("judul", judul.trim());
    formData.append("isi", isi.trim());
    
    // Sinkronisasi tipe data integer untuk PostgreSQL
    formData.append("category_id", categoryId); 
    
    // Pastikan key 'image' sesuai dengan multer di router backend
    if (image) {
      formData.append("image", image); 
    }

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      // Melakukan request ke controller createPost
      const response = await axios.post("http://localhost:5000/api/posts", formData, config);

      if (response.data.success) {
        alert("Data Sholat berhasil ditambahkan!");
        navigate("/dashboard");
      }
    } catch (err) {
      // Debugging Error 500: Cetak pesan error detail dari backend
      console.error("❌ ERROR DETIL:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || "Gagal menambah data ke server";
      alert("Kesalahan Server (500): " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h2 className="gradient-text" style={{ textAlign: 'center', marginBottom: '20px' }}>Tambah Tata Cara Sholat</h2>
      
      <form onSubmit={handleSubmit} className="form-container">
        <div style={{ textAlign: 'left', marginBottom: '5px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Judul Materi:</label>
        </div>
        <input
          type="text"
          placeholder="Judul (Contoh: Niat Sholat Subuh)"
          className="input-field"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          required
        />

        <div style={{ textAlign: 'left', marginBottom: '5px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Kategori Sholat:</label>
        </div>
        <select 
          className="input-field" 
          value={categoryId} 
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">-- Pilih Kategori --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <div style={{ textAlign: 'left', marginBottom: '5px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Isi / Tata Cara:</label>
        </div>
        <textarea
          placeholder="Tuliskan tata cara atau niat di sini..."
          className="input-field"
          style={{ minHeight: '150px', paddingTop: '10px', resize: 'vertical' }}
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
          required
        />

        <div style={{ textAlign: 'left', marginBottom: '5px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Upload Gambar Ilustrasi:</label>
        </div>
        <input
          type="file"
          accept="image/*"
          className="input-field"
          onChange={handleImageChange}
        />
        
        {preview && (
          <div style={{ marginBottom: '15px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Pratinjau Gambar:</p>
            <img 
              src={preview} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #ddd' }} 
            />
          </div>
        )}

        <small style={{ display: 'block', textAlign: 'left', color: '#888', marginBottom: '15px' }}>
          *Format gambar: JPG, PNG, atau WEBP. Maks 5MB.
        </small>

        <div className="button-group" style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            className="btn" 
            disabled={loading} 
            style={{ flex: 2, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? "Sedang Menyimpan..." : "Simpan Data"}
          </button>
          <button 
            type="button" 
            onClick={() => navigate("/dashboard")} 
            className="btn" 
            style={{ background: '#666', flex: 1, cursor: 'pointer' }}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}