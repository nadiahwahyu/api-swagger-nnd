const db = require("../config/db");
const { minioClient, bucketName } = require("../config/minioClient");
const path = require("path");

/* ============================================================
    HELPER: Membuat URL Gambar yang bisa diakses Browser
============================================================ */
const generateImageUrl = (imageName) => {
  if (!imageName) return null;

  let host = process.env.MINIO_ENDPOINT || "127.0.0.1";
  
  // Jika menggunakan Docker atau localhost, paksa ke IP 127.0.0.1 
  // agar browser di sisi client bisa menarik gambar dengan benar.
  if (host === 'minio' || host === 'localhost') {
    host = "127.0.0.1";
  }

  const port = process.env.MINIO_PORT || 9000;
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const bucket = bucketName || process.env.MINIO_BUCKET;

  return `${protocol}://${host}:${port}/${bucket}/${imageName}`;
};

/* =============================
    GET ALL POSTS
============================= */
exports.getAllPosts = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT posts.*, categories.name AS category_name
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      ORDER BY posts.id DESC
    `);

    const data = result.rows.map(post => ({
      ...post,
      // Pastikan menggunakan 'post.gambar' sesuai kolom DB Anda
      image_url: generateImageUrl(post.gambar),
    }));

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("❌ ERROR DETIL (getAllPosts):", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
    GET POST BY ID
============================= */
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT posts.*, categories.name AS category_name
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      WHERE posts.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Post tidak ditemukan" });
    }

    const post = {
      ...result.rows[0],
      image_url: generateImageUrl(result.rows[0].gambar),
    };

    res.status(200).json({ success: true, data: post });
  } catch (err) {
    console.error("❌ ERROR DETIL (getPostById):", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
    CREATE POST
============================= */
exports.createPost = async (req, res) => {
  try {
    const { judul, isi, category_id } = req.body;

    if (!judul || !isi || !category_id) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
    }

    let imageName = null;

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      // Format nama file unik: timestamp-random.ext
      imageName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

      await minioClient.putObject(
        bucketName,
        imageName,
        req.file.buffer,
        req.file.size,
        { "Content-Type": req.file.mimetype }
      );
      console.log(`✅ File ${imageName} berhasil diunggah ke MinIO`);
    }

    // Simpan NAMA FILE ke kolom 'gambar' di database
    const result = await db.query(`
      INSERT INTO posts (judul, isi, gambar, category_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [judul, isi, imageName, category_id]);

    res.status(201).json({
      success: true,
      message: "Post berhasil dibuat",
      data: { 
        ...result.rows[0], 
        image_url: generateImageUrl(result.rows[0].gambar) 
      },
    });
  } catch (err) {
    console.error("❌ ERROR DETIL (createPost):", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
    UPDATE POST
============================= */
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, isi, category_id } = req.body;

    const existingPost = await db.query("SELECT * FROM posts WHERE id = $1", [id]);
    if (existingPost.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Post tidak ditemukan" });
    }

    let imageName = existingPost.rows[0].gambar;

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newImageName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

      // Upload file baru ke MinIO
      await minioClient.putObject(
        bucketName,
        newImageName,
        req.file.buffer,
        req.file.size,
        { "Content-Type": req.file.mimetype }
      );

      // Hapus file lama di MinIO jika ada
      if (existingPost.rows[0].gambar) {
        try {
          await minioClient.removeObject(bucketName, existingPost.rows[0].gambar);
        } catch (e) {
          console.warn("⚠️ File lama tidak ditemukan di MinIO, lanjut update...");
        }
      }
      imageName = newImageName;
    }

    const result = await db.query(`
      UPDATE posts
      SET judul = COALESCE($1, judul),
          isi = COALESCE($2, isi),
          gambar = $3,
          category_id = COALESCE($4, category_id)
      WHERE id = $5
      RETURNING *
    `, [judul, isi, imageName, category_id, id]);

    res.status(200).json({
      success: true,
      message: "Post berhasil diupdate",
      data: { 
        ...result.rows[0], 
        image_url: generateImageUrl(result.rows[0].gambar) 
      },
    });
  } catch (err) {
    console.error("❌ ERROR DETIL (updatePost):", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
    DELETE POST
============================= */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const postResult = await db.query("SELECT * FROM posts WHERE id = $1", [id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Post tidak ditemukan" });
    }

    const imageName = postResult.rows[0].gambar;

    // Hapus gambar di MinIO
    if (imageName) {
      try {
        await minioClient.removeObject(bucketName, imageName);
      } catch (e) {
        console.warn("⚠️ Gagal menghapus file di MinIO (mungkin sudah terhapus)");
      }
    }

    await db.query("DELETE FROM posts WHERE id = $1", [id]);
    res.status(200).json({ success: true, message: "Post berhasil dihapus" });
  } catch (err) {
    console.error("❌ ERROR DETIL (deletePost):", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};