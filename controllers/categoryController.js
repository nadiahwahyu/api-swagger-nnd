const db = require("../config/db");

/* ===============================
   GET ALL
================================ */
exports.getAllCategories = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name FROM categories ORDER BY id ASC"
    );

    return res.status(200).json({
      success: true,
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data category",
      error: error.message,
    });
  }
};

/* ===============================
   GET BY ID
================================ */
exports.getCategoryById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID harus berupa angka",
      });
    }

    const result = await db.query(
      "SELECT id, name FROM categories WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

/* ===============================
   CREATE
================================ */
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nama category wajib diisi",
      });
    }

    const trimmedName = name.trim();

    // cek duplicate (case-insensitive)
    const check = await db.query(
      "SELECT id FROM categories WHERE LOWER(name) = LOWER($1)",
      [trimmedName]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Category sudah ada",
      });
    }

    // insert tanpa id (id auto increment)
    const result = await db.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING id, name",
      [trimmedName]
    );

    return res.status(201).json({
      success: true,
      message: "Category berhasil dibuat",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal membuat category",
      error: error.message,
    });
  }
};

/* ===============================
   UPDATE
================================ */
exports.updateCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID harus berupa angka",
      });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nama category wajib diisi",
      });
    }

    const trimmedName = name.trim();

    // cek duplicate selain dirinya
    const duplicate = await db.query(
      "SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id != $2",
      [trimmedName, id]
    );

    if (duplicate.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Nama category sudah digunakan",
      });
    }

    const result = await db.query(
      "UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name",
      [trimmedName, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category berhasil diupdate",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal update category",
      error: error.message,
    });
  }
};

/* ===============================
   DELETE
================================ */
exports.deleteCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID harus berupa angka",
      });
    }

    const result = await db.query(
      "DELETE FROM categories WHERE id = $1 RETURNING id, name",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category berhasil dihapus",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus category",
      error: error.message,
    });
  }
};