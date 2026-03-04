const multer = require("multer");

// Simpan di memori sebagai buffer agar bisa langsung dikirim ke MinIO
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } // Batas 2MB
});

module.exports = upload;