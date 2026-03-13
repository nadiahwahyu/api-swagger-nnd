const express = require('express');
const router = express.Router();
const { sendWA } = require('../controllers/notifController');

// Endpoint: POST /api/send-wa
router.post('/send-wa', sendWA);

module.exports = router;