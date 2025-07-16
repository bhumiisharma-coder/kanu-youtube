


// const mongoose = require("mongoose")

// const userSchema = new mongoose.Schema(
//   {
//     name: String,
//     email: { type: String, unique: true },
//     password: String,
//     profilePicture: { type: String, default: "" },
//     fcmToken: String,
//     groups: [String], // Keep as String array for compatibility with your existing data
//   },
//   {
//     timestamps: true,
//   },
// )

// module.exports = mongoose.models.User || mongoose.model("User", userSchema)











const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    profilePicture: { type: String, default: "" },
    fcmToken: String,
    groups: [String], // Keep as String array for compatibility with your existing data

    // ⭐ FOLLOW FUNCTIONALITY KE LIYE NAYI FIELDS
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },

    // ⭐ OPTIONAL: EXTRA FIELDS FOR BETTER USER PROFILE
    bio: {
      type: String,
      default: "",
      maxlength: 150,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
     savedVideos: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post' 
  }],
  },
  {
    timestamps: true,
  },
)

// ⭐ INDEXES FOR BETTER PERFORMANCE
userSchema.index({ email: 1 })
userSchema.index({ followers: 1 })
userSchema.index({ following: 1 })

// ⭐ METHODS FOR FOLLOW FUNCTIONALITY
userSchema.methods.isFollowing = function (userId) {
  return this.following.includes(userId)
}

userSchema.methods.isFollowedBy = function (userId) {
  return this.followers.includes(userId)
}

module.exports = mongoose.models.User || mongoose.model("User", userSchema)
