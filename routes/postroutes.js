
const express = require("express")
const router = express.Router()
const Post = require("../models/post")

// Create Post - Updated with better handling
router.post("/create", async (req, res) => {
  try {
    const { caption, imageUrl, videoUrl, userId, category, tags } = req.body

    // Validation
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" })
    }

    if (!caption && !imageUrl && !videoUrl) {
      return res.status(400).json({ success: false, message: "At least caption, image, or video is required" })
    }

    const newPost = new Post({
      caption,
      imageUrl,
      videoUrl,
      userId,
      category: category || "general",
      tags: tags || [],
    })

    await newPost.save()

    // Populate user data in response
    const populatedPost = await Post.findById(newPost._id).populate("userId", "name email")

    res.status(201).json({ success: true, post: populatedPost })
  } catch (err) {
    console.error("Post creation error:", err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Get All Posts - Updated
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name email")
      .populate("comments.userId", "name email")
      .sort({ createdAt: -1 }) // Latest posts first

    res.status(200).json({ success: true, posts })
  } catch (err) {
    console.error("Fetch posts error:", err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Like a Post
router.put("/like/:id", async (req, res) => {
  const { userId } = req.body
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ success: false, message: "Post not found" })

    post.likes += 1
    await post.save()

    res.json({ success: true, post })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Comment on a Post
router.put("/comment/:id", async (req, res) => {
  const { userId, text } = req.body
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ success: false, message: "Post not found" })

    post.comments.push({ userId, text })
    await post.save()

    res.json({ success: true, post })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// routes/posts.js ya jo bhi routes file hai

router.put("/view/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.views = (post.views || 0) + 1;
    await post.save();

    res.status(200).json({ message: "View count incremented", views: post.views });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ Get Posts by Logged-in User
router.get("/user/:id", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.id }).populate("userId", "email")
    res.status(200).json({ success: true, posts })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})


// routes/posts.js (Backend)

// ✅ DELETE POST ENDPOINT
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.query; // Get userId from query parameter

    console.log('🗑️ Delete request:', { postId, userId });

    // Validate inputs
    if (!postId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and User ID are required'
      });
    }

    // Find the post
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if the user owns this post
    const postUserId = post.userId.toString();
    if (postUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);

    console.log('✅ Post deleted successfully:', postId);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
});



module.exports = router
