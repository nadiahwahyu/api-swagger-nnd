const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const { minioClient, bucketName } = require("../config/minioClient");

// Dummy user (Ganti ke database PostgreSQL jika sudah siap)
let users = [];

exports.register = async (req, res) => {
  try {
    // AMBIL 'name', BUKAN 'username' (sesuaikan dengan frontend)
    const { name, email, password } = req.body;
    let avatarUrl = null;

    // Logika Upload ke MinIO
    if (req.file) {
      const file = req.file;
      const fileName = `avatars/${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;

      await minioClient.putObject(
        bucketName,
        fileName,
        file.buffer,
        file.size,
        { "Content-Type": file.mimetype }
      );

      avatarUrl = `http://127.0.0.1:9000/${bucketName}/${fileName}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now(),
      name, // simpan nama
      email,
      password: hashedPassword,
      avatar: avatarUrl,
    };

    users.push(newUser);
    console.log("✅ User Baru Terdaftar:", newUser);

    res.status(201).json({
      success: true,
      message: "Register berhasil ke MinIO",
      avatarUrl
    });

  } catch (error) {
    console.error("❌ Register Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message
    });
  }
};