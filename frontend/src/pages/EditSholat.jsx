import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

export default function EditSholat() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State untuk data formulir
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(""); // URL gambar lama (MinIO)
  const [newImagePreview, setNewImagePreview] = useState(""); // Preview gambar baru yang dipilih
  
  // State untuk data pendukung
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Ambil Kategori dan Data Postingan berdasarkan ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axios.get("http://localhost:5000/api/categories");
        setCategories(catRes.data.data);

        const postRes = await axios.get(`http://localhost:5000/api/posts/${id}`);
        const post = postRes.data.data;

        if (post) {
          setJudul(post.judul);
          setIsi(post.isi);
          setCategoryId(post.category_id);
          setPreviewImage(post.image_url); // URL lengkap dari helper backend
        }
      } catch (err) {
        console.error("Gagal memuat data:", err);
        alert("Data tidak ditemukan atau server error");
        navigate("/dashboard");
      }
    };
    fetchData();
  }, [id, navigate]);

  // 2. Handle Perubahan Gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal 5MB.");
        return;
      }
      setImage(file);
      // Buat preview untuk gambar baru
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("judul", judul.trim());
    formData.append("isi", isi.trim());
    formData.append("category_id", categoryId);
    
    if (image) {
      formData.append("image", image); // Harus 'image' agar cocok dengan upload.single("image")
    }

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      await axios.put(`http://localhost:5000/api/posts/${id}`, formData, config);

      alert("Perubahan berhasil disimpan!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Gagal update:", err);
      alert(err.response?.data?.message || "Gagal memperbarui data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout" style={{ backgroundColor: '#f5f7fb', minHeight: '100vh', padding: '40px' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
        <h2 className="gradient-text" style={{ marginBottom: '20px' }}>Edit Tata Cara Sholat</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Judul */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '5px' }}>
              Nama Sholat
            </label>
            <input
              type="text"
              className="input-field"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
            />
          </div>

          {/* Kategori */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '5px' }}>
              Kategori
            </label>
            <select 
              className="input-field" 
              value={categoryId} 
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Deskripsi */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '5px' }}>
              Deskripsi / Panduan
            </label>
            <textarea
              className="input-field"
              style={{ minHeight: '150px', paddingTop: '10px', resize: 'vertical' }}
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              required
            />
          </div>

          {/* Update Gambar */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '5px' }}>
              Gambar Ilustrasi
            </label>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
              {/* Preview Gambar Lama atau Baru */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.65rem', color: '#718096', marginBottom: '4px' }}>
                  {newImagePreview ? "Gambar Baru:" : "Gambar Saat Ini:"}
                </p>
                <img 
                  src={newImagePreview || previewImage || "https://via.placeholder.com/100"} 
                  alt="Preview" 
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} 
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field"
                  onChange={handleImageChange}
                  style={{ fontSize: '0.8rem' }}
                />
                <p style={{ fontSize: '0.7rem', color: '#a0aec0', marginTop: '5px' }}>
                  Kosongkan jika tidak ingin mengubah gambar.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              className="btn" 
              style={{ flex: 2, opacity: loading ? 0.7 : 1 }} 
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
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