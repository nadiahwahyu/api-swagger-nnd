// 1. WAJIB PALING ATAS
require("dotenv").config(); 

const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const pool = require("./config/db"); 
const { minioClient, bucketName } = require("./config/minioClient");

// Import Routes
const postRoutes = require("./routes/postRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const riwayatRoutes = require("./routes/riwayatRoutes"); 

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE UTAMA
// ==========================================
app.use(cors({
    origin: true, 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Cek Koneksi Database
pool.query('SELECT NOW()')
  .then(() => console.log("✅ Database PostgreSQL: Terkoneksi."))
  .catch(err => console.error("❌ Database PostgreSQL Error:", err.message));

// ==========================================
// KONFIGURASI OTOMATIS MINIO (PUBLIC ACCESS)
// ==========================================
const initMinio = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, "us-east-1");
      console.log(`✅ MinIO: Bucket "${bucketName}" berhasil dibuat.`);
    }

    // POLICY: Mengizinkan Browser membaca gambar tanpa Token (Public Read-Only)
    // Ini krusial agar gambar muncul di Dashboard Frontend
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
    console.log("✅ MinIO: Bucket Ready & Public Access Enabled");
  } catch (err) {
    console.error("❌ MinIO Error:", err.message);
  }
};
initMinio();

/* ============================================================
    SWAGGER CONFIGURATION (FULL PATHS)
============================================================ */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { 
      title: 'Latihan API Fullstack E-Muslim', 
      version: '1.0.0',
      description: 'Dokumentasi API Terpusat untuk Manajemen Konten & Belajar'
    },
    servers: [{ url: `http://localhost:${PORT}` }], 
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    paths: {
      // --- AUTH ---
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register User Baru",
          requestBody: {
            content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" }, name: { type: "string" } } } } }
          },
          responses: { 201: { description: "Berhasil" } }
        }
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login User",
          requestBody: {
            content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } } } }
          },
          responses: { 200: { description: "Login Berhasil" } }
        }
      },

      // --- CATEGORIES ---
      "/api/categories": {
        get: { tags: ["Categories"], summary: "Ambil semua kategori", responses: { 200: { description: "Berhasil" } } },
        post: {
          tags: ["Categories"],
          summary: "Tambah kategori baru",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } } }
          },
          responses: { 201: { description: "Berhasil" } }
        }
      },
      "/api/categories/{id}": {
        get: {
          tags: ["Categories"],
          summary: "Ambil kategori per ID",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Berhasil" } }
        },
        put: {
          tags: ["Categories"],
          summary: "Update kategori",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
          requestBody: {
            content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } } }
          },
          responses: { 200: { description: "Berhasil" } }
        },
        delete: {
          tags: ["Categories"],
          summary: "Hapus kategori",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Berhasil" } }
        }
      },

      // --- POSTS ---
      "/api/posts": {
        get: { tags: ["Posts"], summary: "Ambil semua posts", responses: { 200: { description: "Berhasil" } } },
        post: {
          tags: ["Posts"],
          summary: "Buat post baru",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    judul: { type: "string" },
                    isi: { type: "string" },
                    category_id: { type: "integer" },
                    gambar: { type: "string", format: "binary" }
                  }
                }
              }
            }
          },
          responses: { 201: { description: "Berhasil" } }
        }
      },
      "/api/posts/{id}": {
        get: {
          tags: ["Posts"],
          summary: "Ambil detail post",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Berhasil" } }
        },
        put: {
          tags: ["Posts"],
          summary: "Update post",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    judul: { type: "string" },
                    isi: { type: "string" },
                    category_id: { type: "integer" },
                    gambar: { type: "string", format: "binary" }
                  }
                }
              }
            }
          },
          responses: { 200: { description: "Berhasil" } }
        },
        delete: {
          tags: ["Posts"],
          summary: "Hapus post",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Berhasil" } }
        }
      },

      // --- RIWAYAT ---
      "/api/riwayat/all": {
        get: {
          tags: ["Riwayat"],
          summary: "Ambil semua riwayat belajar",
          parameters: [
            { in: "query", name: "status", schema: { type: "string" } },
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 5 } }
          ],
          responses: { 200: { description: "Berhasil" } }
        }
      },
      "/api/riwayat/update": {
        post: {
          tags: ["Riwayat"],
          summary: "Simpan/Update riwayat belajar",
          requestBody: {
            content: { "application/json": { schema: { type: "object", properties: { user_name: { type: "string" }, materi_nama: { type: "string" }, status: { type: "string" } } } } }
          },
          responses: { 200: { description: "Berhasil" } }
        }
      }
    }
  },
  apis: [], 
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ROUTE BINDING
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/riwayat", riwayatRoutes); 

app.get("/", (req, res) => res.json({ status: "Online", message: "API Running" }));

app.listen(PORT, () => {
  console.log(`🚀 Server ON: http://localhost:${PORT}`);
  console.log(`📄 Swagger: http://localhost:${PORT}/api-docs`);
});