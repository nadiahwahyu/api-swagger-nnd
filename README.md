# Latihan API Fullstack - Node.js, PostgreSQL & MinIO

Proyek ini adalah API sederhana untuk manajemen postingan blog dengan fitur kategori, menggunakan **PostgreSQL** sebagai database dan **MinIO** sebagai Object Storage untuk menyimpan gambar. Dokumentasi API disediakan menggunakan **Swagger UI**.

## 🚀 Fitur
- **Post Management**: Create, Read, Update, Delete (CRUD).
- **Category Management**: Integrasi relasi post dengan kategori.
- **Image Upload**: Upload gambar langsung ke MinIO Object Storage.
- **Auto-Public Bucket**: Otomatis mengatur bucket MinIO menjadi Public Read-Only.
- **API Documentation**: Terintegrasi dengan Swagger UI.

## 🛠️ Prasyarat
Sebelum menjalankan proyek, pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [MinIO Server](https://min.io/)

## 📂 Struktur Folder
```text
.
├── config/             # Konfigurasi Database & MinIO
├── controllers/        # Logika Bisnis (CRUD)
├── routes/             # Definisi Endpoint API
├── .env                # Variabel Lingkungan (Secret Keys)
├── .gitignore          # File yang diabaikan Git
├── server.js           # Entry Point Aplikasi
└── package.json        # Dependensi Node.js