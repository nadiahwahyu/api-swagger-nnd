const db = require("../config/db");
const { minioClient, bucketName } = require("../config/minioClient");
const path = require("path");

/* =============================
   HELPER: GENERATE IMAGE URL
   Memastikan URL sesuai dengan 
   struktur MinIO port 9000
============================= */
const generateImageUrl = (imageName) => {
  if (!imageName) return null;
  
  // Ambil dari env atau default ke localhost:9000
  const host = process.env.MINIO_ENDPOINT || "localhost";
  const port = process.env.MINIO_PORT || 9000;
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  
  // Format: http://localhost:9000/postbucket/namafile.webp
  return `${protocol}://${host}:${port}/${bucketName}/${imageName}`;
};

/* =============================
   GET ALL POSTS
============================= */
exports.getAllPosts = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT posts.*, categories.nama_category AS category_name
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      ORDER BY posts.id DESC
    `);

    const data = result.rows.map(post => ({
      ...post,
      image_url: generateImageUrl(post.image),
    }));

    res.status(200).json({ success: true, data });
  } catch (err) {
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
      SELECT posts.*, categories.nama_category AS category_name
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      WHERE posts.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Post tidak ditemukan" });
    }

    const post = {
      ...result.rows[0],
      image_url: generateImageUrl(result.rows[0].image),
    };

    res.status(200).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =============================
   CREATE POST (UPLOAD FIX)
============================= */
exports.createPost = async (req, res) => {
  try {
    const { judul, isi, category_id } = req.body;

    if (!judul || !isi || !category_id) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
    }

    let imageName = null;

    // Logic Upload ke MinIO
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      imageName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

      // Eksekusi upload buffer ke MinIO
      await minioClient.putObject(
        bucketName,
        imageName,
        req.file.buffer,
        req.file.size,
        { "Content-Type": req.file.mimetype }
      );
      console.log(`✅ File ${imageName} berhasil masuk ke MinIO`);
    }

    // Simpan ke Database (PostgreSQL format)
    const result = await db.query(`
      INSERT INTO posts (judul, isi, image, category_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [judul, isi, imageName, category_id]);

    res.status(201).json({
      success: true,
      message: "Post berhasil dibuat",
      data: { 
        ...result.rows[0], 
        image_url: generateImageUrl(result.rows[0].image) 
      },
    });
  } catch (err) {
    console.error("❌ Error Create Post:", err.message);
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

    let imageName = existingPost.rows[0].image;

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

      // Hapus file lama dari MinIO agar tidak nyampah
      if (existingPost.rows[0].image) {
        try {
          await minioClient.removeObject(bucketName, existingPost.rows[0].image);
        } catch (e) {
          console.warn("File lama tidak ditemukan di storage, skip.");
        }
      }
      imageName = newImageName;
    }

    const result = await db.query(`
      UPDATE posts
      SET judul = COALESCE($1, judul),
          isi = COALESCE($2, isi),
          image = $3,
          category_id = COALESCE($4, category_id)
      WHERE id = $5
      RETURNING *
    `, [judul, isi, imageName, category_id, id]);

    res.status(200).json({
      success: true,
      message: "Post berhasil diupdate",
      data: { 
        ...result.rows[0], 
        image_url: generateImageUrl(result.rows[0].image) 
      },
    });
  } catch (err) {
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

    const imageName = postResult.rows[0].image;

    // Hapus file dari MinIO
    if (imageName) {
      try {
        await minioClient.removeObject(bucketName, imageName);
      } catch (e) {
        console.warn("Gagal hapus file di storage, lanjut hapus DB.");
      }
    }

    await db.query("DELETE FROM posts WHERE id = $1", [id]);
    res.status(200).json({ success: true, message: "Post berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};