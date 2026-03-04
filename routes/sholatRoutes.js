// Lokasi: routes/sholatRoutes.js

const express = require('express');
const router = express.Router();
const sholatController = require('../controllers/sholatController');
const upload = require('../middleware/upload'); // File konfigurasi multer kamu

// URUTAN SANGAT PENTING:
// 1. Rute ('/')
// 2. Middleware Multer (upload.single) -> Ini yang bertugas membedah data Form
// 3. Controller
router.post('/', upload.single('gambar'), sholatController.createSholat);

module.exports = router;