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

    const cleanEmail = email.trim().toLowerCase();

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", cleanEmail);
      formData.append("password", password);
      formData.append("role", "admin");
      
      if (avatar) {
        formData.append("avatar", avatar); 
      }

      const response = await axios.post("http://localhost:5000/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201 || response.status === 200) {
        alert("Registrasi Admin Berhasil! Silakan Login.");
        navigate("/login");
      }

    } catch (error) {
      console.error("Register Error:", error);
      
      // Jika error dari server (email sudah ada, dsb)
      if (error.response) {
        const msg = error.response.data.message || "Gagal registrasi ke server.";
        alert("Error: " + msg);
      } 
      // Jika server offline (Network Error)
      else {
        handleLocalStorageFallback(cleanEmail);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocalStorageFallback = (cleanEmail) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    
    // Cek duplikasi di local storage
    if (users.find(u => u.email === cleanEmail)) {
      alert("Email sudah terdaftar di penyimpanan lokal!");
      return;
    }

    const saveToLocal = (avatarData = null) => {
      const newUser = { 
        name: name.trim(), 
        email: cleanEmail, 
        password, 
        role: "admin", 
        avatar: avatarData,
        createdAt: new Date().toISOString() 
      };
      
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      
      alert("⚠️ Backend offline. Akun Admin berhasil disimpan sementara di browser.");
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
    <div className="card" style={{ maxWidth: '450px', margin: '30px auto' }}>
      <div className="app-image-wrapper">
        <img 
          src="http://127.0.0.1:9000/postbucket/ilustrasi/muslim%20prayer.jpg" 
          alt="App Illustration"
          className="app-main-img" 
          onError={(e) => { 
            e.target.src = "https://ui-avatars.com/api/?name=Admin&background=3182ce&color=fff"; 
          }}
          style={{ width: '100%', borderRadius: '10px', marginBottom: '15px' }}
        />
      </div>

      <h2 className="gradient-text">Registrasi</h2>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '-10px', marginBottom: '20px', textAlign: 'center' }}>
        Khusus untuk pengelola sistem E-MUSLIM
      </p>
      
      <form onSubmit={handleRegister} className="form-container">
        <div style={{ textAlign: 'left', marginBottom: '5px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nama Lengkap:</label>
        </div>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Nama Admin" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />

        <div style={{ textAlign: 'left', marginBottom: '5px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Alamat Email:</label>
        </div>
        <input 
          type="email" 
          className="input-field" 
          placeholder="Email Admin" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />

        <div style={{ textAlign: 'left', marginBottom: '5px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Kata Sandi:</label>
        </div>
        <input 
          type="password" 
          className="input-field" 
          placeholder="Buat Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        
        <div style={{ textAlign: 'left', marginBottom: '10px', marginTop: '10px' }}>
          <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Foto Profil Admin:</label>
        </div>
        
        {preview && (
          <div style={{ marginBottom: '15px', textAlign: 'center' }}>
            <img 
              src={preview} 
              alt="Preview" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #3182ce', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
            />
          </div>
        )}

        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setAvatar(e.target.files[0])} 
          className="input-field" 
          style={{ padding: '10px', fontSize: '12px' }} 
        />
        
        <button 
          type="submit" 
          className="btn" 
          disabled={loading}
          style={{ marginTop: '10px', width: '100%', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Mendaftarkan..." : "Daftar"}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/login" className="text-link" style={{ fontSize: '14px', color: '#3182ce', textDecoration: 'none' }}>
          Sudah punya akun? <b>Kembali ke Login</b>
        </Link>
      </div>
    </div>
  );
};

export default Register;