const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  caption: String,
  imageUrl: String,
  videoUrl: String,
  category: String,
  tags: [String],
 likes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: 'User'
  },
   views: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);
