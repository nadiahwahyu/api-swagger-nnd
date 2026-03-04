const Minio = require('minio');
require('dotenv').config();

// 1. Inisialisasi Client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1', 
  port: Number(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true', 
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const bucketName = process.env.MINIO_BUCKET || 'postbucket';

/**
 * Fungsi inisialisasi untuk memastikan bucket tersedia dan publik
 */
const initMinio = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ Bucket "${bucketName}" berhasil dibuat.`);
    } else {
      console.log(`ℹ️ Bucket "${bucketName}" sudah tersedia.`);
    }

    // Set Policy agar file bisa diakses via URL oleh browser
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    console.log(`🔓 Policy Public Read-Only aktif untuk: ${bucketName}`);
    
  } catch (err) {
    console.error("❌ MinIO Initialization Error:", err.message);
    if (err.code === 'ECONNREFUSED') {
       console.error("💡 Tips: Pastikan aplikasi MinIO (Server) sudah menyala!");
    }
  }
};

/**
 * Helper untuk mendapatkan URL publik file
 */
const getPublicUrl = (fileName) => {
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const host = process.env.MINIO_ENDPOINT || '127.0.0.1';
  const port = process.env.MINIO_PORT || 9000;
  return `${protocol}://${host}:${port}/${bucketName}/${fileName}`;
};

// 2. EXPORT SEMUANYA TERMASUK initMinio
module.exports = { 
  minioClient, 
  bucketName, 
  initMinio, // Ini yang tadi hilang!
  getPublicUrl 
};