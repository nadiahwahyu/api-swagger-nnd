const express = require("express");
const router = express.Router();
const multer = require("multer");
const postController = require("../controllers/postController");

const upload = multer({
  storage: multer.memoryStorage(),
});

// Endpoint Routes
router.get("/", postController.getAllPosts);
router.get("/:id", postController.getPostById);
router.post("/", upload.single("gambar"), postController.createPost);
router.put("/:id", upload.single("gambar"), postController.updatePost);
router.delete("/:id", postController.deletePost);

module.exports = router;