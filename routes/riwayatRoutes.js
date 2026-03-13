const express = require("express");
const router = express.Router();
const riwayatController = require("../controllers/riwayatController");

// Ambil semua data riwayat (GET /api/riwayat/all)
router.get("/all", riwayatController.getAllRiwayat);

// Simpan atau update riwayat (POST /api/riwayat/update)
router.post("/update", riwayatController.updateRiwayat);

module.exports = router;