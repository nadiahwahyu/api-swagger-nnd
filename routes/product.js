const express = require("express");
const router = express.Router();
const pool = require("../db"); // pastikan file db.js sudah ada
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Pastikan folder uploads ada
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}


// ==============================
// CONFIGURASI MULTER
// ==============================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);

    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file JPG, JPEG, PNG yang diperbolehkan"));
    }
  }
});


// ==============================
// GET ALL PRODUCTS
// ==============================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");

    const data = result.rows.map(product => ({
      ...product,
      image_url: product.image 
        ? `${req.protocol}://${req.get("host")}/uploads/${product.image}`
        : null
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// GET PRODUCT BY ID
// ==============================
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const product = result.rows[0];

    product.image_url = product.image
      ? `${req.protocol}://${req.get("host")}/uploads/${product.image}`
      : null;

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// CREATE PRODUCT
// ==============================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name dan price wajib diisi" });
    }

    const image = req.file ? req.file.filename : null;

    const result = await pool.query(
      "INSERT INTO products (name, price, image) VALUES ($1, $2, $3) RETURNING *",
      [name, price, image]
    );

    res.status(201).json({
      message: "Produk berhasil ditambahkan",
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// UPDATE PRODUCT
// ==============================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, price } = req.body;
    const id = req.params.id;

    const oldData = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );

    if (oldData.rows.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    let image = oldData.rows[0].image;

    if (req.file) {
      if (image) {
        const oldPath = `uploads/${image}`;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      image = req.file.filename;
    }

    const result = await pool.query(
      "UPDATE products SET name=$1, price=$2, image=$3 WHERE id=$4 RETURNING *",
      [name, price, image, id]
    );

    res.json({
      message: "Produk berhasil diupdate",
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// DELETE PRODUCT
// ==============================
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const image = result.rows[0].image;

    if (image) {
      const filePath = `uploads/${image}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query("DELETE FROM products WHERE id = $1", [id]);

    res.json({ message: "Produk berhasil dihapus" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
