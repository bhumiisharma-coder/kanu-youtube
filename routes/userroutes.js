// // const express = require("express");
// // const router = express.Router();
// // const User = require("../models/User"); // ✅ Aapka existing User model

// // // Get user profile by ID
// // router.get("/profile/:userId", async (req, res) => {
// //   try {
// //     const user = await User.findById(req.params.userId).select("-password");
// //     if (!user) {
// //       return res.status(404).json({ error: "User not found" });
// //     }
// //     res.json({ success: true, user });
// //   } catch (err) {
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });

// // // Update user profile
// // router.put("/profile/:userId", async (req, res) => {
// //   try {
// //     const { name, email } = req.body;
    
// //     // Check if email already exists (if changing email)
// //     const existingUser = await User.findOne({ 
// //       email, 
// //       _id: { $ne: req.params.userId } 
// //     });
    
// //     if (existingUser) {
// //       return res.status(400).json({ error: "Email already exists" });
// //     }

// //     const updatedUser = await User.findByIdAndUpdate(
// //       req.params.userId,
// //       { name, email },
// //       { new: true }
// //     ).select("-password");

// //     res.json({ success: true, user: updatedUser });
// //   } catch (err) {
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });

// // module.exports = router;






// const express = require("express");
// const router = express.Router();
// const User = require("../models/User");
// const bcrypt = require("bcrypt"); // npm install bcrypt

// // ✅ Existing routes...
// router.get("/profile/:userId", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.userId).select("-password");
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     res.json({ success: true, user });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// router.put("/profile/:userId", async (req, res) => {
//   try {
//     const { name, email } = req.body;
    
//     const existingUser = await User.findOne({ 
//       email, 
//       _id: { $ne: req.params.userId } 
//     });
    
//     if (existingUser) {
//       return res.status(400).json({ error: "Email already exists" });
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.userId,
//       { name, email },
//       { new: true }
//     ).select("-password");

//     res.json({ success: true, user: updatedUser });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ✅ NEW: Change Password
// router.put("/change-password/:userId", async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;
    
//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({ error: "Both passwords are required" });
//     }

//     if (newPassword.length < 6) {
//       return res.status(400).json({ error: "New password must be at least 6 characters" });
//     }

//     const user = await User.findById(req.params.userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Check current password
//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: "Current password is incorrect" });
//     }

//     // Hash new password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

//     // Update password
//     await User.findByIdAndUpdate(req.params.userId, { password: hashedPassword });

//     res.json({ success: true, message: "Password changed successfully" });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ✅ NEW: Update Profile Picture
// router.put("/profile-picture/:userId", async (req, res) => {
//   try {
//     const { profilePicture } = req.body;
    
//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.userId,
//       { profilePicture },
//       { new: true }
//     ).select("-password");

//     res.json({ success: true, user: updatedUser });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;

// const express = require("express")
// const router = express.Router()
// const User = require("../models/user")
// const Post = require("../models/post")
// const bcrypt = require("bcryptjs")
// const mongoose = require("mongoose")

// // ✅ Validation middleware for userId
// const validateUserId = (req, res, next) => {
//   const { userId } = req.params

//   console.log(`🔍 Validating userId: "${userId}" (type: ${typeof userId})`)

//   // Check if userId exists and is not null/undefined
//   if (!userId || userId === "null" || userId === "undefined" || userId.trim() === "") {
//     console.log(`❌ Invalid userId: ${userId}`)
//     return res.status(400).json({
//       success: false,
//       message: "Valid user ID is required. Please login again.",
//     })
//   }

//   // Check if userId is valid MongoDB ObjectId format
//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     console.log(`❌ Invalid ObjectId format: ${userId}`)
//     return res.status(400).json({
//       success: false,
//       message: "Invalid user ID format. Please login again.",
//     })
//   }

//   console.log(`✅ UserId validation passed: ${userId}`)
//   next()
// }

// // ✅ Get User Profile with Posts & Stats
// router.get("/profile/:userId", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params
//     console.log(`🔍 Fetching profile for userId: ${userId}`)

//     // Get user data
//     const user = await User.findById(userId).select("-password")
//     if (!user) {
//       console.log(`❌ User not found: ${userId}`)
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     // Get user's posts
//     const posts = await Post.find({ userId }).populate("userId", "name email profilePicture").sort({ createdAt: -1 })

//     // Calculate stats
//     const totalPosts = posts.length
//     const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0)
//     const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)
//     const totalVideos = posts.filter((post) => post.videoUrl).length
//     const totalImages = posts.filter((post) => post.imageUrl && !post.videoUrl).length

//     console.log(`✅ Profile data fetched for: ${user.name}`)

//     res.json({
//       success: true,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         profilePicture: user.profilePicture || "",
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//       },
//       posts,
//       stats: {
//         totalPosts,
//         totalLikes,
//         totalComments,
//         totalVideos,
//         totalImages,
//       },
//     })
//   } catch (err) {
//     console.error("❌ Get profile error:", err)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// // ✅ Update User Profile
// router.put("/profile/:userId", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params
//     const { name, email, profilePicture } = req.body

//     console.log(`🔄 Updating profile for userId: ${userId}`)

//     // Validation
//     if (!name || !email) {
//       return res.status(400).json({
//         success: false,
//         message: "Name and email are required",
//       })
//     }

//     // Check if email is already taken by another user
//     const emailExists = await User.findOne({
//       email: email.trim(),
//       _id: { $ne: userId },
//     })

//     if (emailExists) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already exists",
//       })
//     }

//     // Update user
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         name: name.trim(),
//         email: email.trim(),
//         ...(profilePicture && { profilePicture }),
//       },
//       { new: true, runValidators: true },
//     ).select("-password")

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     console.log(`✅ Profile updated successfully`)

//     res.json({
//       success: true,
//       message: "Profile updated successfully",
//       user: {
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         profilePicture: updatedUser.profilePicture || "",
//         createdAt: updatedUser.createdAt,
//         updatedAt: updatedUser.updatedAt,
//       },
//     })
//   } catch (err) {
//     console.error("❌ Update profile error:", err)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// // ✅ Change Password
// router.put("/change-password/:userId", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params
//     const { currentPassword, newPassword } = req.body

//     console.log(`🔐 Password change request for userId: ${userId}`)

//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "Both passwords are required",
//       })
//     }

//     if (newPassword.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: "New password must be at least 6 characters",
//       })
//     }

//     const user = await User.findById(userId)
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     const isMatch = await bcrypt.compare(currentPassword, user.password)
//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: "Current password is incorrect",
//       })
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10)
//     await User.findByIdAndUpdate(userId, { password: hashedPassword })

//     console.log(`✅ Password changed successfully`)

//     res.json({
//       success: true,
//       message: "Password changed successfully",
//     })
//   } catch (err) {
//     console.error("❌ Password change error:", err)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// // ✅ Update Profile Picture
// router.put("/profile-picture/:userId", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params
//     const { profilePicture } = req.body

//     console.log(`🖼️ Updating profile picture for userId: ${userId}`)

//     if (!profilePicture) {
//       return res.status(400).json({
//         success: false,
//         message: "Profile picture URL is required",
//       })
//     }

//     const updatedUser = await User.findByIdAndUpdate(userId, { profilePicture }, { new: true }).select("-password")

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     console.log(`✅ Profile picture updated`)

//     res.json({
//       success: true,
//       user: {
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         profilePicture: updatedUser.profilePicture || "",
//         createdAt: updatedUser.createdAt,
//         updatedAt: updatedUser.updatedAt,
//       },
//     })
//   } catch (err) {
//     console.error("❌ Update profile picture error:", err)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// module.exports = router



// const express = require("express")
// const router = express.Router()
// const User = require("../models/user")
// const Post = require("../models/post")
// const bcrypt = require("bcryptjs")
// const mongoose = require("mongoose")
// const jwt = require("jsonwebtoken")

// // Middleware to verify JWT token
// const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1]

//   if (!token) {
//     return res.status(401).json({ success: false, message: "No token provided" })
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
//     req.userId = decoded.userId
//     next()
//   } catch (error) {
//     return res.status(401).json({ success: false, message: "Invalid token" })
//   }
// }

// // ✅ Validation middleware for userId
// const validateUserId = (req, res, next) => {
//   const { userId } = req.params

//   console.log(`🔍 Validating userId: "${userId}" (type: ${typeof userId})`)

//   // Check if userId exists and is not null/undefined
//   if (!userId || userId === "null" || userId === "undefined" || userId.trim() === "") {
//     console.log(`❌ Invalid userId: ${userId}`)
//     return res.status(400).json({
//       success: false,
//       message: "Valid user ID is required. Please login again.",
//     })
//   }

//   // Check if userId is valid MongoDB ObjectId format
//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     console.log(`❌ Invalid ObjectId format: ${userId}`)
//     return res.status(400).json({
//       success: false,
//       message: "Invalid user ID format. Please login again.",
//     })
//   }

//   console.log(`✅ UserId validation passed: ${userId}`)
//   next()
// }

// // Get user profile
// router.get("/profile/:userId", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params
//     console.log(`🔍 Fetching profile for userId: ${userId}`)

//     // Get user data
//     const user = await User.findById(userId).select("-password")
//     if (!user) {
//       console.log(`❌ User not found: ${userId}`)
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     // Get user's posts if Post model exists
//     let posts = []
//     let stats = {
//       totalPosts: 0,
//       totalLikes: 0,
//       totalComments: 0,
//       totalVideos: 0,
//       totalImages: 0,
//     }

//     try {
//       posts = await Post.find({ userId }).populate("userId", "name email profilePicture").sort({ createdAt: -1 })

//       // Calculate stats
//       stats = {
//         totalPosts: posts.length,
//         totalLikes: posts.reduce((sum, post) => sum + (post.likes || 0), 0),
//         totalComments: posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0),
//         totalVideos: posts.filter((post) => post.videoUrl).length,
//         totalImages: posts.filter((post) => post.imageUrl && !post.videoUrl).length,
//       }
//     } catch (postError) {
//       console.log("⚠️ Post model not found, skipping posts")
//     }

//     console.log(`✅ Profile data fetched for: ${user.name}`)

//     res.json({
//       success: true,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         profilePicture: user.profilePicture || "",
//         fcmToken: user.fcmToken || "",
//         groups: user.groups || [],
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//       },
//       posts,
//       stats,
//     })
//   } catch (err) {
//     console.error("❌ Get profile error:", err)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// // Update user profile
// router.put("/profile/:userId", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params
//     const { name, email, profilePicture } = req.body

//     console.log(`🔄 Updating profile for userId: ${userId}`)

//     // Validation
//     if (!name || !email) {
//       return res.status(400).json({
//         success: false,
//         message: "Name and email are required",
//       })
//     }

//     // Check if email is already taken by another user
//     const emailExists = await User.findOne({
//       email: email.trim(),
//       _id: { $ne: userId },
//     })

//     if (emailExists) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already exists",
//       })
//     }

//     // Update user
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         name: name.trim(),
//         email: email.trim(),
//         ...(profilePicture && { profilePicture }),
//       },
//       { new: true, runValidators: true },
//     ).select("-password")

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     console.log(`✅ Profile updated successfully`)

//     res.json({
//       success: true,
//       message: "Profile updated successfully",
//       user: {
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         profilePicture: updatedUser.profilePicture || "",
//         createdAt: updatedUser.createdAt,
//         updatedAt: updatedUser.updatedAt,
//       },
//     })
//   } catch (err) {
//     console.error("❌ Update profile error:", err)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// // ✅ Change Password
// router.put("/change-password/:userId", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params
//     const { currentPassword, newPassword } = req.body

//     console.log(`🔐 Password change request for userId: ${userId}`)

//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "Both passwords are required",
//       })
//     }

//     if (newPassword.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: "New password must be at least 6 characters",
//       })
//     }

//     const user = await User.findById(userId)
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     const isMatch = await bcrypt.compare(currentPassword, user.password)
//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: "Current password is incorrect",
//       })
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10)
//     await User.findByIdAndUpdate(userId, { password: hashedPassword })

//     console.log(`✅ Password changed successfully`)

//     res.json({
//       success: true,
//       message: "Password changed successfully",
//     })
//   } catch (err) {
//     console.error("❌ Password change error:", err)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// // ✅ Update Profile Picture
// router.put("/profile-picture/:userId", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params
//     const { profilePicture } = req.body

//     console.log(`🖼️ Updating profile picture for userId: ${userId}`)

//     if (!profilePicture) {
//       return res.status(400).json({
//         success: false,
//         message: "Profile picture URL is required",
//       })
//     }

//     const updatedUser = await User.findByIdAndUpdate(userId, { profilePicture }, { new: true }).select("-password")

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     console.log(`✅ Profile picture updated`)

//     res.json({
//       success: true,
//       user: {
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         profilePicture: updatedUser.profilePicture || "",
//         createdAt: updatedUser.createdAt,
//         updatedAt: updatedUser.updatedAt,
//       },
//     })
//   } catch (err) {
//     console.error("❌ Update profile picture error:", err)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// // Get user's groups
// router.get("/:userId/groups", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params
//     const user = await User.findById(userId).populate("groups")

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" })
//     }

//     res.json({ groups: user.groups })
//   } catch (error) {
//     console.error("❌ Error fetching user groups:", error)
//     res.status(500).json({ success: false, message: "Server error" })
//   }
// })

// // ✅ FCM Token endpoint - REQUIRED FOR NOTIFICATIONS
// router.post("/fcm-token", async (req, res) => {
//   const { userId, fcmToken } = req.body

//   try {
//     console.log(`💾 Saving FCM token for user: ${userId}`)

//     if (!userId || !fcmToken) {
//       return res.status(400).json({ success: false, message: "userId and fcmToken required" })
//     }

//     const updatedUser = await User.findByIdAndUpdate(userId, { fcmToken }, { new: true })

//     if (!updatedUser) {
//       console.log(`❌ User not found: ${userId}`)
//       return res.status(404).json({ success: false, message: "User not found" })
//     }

//     console.log(`✅ FCM token saved for user: ${updatedUser.name}`)
//     res.json({ success: true })
//   } catch (err) {
//     console.error("❌ Error saving FCM token:", err)
//     res.status(500).json({ success: false, message: "Error saving FCM token" })
//   }
// })

// // ✅ Join Group endpoint - REQUIRED FOR NOTIFICATIONS
// router.post("/join-group", async (req, res) => {
//   const { userId, groupId } = req.body

//   try {
//     console.log(`👥 Adding user ${userId} to group ${groupId}`)

//     if (!userId || !groupId) {
//       return res.status(400).json({ success: false, message: "userId and groupId required" })
//     }

//     // Add group to user's groups array
//     const updatedUser = await User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } }, { new: true })

//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: "User not found" })
//     }

//     console.log(`✅ User ${updatedUser.name} added to group`)
//     res.json({ success: true })
//   } catch (err) {
//     console.error("❌ Error joining group:", err)
//     res.status(500).json({ success: false })
//   }
// })

// module.exports = router



// const express = require("express")
// const User = require("../models/user")
// const Post = require("../models/post")
// const bcrypt = require("bcryptjs")
// const mongoose = require("mongoose")
// const jwt = require("jsonwebtoken")
// const router = express.Router()

// // Middleware to verify JWT token
// const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1]
//   if (!token) {
//     return res.status(401).json({ success: false, message: "No token provided" })
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
//     req.userId = decoded.userId
//     next()
//   } catch (error) {
//     return res.status(401).json({ success: false, message: "Invalid token" })
//   }
// }

// // ✅ Validation middleware for userId
// const validateUserId = (req, res, next) => {
//   const { userId } = req.params
//   console.log(`🔍 Validating userId: "${userId}" (type: ${typeof userId})`)

//   if (!userId || userId === "null" || userId === "undefined" || userId.trim() === "") {
//     console.log(`❌ Invalid userId: ${userId}`)
//     return res.status(400).json({
//       success: false,
//       message: "Valid user ID is required. Please login again.",
//     })
//   }

//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     console.log(`❌ Invalid ObjectId format: ${userId}`)
//     return res.status(400).json({
//       success: false,
//       message: "Invalid user ID format. Please login again.",
//     })
//   }

//   console.log(`✅ UserId validation passed: ${userId}`)
//   next()
// }

// // ⭐ FOLLOW/UNFOLLOW USER - NEW FUNCTIONALITY
// router.put("/follow/:userId", async (req, res) => {
//   try {
//     const { currentUserId } = req.body
//     const userToFollow = req.params.userId

//     console.log(`👥 Follow request: ${currentUserId} -> ${userToFollow}`)

//     // Validation
//     if (!currentUserId || !userToFollow) {
//       return res.status(400).json({
//         success: false,
//         message: "Both user IDs are required",
//       })
//     }

//     // Check if trying to follow self
//     if (currentUserId === userToFollow) {
//       return res.status(400).json({
//         success: false,
//         message: "You cannot follow yourself",
//       })
//     }

//     // Validate ObjectIds
//     if (!mongoose.Types.ObjectId.isValid(currentUserId) || !mongoose.Types.ObjectId.isValid(userToFollow)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user ID format",
//       })
//     }

//     const currentUser = await User.findById(currentUserId)
//     const targetUser = await User.findById(userToFollow)

//     if (!currentUser || !targetUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     // Initialize arrays if they don't exist
//     if (!currentUser.following) currentUser.following = []
//     if (!targetUser.followers) targetUser.followers = []
//     if (typeof currentUser.followingCount !== "number") currentUser.followingCount = 0
//     if (typeof targetUser.followersCount !== "number") targetUser.followersCount = 0

//     const isFollowing = currentUser.following.includes(userToFollow)

//     if (isFollowing) {
//       // ⭐ UNFOLLOW
//       currentUser.following.pull(userToFollow)
//       targetUser.followers.pull(currentUserId)
//       currentUser.followingCount = Math.max(0, currentUser.followingCount - 1)
//       targetUser.followersCount = Math.max(0, targetUser.followersCount - 1)
//       console.log(`✅ Unfollowed: ${currentUser.name} unfollowed ${targetUser.name}`)
//     } else {
//       // ⭐ FOLLOW
//       currentUser.following.push(userToFollow)
//       targetUser.followers.push(currentUserId)
//       currentUser.followingCount += 1
//       targetUser.followersCount += 1
//       console.log(`✅ Followed: ${currentUser.name} followed ${targetUser.name}`)
//     }

//     await currentUser.save()
//     await targetUser.save()

//     res.json({
//       success: true,
//       isFollowing: !isFollowing,
//       followersCount: targetUser.followersCount,
//       followingCount: currentUser.followingCount,
//       message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
//     })
//   } catch (error) {
//     console.error("❌ Follow error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// // ⭐ CHECK IF USER IS FOLLOWING ANOTHER USER
// router.get("/check-follow/:userId/:currentUserId", async (req, res) => {
//   try {
//     const { userId, currentUserId } = req.params

//     console.log(`🔍 Checking follow status: ${currentUserId} -> ${userId}`)

//     if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user ID format",
//       })
//     }

//     const currentUser = await User.findById(currentUserId)
//     const targetUser = await User.findById(userId)

//     if (!currentUser || !targetUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     // Initialize arrays if they don't exist
//     if (!currentUser.following) currentUser.following = []
//     if (typeof targetUser.followersCount !== "number") targetUser.followersCount = 0
//     if (typeof targetUser.followingCount !== "number") targetUser.followingCount = 0

//     const isFollowing = currentUser.following.includes(userId)

//     res.json({
//       success: true,
//       isFollowing,
//       followersCount: targetUser.followersCount,
//       followingCount: targetUser.followingCount,
//     })
//   } catch (error) {
//     console.error("❌ Check follow error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// // ⭐ GET USER PROFILE
// router.get("/profile/:userId", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params
//     console.log(`🔍 Fetching profile for userId: ${userId}`)

//     // Get user data
//     const user = await User.findById(userId).select("-password")

//     if (!user) {
//       console.log(`❌ User not found: ${userId}`)
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     // Get user's posts if Post model exists
//     let posts = []
//     let stats = {
//       totalPosts: 0,
//       totalLikes: 0,
//       totalComments: 0,
//       totalVideos: 0,
//       totalImages: 0,
//     }

//     try {
//       posts = await Post.find({ userId }).populate("userId", "name email profilePicture").sort({ createdAt: -1 })

//       // Calculate stats
//       stats = {
//         totalPosts: posts.length,
//         totalLikes: posts.reduce((sum, post) => sum + (post.likes || 0), 0),
//         totalComments: posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0),
//         totalVideos: posts.filter((post) => post.videoUrl).length,
//         totalImages: posts.filter((post) => post.imageUrl && !post.videoUrl).length,
//       }
//     } catch (postError) {
//       console.log("⚠️ Post model not found, skipping posts")
//     }

//     console.log(`✅ Profile data fetched for: ${user.name}`)

//     res.json({
//       success: true,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         profilePicture: user.profilePicture || "",
//         fcmToken: user.fcmToken || "",
//         groups: user.groups || [],
//         // ⭐ FOLLOW DATA ADDED
//         followers: user.followers || [],
//         following: user.following || [],
//         followersCount: user.followersCount || 0,
//         followingCount: user.followingCount || 0,
//         bio: user.bio || "",
//         isVerified: user.isVerified || false,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//       },
//       posts,
//       stats,
//     })
//   } catch (err) {
//     console.error("❌ Get profile error:", err)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// // ⭐ GET USER'S FOLLOWERS
// router.get("/followers/:userId", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params

//     console.log(`👥 Getting followers for userId: ${userId}`)

//     const user = await User.findById(userId).populate("followers", "name email profilePicture followersCount")

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     res.json({
//       success: true,
//       followers: user.followers || [],
//       count: user.followersCount || 0,
//     })
//   } catch (error) {
//     console.error("❌ Get followers error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// // ⭐ GET USER'S FOLLOWING
// router.get("/following/:userId", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params

//     console.log(`👥 Getting following for userId: ${userId}`)

//     const user = await User.findById(userId).populate("following", "name email profilePicture followersCount")

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     res.json({
//       success: true,
//       following: user.following || [],
//       count: user.followingCount || 0,
//     })
//   } catch (error) {
//     console.error("❌ Get following error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// // Update user profile - UPDATED WITH BIO
// router.put("/profile/:userId", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params
//     const { name, email, profilePicture, bio } = req.body

//     console.log(`🔄 Updating profile for userId: ${userId}`)

//     // Validation
//     if (!name || !email) {
//       return res.status(400).json({
//         success: false,
//         message: "Name and email are required",
//       })
//     }

//     // Check if email is already taken by another user
//     const emailExists = await User.findOne({
//       email: email.trim(),
//       _id: { $ne: userId },
//     })

//     if (emailExists) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already exists",
//       })
//     }

//     // Update user
//     const updateData = {
//       name: name.trim(),
//       email: email.trim(),
//     }

//     if (profilePicture) updateData.profilePicture = profilePicture
//     if (bio !== undefined) updateData.bio = bio.trim()

//     const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(
//       "-password",
//     )

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     console.log(`✅ Profile updated successfully`)

//     res.json({
//       success: true,
//       message: "Profile updated successfully",
//       user: {
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         profilePicture: updatedUser.profilePicture || "",
//         bio: updatedUser.bio || "",
//         followersCount: updatedUser.followersCount || 0,
//         followingCount: updatedUser.followingCount || 0,
//         createdAt: updatedUser.createdAt,
//         updatedAt: updatedUser.updatedAt,
//       },
//     })
//   } catch (err) {
//     console.error("❌ Update profile error:", err)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// // ✅ Change Password
// router.put("/change-password/:userId", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params
//     const { currentPassword, newPassword } = req.body

//     console.log(`🔐 Password change request for userId: ${userId}`)

//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "Both passwords are required",
//       })
//     }

//     if (newPassword.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: "New password must be at least 6 characters",
//       })
//     }

//     const user = await User.findById(userId)

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     const isMatch = await bcrypt.compare(currentPassword, user.password)

//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: "Current password is incorrect",
//       })
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10)

//     await User.findByIdAndUpdate(userId, { password: hashedPassword })

//     console.log(`✅ Password changed successfully`)

//     res.json({
//       success: true,
//       message: "Password changed successfully",
//     })
//   } catch (err) {
//     console.error("❌ Password change error:", err)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// // ✅ Update Profile Picture
// router.put("/profile-picture/:userId", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params
//     const { profilePicture } = req.body

//     console.log(`🖼️ Updating profile picture for userId: ${userId}`)

//     if (!profilePicture) {
//       return res.status(400).json({
//         success: false,
//         message: "Profile picture URL is required",
//       })
//     }

//     const updatedUser = await User.findByIdAndUpdate(userId, { profilePicture }, { new: true }).select("-password")

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       })
//     }

//     console.log(`✅ Profile picture updated`)

//     res.json({
//       success: true,
//       user: {
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         profilePicture: updatedUser.profilePicture || "",
//         createdAt: updatedUser.createdAt,
//         updatedAt: updatedUser.updatedAt,
//       },
//     })
//   } catch (err) {
//     console.error("❌ Update profile picture error:", err)
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     })
//   }
// })

// // Get user's groups
// router.get("/:userId/groups", validateUserId, async (req, res) => {
//   try {
//     const { userId } = req.params

//     const user = await User.findById(userId).populate("groups")

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" })
//     }

//     res.json({ groups: user.groups })
//   } catch (error) {
//     console.error("❌ Error fetching user groups:", error)
//     res.status(500).json({ success: false, message: "Server error" })
//   }
// })

// // ✅ FCM Token endpoint - REQUIRED FOR NOTIFICATIONS
// router.post("/fcm-token", async (req, res) => {
//   const { userId, fcmToken } = req.body

//   try {
//     console.log(`💾 Saving FCM token for user: ${userId}`)

//     if (!userId || !fcmToken) {
//       return res.status(400).json({ success: false, message: "userId and fcmToken required" })
//     }

//     const updatedUser = await User.findByIdAndUpdate(userId, { fcmToken }, { new: true })

//     if (!updatedUser) {
//       console.log(`❌ User not found: ${userId}`)
//       return res.status(404).json({ success: false, message: "User not found" })
//     }

//     console.log(`✅ FCM token saved for user: ${updatedUser.name}`)

//     res.json({ success: true })
//   } catch (err) {
//     console.error("❌ Error saving FCM token:", err)
//     res.status(500).json({ success: false, message: "Error saving FCM token" })
//   }
// })

// // ✅ Join Group endpoint - REQUIRED FOR NOTIFICATIONS
// router.post("/join-group", async (req, res) => {
//   const { userId, groupId } = req.body

//   try {
//     console.log(`👥 Adding user ${userId} to group ${groupId}`)

//     if (!userId || !groupId) {
//       return res.status(400).json({ success: false, message: "userId and groupId required" })
//     }

//     // Add group to user's groups array
//     const updatedUser = await User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } }, { new: true })

//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: "User not found" })
//     }

//     console.log(`✅ User ${updatedUser.name} added to group`)

//     res.json({ success: true })
//   } catch (err) {
//     console.error("❌ Error joining group:", err)
//     res.status(500).json({ success: false })
//   }
// })


// // routes/users.js में add करें

// // Save/Unsave Video
// router.put('/save-video/:postId', async (req, res) => {
//   try {
//     const { postId } = req.params
//     const { userId } = req.body

//     if (!userId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'User ID is required' 
//       })
//     }

//     const user = await User.findById(userId)
//     const post = await Post.findById(postId)

//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'User not found' 
//       })
//     }

//     if (!post) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Post not found' 
//       })
//     }

//     const isAlreadySaved = user.savedVideos.includes(postId)

//     if (isAlreadySaved) {
//       // Unsave video
//       user.savedVideos = user.savedVideos.filter(
//         savedId => savedId.toString() !== postId
//       )
//       await user.save()

//       res.json({
//         success: true,
//         isSaved: false,
//         message: 'Video removed from saved list'
//       })
//     } else {
//       // Save video
//       user.savedVideos.push(postId)
//       await user.save()

//       res.json({
//         success: true,
//         isSaved: true,
//         message: 'Video saved successfully'
//       })
//     }

//   } catch (error) {
//     console.error('Save video error:', error)
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error' 
//     })
//   }
// })

// // Check if video is saved
// router.get('/check-saved/:postId/:userId', async (req, res) => {
//   try {
//     const { postId, userId } = req.params

//     const user = await User.findById(userId)
//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'User not found' 
//       })
//     }

//     const isSaved = user.savedVideos.includes(postId)

//     res.json({
//       success: true,
//       isSaved
//     })

//   } catch (error) {
//     console.error('Check saved error:', error)
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error' 
//     })
//   }
// })

// // Get all saved videos
// router.get('/saved-videos/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params

//     const user = await User.findById(userId)
//       .populate({
//         path: 'savedVideos',
//         populate: {
//           path: 'userId',
//           select: 'name email'
//         }
//       })

//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'User not found' 
//       })
//     }

//     res.json({
//       success: true,
//       savedVideos: user.savedVideos || []
//     })

//   } catch (error) {
//     console.error('Get saved videos error:', error)
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error' 
//     })
//   }
// })


// module.exports = router





const express = require("express")
const User = require("../models/user")
const Post = require("../models/post")
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const router = express.Router()

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    req.userId = decoded.userId
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" })
  }
}

// ✅ Validation middleware for userId
const validateUserId = (req, res, next) => {
  const { userId } = req.params
  console.log(`🔍 Validating userId: "${userId}" (type: ${typeof userId})`)

  if (!userId || userId === "null" || userId === "undefined" || userId.trim() === "") {
    console.log(`❌ Invalid userId: ${userId}`)
    return res.status(400).json({
      success: false,
      message: "Valid user ID is required. Please login again.",
    })
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log(`❌ Invalid ObjectId format: ${userId}`)
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format. Please login again.",
    })
  }

  console.log(`✅ UserId validation passed: ${userId}`)
  next()
}

// ⭐ FOLLOW/UNFOLLOW USER - NEW FUNCTIONALITY
router.put("/follow/:userId", async (req, res) => {
  try {
    const { currentUserId } = req.body
    const userToFollow = req.params.userId

    console.log(`👥 Follow request: ${currentUserId} -> ${userToFollow}`)

    // Validation
    if (!currentUserId || !userToFollow) {
      return res.status(400).json({
        success: false,
        message: "Both user IDs are required",
      })
    }

    // Check if trying to follow self
    if (currentUserId === userToFollow) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      })
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(currentUserId) || !mongoose.Types.ObjectId.isValid(userToFollow)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      })
    }

    const currentUser = await User.findById(currentUserId)
    const targetUser = await User.findById(userToFollow)

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Initialize arrays if they don't exist
    if (!currentUser.following) currentUser.following = []
    if (!targetUser.followers) targetUser.followers = []
    if (typeof currentUser.followingCount !== "number") currentUser.followingCount = 0
    if (typeof targetUser.followersCount !== "number") targetUser.followersCount = 0

    const isFollowing = currentUser.following.includes(userToFollow)

    if (isFollowing) {
      // ⭐ UNFOLLOW
      currentUser.following.pull(userToFollow)
      targetUser.followers.pull(currentUserId)
      currentUser.followingCount = Math.max(0, currentUser.followingCount - 1)
      targetUser.followersCount = Math.max(0, targetUser.followersCount - 1)
      console.log(`✅ Unfollowed: ${currentUser.name} unfollowed ${targetUser.name}`)
    } else {
      // ⭐ FOLLOW
      currentUser.following.push(userToFollow)
      targetUser.followers.push(currentUserId)
      currentUser.followingCount += 1
      targetUser.followersCount += 1
      console.log(`✅ Followed: ${currentUser.name} followed ${targetUser.name}`)
    }

    await currentUser.save()
    await targetUser.save()

    res.json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: targetUser.followersCount,
      followingCount: currentUser.followingCount,
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
    })
  } catch (error) {
    console.error("❌ Follow error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// ⭐ CHECK IF USER IS FOLLOWING ANOTHER USER
router.get("/check-follow/:userId/:currentUserId", async (req, res) => {
  try {
    const { userId, currentUserId } = req.params
    console.log(`🔍 Checking follow status: ${currentUserId} -> ${userId}`)

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      })
    }

    const currentUser = await User.findById(currentUserId)
    const targetUser = await User.findById(userId)

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Initialize arrays if they don't exist
    if (!currentUser.following) currentUser.following = []
    if (typeof targetUser.followersCount !== "number") targetUser.followersCount = 0
    if (typeof targetUser.followingCount !== "number") targetUser.followingCount = 0

    const isFollowing = currentUser.following.includes(userId)

    res.json({
      success: true,
      isFollowing,
      followersCount: targetUser.followersCount,
      followingCount: targetUser.followingCount,
    })
  } catch (error) {
    console.error("❌ Check follow error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// ⭐ GET USER PROFILE - UPDATED WITH ALL FIELDS
router.get("/profile/:userId", validateUserId, async (req, res) => {
  try {
    const { userId } = req.params
    console.log(`🔍 Fetching profile for userId: ${userId}`)

    // Get user data
    const user = await User.findById(userId).select("-password")

    if (!user) {
      console.log(`❌ User not found: ${userId}`)
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Get user's posts if Post model exists
    let posts = []
    let stats = {
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0,
      totalVideos: 0,
      totalImages: 0,
    }

    try {
      posts = await Post.find({ userId }).populate("userId", "name email profilePicture").sort({ createdAt: -1 })

      // Calculate stats
      stats = {
        totalPosts: posts.length,
        totalLikes: posts.reduce((sum, post) => sum + (post.likes || 0), 0),
        totalComments: posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0),
        totalVideos: posts.filter((post) => post.videoUrl).length,
        totalImages: posts.filter((post) => post.imageUrl && !post.videoUrl).length,
      }
    } catch (postError) {
      console.log("⚠️ Post model not found, skipping posts")
    }

    console.log(`✅ Profile data fetched for: ${user.name}`)

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || "",
        fcmToken: user.fcmToken || "",
        groups: user.groups || [],
        // ⭐ FOLLOW DATA ADDED
        followers: user.followers || [],
        following: user.following || [],
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
        // ✅ NEW PROFILE FIELDS
        bio: user.bio || "",
        isVerified: user.isVerified || false,
        isPrivate: user.isPrivate || false, // ✅ Privacy field added
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      posts,
      stats,
    })
  } catch (err) {
    console.error("❌ Get profile error:", err)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// ⭐ GET USER'S FOLLOWERS
router.get("/followers/:userId", validateUserId, async (req, res) => {
  try {
    const { userId } = req.params
    console.log(`👥 Getting followers for userId: ${userId}`)

    const user = await User.findById(userId).populate("followers", "name email profilePicture followersCount bio isVerified")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      followers: user.followers || [],
      count: user.followersCount || 0,
    })
  } catch (error) {
    console.error("❌ Get followers error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// ⭐ GET USER'S FOLLOWING
router.get("/following/:userId", validateUserId, async (req, res) => {
  try {
    const { userId } = req.params
    console.log(`👥 Getting following for userId: ${userId}`)

    const user = await User.findById(userId).populate("following", "name email profilePicture followersCount bio isVerified")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      following: user.following || [],
      count: user.followingCount || 0,
    })
  } catch (error) {
    console.error("❌ Get following error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// ✅ UPDATE USER PROFILE - COMPLETE WITH BIO AND PRIVACY
router.put("/profile/:userId", validateUserId, async (req, res) => {
  try {
    const { userId } = req.params
    const { name, email, profilePicture, bio, isPrivate } = req.body // ✅ isPrivate added

    console.log(`🔄 Updating profile for userId: ${userId}`)
    console.log('Update data:', { name, email, bio, isPrivate }) // ✅ Debug log

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      })
    }

    // ✅ Bio validation
    if (bio && bio.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Bio must be 150 characters or less",
      })
    }

    // Check if email is already taken by another user (if email is being updated)
    if (email) {
      const emailExists = await User.findOne({
        email: email.trim(),
        _id: { $ne: userId },
      })

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        })
      }
    }

    // ✅ Build update data object
    const updateData = {
      name: name.trim(),
    }

    // Only update email if provided
    if (email) updateData.email = email.trim()
    
    // Only update profile picture if provided
    if (profilePicture) updateData.profilePicture = profilePicture
    
    // ✅ Update bio (can be empty string)
    if (bio !== undefined) updateData.bio = bio.trim()
    
    // ✅ Update privacy setting
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate

    console.log('Final update data:', updateData) // ✅ Debug log

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    ).select("-password")

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    console.log(`✅ Profile updated successfully`)

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture || "",
        bio: updatedUser.bio || "", // ✅ Bio return
        isPrivate: updatedUser.isPrivate || false, // ✅ Privacy return
        isVerified: updatedUser.isVerified || false, // ✅ Verification return
        followersCount: updatedUser.followersCount || 0,
        followingCount: updatedUser.followingCount || 0,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    })

  } catch (err) {
    console.error("❌ Update profile error:", err)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    })
  }
})

// ✅ Change Password
router.put("/change-password/:userId", validateUserId, async (req, res) => {
  try {
    const { userId } = req.params
    const { currentPassword, newPassword } = req.body

    console.log(`🔐 Password change request for userId: ${userId}`)

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both passwords are required",
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await User.findByIdAndUpdate(userId, { password: hashedPassword })

    console.log(`✅ Password changed successfully`)

    res.json({
      success: true,
      message: "Password changed successfully",
    })

  } catch (err) {
    console.error("❌ Password change error:", err)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// ✅ Update Profile Picture
router.put("/profile-picture/:userId", validateUserId, async (req, res) => {
  try {
    const { userId } = req.params
    const { profilePicture } = req.body

    console.log(`🖼️ Updating profile picture for userId: ${userId}`)

    if (!profilePicture) {
      return res.status(400).json({
        success: false,
        message: "Profile picture URL is required",
      })
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { profilePicture }, 
      { new: true }
    ).select("-password")

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    console.log(`✅ Profile picture updated`)

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture || "",
        bio: updatedUser.bio || "",
        isPrivate: updatedUser.isPrivate || false,
        isVerified: updatedUser.isVerified || false,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    })

  } catch (err) {
    console.error("❌ Update profile picture error:", err)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Get user's groups
router.get("/:userId/groups", validateUserId, async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).populate("groups")

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    res.json({ 
      success: true,
      groups: user.groups || [],
      count: user.groups?.length || 0
    })
  } catch (error) {
    console.error("❌ Error fetching user groups:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// ✅ FCM Token endpoint - REQUIRED FOR NOTIFICATIONS
router.post("/fcm-token", async (req, res) => {
  const { userId, fcmToken } = req.body

  try {
    console.log(`💾 Saving FCM token for user: ${userId}`)

    if (!userId || !fcmToken) {
      return res.status(400).json({ success: false, message: "userId and fcmToken required" })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      })
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { fcmToken }, { new: true })

    if (!updatedUser) {
      console.log(`❌ User not found: ${userId}`)
      return res.status(404).json({ success: false, message: "User not found" })
    }

    console.log(`✅ FCM token saved for user: ${updatedUser.name}`)

    res.json({ 
      success: true,
      message: "FCM token saved successfully"
    })
  } catch (err) {
    console.error("❌ Error saving FCM token:", err)
    res.status(500).json({ success: false, message: "Error saving FCM token" })
  }
})

// ✅ Join Group endpoint - REQUIRED FOR NOTIFICATIONS
router.post("/join-group", async (req, res) => {
  const { userId, groupId } = req.body

  try {
    console.log(`👥 Adding user ${userId} to group ${groupId}`)

    if (!userId || !groupId) {
      return res.status(400).json({ success: false, message: "userId and groupId required" })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      })
    }

    // Add group to user's groups array
    const updatedUser = await User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } }, { new: true })

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    console.log(`✅ User ${updatedUser.name} added to group`)

    res.json({ 
      success: true,
      message: "Successfully joined group"
    })
  } catch (err) {
    console.error("❌ Error joining group:", err)
    res.status(500).json({ success: false, message: "Error joining group" })
  }
})

// ✅ SAVE/UNSAVE VIDEO - ENHANCED VERSION
router.put('/save-video/:postId', async (req, res) => {
  try {
    const { postId } = req.params
    const { userId } = req.body

    console.log(`💾 Save video request: userId=${userId}, postId=${postId}`) // ✅ Debug

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      })
    }

    // ✅ Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      })
    }

    const user = await User.findById(userId)
    const post = await Post.findById(postId)

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      })
    }

    // ✅ Initialize savedVideos array if it doesn't exist
    if (!user.savedVideos) {
      user.savedVideos = []
    }

    const isAlreadySaved = user.savedVideos.some(
      savedId => savedId.toString() === postId
    )

    if (isAlreadySaved) {
      // Unsave video
      user.savedVideos = user.savedVideos.filter(
        savedId => savedId.toString() !== postId
      )
      await user.save()

      console.log(`✅ Video unsaved successfully`)

      res.json({
        success: true,
        isSaved: false,
        message: 'Video removed from saved list'
      })
    } else {
      // Save video
      user.savedVideos.push(postId)
      await user.save()

      console.log(`✅ Video saved successfully`)

      res.json({
        success: true,
        isSaved: true,
        message: 'Video saved successfully'
      })
    }

  } catch (error) {
    console.error('❌ Save video error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message // ✅ Debug info
    })
  }
})

// ✅ CHECK IF VIDEO IS SAVED
router.get('/check-saved/:postId/:userId', async (req, res) => {
  try {
    const { postId, userId } = req.params

    console.log(`🔍 Checking saved status: userId=${userId}, postId=${postId}`) // ✅ Debug

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    // Initialize savedVideos array if it doesn't exist
    if (!user.savedVideos) {
      user.savedVideos = []
    }

    const isSaved = user.savedVideos.some(
      savedId => savedId.toString() === postId
    )

    res.json({
      success: true,
      isSaved
    })

  } catch (error) {
    console.error('❌ Check saved error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    })
  }
})

// ✅ GET ALL SAVED VIDEOS
router.get('/saved-videos/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    console.log(`📱 Getting saved videos for userId: ${userId}`) // ✅ Debug

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      })
    }

    const user = await User.findById(userId)
      .populate({
        path: 'savedVideos',
        populate: {
          path: 'userId',
          select: 'name email profilePicture isVerified' // ✅ isVerified added
        }
      })

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    // ✅ Filter out any null/undefined saved videos
    const validSavedVideos = (user.savedVideos || []).filter(video => video !== null)

    console.log(`✅ Found ${validSavedVideos.length} saved videos`)

    res.json({
      success: true,
      savedVideos: validSavedVideos,
      count: validSavedVideos.length
    })

  } catch (error) {
    console.error('❌ Get saved videos error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    })
  }
})

module.exports = router