require("dotenv").config();
const { Pool } = require("pg");

// Pastikan konfigurasi ini sesuai dengan isi file .env Anda
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // Tambahkan limit agar database tidak overload
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Gunakan query sederhana untuk mengetes koneksi tanpa menahan client
pool.query('SELECT NOW()')
  .then(() => console.log("✅ Database PostgreSQL Terhubung (Pool Ready)"))
  .catch((err) => {
    console.error("❌ DB Error Detail:", err.message);
    console.log("Periksa apakah PostgreSQL sudah menyala dan database sudah benar.");
  });

// Tangani error tak terduga pada client yang sedang idle
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;