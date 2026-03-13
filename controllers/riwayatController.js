const db = require("../config/db"); 

/**
 * MENGAMBIL SEMUA RIWAYAT (DENGAN PAGINATION & FILTER)
 */
exports.getAllRiwayat = async (req, res) => {
  try {
    const { status, page = 1, limit = 5 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT *, 
      to_char(created_at, 'DD FMMonth YYYY, HH24:MI') as tanggal
      FROM riwayat_belajar`;
      
    let countQuery = "SELECT COUNT(*) as count FROM riwayat_belajar";
    let params = [];

    // Filter Status: Menggunakan ILIKE agar tidak sensitif huruf besar/kecil
    if (status && status !== "Semua") {
      query += " WHERE status ILIKE $1";
      countQuery += " WHERE status ILIKE $1";
      params.push(status);
    }

    // Sorting & Pagination: Memastikan urutan parameter $ tetap benar
    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;

    query += ` ORDER BY created_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
    
    const queryParams = [...params, limitNum, offset];

    const [result, totalDataResult] = await Promise.all([
      db.query(query, queryParams),
      db.query(countQuery, params)
    ]);
    
    const totalCount = parseInt(totalDataResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        totalData: totalCount,
        totalPages: totalPages,
        currentPage: pageNum,
        limit: limitNum
      },
    });
  } catch (error) {
    console.error("Error getAllRiwayat:", error);
    res.status(500).json({ 
      success: false, 
      message: "Gagal mengambil data riwayat",
      error: error.message 
    });
  }
};

/**
 * MENYIMPAN / UPDATE RIWAYAT (UPSERT LOGIC)
 * Tetap sama karena sudah menggunakan ON CONFLICT yang efisien
 */
exports.updateRiwayat = async (req, res) => {
  try {
    const { user_name, materi_nama, status, progress } = req.body;

    if (!user_name || !materi_nama) {
      return res.status(400).json({ 
        success: false, 
        message: "user_name dan materi_nama wajib diisi" 
      });
    }

    const upsertQuery = `
      INSERT INTO riwayat_belajar (user_name, materi_nama, status, progress, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_name, materi_nama) 
      DO UPDATE SET 
        status = EXCLUDED.status,
        progress = EXCLUDED.progress,
        created_at = NOW()
      RETURNING *;
    `;

    const result = await db.query(upsertQuery, [
      user_name, 
      materi_nama, 
      status || "Selesai", 
      progress || "100%"
    ]);

    res.status(200).json({ 
      success: true, 
      message: "Riwayat belajar berhasil diperbarui",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error updateRiwayat:", error);
    res.status(500).json({ 
      success: false, 
      message: "Gagal memperbarui riwayat di database",
      error: error.message 
    });
  }
};