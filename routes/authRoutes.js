const express = require("express");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const pool = require("../config/db");
const multer = require("multer"); // Tambahkan ini
const { minioClient, bucketName } = require("../config/minioClient"); // Tambahkan ini

const router = express.Router();

// Konfigurasi Multer (simpan di memory sementara)
const upload = multer({ storage: multer.memoryStorage() });

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
 * tags: [Authentication]
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
 */
router.post("/register", upload.single("avatar"), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    let avatarUrl = null;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email dan password wajib diisi" });
    }

    // 1. Cek email di DB
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
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
        console.error("MinIO Error:", minioErr.message);
        // Lanjut saja meski upload gagal, atau hentikan jika wajib foto
      }
    }

    // 3. Hash Password & Simpan ke DB
    const hashedPassword = await argon2.hash(password);
    
    // Pastikan tabel users Anda memiliki kolom 'name' dan 'avatar'
    await pool.query(
      "INSERT INTO users (name, email, password, avatar) VALUES ($1, $2, $3, $4)",
      [name || 'User', email, hashedPassword, avatarUrl]
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
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Email tidak ditemukan" });
    }

    const user = result.rows[0];
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Password salah" });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
    );

    // Simpan refresh token (pastikan tabel refresh_tokens tersedia)
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
      [user.id, refreshToken]
    );

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
});

// ... Sisanya (Refresh Token) tetap sama ...
router.post("/refresh", async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
  
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token diperlukan",
        });
      }
  
      const tokenResult = await pool.query(
        "SELECT * FROM refresh_tokens WHERE token = $1",
        [refreshToken]
      );
  
      if (tokenResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Refresh token tidak valid",
        });
      }
  
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) {
            return res.status(403).json({
              success: false,
              message: "Refresh token expired / invalid",
            });
          }
  
          await pool.query(
            "DELETE FROM refresh_tokens WHERE token = $1",
            [refreshToken]
          );
  
          const newAccessToken = jwt.sign(
            { id: decoded.id, email: decoded.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
          );
  
          const newRefreshToken = jwt.sign(
            { id: decoded.id, email: decoded.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
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

module.exports = router;