const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API untuk manajemen kategori
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Ambil semua category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data category
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Tambah category baru
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Teknologi
 *               description:
 *                 type: string
 *                 example: Kategori seputar teknologi
 *     responses:
 *       201:
 *         description: Category berhasil dibuat
 *       400:
 *         description: Data tidak valid
 */
router.post("/", categoryController.createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Ambil category berdasarkan ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID category
 *     responses:
 *       200:
 *         description: Berhasil mengambil category
 *       404:
 *         description: Category tidak ditemukan
 */
router.get("/:id", categoryController.getCategoryById);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Update Teknologi
 *               description:
 *                 type: string
 *                 example: Update deskripsi kategori
 *     responses:
 *       200:
 *         description: Category berhasil diupdate
 */
router.put("/:id", categoryController.updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Hapus category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category berhasil dihapus
 */
router.delete("/:id", categoryController.deleteCategory);

router.get("/", categoryController.getAllCategories);

module.exports = router;