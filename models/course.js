const mongoose = require("mongoose")

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    videoUrl: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    instructorName: { type: String },
    category: { type: String, default: "General" },
    price: { type: Number, default: 0 },
    duration: { type: String, default: "" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Create model if it doesn't exist, otherwise use existing model
const Course = mongoose.models.Course || mongoose.model("Course", courseSchema)

module.exports = Course