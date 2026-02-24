const categoryData = require("../data/categoryData");

/* ===============================
   GET ALL
================================ */
exports.getAllCategories = (req, res) => {
  try {
    const categories = categoryData.getAll();

    return res.status(200).json({
      success: true,
      total: categories.length,
      data: categories,
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
exports.getCategoryById = (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID harus berupa angka",
      });
    }

    const category = categoryData.getById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
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
exports.createCategory = (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nama category wajib diisi",
      });
    }

    const trimmedName = name.trim();

    // Cek duplicate
    const existing = categoryData
      .getAll()
      .find((c) => c.name.toLowerCase() === trimmedName.toLowerCase());

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category sudah ada",
      });
    }

    const newCategory = categoryData.create(trimmedName);

    return res.status(201).json({
      success: true,
      message: "Category berhasil dibuat",
      data: newCategory,
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
exports.updateCategory = (req, res) => {
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

    // Cek duplicate selain dirinya sendiri
    const duplicate = categoryData
      .getAll()
      .find(
        (c) =>
          c.name.toLowerCase() === trimmedName.toLowerCase() &&
          c.id !== id
      );

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Nama category sudah digunakan",
      });
    }

    const updated = categoryData.update(id, trimmedName);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Category tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category berhasil diupdate",
      data: updated,
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
exports.deleteCategory = (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID harus berupa angka",
      });
    }

    const deleted = categoryData.remove(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Category tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category berhasil dihapus",
      data: deleted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus category",
      error: error.message,
    });
  }
};