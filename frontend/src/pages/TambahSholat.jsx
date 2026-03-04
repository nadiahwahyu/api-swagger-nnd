import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

export default function TambahSholat() {
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]); // Untuk dropdown kategori
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Ambil daftar kategori dari database saat halaman dimuat
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/categories");
        setCategories(response.data.data);
      } catch (err) {
        console.error("Gagal mengambil kategori:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 2. Gunakan FormData karena ada upload file
    const formData = new FormData();
    formData.append("judul", judul);
    formData.append("isi", isi);
    formData.append("category_id", categoryId);
    if (image) {
      formData.append("image", image); // Nama field harus 'image' sesuai multer di backend
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Sertakan token jika rute ini di-protect
        },
      });

      alert("Data Sholat berhasil ditambahkan ke PostgreSQL & MinIO!");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambah data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '20px auto' }}>
      <h2 className="gradient-text">Tambah Tata Cara Sholat</h2>
      
      <form onSubmit={handleSubmit} className="form-container">
        {/* Input Judul */}
        <input
          type="text"
          placeholder="Judul (Contoh: Niat Sholat Subuh)"
          className="input-field"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          required
        />

        {/* Dropdown Kategori */}
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

        {/* Input Isi/Deskripsi */}
        <textarea
          placeholder="Tuliskan tata cara atau niat di sini..."
          className="input-field"
          style={{ minHeight: '150px', paddingTop: '10px' }}
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
          required
        />

        {/* Input Gambar untuk MinIO */}
        <div style={{ textAlign: 'left', marginBottom: '10px' }}>
          <label style={{ fontSize: '12px', color: '#666' }}>Upload Gambar Ilustrasi:</label>
        </div>
        <input
          type="file"
          accept="image/*"
          className="input-field"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <div className="button-group" style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Data"}
          </button>
          <button 
            type="button" 
            onClick={() => navigate("/dashboard")} 
            className="btn" 
            style={{ background: '#666' }}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}