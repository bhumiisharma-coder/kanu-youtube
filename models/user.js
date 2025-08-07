


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











// const mongoose = require("mongoose")

// const userSchema = new mongoose.Schema(
//   {
//     name: String,
//     email: { type: String, unique: true },
//     password: String,
//     profilePicture: { type: String, default: "" },
//     fcmToken: String,
//     groups: [String], // Keep as String array for compatibility with your existing data

//     // ⭐ FOLLOW FUNCTIONALITY KE LIYE NAYI FIELDS
//     followers: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ],
//     following: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ],
//     followersCount: {
//       type: Number,
//       default: 0,
//     },
//     followingCount: {
//       type: Number,
//       default: 0,
//     },

//     // ⭐ OPTIONAL: EXTRA FIELDS FOR BETTER USER PROFILE
//     bio: {
//       type: String,
//       default: "",
//       maxlength: 150,
//     },
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//     isPrivate: {
//       type: Boolean,
//       default: false,
//     },
//      savedVideos: [{ 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Post' 
//   }],
//   },
//   {
//     timestamps: true,
//   },
// )

// // ⭐ INDEXES FOR BETTER PERFORMANCE
// userSchema.index({ email: 1 })
// userSchema.index({ followers: 1 })
// userSchema.index({ following: 1 })

// // ⭐ METHODS FOR FOLLOW FUNCTIONALITY
// userSchema.methods.isFollowing = function (userId) {
//   return this.following.includes(userId)
// }

// userSchema.methods.isFollowedBy = function (userId) {
//   return this.followers.includes(userId)
// }

// module.exports = mongoose.models.User || mongoose.model("User", userSchema)











// const mongoose = require("mongoose")
// const userSchema = new mongoose.Schema(
//   {
//     name: String,
//     email: { type: String, unique: true },
//     password: String,
//     profilePicture: { type: String, default: "" },
//     fcmToken: String,
//     groups: [String], // Keep as String array for compatibility with your existing data
//     // ⭐ FOLLOW FUNCTIONALITY KE LIYE NAYI FIELDS
//     followers: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ],
//     following: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ],
//     followersCount: {
//       type: Number,
//       default: 0,
//     },
//     followingCount: {
//       type: Number,
//       default: 0,
//     },
//     // ✅ NEW: Connections field for LinkedIn-like connections
//     connections: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ],
//     // ⭐ OPTIONAL: EXTRA FIELDS FOR BETTER USER PROFILE
//     bio: {
//       type: String,
//       default: "",
//       maxlength: 150,
//     },
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//     isPrivate: {
//       type: Boolean,
//       default: false,
//     },
//     savedVideos: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Post",
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   },
// )

// // ⭐ INDEXES FOR BETTER PERFORMANCE
// userSchema.index({ email: 1 })
// userSchema.index({ followers: 1 })
// userSchema.index({ following: 1 })

// // ⭐ METHODS FOR FOLLOW FUNCTIONALITY
// userSchema.methods.isFollowing = function (userId) {
//   return this.following.includes(userId)
// }
// userSchema.methods.isFollowedBy = function (userId) {
//   return this.followers.includes(userId)
// }

// module.exports = mongoose.models.User || mongoose.model("User", userSchema)



const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: { 
      type: String, 
      unique: true,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email"
      }
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false // Never return password in queries
    },
    profilePicture: { 
      type: String, 
      default: "",
      validate: {
        validator: function(v) {
          return v === "" || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
        },
        message: "Please enter a valid URL"
      }
    },
    fcmToken: {
      type: String,
      default: ""
    },
    savedCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      validate: {
        validator: function(v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: "Invalid course ID"
      }
    }],
    groups: [{
      type: String,
      trim: true
    }],
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function(v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: "Invalid user ID"
      }
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function(v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: "Invalid user ID"
      }
    }],
    followersCount: {
      type: Number,
      default: 0,
      min: 0
    },
    followingCount: {
      type: Number,
      default: 0,
      min: 0
    },
    connections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function(v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: "Invalid user ID"
      }
    }],
    bio: {
      type: String,
      default: "",
      maxlength: [150, "Bio cannot exceed 150 characters"],
      trim: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "deactivated"],
      default: "active"
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });
userSchema.index({ connections: 1 });
userSchema.index({ name: "text", email: "text" }); // Text index for search

// Virtual for full profile URL
userSchema.virtual('profileUrl').get(function() {
  return `/users/${this._id}`;
});

// Pre-save hook to update counters
userSchema.pre('save', function(next) {
  if (this.isModified('followers')) {
    this.followersCount = this.followers.length;
  }
  if (this.isModified('following')) {
    this.followingCount = this.following.length;
  }
  next();
});

// Methods for follow functionality
userSchema.methods = {
  isFollowing: function(userId) {
    return this.following.some(id => id.equals(userId));
  },
  isFollowedBy: function(userId) {
    return this.followers.some(id => id.equals(userId));
  },
  hasConnection: function(userId) {
    return this.connections.some(id => id.equals(userId));
  },
  toJSON: function() {
    const user = this.toObject();
    delete user.password;
    delete user.fcmToken;
    return user;
  }
};

// Static methods
userSchema.statics = {
  findByEmail: function(email) {
    return this.findOne({ email }).select('+password');
  },
  searchUsers: function(query) {
    return this.find({ $text: { $search: query } }).limit(10);
  }
};

// Middleware to cascade delete user references
userSchema.pre('remove', async function(next) {
  // Remove user references from other users' followers/following/connections
  await mongoose.model('User').updateMany(
    {
      $or: [
        { followers: this._id },
        { following: this._id },
        { connections: this._id }
      ]
    },
    {
      $pull: {
        followers: this._id,
        following: this._id,
        connections: this._id
      }
    }
  );
  next();
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);