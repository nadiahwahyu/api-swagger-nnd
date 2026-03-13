const axios = require('axios');

const sendWhatsAppAdzan = async (req, res) => {
  const { phone, message } = req.body;
  try {
    await axios.post('https://api.fonnte.com/send', {
      target: phone,
      message: message,
      countryCode: '62',
    }, {
      headers: {
        'Authorization': 'API_TOKEN_FONNTE_ANDA' // Masukkan token dari Fonnte
      }
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengirim pesan" });
  }
};