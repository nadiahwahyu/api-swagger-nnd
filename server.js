require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

// Pastikan file ini mengekspor { minioClient, bucketName }
const { minioClient, bucketName } = require("./config/minioClient");

// Import Routes
const postRoutes = require("./routes/postRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Koneksi MinIO (Perbaikan: memanggil fungsi inisialisasi dengan benar)
const ensureBucketExists = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, "us-east-1");
      console.log(`✅ Bucket "${bucketName}" siap.`);
    } else {
      console.log(`ℹ️ MinIO: Bucket "${bucketName}" sudah ada.`);
    }
  } catch (err) {
    console.error("⚠️ Cek MinIO: Pastikan server MinIO sudah jalan.");
    console.error("Detail Error:", err.message);
  }
};
// Menjalankan pengecekan bucket saat server start
ensureBucketExists();

/* ============================================================
    SWAGGER CONFIGURATION (FULL VERSION)
============================================================ */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { 
      title: 'Latihan API Fullstack', 
      version: '1.0.0' 
    },
    servers: [{ url: `http://localhost:${PORT}/api` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    paths: {
      // --- AUTH ---
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register User Baru",
          requestBody: {
            content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } } } }
          },
          responses: { 201: { description: "Berhasil" } }
        }
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login User",
          requestBody: {
            content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } } } }
          },
          responses: { 200: { description: "Berhasil" } }
        }
      },

      // --- POSTS ---
      "/posts": {
        get: {
          tags: ["Posts"],
          summary: "Ambil semua posts",
          responses: { 200: { description: "Berhasil" } }
        },
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
      "/posts/{id}": {
        get: {
          tags: ["Posts"],
          summary: "Ambil post per ID",
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

      // --- CATEGORIES ---
      "/categories": {
        get: {
          tags: ["Categories"],
          summary: "Ambil semua kategori",
          responses: { 200: { description: "Berhasil" } }
        },
        post: {
          tags: ["Categories"],
          summary: "Buat kategori baru",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    nama_category: { type: "string" }
                  }
                }
              }
            }
          },
          responses: { 201: { description: "Berhasil" } }
        }
      },
      "/categories/{id}": {
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
            content: { "application/json": { schema: { type: "object", properties: { nama_category: { type: "string" } } } } }
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
      }
    }
  },
  apis: [], 
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Bind Routes
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.json({ message: "API Running" }));

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route tidak ditemukan" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server ON: http://localhost:${PORT}`);
  console.log(`📄 Swagger: http://localhost:${PORT}/api-docs`);
});