import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios"; 
import "../App.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null); 
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    if (!avatar) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(avatar);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatar]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      // TAMBAHKAN INI: Agar user yang didaftarkan otomatis jadi Admin
      formData.append("role", "admin");
      
      if (avatar) {
        formData.append("avatar", avatar); 
      }

      const response = await axios.post("http://127.0.0.1:5000/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201 || response.status === 200) {
        alert("Registrasi Admin Berhasil!");
        navigate("/login");
      }

    } catch (error) {
      console.error("Register Error:", error);
      if (error.response) {
        alert(error.response.data.message || "Gagal registrasi ke server.");
      } else {
        handleLocalStorageFallback();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocalStorageFallback = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const saveToLocal = (avatarData = null) => {
      // Tambahkan role: "admin" di fallback juga
      users.push({ name, email, password, role: "admin", avatar: avatarData });
      localStorage.setItem("users", JSON.stringify(users));
      alert("Backend offline. Akun Admin tersimpan di browser.");
      navigate("/login");
    };

    if (avatar) {
      const reader = new FileReader();
      reader.onload = () => saveToLocal(reader.result);
      reader.readAsDataURL(avatar);
    } else {
      saveToLocal();
    }
  };

  return (
    <div className="card">
      <div className="app-image-wrapper">
        <img 
          src="http://127.0.0.1:9000/postbucket/ilustrasi/muslim%20prayer.jpg" 
          alt="App Illustration"
          className="app-main-img" 
          onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Admin&background=3182ce&color=fff"; }}
        />
      </div>

      <h2 className="gradient-text">Tambah Admin Baru</h2>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '-10px', marginBottom: '20px' }}>
        Khusus untuk pengelola sistem E-MUSLIM
      </p>
      
      <form onSubmit={handleRegister}>
        <input type="text" className="input-field" placeholder="Nama Admin" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" className="input-field" placeholder="Email Admin" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" className="input-field" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <div style={{ textAlign: 'left', marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', color: '#666' }}>Foto Profil Admin:</label>
        </div>
        
        {preview && (
          <div style={{ marginBottom: '10px', textAlign: 'center' }}>
            <img src={preview} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3182ce' }} />
          </div>
        )}

        <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} className="input-field" style={{ padding: '10px' }} />
        
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Mendaftarkan..." : "Daftarkan Admin"}
        </button>
      </form>
      
      <Link to="/login" className="text-link">Kembali ke Login</Link>
    </div>
  );
};

export default Register;