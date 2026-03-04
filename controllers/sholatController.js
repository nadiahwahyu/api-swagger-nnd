// Lokasi: controllers/sholatController.js (atau file sejenis)

exports.createSholat = async (req, res) => {
    try {
        // Ambil data dari body. 
        // Pastikan variabelnya 'category' (bahasa Inggris) bukan 'kategori'
        const { nama, category, sumber } = req.body;

        // Inilah yang menyebabkan error 400 Bad Request jika 'category' kosong
        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Nama category wajib diisi" 
            });
        }

        // Lanjutkan proses simpan ke PostgreSQL...
        // const newSholat = await Sholat.create({ nama, category, sumber, ... });
        
        res.status(201).json({ success: true, data: "Berhasil" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};