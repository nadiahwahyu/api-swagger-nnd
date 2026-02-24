let posts = [];
let categories = []; // akan sinkron manual saat runtime

// GET ALL POSTS
exports.getAllPosts = (req, res) => {
  const result = posts.map(post => {
    const category = categories.find(c => c.id === post.category_id);
    return {
      ...post,
      category_name: category ? category.name : null
    };
  });

  res.status(200).json({
    success: true,
    data: result,
  });
};

// CREATE POST
exports.createPost = (req, res) => {
  const { title, content, category_id } = req.body;

  const categoryExists = categories.find(c => c.id == category_id);

  if (!categoryExists) {
    return res.status(400).json({
      success: false,
      message: "Category tidak ditemukan",
    });
  }

  const newPost = {
    id: Date.now(),
    title,
    content,
    category_id,
    userId: 1, // sementara hardcode supaya tidak error auth
  };

  posts.push(newPost);

  res.status(201).json({
    success: true,
    message: "Post berhasil dibuat",
    data: newPost,
  });
};

// UPDATE POST
exports.updatePost = (req, res) => {
  const { id } = req.params;
  const { title, content, category_id } = req.body;

  const post = posts.find(p => p.id == id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post tidak ditemukan",
    });
  }

  if (category_id) {
    const categoryExists = categories.find(c => c.id == category_id);

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category tidak ditemukan",
      });
    }

    post.category_id = category_id;
  }

  post.title = title || post.title;
  post.content = content || post.content;

  res.status(200).json({
    success: true,
    message: "Post berhasil diupdate",
    data: post,
  });
};

// DELETE POST
exports.deletePost = (req, res) => {
  const { id } = req.params;

  posts = posts.filter(post => post.id != id);

  res.status(200).json({
    success: true,
    message: "Post berhasil dihapus",
  });
};