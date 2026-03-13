const express = require("express");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const pool = require("../config/db");
const multer = require("multer"); 
const { minioClient, bucketName } = require("../config/minioClient"); 

const router = express.Router();

// Konfigurasi Multer (simpan di memory sementara untuk dikirim ke MinIO)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 } // Batas 2MB
});

/**
 * @swagger
 * tags:
 * name: Auth
 * description: API untuk Autentikasi User (Register, Login, Refresh, Logout)
 */

/*
=================================
REGISTER (DENGAN MINIO & POSTGRES)
=================================
*/
/**
 * @swagger
 * /api/auth/register:
 * post:
 * summary: Register user baru dengan foto profil
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * name:
 * type: string
 * email:
 * type: string
 * password:
 * type: string
 * avatar:
 * type: string
 * format: binary
 * responses:
 * 201:
 * description: User berhasil didaftarkan
 * 400:
 * description: Email atau password tidak valid
 */
router.post("/register", upload.single("avatar"), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    let avatarUrl = null;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email dan password wajib diisi" });
    }

    // 1. Cek email di DB
    const existingUser = await pool.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1)", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Email sudah terdaftar" });
    }

    // 2. Upload ke MinIO jika ada file
    if (req.file) {
      try {
        const fileName = `avatars/${Date.now()}_${req.file.originalname.replace(/\s/g, '_')}`;
        await minioClient.putObject(
          bucketName,
          fileName,
          req.file.buffer,
          req.file.size,
          { "Content-Type": req.file.mimetype }
        );
        avatarUrl = `http://127.0.0.1:9000/${bucketName}/${fileName}`;
      } catch (minioErr) {
        console.error("⚠️ MinIO Error:", minioErr.message);
      }
    }

    // 3. Hash Password & Simpan ke DB
    const hashedPassword = await argon2.hash(password);
    
    await pool.query(
      "INSERT INTO users (name, email, password, avatar) VALUES ($1, $2, $3, $4)",
      [name || 'User', email.toLowerCase(), hashedPassword, avatarUrl]
    );

    res.status(201).json({
      success: true,
      message: "User berhasil didaftarkan ke PostgreSQL & MinIO",
      avatarUrl
    });
  } catch (error) {
    next(error);
  }
});

/*
=================================
LOGIN (DENGAN DATA USER LENGKAP)
=================================
*/
/**
 * @swagger
 * /api/auth/login:
 * post:
 * summary: Login user untuk mendapatkan token
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email:
 * type: string
 * password:
 * type: string
 * responses:
 * 200:
 * description: Login berhasil
 * 401:
 * description: Kredensial salah
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email dan password wajib diisi" });
    }

    const result = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Email tidak ditemukan" });
    }

    const user = result.rows[0];
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Password salah" });
    }

    const accessSecret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "access_secret_2026";
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || "refresh_secret_2026";

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      accessSecret,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      refreshSecret,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' }
    );

    // Simpan refresh token ke database
    try {
        await pool.query(
          "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
          [user.id, refreshToken]
        );
    } catch (e) {
        console.error("⚠️ Gagal simpan Refresh Token:", e.message);
    }

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

/*
=================================
REFRESH TOKEN
=================================
*/
/**
 * @swagger
 * /api/auth/refresh:
 * post:
 * summary: Perbarui Access Token menggunakan Refresh Token
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * refreshToken:
 * type: string
 * responses:
 * 200:
 * description: Token berhasil diperbarui
 */
router.post("/refresh", async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
  
      if (!refreshToken) {
        return res.status(401).json({ success: false, message: "Refresh token diperlukan" });
      }
  
      const tokenResult = await pool.query(
        "SELECT * FROM refresh_tokens WHERE token = $1",
        [refreshToken]
      );
  
      if (tokenResult.rows.length === 0) {
        return res.status(403).json({ success: false, message: "Refresh token tidak valid" });
      }
  
      const accessSecret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "access_secret_2026";
      const refreshSecret = process.env.REFRESH_TOKEN_SECRET || "refresh_secret_2026";

      jwt.verify(
        refreshToken,
        refreshSecret,
        async (err, decoded) => {
          if (err) {
            return res.status(403).json({ success: false, message: "Refresh token expired / invalid" });
          }
  
          // Rotasi Token
          await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken]);
  
          const newAccessToken = jwt.sign(
            { id: decoded.id, email: decoded.email },
            accessSecret,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '1h' }
          );
  
          const newRefreshToken = jwt.sign(
            { id: decoded.id, email: decoded.email },
            refreshSecret,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' }
          );
  
          await pool.query(
            "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
            [decoded.id, newRefreshToken]
          );
  
          res.json({
            success: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });
        }
      );
    } catch (error) {
      next(error);
    }
});

/*
=================================
LOGOUT (PEMBERSIHAN DATABASE)
=================================
*/
/**
 * @swagger
 * /api/auth/logout:
 * post:
 * summary: Logout dan hapus refresh token dari server
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * refreshToken:
 * type: string
 * responses:
 * 200:
 * description: Berhasil logout
 */
router.post("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ success: false, message: "Token diperlukan untuk logout" });
    }
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken]);
    
    res.json({ success: true, message: "Berhasil logout dan token dihapus." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;