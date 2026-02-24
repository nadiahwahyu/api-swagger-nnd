const authenticateToken = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* =============================
   MULTER SETUP
============================= */

const uploadPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/* =============================
   GET ALL POSTS
============================= */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Ambil semua post (pagination)
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `
      SELECT posts.*, categories.name AS category_name
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      ORDER BY posts.id DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    res.json({
      success: true,
      page,
      limit,
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =============================
   SEARCH POST
============================= */

/**
 * @swagger
 * /api/posts/search/{keyword}:
 *   get:
 *     summary: Cari post berdasarkan judul
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hasil pencarian
 */
router.get("/search/:keyword", async (req, res) => {
  try {
    const keyword = `%${req.params.keyword}%`;

    const result = await db.query(
      `
      SELECT posts.*, categories.name AS category_name
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      WHERE posts.judul ILIKE $1
      ORDER BY posts.id DESC
      `,
      [keyword]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =============================
   CREATE POST
============================= */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Tambah post baru
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               judul:
 *                 type: string
 *               isi:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post berhasil dibuat
 */
router.post(
  "/",
  // authenticateToken, // aktifkan jika ingin proteksi JWT
  upload.single("image"),
  async (req, res) => {
    try {
      const { judul, isi, category_id } = req.body;
      const image = req.file ? req.file.filename : null;

      const categoryCheck = await db.query(
        "SELECT * FROM categories WHERE id=$1",
        [category_id]
      );

      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Category tidak ditemukan",
        });
      }

      const result = await db.query(
        `
        INSERT INTO posts (judul, isi, image, category_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [judul, isi, image, category_id]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* =============================
   UPDATE POST
============================= */

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               judul:
 *                 type: string
 *               isi:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post berhasil diupdate
 */
router.put(
  "/:id",
  // authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { judul, isi, category_id } = req.body;
      const image = req.file ? req.file.filename : null;

      const result = await db.query(
        `
        UPDATE posts
        SET judul=$1,
            isi=$2,
            image=COALESCE($3, image),
            category_id=$4
        WHERE id=$5
        RETURNING *
        `,
        [judul, isi, image, category_id, req.params.id]
      );

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* =============================
   DELETE POST
============================= */

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Hapus post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post berhasil dihapus
 */
router.delete(
  "/:id",
  // authenticateToken,
  async (req, res) => {
    try {
      await db.query("DELETE FROM posts WHERE id=$1", [
        req.params.id,
      ]);

      res.json({
        success: true,
        message: "Post berhasil dihapus",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;