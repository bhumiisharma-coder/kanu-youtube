// // 🔥 Full Working Backend with FCM Notifications 🔔

// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// const admin = require("firebase-admin");
// const serviceAccount = require("./ndroid-app-759be-firebase-adminsdk-fbsvc-24659e4c07.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// console.log("🚀 Starting YouTube App Backend...");

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:3001", "http://10.0.2.2:3000", "*"],
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: "200mb" }));
// app.use(express.urlencoded({ extended: true, limit: "200mb" }));

// app.use((req, res, next) => {
//   console.log(`📡 ${req.method} ${req.path}`);
//   next();
// });

// app.use((req, res, next) => {
//   req.setTimeout(1800000);
//   res.setTimeout(1800000);
//   next();
// });

// // ✅ MongoDB Schemas
// const messageSchema = new mongoose.Schema({
//   sender: String,
//   senderName: String,
//   message: String,
//   group: String,
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   seenBy: [String],
//   edited: Boolean,
// });

// const groupSchema = new mongoose.Schema({
//   name: String,
// });

// // ✅ Safe model registration
// const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
// const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);

// // ✅ Import User model from separate file
// const User = require("./models/user");

// // 🔧 Helper: Get tokens of group users excluding sender
// async function getGroupMemberTokens(groupId, senderId) {
//   const users = await User.find({
//     groups: groupId,
//     _id: { $ne: senderId },
//     fcmToken: { $exists: true, $ne: null }
//   });
//   return users.map(u => u.fcmToken);
// }

// // ✅ MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("✅ MongoDB Connected");

//     // Import routes
//     const authRoutes = require("./routes/authroutes");
//     const postRoutes = require("./routes/postroutes");
//     const uploadRoutes = require("./routes/upload");
//     const userRoutes = require("./routes/userroutes");

//     app.use("/api/auth", authRoutes);
//     app.use("/api/posts", postRoutes);
//     app.use("/api/upload", uploadRoutes);
//     app.use("/api/users", userRoutes);
//   })
//   .catch((err) => {
//     console.log("❌ MongoDB Connection Error:", err);
//     process.exit(1);
//   });

// app.get("/", (req, res) => {
//   res.json({
//     message: "YouTube App Backend is running! 🚀",
//     timestamp: new Date().toISOString(),
//   });
// });

// // ✅ API Routes
// app.get("/api/groups", async (req, res) => {
//   try {
//     const groups = await Group.find();
//     res.json(groups);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching groups" });
//   }
// });

// app.post("/api/groups", async (req, res) => {
//   try {
//     const { name } = req.body;
//     const group = new Group({ name });
//     await group.save();
//     res.status(201).json(group);
//   } catch (err) {
//     res.status(500).json({ message: "Error creating group" });
//   }
// });

// app.get("/api/messages/:group", async (req, res) => {
//   try {
//     const messages = await Message.find({ group: req.params.group }).sort({ createdAt: 1 });
//     res.json(messages);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching messages" });
//   }
// });

// app.post("/api/users/fcm-token", async (req, res) => {
//   const { userId, fcmToken } = req.body;
//   await User.findByIdAndUpdate(userId, { fcmToken }, { upsert: true });
//   res.send({ success: true });
// });

// // ✅ Socket.IO Events
// io.on("connection", (socket) => {
//   console.log("🟢 User connected:", socket.id);

//   socket.on("joinGroup", (groupId) => {
//     socket.join(groupId);
//     console.log(`👥 User joined group: ${groupId}`);
//   });

//   socket.on("sendMessage", async (data) => {
//     try {
//       const newMsg = new Message(data);
//       await newMsg.save();
//       io.to(data.group).emit("receiveMessage", newMsg);

//   const tokens = await getGroupMemberTokens(data.group, data.sender);

// if (tokens.length > 0) {
//   await admin.messaging().sendEachForMulticast({
//     tokens,
//     notification: {
//       title: `📢 New message in ${data.groupName || "a group"}`,
//       body: `${data.senderName}: ${data.message}`,
//     },
//     data: {
//       title: `📢 New message in ${data.groupName || "a group"}`,
//       body: `${data.senderName}: ${data.message}`,
//     },
//   });
// }

//     } catch (error) {
//       console.error("Socket save error:", error);
//     }
//   });

//   socket.on("deleteMessage", async (msgId) => {
//     try {
//       await Message.findByIdAndDelete(msgId);
//       io.emit("messageDeleted", msgId);
//     } catch (err) {
//       console.error("Delete failed:", err);
//     }
//   });

//   socket.on("editMessage", async (updatedMsg) => {
//     try {
//       const msg = await Message.findByIdAndUpdate(
//         updatedMsg._id,
//         {
//           message: updatedMsg.message,
//           edited: true,
//         },
//         { new: true }
//       );
//       io.emit("messageEdited", msg);
//     } catch (err) {
//       console.error("Edit failed:", err);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("🔴 User disconnected:", socket.id);
//   });
// });

// // ✅ Error handler
// app.use((err, req, res, next) => {
//   console.error("❌ Server Error:", err);
//   res.status(500).json({ success: false, message: "Internal server error" });
// });

// // ✅ Start Server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


// 





// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// const admin = require("firebase-admin");
// const serviceAccount = require("./ndroid-app-759be-firebase-adminsdk-fbsvc-24659e4c07.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// console.log("🚀 Starting YouTube App Backend...");

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:3001", "http://10.0.2.2:3000", "*"],
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: "200mb" }));
// app.use(express.urlencoded({ extended: true, limit: "200mb" }));

// app.use((req, res, next) => {
//   console.log(`📡 ${req.method} ${req.path}`);
//   next();
// });

// app.use((req, res, next) => {
//   req.setTimeout(1800000);
//   res.setTimeout(1800000);
//   next();
// });

// const messageSchema = new mongoose.Schema({
//   sender: String,
//   senderName: String,
//   message: String,
//   group: String,
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   seenBy: [String],
//   edited: Boolean,
// });

// const groupSchema = new mongoose.Schema({
//   name: String,
// });

// const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
// const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);

// const User = require("./models/user");

// const { isValidObjectId } = require("mongoose");

// async function getGroupMemberTokens(groupId, senderId) {
//   const query = {
//     groups: groupId,
//     fcmToken: { $exists: true, $ne: null }
//   };

//   if (isValidObjectId(senderId)) {
//     query._id = { $ne: senderId };
//   } else {
//     query.email = { $ne: senderId };
//   }

//   try {
//     const users = await User.find(query);
//     return users.map(u => u.fcmToken);
//   } catch (err) {
//     console.error("❌ Token fetch error:", err);
//     return [];
//   }
// }

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("✅ MongoDB Connected");

//     const authRoutes = require("./routes/authroutes");
//     const postRoutes = require("./routes/postroutes");
//     const uploadRoutes = require("./routes/upload");
//     const userRoutes = require("./routes/userroutes");

//     app.use("/api/auth", authRoutes);
//     app.use("/api/posts", postRoutes);
//     app.use("/api/upload", uploadRoutes);
//     app.use("/api/users", userRoutes);
//   })
//   .catch((err) => {
//     console.log("❌ MongoDB Connection Error:", err);
//     process.exit(1);
//   });

// app.get("/", (req, res) => {
//   res.json({
//     message: "YouTube App Backend is running! 🚀",
//     timestamp: new Date().toISOString(),
//   });
// });

// app.get("/api/groups", async (req, res) => {
//   try {
//     const groups = await Group.find();
//     res.json(groups);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching groups" });
//   }
// });

// app.post("/api/groups", async (req, res) => {
//   try {
//     const { name } = req.body;
//     const group = new Group({ name });
//     await group.save();
//     res.status(201).json(group);
//   } catch (err) {
//     res.status(500).json({ message: "Error creating group" });
//   }
// });

// app.get("/api/messages/:group", async (req, res) => {
//   try {
//     const messages = await Message.find({ group: req.params.group }).sort({ createdAt: 1 });
//     res.json(messages);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching messages" });
//   }
// });

// app.post("/api/users/fcm-token", async (req, res) => {
//   const { userId, fcmToken } = req.body;

//   try {
//     await User.findOneAndUpdate(
//       { email: userId },
//       { fcmToken },
//       { upsert: true, new: true }
//     );
//     res.send({ success: true });
//   } catch (err) {
//     console.error("❌ Error saving FCM token:", err);
//     res.status(500).json({ success: false, message: "Error saving FCM token" });
//   }
// });

// io.on("connection", (socket) => {
//   console.log("🟢 User connected:", socket.id);

//   socket.on("joinGroup", (groupId) => {
//     socket.join(groupId);
//     console.log(`👥 User joined group: ${groupId}`);
//   });

//   socket.on("sendMessage", async (data) => {
//     try {
//       const { _id, ...safeData } = data;
//       const newMsg = new Message(safeData);
//       await newMsg.save();
//       io.to(data.group).emit("receiveMessage", newMsg);

//       const tokens = await getGroupMemberTokens(data.group, data.sender);

//       if (tokens.length > 0) {
//         await admin.messaging().sendEachForMulticast({
//           tokens,
//           notification: {
//             title: `📢 New message in ${data.groupName || "a group"}`,
//             body: `${data.senderName}: ${data.message}`,
//           },
//           data: {
//             title: `📢 New message in ${data.groupName || "a group"}`,
//             body: `${data.senderName}: ${data.message}`,
//             messageId: newMsg._id.toString(),
//           },
//         });
//       }
//     } catch (error) {
//       console.error("Socket save error:", error);
//     }
//   });

//   socket.on("deleteMessage", async (msgId) => {
//     try {
//       await Message.findByIdAndDelete(msgId);
//       io.emit("messageDeleted", msgId);
//     } catch (err) {
//       console.error("Delete failed:", err);
//     }
//   });

//   socket.on("editMessage", async (updatedMsg) => {
//     try {
//       const msg = await Message.findByIdAndUpdate(
//         updatedMsg._id,
//         {
//           message: updatedMsg.message,
//           edited: true,
//         },
//         { new: true }
//       );
//       io.emit("messageEdited", msg);
//     } catch (err) {
//       console.error("Edit failed:", err);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("🔴 User disconnected:", socket.id);
//   });
// });

// app.use((err, req, res, next) => {
//   console.error("❌ Server Error:", err);
//   res.status(500).json({ success: false, message: "Internal server error" });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });



// const express = require("express")
// const http = require("http")
// const { Server } = require("socket.io")
// const mongoose = require("mongoose")
// const cors = require("cors")
// require("dotenv").config()

// const admin = require("firebase-admin")
// const serviceAccount = require("./ndroid-app-759be-firebase-adminsdk-fbsvc-24659e4c07.json") // Your Firebase service account file

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// })

// const app = express()
// const server = http.createServer(app)

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// })

// console.log("🚀 Starting YouTube Chat App Backend...")

// // Middleware
// app.use(cors({ origin: "*", credentials: true }))
// app.use(express.json({ limit: "200mb" }))
// app.use(express.urlencoded({ extended: true, limit: "200mb" }))

// app.use((req, res, next) => {
//   console.log(`📡 ${req.method} ${req.path}`)
//   next()
// })

// // Schemas
// const messageSchema = new mongoose.Schema({
//   sender: String,
//   senderName: String,
//   message: String,
//   group: String,
//   createdAt: { type: Date, default: Date.now },
//   seenBy: [String],
//   edited: { type: Boolean, default: false },
// })

// const groupSchema = new mongoose.Schema(
//   {
//     name: String,
//     description: { type: String, default: "" },
//     createdBy: String,
//     members: [String], // ✅ Added members array
//   },
//   { timestamps: true },
// )

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, unique: true, required: true },
//     password: { type: String, required: true },
//     profilePicture: { type: String, default: "" },
//     fcmToken: { type: String, default: "" },
//     groups: [String],
//     isOnline: { type: Boolean, default: false },
//   },
//   { timestamps: true },
// )

// // Models
// const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)
// const Group = mongoose.models.Group || mongoose.model("Group", groupSchema)
// const User = require("./models/user")

// // ✅ Enhanced function to get FCM tokens
// async function getGroupMemberTokens(groupId, senderId) {
//   try {
//     console.log(`🔍 Getting FCM tokens for group: ${groupId}, excluding sender: ${senderId}`)

//     if (!senderId) {
//       console.log("⚠️ No sender ID provided")
//       return []
//     }

//     // Find all users who have this group in their groups array and have FCM token
//     const query = {
//       groups: groupId,
//       fcmToken: { $exists: true, $ne: null, $ne: "" },
//     }

//     // Exclude sender - handle both ObjectId and string
//     if (mongoose.Types.ObjectId.isValid(senderId) && senderId.length === 24) {
//       query._id = { $ne: senderId }
//     } else {
//       query.$and = [{ name: { $ne: senderId } }, { email: { $ne: senderId } }]
//     }

//     const users = await User.find(query)
//     const tokens = users.map((user) => user.fcmToken).filter((token) => token)

//     console.log(`📱 Found ${tokens.length} FCM tokens from ${users.length} users`)
//     console.log(
//       "👥 Users with tokens:",
//       users.map((u) => ({ name: u.name, hasToken: !!u.fcmToken })),
//     )

//     return tokens
//   } catch (err) {
//     console.error("❌ Error getting FCM tokens:", err)
//     return []
//   }
// }

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI || "mongodb://localhost:27017/youtube-chat")
//   .then(() => {
//     console.log("✅ MongoDB Connected")

//     // Import routes
//     const authRoutes = require("./routes/authroutes")
//     const postRoutes = require("./routes/postroutes")
//     const uploadRoutes = require("./routes/upload")
//     const userRoutes = require("./routes/userroutes")

//     app.use("/api/auth", authRoutes)
//     app.use("/api/posts", postRoutes)
//     app.use("/api/upload", uploadRoutes)
//     app.use("/api/users", userRoutes)
//   })
//   .catch((err) => {
//     console.log("❌ MongoDB Connection Error:", err)
//     process.exit(1)
//   })

// // Routes
// app.get("/", (req, res) => {
//   res.json({ message: "YouTube Chat Backend is running! 🚀" })
// })

// app.get("/api/groups", async (req, res) => {
//   try {
//     const groups = await Group.find().sort({ createdAt: -1 })
//     res.json(groups)
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching groups" })
//   }
// })

// app.post("/api/groups", async (req, res) => {
//   try {
//     const { name, createdBy } = req.body
//     const group = new Group({
//       name,
//       createdBy,
//       members: createdBy ? [createdBy] : [],
//     })
//     await group.save()

//     // Add group to creator's groups array
//     if (createdBy) {
//       await User.findByIdAndUpdate(createdBy, { $addToSet: { groups: group._id.toString() } })
//     }

//     res.status(201).json(group)
//   } catch (err) {
//     res.status(500).json({ message: "Error creating group" })
//   }
// })

// app.get("/api/messages/:group", async (req, res) => {
//   try {
//     const messages = await Message.find({ group: req.params.group }).sort({ createdAt: 1 })
//     res.json(messages)
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching messages" })
//   }
// })

// // ✅ FCM token endpoint
// app.post("/api/users/fcm-token", async (req, res) => {
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

// // ✅ Join group endpoint
// app.post("/api/users/join-group", async (req, res) => {
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

//     // Add user to group's members array
//     await Group.findByIdAndUpdate(groupId, { $addToSet: { members: userId } })

//     console.log(`✅ User ${updatedUser.name} added to group`)
//     res.json({ success: true })
//   } catch (err) {
//     console.error("❌ Error joining group:", err)
//     res.status(500).json({ success: false })
//   }
// })

// // Socket.io handlers
// io.on("connection", (socket) => {
//   console.log("🟢 User connected:", socket.id)

//   socket.on("joinGroup", (groupId) => {
//     socket.join(groupId)
//     console.log(`👥 Socket joined group: ${groupId}`)
//   })

//   socket.on("sendMessage", async (data) => {
//     try {
//       console.log("📨 Processing message:", data)

//       // ✅ Validate message data
//       if (!data.sender || !data.message || !data.group) {
//         console.error("❌ Invalid message data - missing required fields")
//         return
//       }

//       if (data.sender === "undefined" || data.sender === "null") {
//         console.error("❌ Invalid sender ID:", data.sender)
//         return
//       }

//       // Clean the data
//       const messageData = {
//         sender: data.sender,
//         senderName: data.senderName || data.sender,
//         message: data.message.trim(),
//         group: data.group,
//         seenBy: data.seenBy && data.seenBy.length > 0 ? data.seenBy.filter((id) => id && id !== "null") : [data.sender],
//         edited: false,
//       }

//       console.log("✅ Cleaned message data:", messageData)

//       const { _id, ...safeData } = messageData
//       const newMsg = new Message(safeData)
//       await newMsg.save()

//       io.to(data.group).emit("receiveMessage", newMsg)
//       console.log(`✅ Message broadcasted to group: ${data.group}`)

//       // ✅ Send notifications
//       console.log(`🔔 Preparing notification for group: ${data.group}`)
//       const tokens = await getGroupMemberTokens(data.group, data.sender)

//       if (tokens.length > 0) {
//         console.log(`📱 Sending notification to ${tokens.length} devices`)

//         const result = await admin.messaging().sendEachForMulticast({
//           tokens,
//           notification: {
//             title: `💬 New Message`,
//             body: `${messageData.senderName}: ${messageData.message}`,
//           },
//           data: {
//             type: "group_message",
//             groupId: data.group,
//             messageId: newMsg._id.toString(),
//             senderName: messageData.senderName,
//             message: messageData.message,
//           },
//           android: {
//             priority: "high",
//             notification: {
//               channelId: "default",
//               sound: "default",
//             },
//           },
//         })

//         console.log(`✅ Notifications sent - Success: ${result.successCount}, Failed: ${result.failureCount}`)
//       } else {
//         console.log("⚠️ No FCM tokens found for group members")
//       }
//     } catch (error) {
//       console.error("❌ Error in sendMessage:", error)
//     }
//   })

//   socket.on("deleteMessage", async (msgId) => {
//     try {
//       await Message.findByIdAndDelete(msgId)
//       io.emit("messageDeleted", msgId)
//     } catch (err) {
//       console.error("❌ Delete failed:", err)
//     }
//   })

//   socket.on("editMessage", async (updatedMsg) => {
//     try {
//       const msg = await Message.findByIdAndUpdate(
//         updatedMsg._id,
//         { message: updatedMsg.message, edited: true },
//         { new: true },
//       )
//       io.emit("messageEdited", msg)
//     } catch (err) {
//       console.error("❌ Edit failed:", err)
//     }
//   })

//   socket.on("disconnect", () => {
//     console.log("🔴 User disconnected:", socket.id)
//   })
// })

// const PORT = process.env.PORT || 5000
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`)
// })






// const express = require("express")
// const http = require("http")
// const { Server } = require("socket.io")
// const mongoose = require("mongoose")
// const cors = require("cors")
// require("dotenv").config()




// const admin = require("firebase-admin")
// const serviceAccount = require("./ndroid-app-759be-firebase-adminsdk-fbsvc-24659e4c07.json")

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// })

// const app = express()
// const server = http.createServer(app)

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
//   // ✅ Optimize Socket.IO for speed
//   pingTimeout: 60000,
//   pingInterval: 25000,
//   upgradeTimeout: 30000,
//   allowUpgrades: true,
//   transports: ["websocket", "polling"],
// })

// console.log("🚀 Starting YouTube Chat App Backend...")

// // Middleware
// app.use(cors({ origin: "*", credentials: true }))
// app.use(express.json({ limit: "200mb" }))
// app.use(express.urlencoded({ extended: true, limit: "200mb" }))
// app.use(cors());

// // Schemas and Models (same as before)
// const messageSchema = new mongoose.Schema({
//   sender: String,
//   senderName: String,
//   message: String,
//   group: String,
//   createdAt: { type: Date, default: Date.now },
//   seenBy: [String],
//   edited: { type: Boolean, default: false },
// })

// const groupSchema = new mongoose.Schema(
//   {
//     name: String,
//     description: { type: String, default: "" },
//     createdBy: String,
//     members: [String],
//   },
//   { timestamps: true },
// )

// const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)
// const Group = mongoose.models.Group || mongoose.model("Group", groupSchema)
// const User = require("./models/user")

// // ✅ Optimized FCM token retrieval with caching
// const tokenCache = new Map()
// const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// async function getGroupMemberTokens(groupId, senderId) {
//   try {
//     const cacheKey = `${groupId}-${senderId}`
//     const cached = tokenCache.get(cacheKey)

//     // Use cache if available and not expired
//     if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
//       console.log(`📱 Using cached tokens: ${cached.tokens.length} tokens`)
//       return cached.tokens
//     }

//     console.log(`🔍 Getting FCM tokens for group: ${groupId}, excluding sender: ${senderId}`)

//     if (!senderId) {
//       console.log("⚠️ No sender ID provided")
//       return []
//     }

//     // Optimized query with indexing
//     const query = {
//       groups: groupId,
//       fcmToken: { $exists: true, $ne: null, $ne: "" },
//     }

//     if (mongoose.Types.ObjectId.isValid(senderId) && senderId.length === 24) {
//       query._id = { $ne: senderId }
//     } else {
//       query.$and = [{ name: { $ne: senderId } }, { email: { $ne: senderId } }]
//     }

//     // ✅ Only select fcmToken field for faster query
//     const users = await User.find(query).select("fcmToken name").lean()
//     const tokens = users.map((user) => user.fcmToken).filter((token) => token)

//     // Cache the result
//     tokenCache.set(cacheKey, {
//       tokens,
//       timestamp: Date.now(),
//     })

//     console.log(`📱 Found ${tokens.length} FCM tokens from ${users.length} users`)
//     return tokens
//   } catch (err) {
//     console.error("❌ Error getting FCM tokens:", err)
//     return []
//   }
// }

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI || "mongodb://localhost:27017/youtube-chat")
//   .then(() => {
//     console.log("✅ MongoDB Connected")

//     const authRoutes = require("./routes/authroutes")
//     const postRoutes = require("./routes/postroutes")
//     const uploadRoutes = require("./routes/upload")
//     const userRoutes = require("./routes/userroutes")

//     app.use("/api/auth", authRoutes)
//     app.use("/api/posts", postRoutes)
//     app.use("/api/upload", uploadRoutes)
//     app.use("/api/users", userRoutes)
//   })
//   .catch((err) => {
//     console.log("❌ MongoDB Connection Error:", err)
//     process.exit(1)
//   })

// // Routes (same as before)
// app.get("/", (req, res) => {
//   res.json({ message: "YouTube Chat Backend is running! 🚀" })
// })

// app.get("/api/groups", async (req, res) => {
//   try {
//     const groups = await Group.find().sort({ createdAt: -1 })
//     res.json(groups)
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching groups" })
//   }
// })
// app.get('/api/users/test', (req, res) => {
//   res.send('✅ Server working!');
// });

// app.post("/api/groups", async (req, res) => {
//   try {
//     const { name, createdBy } = req.body
//     const group = new Group({
//       name,
//       createdBy,
//       members: createdBy ? [createdBy] : [],
//     })
//     await group.save()

//     if (createdBy) {
//       await User.findByIdAndUpdate(createdBy, { $addToSet: { groups: group._id.toString() } })
//     }

//     res.status(201).json(group)
//   } catch (err) {
//     res.status(500).json({ message: "Error creating group" })
//   }
// })

// app.get("/api/messages/:group", async (req, res) => {
//   try {
//     const messages = await Message.find({ group: req.params.group }).sort({ createdAt: 1 })
//     res.json(messages)
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching messages" })
//   }
// })

// app.post("/api/users/fcm-token", async (req, res) => {
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

//     // Clear cache when token is updated
//     for (const [key] of tokenCache) {
//       if (key.includes(userId)) {
//         tokenCache.delete(key)
//       }
//     }

//     console.log(`✅ FCM token saved for user: ${updatedUser.name}`)
//     res.json({ success: true })
//   } catch (err) {
//     console.error("❌ Error saving FCM token:", err)
//     res.status(500).json({ success: false, message: "Error saving FCM token" })
//   }
// })

// app.post("/api/users/join-group", async (req, res) => {
//   const { userId, groupId } = req.body

//   try {
//     console.log(`👥 Adding user ${userId} to group ${groupId}`)

//     if (!userId || !groupId) {
//       return res.status(400).json({ success: false, message: "userId and groupId required" })
//     }

//     const updatedUser = await User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } }, { new: true })

//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: "User not found" })
//     }

//     await Group.findByIdAndUpdate(groupId, { $addToSet: { members: userId } })

//     // Clear cache for this group
//     for (const [key] of tokenCache) {
//       if (key.startsWith(groupId)) {
//         tokenCache.delete(key)
//       }
//     }

//     console.log(`✅ User ${updatedUser.name} added to group`)
//     res.json({ success: true })
//   } catch (err) {
//     console.error("❌ Error joining group:", err)
//     res.status(500).json({ success: false })
//   }
// })

// // ✅ Optimized Socket.io handlers
// io.on("connection", (socket) => {
//   console.log("🟢 User connected:", socket.id)

//   socket.on("joinGroup", (groupId) => {
//     socket.join(groupId)
//     console.log(`👥 Socket joined group: ${groupId}`)
//   })

//   socket.on("sendMessage", async (data) => {
//     const startTime = Date.now()

//     try {
//       console.log("📨 Processing message:", data)

//       if (!data.sender || !data.message || !data.group) {
//         console.error("❌ Invalid message data - missing required fields")
//         return
//       }

//       if (data.sender === "undefined" || data.sender === "null") {
//         console.error("❌ Invalid sender ID:", data.sender)
//         return
//       }

//       const messageData = {
//         sender: data.sender,
//         senderName: data.senderName || data.sender,
//         message: data.message.trim(),
//         group: data.group,
//         seenBy: data.seenBy && data.seenBy.length > 0 ? data.seenBy.filter((id) => id && id !== "null") : [data.sender],
//         edited: false,
//       }

//       console.log("✅ Cleaned message data:", messageData)

//       // ✅ Parallel processing: Save message and get tokens simultaneously
//       const [newMsg, tokens] = await Promise.all([
//         new Message(messageData).save(),
//         getGroupMemberTokens(data.group, data.sender),
//       ])

//       // Broadcast immediately
//       io.to(data.group).emit("receiveMessage", newMsg)
//       console.log(`✅ Message broadcasted to group: ${data.group}`)

//       // ✅ Send notifications asynchronously (don't wait)
//       if (tokens.length > 0) {
//         console.log(`📱 Sending notification to ${tokens.length} devices`)

//         // Don't await this - send notifications in background
//         admin
//           .messaging()
//           .sendEachForMulticast({
//             tokens,
//             notification: {
//               title: `💬 New Message`,
//               body: `${messageData.senderName}: ${messageData.message}`,
//             },
//             data: {
//               type: "group_message",
//               groupId: data.group,
//               messageId: newMsg._id.toString(),
//               senderName: messageData.senderName,
//               message: messageData.message,
//             },
//             android: {
//               priority: "high", // ✅ High priority for faster delivery
//               notification: {
//                 channelId: "default",
//                 sound: "default",
//                 priority: "high",
//                 defaultSound: true,
//                 defaultVibrateTimings: true,
//               },
//               ttl: 3600000, // 1 hour TTL
//             },
//             apns: {
//               headers: {
//                 "apns-priority": "10", // ✅ Immediate delivery
//               },
//               payload: {
//                 aps: {
//                   alert: {
//                     title: `💬 New Message`,
//                     body: `${messageData.senderName}: ${messageData.message}`,
//                   },
//                   sound: "default",
//                   badge: 1,
//                 },
//               },
//             },
//           })
//           .then((result) => {
//             const processingTime = Date.now() - startTime
//             console.log(
//               `✅ Notifications sent in ${processingTime}ms - Success: ${result.successCount}, Failed: ${result.failureCount}`,
//             )

//             if (result.failureCount > 0) {
//               console.log("❌ Failed notifications:")
//               result.responses.forEach((response, index) => {
//                 if (!response.success) {
//                   console.log(`  Token ${index}: ${response.error?.message}`)
//                 }
//               })
//             }
//           })
//           .catch((error) => {
//             console.error("❌ Notification error:", error)
//           })
//       } else {
//         console.log("⚠️ No FCM tokens found for group members")
//       }

//       const totalTime = Date.now() - startTime
//       console.log(`⏱️ Total message processing time: ${totalTime}ms`)
//     } catch (error) {
//       console.error("❌ Error in sendMessage:", error)
//     }
//   })

//   socket.on("deleteMessage", async (msgId) => {
//     try {
//       await Message.findByIdAndDelete(msgId)
//       io.emit("messageDeleted", msgId)
//     } catch (err) {
//       console.error("❌ Delete failed:", err)
//     }
//   })

//   socket.on("editMessage", async (updatedMsg) => {
//     try {
//       const msg = await Message.findByIdAndUpdate(
//         updatedMsg._id,
//         { message: updatedMsg.message, edited: true },
//         { new: true },
//       )
//       io.emit("messageEdited", msg)
//     } catch (err) {
//       console.error("❌ Edit failed:", err)
//     }
//   })

//   socket.on("disconnect", () => {
//     console.log("🔴 User disconnected:", socket.id)
//   })
// })

// const PORT = process.env.PORT || 5000
// // server.listen(PORT, () => {
// //   console.log(`🚀 Server running on port ${PORT}`)
// // })
// server.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
// })







// const express = require("express")
// const http = require("http")
// const { Server } = require("socket.io")
// const mongoose = require("mongoose")
// const cors = require("cors")
// require("dotenv").config()

// const admin = require("firebase-admin")
// const serviceAccount = require("./ndroid-app-759be-firebase-adminsdk-fbsvc-24659e4c07.json")

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// })

// const app = express()
// const server = http.createServer(app)
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
//   // ✅ Optimize Socket.IO for speed
//   pingTimeout: 60000,
//   pingInterval: 25000,
//   upgradeTimeout: 30000,
//   allowUpgrades: true,
//   transports: ["websocket", "polling"],
// })

// console.log("🚀 Starting YouTube Chat App Backend...")

// // Middleware
// app.use(cors({ origin: "*", credentials: true }))
// app.use(express.json({ limit: "200mb" }))
// app.use(express.urlencoded({ extended: true, limit: "200mb" }))
// app.use(cors())

// // Schemas and Models (same as before)
// const messageSchema = new mongoose.Schema({
//   sender: String,
//   senderName: String,
//   message: String,
//   group: String,
//   createdAt: { type: Date, default: Date.now },
//   seenBy: [String],
//   edited: { type: Boolean, default: false },
// })

// const groupSchema = new mongoose.Schema(
//   {
//     name: String,
//     description: { type: String, default: "" },
//     createdBy: String,
//     members: [String],
//   },
//   { timestamps: true },
// )

// const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)
// const Group = mongoose.models.Group || mongoose.model("Group", groupSchema)
// const User = require("./models/user")

// // ✅ Optimized FCM token retrieval with caching
// const tokenCache = new Map()
// const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// async function getGroupMemberTokens(groupId, senderId) {
//   try {
//     const cacheKey = `${groupId}-${senderId}`
//     const cached = tokenCache.get(cacheKey)

//     // Use cache if available and not expired
//     if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
//       console.log(`📱 Using cached tokens: ${cached.tokens.length} tokens`)
//       return cached.tokens
//     }

//     console.log(`🔍 Getting FCM tokens for group: ${groupId}, excluding sender: ${senderId}`)

//     if (!senderId) {
//       console.log("⚠️ No sender ID provided")
//       return []
//     }

//     // Optimized query with indexing
//     const query = {
//       groups: groupId,
//       fcmToken: { $exists: true, $ne: null, $ne: "" },
//     }

//     if (mongoose.Types.ObjectId.isValid(senderId) && senderId.length === 24) {
//       query._id = { $ne: senderId }
//     } else {
//       query.$and = [{ name: { $ne: senderId } }, { email: { $ne: senderId } }]
//     }

//     // ✅ Only select fcmToken field for faster query
//     const users = await User.find(query).select("fcmToken name").lean()
//     const tokens = users.map((user) => user.fcmToken).filter((token) => token)

//     // Cache the result
//     tokenCache.set(cacheKey, {
//       tokens,
//       timestamp: Date.now(),
//     })

//     console.log(`📱 Found ${tokens.length} FCM tokens from ${users.length} users`)
//     return tokens
//   } catch (err) {
//     console.error("❌ Error getting FCM tokens:", err)
//     return []
//   }
// }

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI || "mongodb://localhost:27017/youtube-chat")
//   .then(() => {
//     console.log("✅ MongoDB Connected")

//     const authRoutes = require("./routes/authroutes")
//     const postRoutes = require("./routes/postroutes")
//     const uploadRoutes = require("./routes/upload")
//     const userRoutes = require("./routes/userroutes")

//     app.use("/api/auth", authRoutes)
//     app.use("/api/posts", postRoutes)
//     app.use("/api/upload", uploadRoutes)
//     app.use("/api/users", userRoutes)
//   })
//   .catch((err) => {
//     console.log("❌ MongoDB Connection Error:", err)
//     process.exit(1)
//   })

// // Routes (same as before)
// app.get("/", (req, res) => {
//   res.json({ message: "YouTube Chat Backend is running! 🚀" })
// })

// app.get("/api/groups", async (req, res) => {
//   try {
//     const groups = await Group.find().sort({ createdAt: -1 })
//     res.json(groups)
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching groups" })
//   }
// })

// app.get("/api/users/test", (req, res) => {
//   res.send("✅ Server working!")
// })

// // ✅ NEW CREATORS ROUTES - Added here
// app.get("/api/new-creators", async (req, res) => {
//   try {
//     const { page = 1, limit = 20 } = req.query

//     console.log("🌟 Fetching new creators posts...")

//     // ✅ Define criteria for "new creators"
//     const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)

//     // Get users who joined in last 3 months
//     const newCreators = await User.find({
//       createdAt: { $gte: threeMonthsAgo },
//     }).select("_id name profilePicture createdAt")

//     if (newCreators.length === 0) {
//       return res.json({ success: true, posts: [], totalPages: 0, creators: [] })
//     }

//     const newCreatorIds = newCreators.map((user) => user._id)

//     // Get posts from these new creators
//     const Post = require("./models/post") // Assuming you have a Post model

//     const posts = await Post.find({
//       userId: { $in: newCreatorIds },
//       $or: [
//         { videoUrl: { $exists: true, $ne: null } },
//         { imageUrl: { $exists: true, $ne: null } },
//         { caption: { $exists: true, $ne: null } },
//       ],
//     })
//       .populate("userId", "name profilePicture createdAt")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number.parseInt(limit))

//     // Filter posts by engagement (low engagement = new creators)
//     const filteredPosts = posts.filter((post) => {
//       const totalEngagement = (post.likes || 0) + (post.comments?.length || 0)
//       return totalEngagement < 50 // Less than 50 total engagement
//     })

//     const totalPosts = await Post.countDocuments({
//       userId: { $in: newCreatorIds },
//     })

//     const totalPages = Math.ceil(totalPosts / limit)

//     res.json({
//       success: true,
//       posts: filteredPosts,
//       currentPage: Number.parseInt(page),
//       totalPages,
//       totalPosts: filteredPosts.length,
//       creators: newCreators.length,
//     })
//   } catch (error) {
//     console.error("❌ Error fetching new creators:", error)
//     res.status(500).json({ success: false, error: "Failed to fetch new creators" })
//   }
// })

// // ✅ NEW CREATORS STATS
// app.get("/api/new-creators/stats", async (req, res) => {
//   try {
//     const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)

//     const totalNewCreators = await User.countDocuments({
//       createdAt: { $gte: threeMonthsAgo },
//     })

//     const Post = require("./models/post")
//     const newCreators = await User.find({
//       createdAt: { $gte: threeMonthsAgo },
//     }).select("_id")

//     const newCreatorIds = newCreators.map((user) => user._id)

//     const totalNewPosts = await Post.countDocuments({
//       userId: { $in: newCreatorIds },
//     })

//     res.json({
//       success: true,
//       stats: {
//         totalNewCreators,
//         totalNewPosts,
//         avgPostsPerCreator: totalNewCreators > 0 ? Math.round(totalNewPosts / totalNewCreators) : 0,
//       },
//     })
//   } catch (error) {
//     console.error("❌ Error fetching new creators stats:", error)
//     res.status(500).json({ success: false, error: "Failed to fetch stats" })
//   }
// })

// app.post("/api/groups", async (req, res) => {
//   try {
//     const { name, createdBy } = req.body

//     const group = new Group({
//       name,
//       createdBy,
//       members: createdBy ? [createdBy] : [],
//     })

//     await group.save()

//     if (createdBy) {
//       await User.findByIdAndUpdate(createdBy, { $addToSet: { groups: group._id.toString() } })
//     }

//     res.status(201).json(group)
//   } catch (err) {
//     res.status(500).json({ message: "Error creating group" })
//   }
// })

// app.get("/api/messages/:group", async (req, res) => {
//   try {
//     const messages = await Message.find({ group: req.params.group }).sort({ createdAt: 1 })
//     res.json(messages)
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching messages" })
//   }
// })

// app.post("/api/users/fcm-token", async (req, res) => {
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

//     // Clear cache when token is updated
//     for (const [key] of tokenCache) {
//       if (key.includes(userId)) {
//         tokenCache.delete(key)
//       }
//     }

//     console.log(`✅ FCM token saved for user: ${updatedUser.name}`)
//     res.json({ success: true })
//   } catch (err) {
//     console.error("❌ Error saving FCM token:", err)
//     res.status(500).json({ success: false, message: "Error saving FCM token" })
//   }
// })

// app.post("/api/users/join-group", async (req, res) => {
//   const { userId, groupId } = req.body

//   try {
//     console.log(`👥 Adding user ${userId} to group ${groupId}`)

//     if (!userId || !groupId) {
//       return res.status(400).json({ success: false, message: "userId and groupId required" })
//     }

//     const updatedUser = await User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } }, { new: true })

//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: "User not found" })
//     }

//     await Group.findByIdAndUpdate(groupId, { $addToSet: { members: userId } })

//     // Clear cache for this group
//     for (const [key] of tokenCache) {
//       if (key.startsWith(groupId)) {
//         tokenCache.delete(key)
//       }
//     }

//     console.log(`✅ User ${updatedUser.name} added to group`)
//     res.json({ success: true })
//   } catch (err) {
//     console.error("❌ Error joining group:", err)
//     res.status(500).json({ success: false })
//   }
// })

// // ✅ Optimized Socket.io handlers (same as before)
// io.on("connection", (socket) => {
//   console.log("🟢 User connected:", socket.id)

//   socket.on("joinGroup", (groupId) => {
//     socket.join(groupId)
//     console.log(`👥 Socket joined group: ${groupId}`)
//   })

//   socket.on("sendMessage", async (data) => {
//     const startTime = Date.now()

//     try {
//       console.log("📨 Processing message:", data)

//       if (!data.sender || !data.message || !data.group) {
//         console.error("❌ Invalid message data - missing required fields")
//         return
//       }

//       if (data.sender === "undefined" || data.sender === "null") {
//         console.error("❌ Invalid sender ID:", data.sender)
//         return
//       }

//       const messageData = {
//         sender: data.sender,
//         senderName: data.senderName || data.sender,
//         message: data.message.trim(),
//         group: data.group,
//         seenBy: data.seenBy && data.seenBy.length > 0 ? data.seenBy.filter((id) => id && id !== "null") : [data.sender],
//         edited: false,
//       }

//       console.log("✅ Cleaned message data:", messageData)

//       // ✅ Parallel processing: Save message and get tokens simultaneously
//       const [newMsg, tokens] = await Promise.all([
//         new Message(messageData).save(),
//         getGroupMemberTokens(data.group, data.sender),
//       ])

//       // Broadcast immediately
//       io.to(data.group).emit("receiveMessage", newMsg)
//       console.log(`✅ Message broadcasted to group: ${data.group}`)

//       // ✅ Send notifications asynchronously (don't wait)
//       if (tokens.length > 0) {
//         console.log(`📱 Sending notification to ${tokens.length} devices`)

//         // Don't await this - send notifications in background
//         admin
//           .messaging()
//           .sendEachForMulticast({
//             tokens,
//             notification: {
//               title: `💬 New Message`,
//               body: `${messageData.senderName}: ${messageData.message}`,
//             },
//             data: {
//               type: "group_message",
//               groupId: data.group,
//               messageId: newMsg._id.toString(),
//               senderName: messageData.senderName,
//               message: messageData.message,
//             },
//             android: {
//               priority: "high", // ✅ High priority for faster delivery
//               notification: {
//                 channelId: "default",
//                 sound: "default",
//                 priority: "high",
//                 defaultSound: true,
//                 defaultVibrateTimings: true,
//               },
//               ttl: 3600000, // 1 hour TTL
//             },
//             apns: {
//               headers: {
//                 "apns-priority": "10", // ✅ Immediate delivery
//               },
//               payload: {
//                 aps: {
//                   alert: {
//                     title: `💬 New Message`,
//                     body: `${messageData.senderName}: ${messageData.message}`,
//                   },
//                   sound: "default",
//                   badge: 1,
//                 },
//               },
//             },
//           })
//           .then((result) => {
//             const processingTime = Date.now() - startTime
//             console.log(
//               `✅ Notifications sent in ${processingTime}ms - Success: ${result.successCount}, Failed: ${result.failureCount}`,
//             )

//             if (result.failureCount > 0) {
//               console.log("❌ Failed notifications:")
//               result.responses.forEach((response, index) => {
//                 if (!response.success) {
//                   console.log(`  Token ${index}: ${response.error?.message}`)
//                 }
//               })
//             }
//           })
//           .catch((error) => {
//             console.error("❌ Notification error:", error)
//           })
//       } else {
//         console.log("⚠️ No FCM tokens found for group members")
//       }

//       const totalTime = Date.now() - startTime
//       console.log(`⏱️ Total message processing time: ${totalTime}ms`)
//     } catch (error) {
//       console.error("❌ Error in sendMessage:", error)
//     }
//   })

//   socket.on("deleteMessage", async (msgId) => {
//     try {
//       await Message.findByIdAndDelete(msgId)
//       io.emit("messageDeleted", msgId)
//     } catch (err) {
//       console.error("❌ Delete failed:", err)
//     }
//   })

//   socket.on("editMessage", async (updatedMsg) => {
//     try {
//       const msg = await Message.findByIdAndUpdate(
//         updatedMsg._id,
//         { message: updatedMsg.message, edited: true },
//         { new: true },
//       )

//       io.emit("messageEdited", msg)
//     } catch (err) {
//       console.error("❌ Edit failed:", err)
//     }
//   })

//   socket.on("disconnect", () => {
//     console.log("🔴 User disconnected:", socket.id)
//   })
// })

// const PORT = process.env.PORT || 5000

// server.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
// })










// const express = require("express")
// const http = require("http")
// const { Server } = require("socket.io")
// const mongoose = require("mongoose")
// const cors = require("cors")
// require("dotenv").config()

// const admin = require("firebase-admin")
// const serviceAccount = require("./ndroid-app-759be-firebase-adminsdk-fbsvc-24659e4c07.json")

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// })

// const app = express()
// const server = http.createServer(app)
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
//   pingTimeout: 60000,
//   pingInterval: 25000,
//   upgradeTimeout: 30000,
//   allowUpgrades: true,
//   transports: ["websocket", "polling"],
// })

// console.log("🚀 Starting YouTube Chat App Backend...")

// // Middleware
// app.use(cors({ origin: "*", credentials: true }))
// app.use(express.json({ limit: "200mb" }))
// app.use(express.urlencoded({ extended: true, limit: "200mb" }))

// // Schemas and Models
// const messageSchema = new mongoose.Schema({
//   sender: String,
//   senderName: String,
//   message: String,
//   group: String,
//   createdAt: { type: Date, default: Date.now },
//   seenBy: [String],
//   edited: { type: Boolean, default: false },
// })

// const groupSchema = new mongoose.Schema(
//   {
//     name: String,
//     description: { type: String, default: "" },
//     createdBy: String,
//     members: [String],
//   },
//   { timestamps: true },
// )

// const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)
// const Group = mongoose.models.Group || mongoose.model("Group", groupSchema)
// const User = require("./models/user")
// const Post = require("./models/post")

// // FCM token cache
// const tokenCache = new Map()
// const CACHE_DURATION = 5 * 60 * 1000

// async function getGroupMemberTokens(groupId, senderId) {
//   try {
//     const cacheKey = `${groupId}-${senderId}`
//     const cached = tokenCache.get(cacheKey)

//     if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
//       console.log(`📱 Using cached tokens: ${cached.tokens.length} tokens`)
//       return cached.tokens
//     }

//     console.log(`🔍 Getting FCM tokens for group: ${groupId}, excluding sender: ${senderId}`)

//     if (!senderId) {
//       console.log("⚠️ No sender ID provided")
//       return []
//     }

//     const query = {
//       groups: groupId,
//       fcmToken: { $exists: true, $ne: null, $ne: "" },
//     }

//     if (mongoose.Types.ObjectId.isValid(senderId) && senderId.length === 24) {
//       query._id = { $ne: senderId }
//     } else {
//       query.$and = [{ name: { $ne: senderId } }, { email: { $ne: senderId } }]
//     }

//     const users = await User.find(query).select("fcmToken name").lean()
//     const tokens = users.map((user) => user.fcmToken).filter((token) => token)

//     tokenCache.set(cacheKey, {
//       tokens,
//       timestamp: Date.now(),
//     })

//     console.log(`📱 Found ${tokens.length} FCM tokens from ${users.length} users`)
//     return tokens
//   } catch (err) {
//     console.error("❌ Error getting FCM tokens:", err)
//     return []
//   }
// }

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI || "mongodb://localhost:27017/youtube-chat")
//   .then(() => {
//     console.log("✅ MongoDB Connected")

//     const authRoutes = require("./routes/authroutes")
//     const postRoutes = require("./routes/postroutes")
//     const uploadRoutes = require("./routes/upload")
//     const userRoutes = require("./routes/userroutes")

//     app.use("/api/auth", authRoutes)
//     app.use("/api/posts", postRoutes)
//     app.use("/api/upload", uploadRoutes)
//     app.use("/api/users", userRoutes)
//   })
//   .catch((err) => {
//     console.log("❌ MongoDB Connection Error:", err)
//     process.exit(1)
//   })

// // Basic Routes
// app.get("/", (req, res) => {
//   res.json({ message: "YouTube Chat Backend is running! 🚀" })
// })

// app.get("/api/users/test", (req, res) => {
//   res.send("✅ Server working!")
// })

// // ✅ NEW CREATORS ROUTES

// // Get New Creators Posts
// app.get("/api/posts/new-creators", async (req, res) => {
//   try {
//     const { page = 1, limit = 20 } = req.query

//     console.log("🌟 Fetching new creators posts...")

//     // Get users who joined in last 3 months
//     const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)

//     const newCreators = await User.find({
//       createdAt: { $gte: threeMonthsAgo },
//     }).select("_id")

//     if (newCreators.length === 0) {
//       return res.json({ success: true, posts: [], totalPages: 0, creators: 0 })
//     }

//     const newCreatorIds = newCreators.map((user) => user._id)

//     // Get posts from new creators with low engagement
//     const posts = await Post.find({
//       userId: { $in: newCreatorIds },
//       likes: { $lt: 50 }, // Less than 50 likes
//     })
//       .populate("userId", "name profilePicture createdAt")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number.parseInt(limit))

//     const totalPosts = await Post.countDocuments({
//       userId: { $in: newCreatorIds },
//       likes: { $lt: 50 },
//     })

//     const totalPages = Math.ceil(totalPosts / limit)

//     console.log(`✅ Found ${posts.length} posts from new creators`)

//     res.json({
//       success: true,
//       posts,
//       currentPage: Number.parseInt(page),
//       totalPages,
//       totalPosts,
//       creators: newCreators.length,
//     })
//   } catch (error) {
//     console.error("❌ Error fetching new creators posts:", error)
//     res.status(500).json({ success: false, error: error.message })
//   }
// })

// // Get New Creators Stats
// app.get("/api/posts/stats", async (req, res) => {
//   try {
//     console.log("📊 Fetching posts stats...")

//     // Get total posts
//     const totalPosts = await Post.countDocuments()

//     // Get posts from last 30 days
//     const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
//     const recentPosts = await Post.countDocuments({
//       createdAt: { $gte: thirtyDaysAgo },
//     })

//     // Get total likes across all posts
//     const likesResult = await Post.aggregate([
//       {
//         $group: {
//           _id: null,
//           totalLikes: { $sum: "$likes" },
//         },
//       },
//     ])

//     const totalLikes = likesResult[0]?.totalLikes || 0

//     // Get new creators (users joined in last 3 months)
//     const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)
//     const newCreators = await User.countDocuments({
//       createdAt: { $gte: threeMonthsAgo },
//     })

//     // Get posts from new creators
//     const newCreatorUsers = await User.find({
//       createdAt: { $gte: threeMonthsAgo },
//     }).select("_id")

//     const newCreatorIds = newCreatorUsers.map((user) => user._id)

//     const newCreatorPosts = await Post.countDocuments({
//       userId: { $in: newCreatorIds },
//     })

//     const stats = {
//       totalPosts,
//       recentPosts,
//       totalLikes,
//       newCreators,
//       newCreatorPosts,
//       avgLikesPerPost: totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0,
//     }

//     console.log("✅ Stats calculated:", stats)

//     res.json({
//       success: true,
//       stats,
//     })
//   } catch (error) {
//     console.error("❌ Error fetching stats:", error)
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch stats",
//     })
//   }
// })

// // Groups Routes
// app.get("/api/groups", async (req, res) => {
//   try {
//     const groups = await Group.find().sort({ createdAt: -1 })
//     res.json(groups)
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching groups" })
//   }
// })

// app.post("/api/groups", async (req, res) => {
//   try {
//     const { name, createdBy } = req.body

//     const group = new Group({
//       name,
//       createdBy,
//       members: createdBy ? [createdBy] : [],
//     })

//     await group.save()

//     if (createdBy) {
//       await User.findByIdAndUpdate(createdBy, { $addToSet: { groups: group._id.toString() } })
//     }

//     res.status(201).json(group)
//   } catch (err) {
//     res.status(500).json({ message: "Error creating group" })
//   }
// })

// app.get("/api/messages/:group", async (req, res) => {
//   try {
//     const messages = await Message.find({ group: req.params.group }).sort({ createdAt: 1 })
//     res.json(messages)
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching messages" })
//   }
// })

// app.post("/api/users/fcm-token", async (req, res) => {
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

//     for (const [key] of tokenCache) {
//       if (key.includes(userId)) {
//         tokenCache.delete(key)
//       }
//     }

//     console.log(`✅ FCM token saved for user: ${updatedUser.name}`)
//     res.json({ success: true })
//   } catch (err) {
//     console.error("❌ Error saving FCM token:", err)
//     res.status(500).json({ success: false, message: "Error saving FCM token" })
//   }
// })

// app.post("/api/users/join-group", async (req, res) => {
//   const { userId, groupId } = req.body

//   try {
//     console.log(`👥 Adding user ${userId} to group ${groupId}`)

//     if (!userId || !groupId) {
//       return res.status(400).json({ success: false, message: "userId and groupId required" })
//     }

//     const updatedUser = await User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } }, { new: true })

//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: "User not found" })
//     }

//     await Group.findByIdAndUpdate(groupId, { $addToSet: { members: userId } })

//     for (const [key] of tokenCache) {
//       if (key.startsWith(groupId)) {
//         tokenCache.delete(key)
//       }
//     }

//     console.log(`✅ User ${updatedUser.name} added to group`)
//     res.json({ success: true })
//   } catch (err) {
//     console.error("❌ Error joining group:", err)
//     res.status(500).json({ success: false })
//   }
// })

// // Socket.io handlers
// io.on("connection", (socket) => {
//   console.log("🟢 User connected:", socket.id)

//   socket.on("joinGroup", (groupId) => {
//     socket.join(groupId)
//     console.log(`👥 Socket joined group: ${groupId}`)
//   })

//   socket.on("sendMessage", async (data) => {
//     const startTime = Date.now()

//     try {
//       console.log("📨 Processing message:", data)

//       if (!data.sender || !data.message || !data.group) {
//         console.error("❌ Invalid message data - missing required fields")
//         return
//       }

//       if (data.sender === "undefined" || data.sender === "null") {
//         console.error("❌ Invalid sender ID:", data.sender)
//         return
//       }

//       const messageData = {
//         sender: data.sender,
//         senderName: data.senderName || data.sender,
//         message: data.message.trim(),
//         group: data.group,
//         seenBy: data.seenBy && data.seenBy.length > 0 ? data.seenBy.filter((id) => id && id !== "null") : [data.sender],
//         edited: false,
//       }

//       console.log("✅ Cleaned message data:", messageData)

//       const [newMsg, tokens] = await Promise.all([
//         new Message(messageData).save(),
//         getGroupMemberTokens(data.group, data.sender),
//       ])

//       io.to(data.group).emit("receiveMessage", newMsg)
//       console.log(`✅ Message broadcasted to group: ${data.group}`)

//       if (tokens.length > 0) {
//         console.log(`📱 Sending notification to ${tokens.length} devices`)

//         admin
//           .messaging()
//           .sendEachForMulticast({
//             tokens,
//             notification: {
//               title: `💬 New Message`,
//               body: `${messageData.senderName}: ${messageData.message}`,
//             },
//             data: {
//               type: "group_message",
//               groupId: data.group,
//               messageId: newMsg._id.toString(),
//               senderName: messageData.senderName,
//               message: messageData.message,
//             },
//             android: {
//               priority: "high",
//               notification: {
//                 channelId: "default",
//                 sound: "default",
//                 priority: "high",
//                 defaultSound: true,
//                 defaultVibrateTimings: true,
//               },
//               ttl: 3600000,
//             },
//             apns: {
//               headers: {
//                 "apns-priority": "10",
//               },
//               payload: {
//                 aps: {
//                   alert: {
//                     title: `💬 New Message`,
//                     body: `${messageData.senderName}: ${messageData.message}`,
//                   },
//                   sound: "default",
//                   badge: 1,
//                 },
//               },
//             },
//           })
//           .then((result) => {
//             const processingTime = Date.now() - startTime
//             console.log(
//               `✅ Notifications sent in ${processingTime}ms - Success: ${result.successCount}, Failed: ${result.failureCount}`,
//             )

//             if (result.failureCount > 0) {
//               console.log("❌ Failed notifications:")
//               result.responses.forEach((response, index) => {
//                 if (!response.success) {
//                   console.log(`  Token ${index}: ${response.error?.message}`)
//                 }
//               })
//             }
//           })
//           .catch((error) => {
//             console.error("❌ Notification error:", error)
//           })
//       } else {
//         console.log("⚠️ No FCM tokens found for group members")
//       }

//       const totalTime = Date.now() - startTime
//       console.log(`⏱️ Total message processing time: ${totalTime}ms`)
//     } catch (error) {
//       console.error("❌ Error in sendMessage:", error)
//     }
//   })

//   socket.on("deleteMessage", async (msgId) => {
//     try {
//       await Message.findByIdAndDelete(msgId)
//       io.emit("messageDeleted", msgId)
//     } catch (err) {
//       console.error("❌ Delete failed:", err)
//     }
//   })

//   socket.on("editMessage", async (updatedMsg) => {
//     try {
//       const msg = await Message.findByIdAndUpdate(
//         updatedMsg._id,
//         { message: updatedMsg.message, edited: true },
//         { new: true },
//       )

//       io.emit("messageEdited", msg)
//     } catch (err) {
//       console.error("❌ Edit failed:", err)
//     }
//   })

//   socket.on("disconnect", () => {
//     console.log("🔴 User disconnected:", socket.id)
//   })
// })

// const PORT = process.env.PORT || 5000

// server.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
// })




const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const admin = require("firebase-admin")
const serviceAccount = require("./ndroid-app-759be-firebase-adminsdk-fbsvc-24659e4c07.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowUpgrades: true,
  transports: ["websocket", "polling"],
})

console.log("🚀 Starting YouTube Chat App Backend...")

// Middleware
app.use(cors({ origin: "*", credentials: true }))
app.use(express.json({ limit: "200mb" }))
app.use(express.urlencoded({ extended: true, limit: "200mb" }))

// Schemas and Models
const messageSchema = new mongoose.Schema({
  sender: String,
  senderName: String,
  message: String,
  group: String,
  createdAt: { type: Date, default: Date.now },
  seenBy: [String],
  edited: { type: Boolean, default: false },
})

const groupSchema = new mongoose.Schema(
  {
    name: String,
    description: { type: String, default: "" },
    createdBy: String,
    members: [String],
  },
  { timestamps: true },
)

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)
const Group = mongoose.models.Group || mongoose.model("Group", groupSchema)
const User = require("./models/user")
const Post = require("./models/post")

// FCM token cache
const tokenCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000

async function getGroupMemberTokens(groupId, senderId) {
  try {
    const cacheKey = `${groupId}-${senderId}`
    const cached = tokenCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📱 Using cached tokens: ${cached.tokens.length} tokens`)
      return cached.tokens
    }

    console.log(`🔍 Getting FCM tokens for group: ${groupId}, excluding sender: ${senderId}`)

    if (!senderId) {
      console.log("⚠️ No sender ID provided")
      return []
    }

    const query = {
      groups: groupId,
      fcmToken: { $exists: true, $ne: null, $ne: "" },
    }

    if (mongoose.Types.ObjectId.isValid(senderId) && senderId.length === 24) {
      query._id = { $ne: senderId }
    } else {
      query.$and = [{ name: { $ne: senderId } }, { email: { $ne: senderId } }]
    }

    const users = await User.find(query).select("fcmToken name").lean()
    const tokens = users.map((user) => user.fcmToken).filter((token) => token)

    tokenCache.set(cacheKey, {
      tokens,
      timestamp: Date.now(),
    })

    console.log(`📱 Found ${tokens.length} FCM tokens from ${users.length} users`)
    return tokens
  } catch (err) {
    console.error("❌ Error getting FCM tokens:", err)
    return []
  }
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/youtube-chat")
  .then(() => {
    console.log("✅ MongoDB Connected")

    const authRoutes = require("./routes/authroutes")
    const postRoutes = require("./routes/postroutes")
    const uploadRoutes = require("./routes/upload")
    const userRoutes = require("./routes/userroutes")
    

    app.use("/api/auth", authRoutes)
    app.use("/api/posts", postRoutes)
    app.use("/api/upload", uploadRoutes)
    app.use("/api/users", userRoutes)
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err)
    process.exit(1)
  })

// Basic Routes
app.get("/", (req, res) => {
  res.json({ message: "YouTube Chat Backend is running! 🚀" })
})

app.get("/api/users/test", (req, res) => {
  res.send("✅ Server working!")
})

// ✅ NEW CREATORS ROUTES

// Get New Creators Posts
app.get("/api/posts/new-creators", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    console.log("🌟 Fetching new creators posts...")

    // Get users who joined in last 3 months
    const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)

    const newCreators = await User.find({
      createdAt: { $gte: threeMonthsAgo },
    }).select("_id")

    if (newCreators.length === 0) {
      return res.json({ success: true, posts: [], totalPages: 0, creators: 0 })
    }

    const newCreatorIds = newCreators.map((user) => user._id)

    // ✅ FIXED: Proper populate with all user fields
    const posts = await Post.find({
      userId: { $in: newCreatorIds },
      likes: { $lt: 50 }, // Less than 50 likes
    })
      .populate("userId", "name email profilePicture createdAt") // ✅ Include all needed fields
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number.parseInt(limit))

    const totalPosts = await Post.countDocuments({
      userId: { $in: newCreatorIds },
      likes: { $lt: 50 },
    })

    const totalPages = Math.ceil(totalPosts / limit)

    console.log(`✅ Found ${posts.length} posts from new creators`)

    // ✅ DEBUG: Log first post structure
    if (posts.length > 0) {
      console.log("📝 Sample post structure:", {
        _id: posts[0]._id,
        userId: posts[0].userId,
        userIdType: typeof posts[0].userId,
      })
    }

    res.json({
      success: true,
      posts,
      currentPage: Number.parseInt(page),
      totalPages,
      totalPosts,
      creators: newCreators.length,
    })
  } catch (error) {
    console.error("❌ Error fetching new creators posts:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get New Creators Stats
app.get("/api/posts/stats", async (req, res) => {
  try {
    console.log("📊 Fetching posts stats...")

    // Get total posts
    const totalPosts = await Post.countDocuments()

    // Get posts from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentPosts = await Post.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    })

    // Get total likes across all posts
    const likesResult = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalLikes: { $sum: "$likes" },
        },
      },
    ])

    const totalLikes = likesResult[0]?.totalLikes || 0

    // Get new creators (users joined in last 3 months)
    const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)
    const newCreators = await User.countDocuments({
      createdAt: { $gte: threeMonthsAgo },
    })

    // Get posts from new creators
    const newCreatorUsers = await User.find({
      createdAt: { $gte: threeMonthsAgo },
    }).select("_id")

    const newCreatorIds = newCreatorUsers.map((user) => user._id)

    const newCreatorPosts = await Post.countDocuments({
      userId: { $in: newCreatorIds },
    })

    const stats = {
      totalPosts,
      recentPosts,
      totalLikes,
      newCreators,
      newCreatorPosts,
      avgLikesPerPost: totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0,
    }

    console.log("✅ Stats calculated:", stats)

    res.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("❌ Error fetching stats:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch stats",
    })
  }
})

// Groups Routes
app.get("/api/groups", async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 })
    res.json(groups)
  } catch (err) {
    res.status(500).json({ message: "Error fetching groups" })
  }
})

app.post("/api/groups", async (req, res) => {
  try {
    const { name, createdBy } = req.body

    const group = new Group({
      name,
      createdBy,
      members: createdBy ? [createdBy] : [],
    })

    await group.save()

    if (createdBy) {
      await User.findByIdAndUpdate(createdBy, { $addToSet: { groups: group._id.toString() } })
    }

    res.status(201).json(group)
  } catch (err) {
    res.status(500).json({ message: "Error creating group" })
  }
})

app.get("/api/messages/:group", async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.group }).sort({ createdAt: 1 })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" })
  }
})

app.post("/api/users/fcm-token", async (req, res) => {
  const { userId, fcmToken } = req.body

  try {
    console.log(`💾 Saving FCM token for user: ${userId}`)

    if (!userId || !fcmToken) {
      return res.status(400).json({ success: false, message: "userId and fcmToken required" })
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { fcmToken }, { new: true })

    if (!updatedUser) {
      console.log(`❌ User not found: ${userId}`)
      return res.status(404).json({ success: false, message: "User not found" })
    }

    for (const [key] of tokenCache) {
      if (key.includes(userId)) {
        tokenCache.delete(key)
      }
    }

    console.log(`✅ FCM token saved for user: ${updatedUser.name}`)
    res.json({ success: true })
  } catch (err) {
    console.error("❌ Error saving FCM token:", err)
    res.status(500).json({ success: false, message: "Error saving FCM token" })
  }
})

app.post("/api/users/join-group", async (req, res) => {
  const { userId, groupId } = req.body

  try {
    console.log(`👥 Adding user ${userId} to group ${groupId}`)

    if (!userId || !groupId) {
      return res.status(400).json({ success: false, message: "userId and groupId required" })
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } }, { new: true })

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    await Group.findByIdAndUpdate(groupId, { $addToSet: { members: userId } })

    for (const [key] of tokenCache) {
      if (key.startsWith(groupId)) {
        tokenCache.delete(key)
      }
    }

    console.log(`✅ User ${updatedUser.name} added to group`)
    res.json({ success: true })
  } catch (err) {
    console.error("❌ Error joining group:", err)
    res.status(500).json({ success: false })
  }
})

// ✅ ALSO FIX: Regular posts route to ensure populate
app.get("/api/posts/", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const posts = await Post.find()
      .populate("userId", "name email profilePicture createdAt") // ✅ Add populate here too
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number.parseInt(limit))

    const totalPosts = await Post.countDocuments()
    const totalPages = Math.ceil(totalPosts / limit)

    res.json({
      success: true,
      posts,
      currentPage: Number.parseInt(page),
      totalPages,
      totalPosts,
    })
  } catch (error) {
    console.error("❌ Error fetching posts:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Socket.io handlers
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id)

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId)
    console.log(`👥 Socket joined group: ${groupId}`)
  })

  socket.on("sendMessage", async (data) => {
    const startTime = Date.now()

    try {
      console.log("📨 Processing message:", data)

      if (!data.sender || !data.message || !data.group) {
        console.error("❌ Invalid message data - missing required fields")
        return
      }

      if (data.sender === "undefined" || data.sender === "null") {
        console.error("❌ Invalid sender ID:", data.sender)
        return
      }

      const messageData = {
        sender: data.sender,
        senderName: data.senderName || data.sender,
        message: data.message.trim(),
        group: data.group,
        seenBy: data.seenBy && data.seenBy.length > 0 ? data.seenBy.filter((id) => id && id !== "null") : [data.sender],
        edited: false,
      }

      console.log("✅ Cleaned message data:", messageData)

      const [newMsg, tokens] = await Promise.all([
        new Message(messageData).save(),
        getGroupMemberTokens(data.group, data.sender),
      ])

      io.to(data.group).emit("receiveMessage", newMsg)
      console.log(`✅ Message broadcasted to group: ${data.group}`)

      if (tokens.length > 0) {
        console.log(`📱 Sending notification to ${tokens.length} devices`)

        admin
          .messaging()
          .sendEachForMulticast({
            tokens,
            notification: {
              title: `💬 New Message`,
              body: `${messageData.senderName}: ${messageData.message}`,
            },
            data: {
              type: "group_message",
              groupId: data.group,
              messageId: newMsg._id.toString(),
              senderName: messageData.senderName,
              message: messageData.message,
            },
            android: {
              priority: "high",
              notification: {
                channelId: "default",
                sound: "default",
                priority: "high",
                defaultSound: true,
                defaultVibrateTimings: true,
              },
              ttl: 3600000,
            },
            apns: {
              headers: {
                "apns-priority": "10",
              },
              payload: {
                aps: {
                  alert: {
                    title: `💬 New Message`,
                    body: `${messageData.senderName}: ${messageData.message}`,
                  },
                  sound: "default",
                  badge: 1,
                },
              },
            },
          })
          .then((result) => {
            const processingTime = Date.now() - startTime
            console.log(
              `✅ Notifications sent in ${processingTime}ms - Success: ${result.successCount}, Failed: ${result.failureCount}`,
            )

            if (result.failureCount > 0) {
              console.log("❌ Failed notifications:")
              result.responses.forEach((response, index) => {
                if (!response.success) {
                  console.log(`  Token ${index}: ${response.error?.message}`)
                }
              })
            }
          })
          .catch((error) => {
            console.error("❌ Notification error:", error)
          })
      } else {
        console.log("⚠️ No FCM tokens found for group members")
      }

      const totalTime = Date.now() - startTime
      console.log(`⏱️ Total message processing time: ${totalTime}ms`)
    } catch (error) {
      console.error("❌ Error in sendMessage:", error)
    }
  })

  socket.on("deleteMessage", async (msgId) => {
    try {
      await Message.findByIdAndDelete(msgId)
      io.emit("messageDeleted", msgId)
    } catch (err) {
      console.error("❌ Delete failed:", err)
    }
  })

  socket.on("editMessage", async (updatedMsg) => {
    try {
      const msg = await Message.findByIdAndUpdate(
        updatedMsg._id,
        { message: updatedMsg.message, edited: true },
        { new: true },
      )

      io.emit("messageEdited", msg)
    } catch (err) {
      console.error("❌ Edit failed:", err)
    }
  })

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id)
  })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
})
