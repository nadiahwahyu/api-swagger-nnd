const argon2 = require("argon2"); // Pastikan pakai argon2 agar cocok dengan Register
const jwt = require("jsonwebtoken");
const pool = require("../config/db"); 

/**
 * PENTING: Menggunakan query SQL 'LOWER(email)' agar pencarian bersifat 
 * Case-Insensitive, cocok untuk database PostgreSQL.
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi Input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email dan password wajib diisi." 
      });
    }

    // 2. Cari user di DATABASE dengan query manual
    const cleanEmail = email.trim().toLowerCase();
    
    // Menggunakan pool.query (SQL Mentah)
    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = $1", 
      [cleanEmail]
    );

    const user = result.rows[0]; 

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Email tidak ditemukan atau belum terdaftar." 
      });
    }

    // 3. Bandingkan password menggunakan argon2.verify
    const isMatch = await argon2.verify(user.password, password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Password salah!" 
      });
    }

    // 4. GENERATE TOKEN
    const secretKey = process.env.JWT_SECRET || "rahasia_muslim_2026"; 

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role || "user" 
      },
      secretKey, 
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION || "1d" }
    );

    // 5. Kirim Response Sukses
    res.status(200).json({
      success: true,
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role || "user" 
      }
    });

  } catch (error) {
    console.error("❌ Login Error Detail:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error: " + error.message 
    });
  }
};