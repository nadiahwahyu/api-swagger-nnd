require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

// IMPORT ROUTES
const postRoutes = require("./routes/postRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

/* =============================
   MIDDLEWARE
============================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =============================
   TEST ROUTE
============================= */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Running Successfully 🚀",
  });
});

/* =============================
   SWAGGER SETUP
============================= */
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Post API",
      version: "1.0.0",
      description:
        "API Dokumentasi untuk Posts, Categories dan Authentication",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],

    // 🔥 JWT CONFIGURATION (INI YANG BIKIN AUTHORIZE MUNCUL)
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    // 🔥 SEMUA ENDPOINT DEFAULT PAKAI TOKEN
    security: [
      {
        bearerAuth: [],
      },
    ],

    // 🔥 URUTAN TAG (CATEGORIES PALING BAWAH)
    tags: [
      {
        name: "Authentication",
        description: "Login dan Register User",
      },
      {
        name: "Posts",
        description: "Manajemen Data Posts",
      },
      {
        name: "Categories",
        description: "Manajemen Data Categories",
      },
    ],
  },

  apis: [path.join(__dirname, "routes", "*.js")],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  })
);

/* =============================
   ROUTES
============================= */
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);

/* =============================
   404 HANDLER
============================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route tidak ditemukan",
  });
});

/* =============================
   ERROR HANDLER
============================= */
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Terjadi kesalahan server",
  });
});

/* =============================
   SERVER
============================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
  console.log(`📄 Swagger Docs di http://localhost:${PORT}/api-docs`);
});