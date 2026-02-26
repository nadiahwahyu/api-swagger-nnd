const Minio = require('minio');
require('dotenv').config();

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const bucketName = process.env.MINIO_BUCKET || 'postbucket';

/* ============================================================
   FUNGSI UNTUK SET BUCKET MENJADI PUBLIC (READ ONLY)
============================================================ */
const setBucketPublic = async () => {
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetBucketLocation", "s3:ListBucket"],
        Resource: [`arn:aws:s3:::${bucketName}`],
      },
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
      },
    ],
  };

  try {
    // Cek apakah bucket sudah ada
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ Bucket "${bucketName}" berhasil dibuat.`);
    }

    // Set policy ke public
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    console.log(`🔓 Bucket "${bucketName}" sekarang sudah PUBLIC (ReadOnly).`);
  } catch (err) {
    console.error("❌ Gagal mengatur policy MinIO:", err.message);
  }
};

// Jalankan fungsi saat file ini di-load
setBucketPublic();

module.exports = { minioClient, bucketName };