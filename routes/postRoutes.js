const express = require("express");
const router = express.Router();
const multer = require("multer");
const postController = require("../controllers/postController");

// Konfigurasi Multer untuk menyimpan file di Memory (Buffer)
// Sangat disarankan untuk penggunaan bersama MinIO
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Batasi ukuran file (5MB)
  },
  fileFilter: (req, file, cb) => {
    // Validasi tipe file agar hanya gambar yang diizinkan
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar yang diizinkan!"), false);
    }
  }
});

/* ==========================================
   ENDPOINT ROUTES: /api/posts
   ========================================== */

// Ambil semua postingan
router.get("/", postController.getAllPosts);

// Ambil postingan berdasarkan ID
router.get("/:id", postController.getPostById);

// Buat postingan baru (dengan upload gambar)
// Tambahkan penanganan error multer secara inline agar pesan error tersampaikan ke frontend
router.post("/", (req, res, next) => {
  upload.single("gambar")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Multer Error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, postController.createPost);

// Update postingan (dengan upload gambar opsional)
router.put("/:id", (req, res, next) => {
  upload.single("gambar")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Multer Error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, postController.updatePost);

// Hapus postingan
router.delete("/:id", postController.deletePost);

module.exports = router;