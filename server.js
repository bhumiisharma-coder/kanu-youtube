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

//     // ✅ FIXED: Proper populate with all user fields
//     const posts = await Post.find({
//       userId: { $in: newCreatorIds },
//       likes: { $lt: 50 }, // Less than 50 likes
//     })
//       .populate("userId", "name email profilePicture createdAt") // ✅ Include all needed fields
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number.parseInt(limit))

//     const totalPosts = await Post.countDocuments({
//       userId: { $in: newCreatorIds },
//       likes: { $lt: 50 },
//     })

//     const totalPages = Math.ceil(totalPosts / limit)

//     console.log(`✅ Found ${posts.length} posts from new creators`)

//     // ✅ DEBUG: Log first post structure
//     if (posts.length > 0) {
//       console.log("📝 Sample post structure:", {
//         _id: posts[0]._id,
//         userId: posts[0].userId,
//         userIdType: typeof posts[0].userId,
//       })
//     }

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

// // ✅ ALSO FIX: Regular posts route to ensure populate
// app.get("/api/posts/", async (req, res) => {
//   try {
//     const { page = 1, limit = 20 } = req.query

//     const posts = await Post.find()
//       .populate("userId", "name email profilePicture createdAt") // ✅ Add populate here too
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number.parseInt(limit))

//     const totalPosts = await Post.countDocuments()
//     const totalPages = Math.ceil(totalPosts / limit)

//     res.json({
//       success: true,
//       posts,
//       currentPage: Number.parseInt(page),
//       totalPages,
//       totalPosts,
//     })
//   } catch (error) {
//     console.error("❌ Error fetching posts:", error)
//     res.status(500).json({ success: false, error: error.message })
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
//     profilePicture: { type: String, default: "" }, // ✅ NEW: Add profilePicture field
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
//     // ✅ FIXED: Proper populate with all user fields
//     const posts = await Post.find({
//       userId: { $in: newCreatorIds },
//       likes: { $lt: 50 }, // Less than 50 likes
//     })
//       .populate("userId", "name email profilePicture createdAt") // ✅ Include all needed fields
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number.parseInt(limit))
//     const totalPosts = await Post.countDocuments({
//       userId: { $in: newCreatorIds },
//       likes: { $lt: 50 },
//     })
//     const totalPages = Math.ceil(totalPosts / limit)
//     console.log(`✅ Found ${posts.length} posts from new creators`)
//     // ✅ DEBUG: Log first post structure
//     if (posts.length > 0) {
//       console.log("📝 Sample post structure:", {
//         _id: posts[0]._id,
//         userId: posts[0].userId,
//         userIdType: typeof posts[0].userId,
//       })
//     }
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
//     console.log("Received group creation request with body:", req.body)
//     const { name, createdBy, profilePicture, description } = req.body // ✅ NEW: Accept profilePicture and description
//     const group = new Group({
//       name,
//       createdBy,
//       members: createdBy ? [createdBy] : [],
//       profilePicture: profilePicture || "", // ✅ NEW: Save profilePicture
//       description: description || "", // ✅ NEW: Save description
//     })
//     console.log("Saving group to DB:", group)
//     await group.save()
//     if (createdBy) {
//       await User.findByIdAndUpdate(createdBy, { $addToSet: { groups: group._id.toString() } })
//        console.log("group createddddd");
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

// // ✅ ALSO FIX: Regular posts route to ensure populate
// app.get("/api/posts/", async (req, res) => {
//   try {
//     const { page = 1, limit = 20 } = req.query
//     const posts = await Post.find()
//       .populate("userId", "name email profilePicture createdAt") // ✅ Add populate here too
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number.parseInt(limit))
//     const totalPosts = await Post.countDocuments()
//     const totalPages = Math.ceil(totalPosts / limit)
//     res.json({
//       success: true,
//       posts,
//       currentPage: Number.parseInt(page),
//       totalPages,
//       totalPosts,
//     })
//   } catch (error) {
//     console.error("❌ Error fetching posts:", error)
//     res.status(500).json({ success: false, error: error.message })
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
//                   console.log(`   Token ${index}: ${response.error?.message}`)
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





// 















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
//     profilePicture: { type: String, default: "" },
//   },
//   { timestamps: true },
// )

// const courseSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true, trim: true },
//     description: { type: String, trim: true },
//     videoUrl: { type: String, default: "" },
//     thumbnailUrl: { type: String, default: "" },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     instructorName: { type: String },
//     category: { type: String, default: "General" },
//     price: { type: Number, default: 0 },
//     duration: { type: String, default: "" },
//     likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     comments: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         text: String,
//         createdAt: { type: Date, default: Date.now },
//       },
//     ],
//     views: { type: Number, default: 0 },
//   },
//   { timestamps: true },
// )

// // ✅ NEW: Connection Request Schema
// const connectionRequestSchema = new mongoose.Schema(
//   {
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
//   },
//   { timestamps: true },
// )

// // ✅ NEW: Private Chat Schema
// const privateChatSchema = new mongoose.Schema(
//   {
//     participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
//     lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "PrivateMessage" },
//     lastMessageAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true },
// )

// // ✅ NEW: Private Message Schema
// const privateMessageSchema = new mongoose.Schema(
//   {
//     chat: { type: mongoose.Schema.Types.ObjectId, ref: "PrivateChat", required: true },
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     text: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
//     seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   },
//   { timestamps: true },
// )

// const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)
// const Group = mongoose.models.Group || mongoose.model("Group", groupSchema)
// const User = require("./models/user")
// const Post = require("./models/post")
// const Course = mongoose.models.Course || mongoose.model("Course", courseSchema)
// // ✅ NEW: Models for Connections and Private Chats
// const ConnectionRequest =
//   mongoose.models.ConnectionRequest || mongoose.model("ConnectionRequest", connectionRequestSchema)
// const PrivateChat = mongoose.models.PrivateChat || mongoose.model("PrivateChat", privateChatSchema)
// const PrivateMessage = mongoose.models.PrivateMessage || mongoose.model("PrivateMessage", privateMessageSchema)

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

//     // Course Routes
//     app.post("/api/courses", async (req, res) => {
//       try {
//         const { title, description, videoUrl, thumbnailUrl, createdBy, instructorName, category, price, duration } =
//           req.body

//         if (!title || !videoUrl || !createdBy) {
//           return res.status(400).json({ success: false, message: "Title, video URL, and creator are required." })
//         }

//         const newCourse = new Course({
//           title,
//           description,
//           videoUrl,
//           thumbnailUrl,
//           createdBy,
//           instructorName,
//           category,
//           price: Number.parseFloat(price) || 0,
//           duration,
//         })

//         await newCourse.save()
//         res.status(201).json({ success: true, message: "Course created successfully!", course: newCourse })
//       } catch (error) {
//         console.error("Error creating course:", error)
//         res.status(500).json({ success: false, message: "Failed to create course.", error: error.message })
//       }
//     })

//     app.put("/api/courses/like/:id", async (req, res) => {
//       const { userId } = req.body
//       try {
//         const course = await Course.findById(req.params.id)
//         if (!course) return res.status(404).json({ success: false, message: "Course not found" })

//         const userIdStr = userId.toString()

//         if (course.likes.includes(userIdStr)) {
//           course.likes = course.likes.filter((id) => id.toString() !== userIdStr)
//         } else {
//           course.likes.push(userIdStr)
//         }
//         await course.save()
//         res.json({ success: true, course })
//       } catch (err) {
//         console.error("Course like/unlike error:", err)
//         res.status(500).json({ success: false, message: err.message })
//       }
//     })

//     app.put("/api/courses/comment/:id", async (req, res) => {
//       const { userId, text } = req.body
//       try {
//         const course = await Course.findById(req.params.id)
//         if (!course) return res.status(404).json({ success: false, message: "Course not found" })

//         course.comments.push({ userId, text })
//         await course.save()

//         const populatedCourse = await Course.findById(course._id)
//           .populate("createdBy", "name profilePicture")
//           .populate("comments.userId", "name profilePicture")

//         res.json({ success: true, course: populatedCourse })
//       } catch (err) {
//         console.error("Course comment error:", err)
//         res.status(500).json({ success: false, message: err.message })
//       }
//     })

//     app.put("/api/courses/view/:id", async (req, res) => {
//       try {
//         const course = await Course.findById(req.params.id)
//         if (!course) return res.status(404).json({ success: false, message: "Course not found" })

//         course.views = (course.views || 0) + 1
//         await course.save()
//         res.status(200).json({ success: true, message: "View count incremented", views: course.views })
//       } catch (err) {
//         console.error("Course view increment error:", err)
//         res.status(500).json({ success: false, message: err.message })
//       }
//     })

//     app.delete("/api/courses/:courseId", async (req, res) => {
//       try {
//         const { courseId } = req.params
//         const { userId } = req.query

//         if (!courseId || !userId) {
//           return res.status(400).json({ success: false, message: "Course ID and User ID are required" })
//         }

//         const course = await Course.findById(courseId)
//         if (!course) {
//           return res.status(404).json({ success: false, message: "Course not found" })
//         }

//         if (course.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only delete your own courses" })
//         }

//         await Course.findByIdAndDelete(courseId)
//         res.status(200).json({ success: true, message: "Course deleted successfully" })
//       } catch (error) {
//         console.error("Delete course error:", error)
//         res.status(500).json({ success: false, message: "Failed to delete course", error: error.message })
//       }
//     })

//     app.get("/api/users/achievements/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params

//         const courseStats = await Course.aggregate([
//           { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
//           {
//             $group: {
//               _id: null,
//               totalCourses: { $sum: 1 },
//               totalViews: { $sum: "$views" },
//               totalLikes: { $sum: { $size: "$likes" } },
//             },
//           },
//         ])

//         const totalCoursesCreated = courseStats[0]?.totalCourses || 0
//         const totalCourseViews = courseStats[0]?.totalViews || 0
//         const totalCourseLikes = courseStats[0]?.totalLikes || 0

//         const commentsOnCourses = await Course.aggregate([
//           { $unwind: "$comments" },
//           { $match: { "comments.userId": new mongoose.Types.ObjectId(userId) } },
//           { $count: "totalComments" },
//         ])
//         const totalCommentsOnCourses = commentsOnCourses[0]?.totalComments || 0

//         const commentsOnPosts = await Post.aggregate([
//           { $unwind: "$comments" },
//           { $match: { "comments.userId": new mongoose.Types.ObjectId(userId) } },
//           { $count: "totalComments" },
//         ])
//         const totalCommentsOnPosts = commentsOnPosts[0]?.totalComments || 0
//         const totalCommentsMade = totalCommentsOnCourses + totalCommentsOnPosts

//         const groupMessagesSent = await Message.aggregate([{ $match: { sender: userId } }, { $count: "totalMessages" }])
//         const totalGroupMessages = groupMessagesSent[0]?.totalMessages || 0

//         const achievements = []

//         if (totalCoursesCreated >= 1) {
//           achievements.push({
//             _id: "ach_course_1",
//             name: "First Course Published 🎓",
//             description: "You've published your very first course on the platform!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "book-plus-outline",
//           })
//         }
//         if (totalCoursesCreated >= 5) {
//           achievements.push({
//             _id: "ach_course_5",
//             name: "Prolific Instructor 📚",
//             description: "You've published 5 or more courses!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "bookshelf",
//           })
//         }
//         if (totalCourseViews >= 1000) {
//           achievements.push({
//             _id: "ach_views_1k",
//             name: "Popular Educator ⭐",
//             description: `Your courses have collectively reached ${totalCourseViews} views!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "eye-check-outline",
//           })
//         }
//         if (totalCourseLikes >= 500) {
//           achievements.push({
//             _id: "ach_likes_500",
//             name: "Fan Favorite Creator ❤️",
//             description: `Your courses have received ${totalCourseLikes} likes!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "heart-multiple-outline",
//           })
//         }
//         if (totalCommentsMade >= 50) {
//           achievements.push({
//             _id: "ach_comment_50",
//             name: "Community Engager 💬",
//             description: `You've made ${totalCommentsMade} comments on courses and posts!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "comment-multiple-outline",
//           })
//         }
//         if (totalGroupMessages >= 100) {
//           achievements.push({
//             _id: "ach_group_100",
//             name: "Chatty Member 🗣️",
//             description: `You've sent ${totalGroupMessages} messages in groups!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "chat-processing-outline",
//           })
//         }

//         res.json({ success: true, achievements })
//       } catch (error) {
//         console.error("❌ Error fetching user achievements:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user achievements.", error: error.message })
//       }
//     })

//     // ✅ NEW: Connection Routes
//     // Send a connection request
//     app.post("/api/connections/request", async (req, res) => {
//       try {
//         const { senderId, receiverId } = req.body
//         if (!senderId || !receiverId) {
//           return res.status(400).json({ success: false, message: "Sender and receiver IDs are required." })
//         }
//         if (senderId === receiverId) {
//           return res.status(400).json({ success: false, message: "Cannot send a connection request to yourself." })
//         }

//         // Check if a request already exists (pending or accepted)
//         const existingRequest = await ConnectionRequest.findOne({
//           $or: [
//             { sender: senderId, receiver: receiverId },
//             { sender: receiverId, receiver: senderId, status: "accepted" }, // Already connected
//           ],
//         })

//         if (existingRequest) {
//           if (existingRequest.status === "pending") {
//             return res.status(409).json({ success: false, message: "Connection request already sent." })
//           } else if (existingRequest.status === "accepted") {
//             return res.status(409).json({ success: false, message: "Already connected with this user." })
//           }
//         }

//         const newRequest = new ConnectionRequest({ sender: senderId, receiver: receiverId })
//         await newRequest.save()

//         // Optionally send a notification to the receiver
//         const receiverUser = await User.findById(receiverId).select("fcmToken name")
//         if (receiverUser && receiverUser.fcmToken) {
//           const senderUser = await User.findById(senderId).select("name")
//           admin.messaging().send({
//             token: receiverUser.fcmToken,
//             notification: {
//               title: "New Connection Request! 🤝",
//               body: `${senderUser?.name || "Someone"} wants to connect with you.`,
//             },
//             data: {
//               type: "connection_request",
//               senderId: senderId,
//               requestId: newRequest._id.toString(),
//             },
//           })
//         }

//         res.status(201).json({ success: true, message: "Connection request sent.", request: newRequest })
//       } catch (error) {
//         console.error("Error sending connection request:", error)
//         res.status(500).json({ success: false, message: "Failed to send connection request.", error: error.message })
//       }
//     })

//     // Accept a connection request
//     app.put("/api/connections/accept/:requestId", async (req, res) => {
//       try {
//         const { requestId } = req.params
//         const { userId } = req.body // The user accepting the request

//         const request = await ConnectionRequest.findById(requestId)
//         if (!request) {
//           return res.status(404).json({ success: false, message: "Connection request not found." })
//         }
//         if (request.receiver.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You are not authorized to accept this request." })
//         }
//         if (request.status !== "pending") {
//           return res.status(409).json({ success: false, message: "Request is not pending." })
//         }

//         request.status = "accepted"
//         await request.save()

//         // Add each user to the other's connections list
//         await User.findByIdAndUpdate(request.sender, { $addToSet: { connections: request.receiver } })
//         await User.findByIdAndUpdate(request.receiver, { $addToSet: { connections: request.sender } })

//         // Optionally create a new private chat for them
//         let chat = await PrivateChat.findOne({
//           participants: { $all: [request.sender, request.receiver] },
//           $size: 2,
//         })
//         if (!chat) {
//           chat = new PrivateChat({ participants: [request.sender, request.receiver] })
//           await chat.save()
//         }

//         // Optionally send a notification to the sender
//         const senderUser = await User.findById(request.sender).select("fcmToken name")
//         if (senderUser && senderUser.fcmToken) {
//           const receiverUser = await User.findById(request.receiver).select("name")
//           admin.messaging().send({
//             token: senderUser.fcmToken,
//             notification: {
//               title: "Connection Accepted! 🎉",
//               body: `${receiverUser?.name || "Someone"} accepted your connection request.`,
//             },
//             data: {
//               type: "connection_accepted",
//               receiverId: request.receiver.toString(),
//               chatId: chat._id.toString(),
//             },
//           })
//         }

//         res.status(200).json({ success: true, message: "Connection request accepted.", request })
//       } catch (error) {
//         console.error("Error accepting connection request:", error)
//         res.status(500).json({ success: false, message: "Failed to accept connection request.", error: error.message })
//       }
//     })

//     // Reject a connection request
//     app.put("/api/connections/reject/:requestId", async (req, res) => {
//       try {
//         const { requestId } = req.params
//         const { userId } = req.body // The user rejecting the request

//         const request = await ConnectionRequest.findById(requestId)
//         if (!request) {
//           return res.status(404).json({ success: false, message: "Connection request not found." })
//         }
//         if (request.receiver.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You are not authorized to reject this request." })
//         }
//         if (request.status !== "pending") {
//           return res.status(409).json({ success: false, message: "Request is not pending." })
//         }

//         request.status = "rejected"
//         await request.save()

//         res.status(200).json({ success: true, message: "Connection request rejected.", request })
//       } catch (error) {
//         console.error("Error rejecting connection request:", error)
//         res.status(500).json({ success: false, message: "Failed to reject connection request.", error: error.message })
//       }
//     })

//     // Get pending connection requests for a user (received)
//     app.get("/api/connections/pending/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const pendingRequests = await ConnectionRequest.find({ receiver: userId, status: "pending" }).populate(
//           "sender",
//           "name profilePicture",
//         )
//         res.status(200).json({ success: true, requests: pendingRequests })
//       } catch (error) {
//         console.error("Error fetching pending requests:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch pending requests.", error: error.message })
//       }
//     })

//     // Get sent connection requests by a user
//     app.get("/api/connections/sent/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const sentRequests = await ConnectionRequest.find({ sender: userId, status: "pending" }).populate(
//           "receiver",
//           "name profilePicture",
//         )
//         res.status(200).json({ success: true, requests: sentRequests })
//       } catch (error) {
//         console.error("Error fetching sent requests:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch sent requests.", error: error.message })
//       }
//     })

//     // Get accepted connections for a user
//     app.get("/api/connections/accepted/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         // Find all connection requests where the user is either sender or receiver and status is accepted
//         const acceptedConnections = await ConnectionRequest.find({
//           $or: [{ sender: userId }, { receiver: userId }],
//           status: "accepted",
//         })
//           .populate("sender", "name profilePicture")
//           .populate("receiver", "name profilePicture")

//         // Extract unique connected users
//         const connections = acceptedConnections
//           .map((conn) => {
//             if (conn.sender._id.toString() === userId) {
//               return conn.receiver
//             } else {
//               return conn.sender
//             }
//           })
//           .filter(
//             (value, index, self) => self.findIndex((user) => user._id.toString() === value._id.toString()) === index,
//           ) // Filter unique users

//         res.status(200).json({ success: true, connections })
//       } catch (error) {
//         console.error("Error fetching accepted connections:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch accepted connections.", error: error.message })
//       }
//     })

//     // ✅ NEW: Private Chat Routes
//     // Find or create a private chat between two users
//     app.get("/api/chats/find/:user1Id/:user2Id", async (req, res) => {
//       try {
//         const { user1Id, user2Id } = req.params
//         let chat = await PrivateChat.findOne({
//           participants: { $all: [user1Id, user2Id] },
//           $size: 2,
//         })

//         if (!chat) {
//           chat = new PrivateChat({ participants: [user1Id, user2Id] })
//           await chat.save()
//         }
//         res.status(200).json({ success: true, chat })
//       } catch (error) {
//         console.error("Error finding/creating chat:", error)
//         res.status(500).json({ success: false, message: "Failed to find or create chat.", error: error.message })
//       }
//     })

//     // Get all private chats for a user
//     app.get("/api/chats/user/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const chats = await PrivateChat.find({ participants: userId })
//           .populate("participants", "name profilePicture")
//           .populate("lastMessage")
//           .sort({ lastMessageAt: -1 })
//         res.status(200).json({ success: true, chats })
//       } catch (error) {
//         console.error("Error fetching user chats:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user chats.", error: error.message })
//       }
//     })

//     // Get messages for a specific private chat
//     app.get("/api/chats/:chatId/messages", async (req, res) => {
//       try {
//         const { chatId } = req.params
//         const messages = await PrivateMessage.find({ chat: chatId })
//           .populate("sender", "name profilePicture")
//           .sort({ createdAt: 1 })
//         res.status(200).json({ success: true, messages })
//       } catch (error) {
//         console.error("Error fetching chat messages:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch chat messages.", error: error.message })
//       }
//     })

//     // Send a private message
//     app.post("/api/chats/message", async (req, res) => {
//       try {
//         const { chatId, senderId, text } = req.body
//         if (!chatId || !senderId || !text) {
//           return res.status(400).json({ success: false, message: "Chat ID, sender ID, and text are required." })
//         }

//         const newMessage = new PrivateMessage({ chat: chatId, sender: senderId, text })
//         await newMessage.save()

//         // Update last message in chat
//         await PrivateChat.findByIdAndUpdate(chatId, {
//           lastMessage: newMessage._id,
//           lastMessageAt: newMessage.createdAt,
//         })

//         // Populate sender for immediate response
//         const populatedMessage = await PrivateMessage.findById(newMessage._id).populate("sender", "name profilePicture")

//         // Emit message via Socket.io
//         io.to(chatId).emit("receivePrivateMessage", populatedMessage)

//         // Send FCM notification to the other participant
//         const chat = await PrivateChat.findById(chatId).populate("participants", "fcmToken name")
//         if (chat) {
//           const otherParticipant = chat.participants.find((p) => p._id.toString() !== senderId)
//           if (otherParticipant && otherParticipant.fcmToken) {
//             const senderUser = await User.findById(senderId).select("name")
//             admin.messaging().send({
//               token: otherParticipant.fcmToken,
//               notification: {
//                 title: `New Message from ${senderUser?.name || "Someone"}`,
//                 body: text,
//               },
//               data: {
//                 type: "private_message",
//                 chatId: chatId,
//                 senderId: senderId,
//               },
//             })
//           }
//         }

//         res.status(201).json({ success: true, message: "Message sent.", message: populatedMessage })
//       } catch (error) {
//         console.error("Error sending private message:", error)
//         res.status(500).json({ success: false, message: "Failed to send private message.", error: error.message })
//       }
//     })
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

// app.get("/api/posts/new-creators", async (req, res) => {
//   try {
//     const { page = 1, limit = 20 } = req.query
//     console.log("🌟 Fetching new creators posts...")
//     const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)
//     const newCreators = await User.find({
//       createdAt: { $gte: threeMonthsAgo },
//     }).select("_id")
//     if (newCreators.length === 0) {
//       return res.json({ success: true, posts: [], totalPages: 0, creators: 0 })
//     }
//     const newCreatorIds = newCreators.map((user) => user._id)
//     const posts = await Post.find({
//       userId: { $in: newCreatorIds },
//       likes: { $lt: 50 },
//     })
//       .populate("userId", "name email profilePicture createdAt")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number.parseInt(limit))
//     const totalPosts = await Post.countDocuments({
//       userId: { $in: newCreatorIds },
//       likes: { $lt: 50 },
//     })
//     const totalPages = Math.ceil(totalPosts / limit)
//     console.log(`✅ Found ${posts.length} posts from new creators`)
//     if (posts.length > 0) {
//       console.log("📝 Sample post structure:", {
//         _id: posts[0]._id,
//         userId: posts[0].userId,
//         userIdType: typeof posts[0].userId,
//       })
//     }
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

// app.get("/api/posts/stats", async (req, res) => {
//   try {
//     console.log("📊 Fetching posts stats...")
//     const totalPosts = await Post.countDocuments()
//     const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
//     const recentPosts = await Post.countDocuments({
//       createdAt: { $gte: thirtyDaysAgo },
//     })
//     const likesResult = await Post.aggregate([
//       {
//         $group: {
//           _id: null,
//           totalLikes: { $sum: "$likes" },
//         },
//       },
//     ])
//     const totalLikes = likesResult[0]?.totalLikes || 0
//     const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)
//     const newCreators = await User.countDocuments({
//       createdAt: { $gte: threeMonthsAgo },
//     })
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
//     console.log("Received group creation request with body:", req.body)
//     const { name, createdBy, profilePicture, description } = req.body
//     const group = new Group({
//       name,
//       createdBy,
//       members: createdBy ? [createdBy] : [],
//       profilePicture: profilePicture || "",
//       description: description || "",
//     })
//     console.log("Saving group to DB:", group)
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

// app.get("/api/posts/", async (req, res) => {
//   try {
//     const { page = 1, limit = 20 } = req.query
//     const posts = await Post.find()
//       .populate("userId", "name email profilePicture createdAt")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number.parseInt(limit))
//     const totalPosts = await Post.countDocuments()
//     const totalPages = Math.ceil(totalPosts / limit)
//     res.json({
//       success: true,
//       posts,
//       currentPage: Number.parseInt(page),
//       totalPages,
//       totalPosts,
//     })
//   } catch (error) {
//     console.error("❌ Error fetching posts:", error)
//     res.status(500).json({ success: false, error: error.message })
//   }
// })

// app.get("/api/courses", async (req, res) => {
//   try {
//     const { page = 1, limit = 20, search = "", category = "" } = req.query
//     const query = {}
//     if (search) {
//       query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
//     }
//     if (category) {
//       query.category = { $regex: category, $options: "i" }
//     }
//     const courses = await Course.find(query)
//       .populate("createdBy", "name profilePicture")
//       .populate("comments.userId", "name profilePicture")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number.parseInt(limit))
//     const totalCourses = await Course.countDocuments(query)
//     const totalPages = Math.ceil(totalCourses / limit)
//     res.json({
//       success: true,
//       courses,
//       currentPage: Number.parseInt(page),
//       totalPages,
//       totalCourses,
//     })
//   } catch (error) {
//     console.error("❌ Error fetching courses:", error)
//     res.status(500).json({ success: false, error: error.message })
//   }
// })

// app.get("/api/courses/user/:userId", async (req, res) => {
//   try {
//     const courses = await Course.find({ createdBy: req.params.userId })
//       .populate("createdBy", "name profilePicture")
//       .populate("comments.userId", "name profilePicture")
//       .sort({ createdAt: -1 })
//     res.json({ success: true, courses })
//   } catch (error) {
//     console.error("❌ Error fetching user courses:", error)
//     res.status(500).json({ success: false, message: "Failed to fetch user courses." })
//   }
// })

// // Socket.io handlers
// io.on("connection", (socket) => {
//   console.log("🟢 User connected:", socket.id)

//   socket.on("joinGroup", (groupId) => {
//     socket.join(groupId)
//     console.log(`👥 Socket joined group: ${groupId}`)
//   })

//   // ✅ NEW: Join private chat room
//   socket.on("joinPrivateChat", (chatId) => {
//     socket.join(chatId)
//     console.log(`👥 Socket joined private chat: ${chatId}`)
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
//                   console.log(`   Token ${index}: ${response.error?.message}`)
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
//     profilePicture: { type: String, default: "" },
//   },
//   { timestamps: true },
// )

// const courseSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true, trim: true },
//     description: { type: String, trim: true },
//     videoUrl: { type: String, default: "" },
//     thumbnailUrl: { type: String, default: "" },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     instructorName: { type: String },
//     category: { type: String, default: "General" },
//     price: { type: Number, default: 0 },
//     duration: { type: String, default: "" },
//     likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     comments: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         text: String,
//         createdAt: { type: Date, default: Date.now },
//       },
//     ],
//     views: { type: Number, default: 0 },
//   },
//   { timestamps: true },
// )

// // ✅ FIXED: Connection Request Schema
// const connectionRequestSchema = new mongoose.Schema(
//   {
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
//   },
//   { timestamps: true },
// )

// // ✅ FIXED: Private Chat Schema
// const privateChatSchema = new mongoose.Schema(
//   {
//     participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
//     lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "PrivateMessage" },
//     lastMessageAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true },
// )

// // ✅ FIXED: Private Message Schema
// const privateMessageSchema = new mongoose.Schema(
//   {
//     chat: { type: mongoose.Schema.Types.ObjectId, ref: "PrivateChat", required: true },
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     text: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
//     seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   },
//   { timestamps: true },
// )

// const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)
// const Group = mongoose.models.Group || mongoose.model("Group", groupSchema)
// const User = require("./models/user")
// const Post = require("./models/post")
// const Course = mongoose.models.Course || mongoose.model("Course", courseSchema)

// // ✅ FIXED: Models for Connections and Private Chats
// const ConnectionRequest =
//   mongoose.models.ConnectionRequest || mongoose.model("ConnectionRequest", connectionRequestSchema)
// const PrivateChat = mongoose.models.PrivateChat || mongoose.model("PrivateChat", privateChatSchema)
// const PrivateMessage = mongoose.models.PrivateMessage || mongoose.model("PrivateMessage", privateMessageSchema)

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

//     // Course Routes
//     app.post("/api/courses", async (req, res) => {
//       try {
//         const { title, description, videoUrl, thumbnailUrl, createdBy, instructorName, category, price, duration } =
//           req.body

//         if (!title || !videoUrl || !createdBy) {
//           return res.status(400).json({ success: false, message: "Title, video URL, and creator are required." })
//         }

//         const newCourse = new Course({
//           title,
//           description,
//           videoUrl,
//           thumbnailUrl,
//           createdBy,
//           instructorName,
//           category,
//           price: Number.parseFloat(price) || 0,
//           duration,
//         })

//         await newCourse.save()
//         res.status(201).json({ success: true, message: "Course created successfully!", course: newCourse })
//       } catch (error) {
//         console.error("Error creating course:", error)
//         res.status(500).json({ success: false, message: "Failed to create course.", error: error.message })
//       }
//     })

//     app.put("/api/courses/like/:id", async (req, res) => {
//       const { userId } = req.body
//       try {
//         const course = await Course.findById(req.params.id)
//         if (!course) return res.status(404).json({ success: false, message: "Course not found" })

//         const userIdStr = userId.toString()
//         if (course.likes.includes(userIdStr)) {
//           course.likes = course.likes.filter((id) => id.toString() !== userIdStr)
//         } else {
//           course.likes.push(userIdStr)
//         }

//         await course.save()
//         res.json({ success: true, course })
//       } catch (err) {
//         console.error("Course like/unlike error:", err)
//         res.status(500).json({ success: false, message: err.message })
//       }
//     })

//     app.put("/api/courses/comment/:id", async (req, res) => {
//       const { userId, text } = req.body
//       try {
//         const course = await Course.findById(req.params.id)
//         if (!course) return res.status(404).json({ success: false, message: "Course not found" })

//         course.comments.push({ userId, text })
//         await course.save()

//         const populatedCourse = await Course.findById(course._id)
//           .populate("createdBy", "name profilePicture")
//           .populate("comments.userId", "name profilePicture")

//         res.json({ success: true, course: populatedCourse })
//       } catch (err) {
//         console.error("Course comment error:", err)
//         res.status(500).json({ success: false, message: err.message })
//       }
//     })

//     app.put("/api/courses/view/:id", async (req, res) => {
//       try {
//         const course = await Course.findById(req.params.id)
//         if (!course) return res.status(404).json({ success: false, message: "Course not found" })

//         course.views = (course.views || 0) + 1
//         await course.save()

//         res.status(200).json({ success: true, message: "View count incremented", views: course.views })
//       } catch (err) {
//         console.error("Course view increment error:", err)
//         res.status(500).json({ success: false, message: err.message })
//       }
//     })

//     app.delete("/api/courses/:courseId", async (req, res) => {
//       try {
//         const { courseId } = req.params
//         const { userId } = req.query

//         if (!courseId || !userId) {
//           return res.status(400).json({ success: false, message: "Course ID and User ID are required" })
//         }

//         const course = await Course.findById(courseId)
//         if (!course) {
//           return res.status(404).json({ success: false, message: "Course not found" })
//         }

//         if (course.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only delete your own courses" })
//         }

//         await Course.findByIdAndDelete(courseId)
//         res.status(200).json({ success: true, message: "Course deleted successfully" })
//       } catch (error) {
//         console.error("Delete course error:", error)
//         res.status(500).json({ success: false, message: "Failed to delete course", error: error.message })
//       }
//     })

//     app.get("/api/users/achievements/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params

//         const courseStats = await Course.aggregate([
//           { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
//           {
//             $group: {
//               _id: null,
//               totalCourses: { $sum: 1 },
//               totalViews: { $sum: "$views" },
//               totalLikes: { $sum: { $size: "$likes" } },
//             },
//           },
//         ])

//         const totalCoursesCreated = courseStats[0]?.totalCourses || 0
//         const totalCourseViews = courseStats[0]?.totalViews || 0
//         const totalCourseLikes = courseStats[0]?.totalLikes || 0

//         const commentsOnCourses = await Course.aggregate([
//           { $unwind: "$comments" },
//           { $match: { "comments.userId": new mongoose.Types.ObjectId(userId) } },
//           { $count: "totalComments" },
//         ])

//         const totalCommentsOnCourses = commentsOnCourses[0]?.totalComments || 0

//         const commentsOnPosts = await Post.aggregate([
//           { $unwind: "$comments" },
//           { $match: { "comments.userId": new mongoose.Types.ObjectId(userId) } },
//           { $count: "totalComments" },
//         ])

//         const totalCommentsOnPosts = commentsOnPosts[0]?.totalComments || 0
//         const totalCommentsMade = totalCommentsOnCourses + totalCommentsOnPosts

//         const groupMessagesSent = await Message.aggregate([{ $match: { sender: userId } }, { $count: "totalMessages" }])
//         const totalGroupMessages = groupMessagesSent[0]?.totalMessages || 0

//         const achievements = []

//         if (totalCoursesCreated >= 1) {
//           achievements.push({
//             _id: "ach_course_1",
//             name: "First Course Published 🎓",
//             description: "You've published your very first course on the platform!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "book-plus-outline",
//           })
//         }

//         if (totalCoursesCreated >= 5) {
//           achievements.push({
//             _id: "ach_course_5",
//             name: "Prolific Instructor 📚",
//             description: "You've published 5 or more courses!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "bookshelf",
//           })
//         }

//         if (totalCourseViews >= 1000) {
//           achievements.push({
//             _id: "ach_views_1k",
//             name: "Popular Educator ⭐",
//             description: `Your courses have collectively reached ${totalCourseViews} views!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "eye-check-outline",
//           })
//         }

//         if (totalCourseLikes >= 500) {
//           achievements.push({
//             _id: "ach_likes_500",
//             name: "Fan Favorite Creator ❤️",
//             description: `Your courses have received ${totalCourseLikes} likes!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "heart-multiple-outline",
//           })
//         }

//         if (totalCommentsMade >= 50) {
//           achievements.push({
//             _id: "ach_comment_50",
//             name: "Community Engager 💬",
//             description: `You've made ${totalCommentsMade} comments on courses and posts!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "comment-multiple-outline",
//           })
//         }

//         if (totalGroupMessages >= 100) {
//           achievements.push({
//             _id: "ach_group_100",
//             name: "Chatty Member 🗣️",
//             description: `You've sent ${totalGroupMessages} messages in groups!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "chat-processing-outline",
//           })
//         }

//         res.json({ success: true, achievements })
//       } catch (error) {
//         console.error("❌ Error fetching user achievements:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user achievements.", error: error.message })
//       }
//     })

//     // ✅ MAIN FIX: Connection Routes
//     // Send a connection request
//     app.post("/api/connections/request", async (req, res) => {
//       try {
//         const { senderId, receiverId } = req.body

//         if (!senderId || !receiverId) {
//           return res.status(400).json({ success: false, message: "Sender and receiver IDs are required." })
//         }

//         if (senderId === receiverId) {
//           return res.status(400).json({ success: false, message: "Cannot send a connection request to yourself." })
//         }

//         // Check if a request already exists (pending or accepted)
//         const existingRequest = await ConnectionRequest.findOne({
//           $or: [
//             { sender: senderId, receiver: receiverId },
//             { sender: receiverId, receiver: senderId, status: "accepted" }, // Already connected
//           ],
//         })

//         if (existingRequest) {
//           if (existingRequest.status === "pending") {
//             return res.status(409).json({ success: false, message: "Connection request already sent." })
//           } else if (existingRequest.status === "accepted") {
//             return res.status(409).json({ success: false, message: "Already connected with this user." })
//           }
//         }

//         const newRequest = new ConnectionRequest({ sender: senderId, receiver: receiverId })
//         await newRequest.save()

//         // Optionally send a notification to the receiver
//         const receiverUser = await User.findById(receiverId).select("fcmToken name")
//         if (receiverUser && receiverUser.fcmToken) {
//           const senderUser = await User.findById(senderId).select("name")
//           admin.messaging().send({
//             token: receiverUser.fcmToken,
//             notification: {
//               title: "New Connection Request! 🤝",
//               body: `${senderUser?.name || "Someone"} wants to connect with you.`,
//             },
//             data: {
//               type: "connection_request",
//               senderId: senderId,
//               requestId: newRequest._id.toString(),
//             },
//           })
//         }

//         res.status(201).json({ success: true, message: "Connection request sent.", request: newRequest })
//       } catch (error) {
//         console.error("Error sending connection request:", error)
//         res.status(500).json({ success: false, message: "Failed to send connection request.", error: error.message })
//       }
//     })

//     // ✅ MAIN FIX: Accept a connection request - REMOVED $size OPERATOR
//     app.put("/api/connections/accept/:requestId", async (req, res) => {
//       try {
//         const { requestId } = req.params
//         const { userId } = req.body // The user accepting the request

//         console.log(`✅ Accepting connection request: ${requestId} by user: ${userId}`)

//         const request = await ConnectionRequest.findById(requestId)
//         if (!request) {
//           return res.status(404).json({ success: false, message: "Connection request not found." })
//         }

//         if (request.receiver.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You are not authorized to accept this request." })
//         }

//         if (request.status !== "pending") {
//           return res.status(409).json({ success: false, message: "Request is not pending." })
//         }

//         request.status = "accepted"
//         await request.save()

//         // ✅ FIXED: Add each user to the other's connections list - SIMPLIFIED QUERY
//         await User.findByIdAndUpdate(request.sender, { $addToSet: { connections: request.receiver } })
//         await User.findByIdAndUpdate(request.receiver, { $addToSet: { connections: request.sender } })

//         // ✅ FIXED: Create a new private chat for them - REMOVED $size CONDITION
//         let chat = await PrivateChat.findOne({
//           participants: { $all: [request.sender, request.receiver] },
//         })

//         if (!chat) {
//           chat = new PrivateChat({ participants: [request.sender, request.receiver] })
//           await chat.save()
//           console.log("✅ Private chat created successfully")
//         }

//         // Optionally send a notification to the sender
//         const senderUser = await User.findById(request.sender).select("fcmToken name")
//         if (senderUser && senderUser.fcmToken) {
//           const receiverUser = await User.findById(request.receiver).select("name")
//           admin.messaging().send({
//             token: senderUser.fcmToken,
//             notification: {
//               title: "Connection Accepted! 🎉",
//               body: `${receiverUser?.name || "Someone"} accepted your connection request.`,
//             },
//             data: {
//               type: "connection_accepted",
//               receiverId: request.receiver.toString(),
//               chatId: chat._id.toString(),
//             },
//           })
//         }

//         console.log("✅ Connection request accepted successfully")
//         res.status(200).json({ success: true, message: "Connection request accepted.", request })
//       } catch (error) {
//         console.error("❌ Error accepting connection request:", error)
//         res.status(500).json({ success: false, message: "Failed to accept connection request.", error: error.message })
//       }
//     })

//     // Reject a connection request
//     app.put("/api/connections/reject/:requestId", async (req, res) => {
//       try {
//         const { requestId } = req.params
//         const { userId } = req.body // The user rejecting the request

//         const request = await ConnectionRequest.findById(requestId)
//         if (!request) {
//           return res.status(404).json({ success: false, message: "Connection request not found." })
//         }

//         if (request.receiver.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You are not authorized to reject this request." })
//         }

//         if (request.status !== "pending") {
//           return res.status(409).json({ success: false, message: "Request is not pending." })
//         }

//         request.status = "rejected"
//         await request.save()

//         res.status(200).json({ success: true, message: "Connection request rejected.", request })
//       } catch (error) {
//         console.error("Error rejecting connection request:", error)
//         res.status(500).json({ success: false, message: "Failed to reject connection request.", error: error.message })
//       }
//     })

//     // Get pending connection requests for a user (received)
//     app.get("/api/connections/pending/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const pendingRequests = await ConnectionRequest.find({ receiver: userId, status: "pending" }).populate(
//           "sender",
//           "name profilePicture",
//         )
//         res.status(200).json({ success: true, requests: pendingRequests })
//       } catch (error) {
//         console.error("Error fetching pending requests:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch pending requests.", error: error.message })
//       }
//     })

//     // Get sent connection requests by a user
//     app.get("/api/connections/sent/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const sentRequests = await ConnectionRequest.find({ sender: userId, status: "pending" }).populate(
//           "receiver",
//           "name profilePicture",
//         )
//         res.status(200).json({ success: true, requests: sentRequests })
//       } catch (error) {
//         console.error("Error fetching sent requests:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch sent requests.", error: error.message })
//       }
//     })

//     // Get accepted connections for a user
//     app.get("/api/connections/accepted/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         // Find all connection requests where the user is either sender or receiver and status is accepted
//         const acceptedConnections = await ConnectionRequest.find({
//           $or: [{ sender: userId }, { receiver: userId }],
//           status: "accepted",
//         })
//           .populate("sender", "name profilePicture")
//           .populate("receiver", "name profilePicture")

//         // Extract unique connected users
//         const connections = acceptedConnections
//           .map((conn) => {
//             if (conn.sender._id.toString() === userId) {
//               return conn.receiver
//             } else {
//               return conn.sender
//             }
//           })
//           .filter(
//             (value, index, self) => self.findIndex((user) => user._id.toString() === value._id.toString()) === index,
//           ) // Filter unique users

//         res.status(200).json({ success: true, connections })
//       } catch (error) {
//         console.error("Error fetching accepted connections:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch accepted connections.", error: error.message })
//       }
//     })

//     // ✅ FIXED: Private Chat Routes
//     // Find or create a private chat between two users
//     app.get("/api/chats/find/:user1Id/:user2Id", async (req, res) => {
//       try {
//         const { user1Id, user2Id } = req.params
//         let chat = await PrivateChat.findOne({
//           participants: { $all: [user1Id, user2Id] },
//         })

//         if (!chat) {
//           chat = new PrivateChat({ participants: [user1Id, user2Id] })
//           await chat.save()
//         }

//         res.status(200).json({ success: true, chat })
//       } catch (error) {
//         console.error("Error finding/creating chat:", error)
//         res.status(500).json({ success: false, message: "Failed to find or create chat.", error: error.message })
//       }
//     })

//     // Get all private chats for a user
//     app.get("/api/chats/user/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const chats = await PrivateChat.find({ participants: userId })
//           .populate("participants", "name profilePicture")
//           .populate("lastMessage")
//           .sort({ lastMessageAt: -1 })

//         res.status(200).json({ success: true, chats })
//       } catch (error) {
//         console.error("Error fetching user chats:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user chats.", error: error.message })
//       }
//     })

//     // Get messages for a specific private chat
//     app.get("/api/chats/:chatId/messages", async (req, res) => {
//       try {
//         const { chatId } = req.params
//         const messages = await PrivateMessage.find({ chat: chatId })
//           .populate("sender", "name profilePicture")
//           .sort({ createdAt: 1 })

//         res.status(200).json({ success: true, messages })
//       } catch (error) {
//         console.error("Error fetching chat messages:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch chat messages.", error: error.message })
//       }
//     })

//     // Send a private message
//     app.post("/api/chats/message", async (req, res) => {
//       try {
//         const { chatId, senderId, text } = req.body

//         if (!chatId || !senderId || !text) {
//           return res.status(400).json({ success: false, message: "Chat ID, sender ID, and text are required." })
//         }

//         const newMessage = new PrivateMessage({ chat: chatId, sender: senderId, text })
//         await newMessage.save()

//         // Update last message in chat
//         await PrivateChat.findByIdAndUpdate(chatId, {
//           lastMessage: newMessage._id,
//           lastMessageAt: newMessage.createdAt,
//         })

//         // Populate sender for immediate response
//         const populatedMessage = await PrivateMessage.findById(newMessage._id).populate("sender", "name profilePicture")

//         // Emit message via Socket.io
//         io.to(chatId).emit("receivePrivateMessage", populatedMessage)

//         // Send FCM notification to the other participant
//         const chat = await PrivateChat.findById(chatId).populate("participants", "fcmToken name")
//         if (chat) {
//           const otherParticipant = chat.participants.find((p) => p._id.toString() !== senderId)
//           if (otherParticipant && otherParticipant.fcmToken) {
//             const senderUser = await User.findById(senderId).select("name")
//             admin.messaging().send({
//               token: otherParticipant.fcmToken,
//               notification: {
//                 title: `New Message from ${senderUser?.name || "Someone"}`,
//                 body: text,
//               },
//               data: {
//                 type: "private_message",
//                 chatId: chatId,
//                 senderId: senderId,
//               },
//             })
//           }
//         }

//         res.status(201).json({ success: true, message: "Message sent.", message: populatedMessage })
//       } catch (error) {
//         console.error("Error sending private message:", error)
//         res.status(500).json({ success: false, message: "Failed to send private message.", error: error.message })
//       }
//     })

//     // ✅ FIXED: Get all posts
//     app.get("/api/posts/", async (req, res) => {
//       try {
//         console.log("📝 Fetching all posts...")
//         const posts = await Post.find()
//           .populate("userId", "name email profilePicture isVerified")
//           .sort({ createdAt: -1 })

//         console.log(`✅ Found ${posts.length} posts`)
//         res.status(200).json({ success: true, posts })
//       } catch (error) {
//         console.error("❌ Error fetching posts:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch posts.", error: error.message })
//       }
//     })

//     // ✅ FIXED: Get user profile by ID
//     app.get("/api/users/profile/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         console.log(`👤 Fetching profile for userId: ${userId}`)

//         if (!userId) {
//           return res.status(400).json({ success: false, message: "User ID is required" })
//         }

//         const user = await User.findById(userId).select("name email profilePicture bio isVerified isPrivate createdAt")

//         if (!user) {
//           return res.status(404).json({ success: false, message: "User not found" })
//         }

//         console.log(`✅ Found user profile: ${user.name}`)
//         res.status(200).json({ success: true, user })
//       } catch (error) {
//         console.error("❌ Error fetching user profile:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user profile.", error: error.message })
//       }
//     })

//     // ✅ FIXED: Get posts by user ID
//     app.get("/api/posts/user/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         console.log(`📝 Fetching posts for userId: ${userId}`)

//         if (!userId) {
//           return res.status(400).json({ success: false, message: "User ID is required" })
//         }

//         const posts = await Post.find({ userId: userId })
//           .populate("userId", "name email profilePicture")
//           .sort({ createdAt: -1 })

//         console.log(`✅ Found ${posts.length} posts for user`)
//         res.status(200).json({ success: true, posts })
//       } catch (error) {
//         console.error("❌ Error fetching user posts:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user posts.", error: error.message })
//       }
//     })

//     // ✅ FIXED: Like a post
//     app.put("/api/posts/like/:postId", async (req, res) => {
//       try {
//         const { postId } = req.params
//         const { userId } = req.body

//         console.log(`❤️ Like request for post: ${postId} by user: ${userId}`)

//         const post = await Post.findById(postId)
//         if (!post) {
//           return res.status(404).json({ success: false, message: "Post not found" })
//         }

//         const likeIndex = post.likes.indexOf(userId)
//         if (likeIndex > -1) {
//           // Unlike
//           post.likes.splice(likeIndex, 1)
//           console.log("👎 Post unliked")
//         } else {
//           // Like
//           post.likes.push(userId)
//           console.log("👍 Post liked")
//         }

//         await post.save()
//         res.status(200).json({ success: true, message: "Post like updated", likes: post.likes.length })
//       } catch (error) {
//         console.error("❌ Error updating post like:", error)
//         res.status(500).json({ success: false, message: "Failed to update like.", error: error.message })
//       }
//     })

//     // ✅ FIXED: Comment on a post
//     app.put("/api/posts/comment/:postId", async (req, res) => {
//       try {
//         const { postId } = req.params
//         const { userId, text } = req.body

//         console.log(`💬 Comment request for post: ${postId} by user: ${userId}`)

//         if (!text || !text.trim()) {
//           return res.status(400).json({ success: false, message: "Comment text is required" })
//         }

//         const post = await Post.findById(postId)
//         if (!post) {
//           return res.status(404).json({ success: false, message: "Post not found" })
//         }

//         const newComment = {
//           userId,
//           text: text.trim(),
//           createdAt: new Date(),
//         }

//         post.comments.push(newComment)
//         await post.save()

//         console.log("✅ Comment added successfully")
//         res.status(200).json({ success: true, message: "Comment added successfully", comments: post.comments.length })
//       } catch (error) {
//         console.error("❌ Error adding comment:", error)
//         res.status(500).json({ success: false, message: "Failed to add comment.", error: error.message })
//       }
//     })

//     // ✅ FIXED: Get discoverable users (all users except current user)
//     app.get("/api/users/discoverable/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         console.log(`🔍 Fetching discoverable users for userId: ${userId}`)

//         const users = await User.find({
//           _id: { $ne: userId }, // Exclude current user
//           // isPrivate: { $ne: true } // Optionally exclude private users
//         }).select("name email profilePicture bio isVerified")

//         console.log(`✅ Found ${users.length} discoverable users`)
//         res.status(200).json({ success: true, users })
//       } catch (error) {
//         console.error("❌ Error fetching discoverable users:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch users.", error: error.message })
//       }
//     })

//     // Basic Routes
//     app.get("/", (req, res) => {
//       res.json({ message: "YouTube Chat Backend is running! 🚀" })
//     })

//     app.get("/api/users/test", (req, res) => {
//       res.send("✅ Server working!")
//     })

//     app.get("/api/posts/new-creators", async (req, res) => {
//       try {
//         const { page = 1, limit = 20 } = req.query
//         console.log("🌟 Fetching new creators posts...")

//         const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)
//         const newCreators = await User.find({
//           createdAt: { $gte: threeMonthsAgo },
//         }).select("_id")

//         if (newCreators.length === 0) {
//           return res.json({ success: true, posts: [], totalPages: 0, creators: 0 })
//         }

//         const newCreatorIds = newCreators.map((user) => user._id)
//         const posts = await Post.find({
//           userId: { $in: newCreatorIds },
//           likes: { $lt: 50 },
//         })
//           .populate("userId", "name email profilePicture createdAt")
//           .sort({ createdAt: -1 })
//           .skip((page - 1) * limit)
//           .limit(Number.parseInt(limit))

//         const totalPosts = await Post.countDocuments({
//           userId: { $in: newCreatorIds },
//           likes: { $lt: 50 },
//         })

//         const totalPages = Math.ceil(totalPosts / limit)

//         console.log(`✅ Found ${posts.length} posts from new creators`)
//         if (posts.length > 0) {
//           console.log("📝 Sample post structure:", {
//             _id: posts[0]._id,
//             userId: posts[0].userId,
//             userIdType: typeof posts[0].userId,
//           })
//         }

//         res.json({
//           success: true,
//           posts,
//           currentPage: Number.parseInt(page),
//           totalPages,
//           totalPosts,
//           creators: newCreators.length,
//         })
//       } catch (error) {
//         console.error("❌ Error fetching new creators posts:", error)
//         res.status(500).json({ success: false, error: error.message })
//       }
//     })

//     app.get("/api/posts/stats", async (req, res) => {
//       try {
//         console.log("📊 Fetching posts stats...")
//         const totalPosts = await Post.countDocuments()

//         const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
//         const recentPosts = await Post.countDocuments({
//           createdAt: { $gte: thirtyDaysAgo },
//         })

//         const likesResult = await Post.aggregate([
//           {
//             $group: {
//               _id: null,
//               totalLikes: { $sum: "$likes" },
//             },
//           },
//         ])

//         const totalLikes = likesResult[0]?.totalLikes || 0

//         const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)
//         const newCreators = await User.countDocuments({
//           createdAt: { $gte: threeMonthsAgo },
//         })

//         const newCreatorUsers = await User.find({
//           createdAt: { $gte: threeMonthsAgo },
//         }).select("_id")

//         const newCreatorIds = newCreatorUsers.map((user) => user._id)
//         const newCreatorPosts = await Post.countDocuments({
//           userId: { $in: newCreatorIds },
//         })

//         const stats = {
//           totalPosts,
//           recentPosts,
//           totalLikes,
//           newCreators,
//           newCreatorPosts,
//           avgLikesPerPost: totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0,
//         }

//         console.log("✅ Stats calculated:", stats)
//         res.json({
//           success: true,
//           stats,
//         })
//       } catch (error) {
//         console.error("❌ Error fetching stats:", error)
//         res.status(500).json({
//           success: false,
//           error: "Failed to fetch stats",
//         })
//       }
//     })

//     // Groups Routes
//     app.get("/api/groups", async (req, res) => {
//       try {
//         const groups = await Group.find().sort({ createdAt: -1 })
//         res.json(groups)
//       } catch (err) {
//         res.status(500).json({ message: "Error fetching groups" })
//       }
//     })

//     app.post("/api/groups", async (req, res) => {
//       try {
//         console.log("Received group creation request with body:", req.body)
//         const { name, createdBy, profilePicture, description } = req.body

//         const group = new Group({
//           name,
//           createdBy,
//           members: createdBy ? [createdBy] : [],
//           profilePicture: profilePicture || "",
//           description: description || "",
//         })

//         console.log("Saving group to DB:", group)
//         await group.save()

//         if (createdBy) {
//           await User.findByIdAndUpdate(createdBy, { $addToSet: { groups: group._id.toString() } })
//         }

//         res.status(201).json(group)
//       } catch (err) {
//         res.status(500).json({ message: "Error creating group" })
//       }
//     })

//     app.get("/api/messages/:group", async (req, res) => {
//       try {
//         const messages = await Message.find({ group: req.params.group }).sort({ createdAt: 1 })
//         res.json(messages)
//       } catch (err) {
//         res.status(500).json({ message: "Error fetching messages" })
//       }
//     })

//     app.post("/api/users/fcm-token", async (req, res) => {
//       const { userId, fcmToken } = req.body
//       try {
//         console.log(`💾 Saving FCM token for user: ${userId}`)
//         if (!userId || !fcmToken) {
//           return res.status(400).json({ success: false, message: "userId and fcmToken required" })
//         }

//         const updatedUser = await User.findByIdAndUpdate(userId, { fcmToken }, { new: true })
//         if (!updatedUser) {
//           console.log(`❌ User not found: ${userId}`)
//           return res.status(404).json({ success: false, message: "User not found" })
//         }

//         for (const [key] of tokenCache) {
//           if (key.includes(userId)) {
//             tokenCache.delete(key)
//           }
//         }

//         console.log(`✅ FCM token saved for user: ${updatedUser.name}`)
//         res.json({ success: true })
//       } catch (err) {
//         console.error("❌ Error saving FCM token:", err)
//         res.status(500).json({ success: false, message: "Error saving FCM token" })
//       }
//     })

//     app.post("/api/users/join-group", async (req, res) => {
//       const { userId, groupId } = req.body
//       try {
//         console.log(`👥 Adding user ${userId} to group ${groupId}`)
//         if (!userId || !groupId) {
//           return res.status(400).json({ success: false, message: "userId and groupId required" })
//         }

//         const updatedUser = await User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } }, { new: true })
//         if (!updatedUser) {
//           return res.status(404).json({ success: false, message: "User not found" })
//         }

//         await Group.findByIdAndUpdate(groupId, { $addToSet: { members: userId } })

//         for (const [key] of tokenCache) {
//           if (key.startsWith(groupId)) {
//             tokenCache.delete(key)
//           }
//         }

//         console.log(`✅ User ${updatedUser.name} added to group`)
//         res.json({ success: true })
//       } catch (err) {
//         console.error("❌ Error joining group:", err)
//         res.status(500).json({ success: false })
//       }
//     })

//     app.get("/api/courses", async (req, res) => {
//       try {
//         const { page = 1, limit = 20, search = "", category = "" } = req.query

//         const query = {}
//         if (search) {
//           query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
//         }
//         if (category) {
//           query.category = { $regex: category, $options: "i" }
//         }

//         const courses = await Course.find(query)
//           .populate("createdBy", "name profilePicture")
//           .populate("comments.userId", "name profilePicture")
//           .sort({ createdAt: -1 })
//           .skip((page - 1) * limit)
//           .limit(Number.parseInt(limit))

//         const totalCourses = await Course.countDocuments(query)
//         const totalPages = Math.ceil(totalCourses / limit)

//         res.json({
//           success: true,
//           courses,
//           currentPage: Number.parseInt(page),
//           totalPages,
//           totalCourses,
//         })
//       } catch (error) {
//         console.error("❌ Error fetching courses:", error)
//         res.status(500).json({ success: false, error: error.message })
//       }
//     })

//     app.get("/api/courses/user/:userId", async (req, res) => {
//       try {
//         const courses = await Course.find({ createdBy: req.params.userId })
//           .populate("createdBy", "name profilePicture")
//           .populate("comments.userId", "name profilePicture")
//           .sort({ createdAt: -1 })

//         res.json({ success: true, courses })
//       } catch (error) {
//         console.error("❌ Error fetching user courses:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user courses." })
//       }
//     })
//   })
//   .catch((err) => {
//     console.log("❌ MongoDB Connection Error:", err)
//     process.exit(1)
//   })

// // Socket.io handlers
// io.on("connection", (socket) => {
//   console.log("🟢 User connected:", socket.id)

//   socket.on("joinGroup", (groupId) => {
//     socket.join(groupId)
//     console.log(`👥 Socket joined group: ${groupId}`)
//   })

//   // ✅ FIXED: Join private chat room
//   socket.on("joinPrivateChat", (chatId) => {
//     socket.join(chatId)
//     console.log(`👥 Socket joined private chat: ${chatId}`)
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
//                   console.log(`   Token ${index}: ${response.error?.message}`)
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
//   console.log(`📡 API URL: http://localhost:${PORT}`)
//   console.log(`📱 Android Emulator URL: http://10.0.2.2:${PORT}`)
// })





// const express = require("express")
// const http = require("http")
// const { Server } = require("socket.io")
// const mongoose = require("mongoose")
// const cors = require("cors")
// require("dotenv").config()

// // ✅ FIXED: Firebase Admin SDK Configuration
// let admin
// try {
//   admin = require("firebase-admin")

//   // Check if Firebase is already initialized
//   if (!admin.apps.length) {
//     // Try to use environment variables first (recommended for production)
//     if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
//       console.log("🔥 Initializing Firebase with environment variables...")
//       admin.initializeApp({
//         credential: admin.credential.cert({
//           type: "service_account",
//           project_id: process.env.FIREBASE_PROJECT_ID,
//           private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
//           private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//           client_email: process.env.FIREBASE_CLIENT_EMAIL,
//           client_id: process.env.FIREBASE_CLIENT_ID,
//           auth_uri: "https://accounts.google.com/o/oauth2/auth",
//           token_uri: "https://oauth2.googleapis.com/token",
//           auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
//           client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
//         }),
//       })
//       console.log("✅ Firebase initialized with environment variables")
//     } else {
//       // Fallback to service account file (for development)
//       console.log("🔥 Initializing Firebase with service account file...")
//       const serviceAccount = require("./firebase-service-account.json") // Rename your file
//       admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount),
//       })
//       console.log("✅ Firebase initialized with service account file")
//     }
//   } else {
//     console.log("🔥 Firebase already initialized")
//   }
// } catch (error) {
//   console.error("❌ Firebase initialization error:", error.message)
//   console.log("⚠️ Continuing without Firebase (notifications will not work)")
//   admin = null
// }

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
//     profilePicture: { type: String, default: "" },
//   },
//   { timestamps: true },
// )

// const courseSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true, trim: true },
//     description: { type: String, trim: true },
//     videoUrl: { type: String, default: "" },
//     thumbnailUrl: { type: String, default: "" },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     instructorName: { type: String },
//     category: { type: String, default: "General" },
//     price: { type: Number, default: 0 },
//     duration: { type: String, default: "" },
//     likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     comments: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         text: String,
//         createdAt: { type: Date, default: Date.now },
//       },
//     ],
//     views: { type: Number, default: 0 },
//   },
//   { timestamps: true },
// )

// const connectionRequestSchema = new mongoose.Schema(
//   {
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
//   },
//   { timestamps: true },
// )

// const privateChatSchema = new mongoose.Schema(
//   {
//     participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
//     lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "PrivateMessage" },
//     lastMessageAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true },
// )

// const privateMessageSchema = new mongoose.Schema(
//   {
//     chat: { type: mongoose.Schema.Types.ObjectId, ref: "PrivateChat", required: true },
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     text: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
//     seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   },
//   { timestamps: true },
// )

// const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)
// const Group = mongoose.models.Group || mongoose.model("Group", groupSchema)
// const User = require("./models/user")
// const Post = require("./models/post")
// const Course = mongoose.models.Course || mongoose.model("Course", courseSchema)
// const ConnectionRequest =
//   mongoose.models.ConnectionRequest || mongoose.model("ConnectionRequest", connectionRequestSchema)
// const PrivateChat = mongoose.models.PrivateChat || mongoose.model("PrivateChat", privateChatSchema)
// const PrivateMessage = mongoose.models.PrivateMessage || mongoose.model("PrivateMessage", privateMessageSchema)

// // FCM token cache
// const tokenCache = new Map()
// const CACHE_DURATION = 5 * 60 * 1000

// // ✅ FIXED: Safe Firebase messaging function
// async function sendFirebaseNotification(tokens, notification, data) {
//   if (!admin) {
//     console.log("⚠️ Firebase not initialized, skipping notification")
//     return { successCount: 0, failureCount: tokens.length }
//   }

//   try {
//     const result = await admin.messaging().sendEachForMulticast({
//       tokens,
//       notification,
//       data,
//       android: {
//         priority: "high",
//         notification: {
//           channelId: "default",
//           sound: "default",
//           priority: "high",
//           defaultSound: true,
//           defaultVibrateTimings: true,
//         },
//         ttl: 3600000,
//       },
//       apns: {
//         headers: {
//           "apns-priority": "10",
//         },
//         payload: {
//           aps: {
//             alert: {
//               title: notification.title,
//               body: notification.body,
//             },
//             sound: "default",
//             badge: 1,
//           },
//         },
//       },
//     })
//     return result
//   } catch (error) {
//     console.error("❌ Firebase notification error:", error)
//     return { successCount: 0, failureCount: tokens.length }
//   }
// }

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

//     // Course Routes
//     app.post("/api/courses", async (req, res) => {
//       try {
//         const { title, description, videoUrl, thumbnailUrl, createdBy, instructorName, category, price, duration } =
//           req.body

//         if (!title || !videoUrl || !createdBy) {
//           return res.status(400).json({ success: false, message: "Title, video URL, and creator are required." })
//         }

//         const newCourse = new Course({
//           title,
//           description,
//           videoUrl,
//           thumbnailUrl,
//           createdBy,
//           instructorName,
//           category,
//           price: Number.parseFloat(price) || 0,
//           duration,
//         })

//         await newCourse.save()
//         res.status(201).json({ success: true, message: "Course created successfully!", course: newCourse })
//       } catch (error) {
//         console.error("Error creating course:", error)
//         res.status(500).json({ success: false, message: "Failed to create course.", error: error.message })
//       }
//     })

//     app.put("/api/courses/like/:id", async (req, res) => {
//       const { userId } = req.body
//       try {
//         const course = await Course.findById(req.params.id)
//         if (!course) return res.status(404).json({ success: false, message: "Course not found" })

//         const userIdStr = userId.toString()
//         if (course.likes.includes(userIdStr)) {
//           course.likes = course.likes.filter((id) => id.toString() !== userIdStr)
//         } else {
//           course.likes.push(userIdStr)
//         }

//         await course.save()
//         res.json({ success: true, course })
//       } catch (err) {
//         console.error("Course like/unlike error:", err)
//         res.status(500).json({ success: false, message: err.message })
//       }
//     })

//     app.put("/api/courses/comment/:id", async (req, res) => {
//       const { userId, text } = req.body
//       try {
//         const course = await Course.findById(req.params.id)
//         if (!course) return res.status(404).json({ success: false, message: "Course not found" })

//         course.comments.push({ userId, text })
//         await course.save()

//         const populatedCourse = await Course.findById(course._id)
//           .populate("createdBy", "name profilePicture")
//           .populate("comments.userId", "name profilePicture")

//         res.json({ success: true, course: populatedCourse })
//       } catch (err) {
//         console.error("Course comment error:", err)
//         res.status(500).json({ success: false, message: err.message })
//       }
//     })

//     app.put("/api/courses/view/:id", async (req, res) => {
//       try {
//         const course = await Course.findById(req.params.id)
//         if (!course) return res.status(404).json({ success: false, message: "Course not found" })

//         course.views = (course.views || 0) + 1
//         await course.save()

//         res.status(200).json({ success: true, message: "View count incremented", views: course.views })
//       } catch (err) {
//         console.error("Course view increment error:", err)
//         res.status(500).json({ success: false, message: err.message })
//       }
//     })

//     app.delete("/api/courses/:courseId", async (req, res) => {
//       try {
//         const { courseId } = req.params
//         const { userId } = req.query

//         if (!courseId || !userId) {
//           return res.status(400).json({ success: false, message: "Course ID and User ID are required" })
//         }

//         const course = await Course.findById(courseId)
//         if (!course) {
//           return res.status(404).json({ success: false, message: "Course not found" })
//         }

//         if (course.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only delete your own courses" })
//         }

//         await Course.findByIdAndDelete(courseId)
//         res.status(200).json({ success: true, message: "Course deleted successfully" })
//       } catch (error) {
//         console.error("Delete course error:", error)
//         res.status(500).json({ success: false, message: "Failed to delete course", error: error.message })
//       }
//     })

//     app.get("/api/users/achievements/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params

//         const courseStats = await Course.aggregate([
//           { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
//           {
//             $group: {
//               _id: null,
//               totalCourses: { $sum: 1 },
//               totalViews: { $sum: "$views" },
//               totalLikes: { $sum: { $size: "$likes" } },
//             },
//           },
//         ])

//         const totalCoursesCreated = courseStats[0]?.totalCourses || 0
//         const totalCourseViews = courseStats[0]?.totalViews || 0
//         const totalCourseLikes = courseStats[0]?.totalLikes || 0

//         const commentsOnCourses = await Course.aggregate([
//           { $unwind: "$comments" },
//           { $match: { "comments.userId": new mongoose.Types.ObjectId(userId) } },
//           { $count: "totalComments" },
//         ])

//         const totalCommentsOnCourses = commentsOnCourses[0]?.totalComments || 0

//         const commentsOnPosts = await Post.aggregate([
//           { $unwind: "$comments" },
//           { $match: { "comments.userId": new mongoose.Types.ObjectId(userId) } },
//           { $count: "totalComments" },
//         ])

//         const totalCommentsOnPosts = commentsOnPosts[0]?.totalComments || 0
//         const totalCommentsMade = totalCommentsOnCourses + totalCommentsOnPosts

//         const groupMessagesSent = await Message.aggregate([{ $match: { sender: userId } }, { $count: "totalMessages" }])
//         const totalGroupMessages = groupMessagesSent[0]?.totalMessages || 0

//         const achievements = []

//         if (totalCoursesCreated >= 1) {
//           achievements.push({
//             _id: "ach_course_1",
//             name: "First Course Published 🎓",
//             description: "You've published your very first course on the platform!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "book-plus-outline",
//           })
//         }

//         if (totalCoursesCreated >= 5) {
//           achievements.push({
//             _id: "ach_course_5",
//             name: "Prolific Instructor 📚",
//             description: "You've published 5 or more courses!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "bookshelf",
//           })
//         }

//         if (totalCourseViews >= 1000) {
//           achievements.push({
//             _id: "ach_views_1k",
//             name: "Popular Educator ⭐",
//             description: `Your courses have collectively reached ${totalCourseViews} views!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "eye-check-outline",
//           })
//         }

//         if (totalCourseLikes >= 500) {
//           achievements.push({
//             _id: "ach_likes_500",
//             name: "Fan Favorite Creator ❤️",
//             description: `Your courses have received ${totalCourseLikes} likes!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "heart-multiple-outline",
//           })
//         }

//         if (totalCommentsMade >= 50) {
//           achievements.push({
//             _id: "ach_comment_50",
//             name: "Community Engager 💬",
//             description: `You've made ${totalCommentsMade} comments on courses and posts!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "comment-multiple-outline",
//           })
//         }

//         if (totalGroupMessages >= 100) {
//           achievements.push({
//             _id: "ach_group_100",
//             name: "Chatty Member 🗣️",
//             description: `You've sent ${totalGroupMessages} messages in groups!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "chat-processing-outline",
//           })
//         }

//         res.json({ success: true, achievements })
//       } catch (error) {
//         console.error("❌ Error fetching user achievements:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user achievements.", error: error.message })
//       }
//     })

//     // Connection Routes
//     app.post("/api/connections/request", async (req, res) => {
//       try {
//         const { senderId, receiverId } = req.body

//         if (!senderId || !receiverId) {
//           return res.status(400).json({ success: false, message: "Sender and receiver IDs are required." })
//         }

//         if (senderId === receiverId) {
//           return res.status(400).json({ success: false, message: "Cannot send a connection request to yourself." })
//         }

//         const existingRequest = await ConnectionRequest.findOne({
//           $or: [
//             { sender: senderId, receiver: receiverId },
//             { sender: receiverId, receiver: senderId, status: "accepted" },
//           ],
//         })

//         if (existingRequest) {
//           if (existingRequest.status === "pending") {
//             return res.status(409).json({ success: false, message: "Connection request already sent." })
//           } else if (existingRequest.status === "accepted") {
//             return res.status(409).json({ success: false, message: "Already connected with this user." })
//           }
//         }

//         const newRequest = new ConnectionRequest({ sender: senderId, receiver: receiverId })
//         await newRequest.save()

//         // ✅ FIXED: Safe notification sending
//         if (admin) {
//           try {
//             const receiverUser = await User.findById(receiverId).select("fcmToken name")
//             if (receiverUser && receiverUser.fcmToken) {
//               const senderUser = await User.findById(senderId).select("name")
//               await admin.messaging().send({
//                 token: receiverUser.fcmToken,
//                 notification: {
//                   title: "New Connection Request! 🤝",
//                   body: `${senderUser?.name || "Someone"} wants to connect with you.`,
//                 },
//                 data: {
//                   type: "connection_request",
//                   senderId: senderId,
//                   requestId: newRequest._id.toString(),
//                 },
//               })
//             }
//           } catch (notificationError) {
//             console.error("❌ Notification error:", notificationError)
//             // Don't fail the request if notification fails
//           }
//         }

//         res.status(201).json({ success: true, message: "Connection request sent.", request: newRequest })
//       } catch (error) {
//         console.error("Error sending connection request:", error)
//         res.status(500).json({ success: false, message: "Failed to send connection request.", error: error.message })
//       }
//     })

//     app.put("/api/connections/accept/:requestId", async (req, res) => {
//       try {
//         const { requestId } = req.params
//         const { userId } = req.body

//         console.log(`✅ Accepting connection request: ${requestId} by user: ${userId}`)

//         const request = await ConnectionRequest.findById(requestId)
//         if (!request) {
//           return res.status(404).json({ success: false, message: "Connection request not found." })
//         }

//         if (request.receiver.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You are not authorized to accept this request." })
//         }

//         if (request.status !== "pending") {
//           return res.status(409).json({ success: false, message: "Request is not pending." })
//         }

//         request.status = "accepted"
//         await request.save()

//         await User.findByIdAndUpdate(request.sender, { $addToSet: { connections: request.receiver } })
//         await User.findByIdAndUpdate(request.receiver, { $addToSet: { connections: request.sender } })

//         let chat = await PrivateChat.findOne({
//           participants: { $all: [request.sender, request.receiver] },
//         })

//         if (!chat) {
//           chat = new PrivateChat({ participants: [request.sender, request.receiver] })
//           await chat.save()
//           console.log("✅ Private chat created successfully")
//         }

//         // ✅ FIXED: Safe notification sending
//         if (admin) {
//           try {
//             const senderUser = await User.findById(request.sender).select("fcmToken name")
//             if (senderUser && senderUser.fcmToken) {
//               const receiverUser = await User.findById(request.receiver).select("name")
//               await admin.messaging().send({
//                 token: senderUser.fcmToken,
//                 notification: {
//                   title: "Connection Accepted! 🎉",
//                   body: `${receiverUser?.name || "Someone"} accepted your connection request.`,
//                 },
//                 data: {
//                   type: "connection_accepted",
//                   receiverId: request.receiver.toString(),
//                   chatId: chat._id.toString(),
//                 },
//               })
//             }
//           } catch (notificationError) {
//             console.error("❌ Notification error:", notificationError)
//             // Don't fail the request if notification fails
//           }
//         }

//         console.log("✅ Connection request accepted successfully")
//         res.status(200).json({ success: true, message: "Connection request accepted.", request })
//       } catch (error) {
//         console.error("❌ Error accepting connection request:", error)
//         res.status(500).json({ success: false, message: "Failed to accept connection request.", error: error.message })
//       }
//     })

//     app.put("/api/connections/reject/:requestId", async (req, res) => {
//       try {
//         const { requestId } = req.params
//         const { userId } = req.body

//         const request = await ConnectionRequest.findById(requestId)
//         if (!request) {
//           return res.status(404).json({ success: false, message: "Connection request not found." })
//         }

//         if (request.receiver.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You are not authorized to reject this request." })
//         }

//         if (request.status !== "pending") {
//           return res.status(409).json({ success: false, message: "Request is not pending." })
//         }

//         request.status = "rejected"
//         await request.save()

//         res.status(200).json({ success: true, message: "Connection request rejected.", request })
//       } catch (error) {
//         console.error("Error rejecting connection request:", error)
//         res.status(500).json({ success: false, message: "Failed to reject connection request.", error: error.message })
//       }
//     })

//     app.get("/api/connections/pending/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const pendingRequests = await ConnectionRequest.find({ receiver: userId, status: "pending" }).populate(
//           "sender",
//           "name profilePicture",
//         )
//         res.status(200).json({ success: true, requests: pendingRequests })
//       } catch (error) {
//         console.error("Error fetching pending requests:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch pending requests.", error: error.message })
//       }
//     })

//     app.get("/api/connections/sent/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const sentRequests = await ConnectionRequest.find({ sender: userId, status: "pending" }).populate(
//           "receiver",
//           "name profilePicture",
//         )
//         res.status(200).json({ success: true, requests: sentRequests })
//       } catch (error) {
//         console.error("Error fetching sent requests:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch sent requests.", error: error.message })
//       }
//     })

//     app.get("/api/connections/accepted/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const acceptedConnections = await ConnectionRequest.find({
//           $or: [{ sender: userId }, { receiver: userId }],
//           status: "accepted",
//         })
//           .populate("sender", "name profilePicture")
//           .populate("receiver", "name profilePicture")

//         const connections = acceptedConnections
//           .map((conn) => {
//             if (conn.sender._id.toString() === userId) {
//               return conn.receiver
//             } else {
//               return conn.sender
//             }
//           })
//           .filter(
//             (value, index, self) => self.findIndex((user) => user._id.toString() === value._id.toString()) === index,
//           )

//         res.status(200).json({ success: true, connections })
//       } catch (error) {
//         console.error("Error fetching accepted connections:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch accepted connections.", error: error.message })
//       }
//     })

//     // Private Chat Routes
//     app.get("/api/chats/find/:user1Id/:user2Id", async (req, res) => {
//       try {
//         const { user1Id, user2Id } = req.params
//         let chat = await PrivateChat.findOne({
//           participants: { $all: [user1Id, user2Id] },
//         })

//         if (!chat) {
//           chat = new PrivateChat({ participants: [user1Id, user2Id] })
//           await chat.save()
//         }

//         res.status(200).json({ success: true, chat })
//       } catch (error) {
//         console.error("Error finding/creating chat:", error)
//         res.status(500).json({ success: false, message: "Failed to find or create chat.", error: error.message })
//       }
//     })

//     app.get("/api/chats/user/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const chats = await PrivateChat.find({ participants: userId })
//           .populate("participants", "name profilePicture")
//           .populate("lastMessage")
//           .sort({ lastMessageAt: -1 })

//         res.status(200).json({ success: true, chats })
//       } catch (error) {
//         console.error("Error fetching user chats:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user chats.", error: error.message })
//       }
//     })

//     app.get("/api/chats/:chatId/messages", async (req, res) => {
//       try {
//         const { chatId } = req.params
//         const messages = await PrivateMessage.find({ chat: chatId })
//           .populate("sender", "name profilePicture")
//           .sort({ createdAt: 1 })

//         res.status(200).json({ success: true, messages })
//       } catch (error) {
//         console.error("Error fetching chat messages:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch chat messages.", error: error.message })
//       }
//     })

//     app.post("/api/chats/message", async (req, res) => {
//       try {
//         const { chatId, senderId, text } = req.body

//         if (!chatId || !senderId || !text) {
//           return res.status(400).json({ success: false, message: "Chat ID, sender ID, and text are required." })
//         }

//         const newMessage = new PrivateMessage({ chat: chatId, sender: senderId, text })
//         await newMessage.save()

//         await PrivateChat.findByIdAndUpdate(chatId, {
//           lastMessage: newMessage._id,
//           lastMessageAt: newMessage.createdAt,
//         })

//         const populatedMessage = await PrivateMessage.findById(newMessage._id).populate("sender", "name profilePicture")

//         io.to(chatId).emit("receivePrivateMessage", populatedMessage)

//         // ✅ FIXED: Safe notification sending
//         if (admin) {
//           try {
//             const chat = await PrivateChat.findById(chatId).populate("participants", "fcmToken name")
//             if (chat) {
//               const otherParticipant = chat.participants.find((p) => p._id.toString() !== senderId)
//               if (otherParticipant && otherParticipant.fcmToken) {
//                 const senderUser = await User.findById(senderId).select("name")
//                 await admin.messaging().send({
//                   token: otherParticipant.fcmToken,
//                   notification: {
//                     title: `New Message from ${senderUser?.name || "Someone"}`,
//                     body: text,
//                   },
//                   data: {
//                     type: "private_message",
//                     chatId: chatId,
//                     senderId: senderId,
//                   },
//                 })
//               }
//             }
//           } catch (notificationError) {
//             console.error("❌ Notification error:", notificationError)
//             // Don't fail the request if notification fails
//           }
//         }

//         res.status(201).json({ success: true, message: "Message sent.", message: populatedMessage })
//       } catch (error) {
//         console.error("Error sending private message:", error)
//         res.status(500).json({ success: false, message: "Failed to send private message.", error: error.message })
//       }
//     })

//     // Get all posts
//     app.get("/api/posts/", async (req, res) => {
//       try {
//         console.log("📝 Fetching all posts...")
//         const posts = await Post.find()
//           .populate("userId", "name email profilePicture isVerified")
//           .sort({ createdAt: -1 })

//         console.log(`✅ Found ${posts.length} posts`)
//         res.status(200).json({ success: true, posts })
//       } catch (error) {
//         console.error("❌ Error fetching posts:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch posts.", error: error.message })
//       }
//     })

//     app.get("/api/users/profile/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         console.log(`👤 Fetching profile for userId: ${userId}`)

//         if (!userId) {
//           return res.status(400).json({ success: false, message: "User ID is required" })
//         }

//         const user = await User.findById(userId).select("name email profilePicture bio isVerified isPrivate createdAt")

//         if (!user) {
//           return res.status(404).json({ success: false, message: "User not found" })
//         }

//         console.log(`✅ Found user profile: ${user.name}`)
//         res.status(200).json({ success: true, user })
//       } catch (error) {
//         console.error("❌ Error fetching user profile:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user profile.", error: error.message })
//       }
//     })

//     app.get("/api/posts/user/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         console.log(`📝 Fetching posts for userId: ${userId}`)

//         if (!userId) {
//           return res.status(400).json({ success: false, message: "User ID is required" })
//         }

//         const posts = await Post.find({ userId: userId })
//           .populate("userId", "name email profilePicture")
//           .sort({ createdAt: -1 })

//         console.log(`✅ Found ${posts.length} posts for user`)
//         res.status(200).json({ success: true, posts })
//       } catch (error) {
//         console.error("❌ Error fetching user posts:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user posts.", error: error.message })
//       }
//     })

//     app.put("/api/posts/like/:postId", async (req, res) => {
//       try {
//         const { postId } = req.params
//         const { userId } = req.body

//         console.log(`❤️ Like request for post: ${postId} by user: ${userId}`)

//         const post = await Post.findById(postId)
//         if (!post) {
//           return res.status(404).json({ success: false, message: "Post not found" })
//         }

//         const likeIndex = post.likes.indexOf(userId)
//         if (likeIndex > -1) {
//           post.likes.splice(likeIndex, 1)
//           console.log("👎 Post unliked")
//         } else {
//           post.likes.push(userId)
//           console.log("👍 Post liked")
//         }

//         await post.save()
//         res.status(200).json({ success: true, message: "Post like updated", likes: post.likes.length })
//       } catch (error) {
//         console.error("❌ Error updating post like:", error)
//         res.status(500).json({ success: false, message: "Failed to update like.", error: error.message })
//       }
//     })

//     app.put("/api/posts/comment/:postId", async (req, res) => {
//       try {
//         const { postId } = req.params
//         const { userId, text } = req.body

//         console.log(`💬 Comment request for post: ${postId} by user: ${userId}`)

//         if (!text || !text.trim()) {
//           return res.status(400).json({ success: false, message: "Comment text is required" })
//         }

//         const post = await Post.findById(postId)
//         if (!post) {
//           return res.status(404).json({ success: false, message: "Post not found" })
//         }

//         const newComment = {
//           userId,
//           text: text.trim(),
//           createdAt: new Date(),
//         }

//         post.comments.push(newComment)
//         await post.save()

//         console.log("✅ Comment added successfully")
//         res.status(200).json({ success: true, message: "Comment added successfully", comments: post.comments.length })
//       } catch (error) {
//         console.error("❌ Error adding comment:", error)
//         res.status(500).json({ success: false, message: "Failed to add comment.", error: error.message })
//       }
//     })

//     app.get("/api/users/discoverable/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         console.log(`🔍 Fetching discoverable users for userId: ${userId}`)

//         const users = await User.find({
//           _id: { $ne: userId },
//         }).select("name email profilePicture bio isVerified")

//         console.log(`✅ Found ${users.length} discoverable users`)
//         res.status(200).json({ success: true, users })
//       } catch (error) {
//         console.error("❌ Error fetching discoverable users:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch users.", error: error.message })
//       }
//     })

//     // Basic Routes
//     app.get("/", (req, res) => {
//       res.json({ message: "YouTube Chat Backend is running! 🚀" })
//     })

//     app.get("/api/users/test", (req, res) => {
//       res.send("✅ Server working!")
//     })

//     app.get("/api/posts/new-creators", async (req, res) => {
//       try {
//         const { page = 1, limit = 20 } = req.query
//         console.log("🌟 Fetching new creators posts...")

//         const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)
//         const newCreators = await User.find({
//           createdAt: { $gte: threeMonthsAgo },
//         }).select("_id")

//         if (newCreators.length === 0) {
//           return res.json({ success: true, posts: [], totalPages: 0, creators: 0 })
//         }

//         const newCreatorIds = newCreators.map((user) => user._id)
//         const posts = await Post.find({
//           userId: { $in: newCreatorIds },
//           likes: { $lt: 50 },
//         })
//           .populate("userId", "name email profilePicture createdAt")
//           .sort({ createdAt: -1 })
//           .skip((page - 1) * limit)
//           .limit(Number.parseInt(limit))

//         const totalPosts = await Post.countDocuments({
//           userId: { $in: newCreatorIds },
//           likes: { $lt: 50 },
//         })

//         const totalPages = Math.ceil(totalPosts / limit)

//         console.log(`✅ Found ${posts.length} posts from new creators`)
//         if (posts.length > 0) {
//           console.log("📝 Sample post structure:", {
//             _id: posts[0]._id,
//             userId: posts[0].userId,
//             userIdType: typeof posts[0].userId,
//           })
//         }

//         res.json({
//           success: true,
//           posts,
//           currentPage: Number.parseInt(page),
//           totalPages,
//           totalPosts,
//           creators: newCreators.length,
//         })
//       } catch (error) {
//         console.error("❌ Error fetching new creators posts:", error)
//         res.status(500).json({ success: false, error: error.message })
//       }
//     })

//     app.get("/api/posts/stats", async (req, res) => {
//       try {
//         console.log("📊 Fetching posts stats...")
//         const totalPosts = await Post.countDocuments()

//         const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
//         const recentPosts = await Post.countDocuments({
//           createdAt: { $gte: thirtyDaysAgo },
//         })

//         const likesResult = await Post.aggregate([
//           {
//             $group: {
//               _id: null,
//               totalLikes: { $sum: "$likes" },
//             },
//           },
//         ])

//         const totalLikes = likesResult[0]?.totalLikes || 0

//         const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)
//         const newCreators = await User.countDocuments({
//           createdAt: { $gte: threeMonthsAgo },
//         })

//         const newCreatorUsers = await User.find({
//           createdAt: { $gte: threeMonthsAgo },
//         }).select("_id")

//         const newCreatorIds = newCreatorUsers.map((user) => user._id)
//         const newCreatorPosts = await Post.countDocuments({
//           userId: { $in: newCreatorIds },
//         })

//         const stats = {
//           totalPosts,
//           recentPosts,
//           totalLikes,
//           newCreators,
//           newCreatorPosts,
//           avgLikesPerPost: totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0,
//         }

//         console.log("✅ Stats calculated:", stats)
//         res.json({
//           success: true,
//           stats,
//         })
//       } catch (error) {
//         console.error("❌ Error fetching stats:", error)
//         res.status(500).json({
//           success: false,
//           error: "Failed to fetch stats",
//         })
//       }
//     })

//     // Groups Routes
//     app.get("/api/groups", async (req, res) => {
//       try {
//         const groups = await Group.find().sort({ createdAt: -1 })
//         res.json(groups)
//       } catch (err) {
//         res.status(500).json({ message: "Error fetching groups" })
//       }
//     })

//     app.post("/api/groups", async (req, res) => {
//       try {
//         console.log("Received group creation request with body:", req.body)
//         const { name, createdBy, profilePicture, description } = req.body

//         const group = new Group({
//           name,
//           createdBy,
//           members: createdBy ? [createdBy] : [],
//           profilePicture: profilePicture || "",
//           description: description || "",
//         })

//         console.log("Saving group to DB:", group)
//         await group.save()

//         if (createdBy) {
//           await User.findByIdAndUpdate(createdBy, { $addToSet: { groups: group._id.toString() } })
//         }

//         res.status(201).json(group)
//       } catch (err) {
//         res.status(500).json({ message: "Error creating group" })
//       }
//     })

//     app.get("/api/messages/:group", async (req, res) => {
//       try {
//         const messages = await Message.find({ group: req.params.group }).sort({ createdAt: 1 })
//         res.json(messages)
//       } catch (err) {
//         res.status(500).json({ message: "Error fetching messages" })
//       }
//     })

//     app.post("/api/users/fcm-token", async (req, res) => {
//       const { userId, fcmToken } = req.body
//       try {
//         console.log(`💾 Saving FCM token for user: ${userId}`)
//         if (!userId || !fcmToken) {
//           return res.status(400).json({ success: false, message: "userId and fcmToken required" })
//         }

//         const updatedUser = await User.findByIdAndUpdate(userId, { fcmToken }, { new: true })
//         if (!updatedUser) {
//           console.log(`❌ User not found: ${userId}`)
//           return res.status(404).json({ success: false, message: "User not found" })
//         }

//         for (const [key] of tokenCache) {
//           if (key.includes(userId)) {
//             tokenCache.delete(key)
//           }
//         }

//         console.log(`✅ FCM token saved for user: ${updatedUser.name}`)
//         res.json({ success: true })
//       } catch (err) {
//         console.error("❌ Error saving FCM token:", err)
//         res.status(500).json({ success: false, message: "Error saving FCM token" })
//       }
//     })

//     app.post("/api/users/join-group", async (req, res) => {
//       const { userId, groupId } = req.body
//       try {
//         console.log(`👥 Adding user ${userId} to group ${groupId}`)
//         if (!userId || !groupId) {
//           return res.status(400).json({ success: false, message: "userId and groupId required" })
//         }

//         const updatedUser = await User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } }, { new: true })
//         if (!updatedUser) {
//           return res.status(404).json({ success: false, message: "User not found" })
//         }

//         await Group.findByIdAndUpdate(groupId, { $addToSet: { members: userId } })

//         for (const [key] of tokenCache) {
//           if (key.startsWith(groupId)) {
//             tokenCache.delete(key)
//           }
//         }

//         console.log(`✅ User ${updatedUser.name} added to group`)
//         res.json({ success: true })
//       } catch (err) {
//         console.error("❌ Error joining group:", err)
//         res.status(500).json({ success: false })
//       }
//     })

//     app.get("/api/courses", async (req, res) => {
//       try {
//         const { page = 1, limit = 20, search = "", category = "" } = req.query

//         const query = {}
//         if (search) {
//           query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
//         }
//         if (category) {
//           query.category = { $regex: category, $options: "i" }
//         }

//         const courses = await Course.find(query)
//           .populate("createdBy", "name profilePicture")
//           .populate("comments.userId", "name profilePicture")
//           .sort({ createdAt: -1 })
//           .skip((page - 1) * limit)
//           .limit(Number.parseInt(limit))

//         const totalCourses = await Course.countDocuments(query)
//         const totalPages = Math.ceil(totalCourses / limit)

//         res.json({
//           success: true,
//           courses,
//           currentPage: Number.parseInt(page),
//           totalPages,
//           totalCourses,
//         })
//       } catch (error) {
//         console.error("❌ Error fetching courses:", error)
//         res.status(500).json({ success: false, error: error.message })
//       }
//     })

//     app.get("/api/courses/user/:userId", async (req, res) => {
//       try {
//         const courses = await Course.find({ createdBy: req.params.userId })
//           .populate("createdBy", "name profilePicture")
//           .populate("comments.userId", "name profilePicture")
//           .sort({ createdAt: -1 })

//         res.json({ success: true, courses })
//       } catch (error) {
//         console.error("❌ Error fetching user courses:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user courses." })
//       }
//     })
//   })
//   .catch((err) => {
//     console.log("❌ MongoDB Connection Error:", err)
//     process.exit(1)
//   })

// // Socket.io handlers
// io.on("connection", (socket) => {
//   console.log("🟢 User connected:", socket.id)

//   socket.on("joinGroup", (groupId) => {
//     socket.join(groupId)
//     console.log(`👥 Socket joined group: ${groupId}`)
//   })

//   socket.on("joinPrivateChat", (chatId) => {
//     socket.join(chatId)
//     console.log(`👥 Socket joined private chat: ${chatId}`)
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
//         const result = await sendFirebaseNotification(
//           tokens,
//           {
//             title: `💬 New Message`,
//             body: `${messageData.senderName}: ${messageData.message}`,
//           },
//           {
//             type: "group_message",
//             groupId: data.group,
//             messageId: newMsg._id.toString(),
//             senderName: messageData.senderName,
//             message: messageData.message,
//           },
//         )

//         const processingTime = Date.now() - startTime
//         console.log(
//           `✅ Notifications sent in ${processingTime}ms - Success: ${result.successCount}, Failed: ${result.failureCount}`,
//         )
//         if (result.failureCount > 0) {
//           console.log("❌ Failed notifications:")
//           result.responses?.forEach((response, index) => {
//             if (!response.success) {
//               console.log(`   Token ${index}: ${response.error?.message}`)
//             }
//           })
//         }
//       } else {
//         console.log("⚠️ No FCM tokens found for group members")
//       }

//       const totalTime = Date.now() - startTime
//       console.log(`⏱️ Total message processing time: ${totalTime}ms`)
//     } catch (error) {
//       console.error("❌ Error in sendMessage:", error)
//     }
//   })

//   // Add this in the socket.io handlers section, after the existing sendMessage handler

//   socket.on("sendPrivateMessage", async (data) => {
//     try {
//       console.log("📨 Processing private message:", data)

//       const { chatId, senderId, text, senderName } = data

//       if (!chatId || !senderId || !text) {
//         console.error("❌ Invalid private message data")
//         return
//       }

//       // Save message to database
//       const newMessage = new PrivateMessage({
//         chat: chatId,
//         sender: senderId,
//         text: text.trim(),
//       })
//       await newMessage.save()

//       // Update chat's last message
//       await PrivateChat.findByIdAndUpdate(chatId, {
//         lastMessage: newMessage._id,
//         lastMessageAt: newMessage.createdAt,
//       })

//       // Populate sender info
//       const populatedMessage = await PrivateMessage.findById(newMessage._id).populate("sender", "name profilePicture")

//       // Emit to all users in this private chat
//       io.to(chatId).emit("receivePrivateMessage", populatedMessage)

//       // Send confirmation back to sender
//       socket.emit("privateMessageSent", populatedMessage)

//       console.log("✅ Private message sent successfully via socket")

//       // ✅ Firebase notification in background (non-blocking)
//       setImmediate(async () => {
//         try {
//           if (admin) {
//             const chat = await PrivateChat.findById(chatId).populate("participants", "fcmToken name")
//             if (chat) {
//               const otherParticipant = chat.participants.find((p) => p._id.toString() !== senderId)
//               if (otherParticipant && otherParticipant.fcmToken) {
//                 await admin.messaging().send({
//                   token: otherParticipant.fcmToken,
//                   notification: {
//                     title: `New Message from ${senderName || "Someone"}`,
//                     body: text,
//                   },
//                   data: {
//                     type: "private_message",
//                     chatId: chatId,
//                     senderId: senderId,
//                   },
//                 })
//                 console.log("✅ Private message notification sent")
//               }
//             }
//           }
//         } catch (notificationError) {
//           console.error("❌ Private message notification error:", notificationError)
//           // Don't affect the main message flow
//         }
//       })
//     } catch (error) {
//       console.error("❌ Error in sendPrivateMessage:", error)
//       socket.emit("privateMessageError", { error: "Failed to send message" })
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
//   console.log(`📡 API URL: http://localhost:${PORT}`)
//   console.log(`📱 Android Emulator URL: http://10.0.2.2:${PORT}`)
// })







// const express = require("express")
// const http = require("http")
// const { Server } = require("socket.io")
// const mongoose = require("mongoose")
// const cors = require("cors")
// require("dotenv").config()

// // ✅ FIXED: Firebase Admin SDK Configuration
// let admin
// try {
//   admin = require("firebase-admin")
//   // Check if Firebase is already initialized
//   if (!admin.apps.length) {
//     // Try to use environment variables first (recommended for production)
//     if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
//       console.log("🔥 Initializing Firebase with environment variables...")
//       admin.initializeApp({
//         credential: admin.credential.cert({
//           type: "service_account",
//           project_id: process.env.FIREBASE_PROJECT_ID,
//           private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
//           private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//           client_email: process.env.FIREBASE_CLIENT_EMAIL,
//           client_id: process.env.FIREBASE_CLIENT_ID,
//           auth_uri: "https://accounts.google.com/o/oauth2/auth",
//           token_uri: "https://oauth2.googleapis.com/token",
//           auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
//           client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
//         }),
//       })
//       console.log("✅ Firebase initialized with environment variables")
//     } else {
//       // Fallback to service account file (for development)
//       console.log("🔥 Initializing Firebase with service account file...")
//       const serviceAccount = require("./firebase-service-account.json") // Rename your file
//       admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount),
//       })
//       console.log("✅ Firebase initialized with service account file")
//     }
//   } else {
//     console.log("🔥 Firebase already initialized")
//   }
// } catch (error) {
//   console.error("❌ Firebase initialization error:", error.message)
//   console.log("⚠️ Continuing without Firebase (notifications will not work)")
//   admin = null
// }

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
//     profilePicture: { type: String, default: "" },
//   },
//   { timestamps: true },
// )

// const courseSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true, trim: true },
//     description: { type: String, trim: true },
//     videoUrl: { type: String, default: "" },
//     thumbnailUrl: { type: String, default: "" },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     instructorName: { type: String },
//     category: { type: String, default: "General" },
//     price: { type: Number, default: 0 },
//     duration: { type: String, default: "" },
//     likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     comments: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         text: String,
//         createdAt: { type: Date, default: Date.now },
//       },
//     ],
//     views: { type: Number, default: 0 },
//   },
//   { timestamps: true },
// )

// // 🎵 NEW: Playlist Schema
// const playlistSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     description: { type: String, default: "", trim: true },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     isPrivate: { type: Boolean, default: false },
//     videos: [
//       {
//         _id: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
//         caption: String,
//         videoUrl: String,
//         thumbnailUrl: String,
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         addedAt: { type: Date, default: Date.now },
//       },
//     ],
//     thumbnailUrl: { type: String, default: "" },
//     totalDuration: { type: String, default: "0:00" },
//     views: { type: Number, default: 0 },
//   },
//   { timestamps: true },
// )

// const connectionRequestSchema = new mongoose.Schema(
//   {
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
//   },
//   { timestamps: true },
// )

// const privateChatSchema = new mongoose.Schema(
//   {
//     participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
//     lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "PrivateMessage" },
//     lastMessageAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true },
// )

// const privateMessageSchema = new mongoose.Schema(
//   {
//     chat: { type: mongoose.Schema.Types.ObjectId, ref: "PrivateChat", required: true },
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     text: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
//     seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   },
//   { timestamps: true },
// )

// const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)
// const Group = mongoose.models.Group || mongoose.model("Group", groupSchema)
// const User = require("./models/user")
// const Post = require("./models/post")
// const Course = mongoose.models.Course || mongoose.model("Course", courseSchema)
// const Playlist = mongoose.models.Playlist || mongoose.model("Playlist", playlistSchema) // 🎵 NEW
// const ConnectionRequest =
//   mongoose.models.ConnectionRequest || mongoose.model("ConnectionRequest", connectionRequestSchema)
// const PrivateChat = mongoose.models.PrivateChat || mongoose.model("PrivateChat", privateChatSchema)
// const PrivateMessage = mongoose.models.PrivateMessage || mongoose.model("PrivateMessage", privateMessageSchema)

// // FCM token cache
// const tokenCache = new Map()
// const CACHE_DURATION = 5 * 60 * 1000

// // ✅ FIXED: Safe Firebase messaging function
// async function sendFirebaseNotification(tokens, notification, data) {
//   if (!admin) {
//     console.log("⚠️ Firebase not initialized, skipping notification")
//     return { successCount: 0, failureCount: tokens.length }
//   }
//   try {
//     const result = await admin.messaging().sendEachForMulticast({
//       tokens,
//       notification,
//       data,
//       android: {
//         priority: "high",
//         notification: {
//           channelId: "default",
//           sound: "default",
//           priority: "high",
//           defaultSound: true,
//           defaultVibrateTimings: true,
//         },
//         ttl: 3600000,
//       },
//       apns: {
//         headers: {
//           "apns-priority": "10",
//         },
//         payload: {
//           aps: {
//             alert: {
//               title: notification.title,
//               body: notification.body,
//             },
//             sound: "default",
//             badge: 1,
//           },
//         },
//       },
//     })
//     return result
//   } catch (error) {
//     console.error("❌ Firebase notification error:", error)
//     return { successCount: 0, failureCount: tokens.length }
//   }
// }

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

//     // 🎵 ===== PLAYLIST ROUTES ===== 🎵
//     console.log("🎵 Setting up Playlist routes...")

//     // Create new playlist
//     app.post("/api/playlists/create", async (req, res) => {
//       try {
//         const { name, description, isPrivate, createdBy, videos } = req.body
//         console.log("🎵 Creating new playlist:", { name, createdBy, isPrivate })

//         if (!name || !createdBy) {
//           return res.status(400).json({ success: false, message: "Name and creator are required." })
//         }

//         const newPlaylist = new Playlist({
//           name: name.trim(),
//           description: description?.trim() || "",
//           isPrivate: isPrivate || false,
//           createdBy,
//           videos: videos || [],
//         })

//         await newPlaylist.save()
//         console.log("✅ Playlist created:", newPlaylist.name)

//         res.status(201).json({
//           success: true,
//           message: "Playlist created successfully!",
//           playlist: newPlaylist,
//         })
//       } catch (error) {
//         console.error("❌ Error creating playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to create playlist.", error: error.message })
//       }
//     })

//     // Get user's playlists
//     app.get("/api/playlists/user/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         console.log(`📋 Fetching playlists for user: ${userId}`)

//         const playlists = await Playlist.find({ createdBy: userId })
//           .populate("createdBy", "name profilePicture")
//           .sort({ createdAt: -1 })

//         console.log(`✅ Found ${playlists.length} playlists`)
//         res.status(200).json({ success: true, playlists })
//       } catch (error) {
//         console.error("❌ Error fetching user playlists:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch playlists.", error: error.message })
//       }
//     })

//     // Get single playlist with videos
//     app.get("/api/playlists/:playlistId", async (req, res) => {
//       try {
//         const { playlistId } = req.params
//         console.log(`📋 Fetching playlist: ${playlistId}`)

//         const playlist = await Playlist.findById(playlistId)
//           .populate("createdBy", "name profilePicture")
//           .populate("videos.userId", "name profilePicture")

//         if (!playlist) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         // Increment view count
//         playlist.views = (playlist.views || 0) + 1
//         await playlist.save()

//         console.log(`✅ Found playlist: ${playlist.name}`)
//         res.status(200).json({ success: true, playlist })
//       } catch (error) {
//         console.error("❌ Error fetching playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch playlist.", error: error.message })
//       }
//     })

//     // Add video to playlist
//     app.put("/api/playlists/add-video", async (req, res) => {
//       try {
//         const { playlistId, videoId, userId } = req.body
//         console.log(`➕ Adding video ${videoId} to playlist ${playlistId}`)

//         if (!playlistId || !videoId || !userId) {
//           return res.status(400).json({ success: false, message: "Playlist ID, video ID, and user ID are required." })
//         }

//         const playlist = await Playlist.findById(playlistId)
//         if (!playlist) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         // Check if user owns the playlist
//         if (playlist.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only add videos to your own playlists" })
//         }

//         // Check if video already exists in playlist
//         const videoExists = playlist.videos.some((video) => video._id.toString() === videoId)
//         if (videoExists) {
//           return res.status(409).json({ success: false, message: "Video already exists in this playlist" })
//         }

//         // Get video details from Post collection
//         const post = await Post.findById(videoId).populate("userId", "name profilePicture")
//         if (!post) {
//           return res.status(404).json({ success: false, message: "Video not found" })
//         }

//         // Add video to playlist
//         const videoData = {
//           _id: post._id,
//           caption: post.caption,
//           videoUrl: post.videoUrl,
//           thumbnailUrl: post.imageUrl,
//           userId: post.userId._id,
//           addedAt: new Date(),
//         }

//         playlist.videos.push(videoData)
//         await playlist.save()

//         console.log("✅ Video added to playlist successfully")
//         res.status(200).json({ success: true, message: "Video added to playlist!", playlist })
//       } catch (error) {
//         console.error("❌ Error adding video to playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to add video to playlist.", error: error.message })
//       }
//     })

//     // Remove video from playlist
//     app.put("/api/playlists/remove-video", async (req, res) => {
//       try {
//         const { playlistId, videoId, userId } = req.body
//         console.log(`➖ Removing video ${videoId} from playlist ${playlistId}`)

//         const playlist = await Playlist.findById(playlistId)
//         if (!playlist) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         // Check if user owns the playlist
//         if (playlist.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only remove videos from your own playlists" })
//         }

//         // Remove video from playlist
//         playlist.videos = playlist.videos.filter((video) => video._id.toString() !== videoId)
//         await playlist.save()

//         console.log("✅ Video removed from playlist successfully")
//         res.status(200).json({ success: true, message: "Video removed from playlist!", playlist })
//       } catch (error) {
//         console.error("❌ Error removing video from playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to remove video from playlist.", error: error.message })
//       }
//     })

//     // Update playlist details
//     app.put("/api/playlists/update/:playlistId", async (req, res) => {
//       try {
//         const { playlistId } = req.params
//         const { name, description, isPrivate, userId } = req.body
//         console.log(`✏️ Updating playlist: ${playlistId}`)

//         if (!userId) {
//           return res.status(400).json({ success: false, message: "User ID is required" })
//         }

//         const playlist = await Playlist.findById(playlistId)
//         if (!playlist) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         // Check if user owns the playlist
//         if (playlist.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only update your own playlists" })
//         }

//         // Update playlist fields
//         if (name) playlist.name = name.trim()
//         if (description !== undefined) playlist.description = description.trim()
//         if (isPrivate !== undefined) playlist.isPrivate = isPrivate

//         await playlist.save()
//         console.log("✅ Playlist updated successfully")

//         res.status(200).json({ success: true, message: "Playlist updated successfully!", playlist })
//       } catch (error) {
//         console.error("❌ Error updating playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to update playlist.", error: error.message })
//       }
//     })

//     // Delete playlist
//     app.delete("/api/playlists/:playlistId", async (req, res) => {
//       try {
//         const { playlistId } = req.params
//         const { userId } = req.query
//         console.log(`🗑️ Deleting playlist: ${playlistId}`)

//         if (!userId) {
//           return res.status(400).json({ success: false, message: "User ID is required" })
//         }

//         const playlist = await Playlist.findById(playlistId)
//         if (!playlist) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         // Check if user owns the playlist
//         if (playlist.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only delete your own playlists" })
//         }

//         await Playlist.findByIdAndDelete(playlistId)
//         console.log("✅ Playlist deleted successfully")

//         res.status(200).json({ success: true, message: "Playlist deleted successfully!" })
//       } catch (error) {
//         console.error("❌ Error deleting playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to delete playlist.", error: error.message })
//       }
//     })

//     // Get all public playlists (for discovery)
//     app.get("/api/playlists/public/discover", async (req, res) => {
//       try {
//         const { page = 1, limit = 20 } = req.query
//         console.log("🔍 Fetching public playlists...")

//         const playlists = await Playlist.find({ isPrivate: false })
//           .populate("createdBy", "name profilePicture")
//           .sort({ createdAt: -1 })
//           .skip((page - 1) * limit)
//           .limit(Number.parseInt(limit))

//         const totalPlaylists = await Playlist.countDocuments({ isPrivate: false })
//         const totalPages = Math.ceil(totalPlaylists / limit)

//         console.log(`✅ Found ${playlists.length} public playlists`)
//         res.status(200).json({
//           success: true,
//           playlists,
//           currentPage: Number.parseInt(page),
//           totalPages,
//           totalPlaylists,
//         })
//       } catch (error) {
//         console.error("❌ Error fetching public playlists:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch public playlists.", error: error.message })
//       }
//     })

//     // Reorder videos in playlist
//     app.put("/api/playlists/reorder/:playlistId", async (req, res) => {
//       try {
//         const { playlistId } = req.params
//         const { videoIds, userId } = req.body
//         console.log(`🔄 Reordering videos in playlist: ${playlistId}`)

//         if (!userId || !videoIds || !Array.isArray(videoIds)) {
//           return res.status(400).json({ success: false, message: "User ID and video IDs array are required" })
//         }

//         const playlist = await Playlist.findById(playlistId)
//         if (!playlist) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         // Check if user owns the playlist
//         if (playlist.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only reorder your own playlists" })
//         }

//         // Reorder videos based on provided order
//         const reorderedVideos = []
//         for (const videoId of videoIds) {
//           const video = playlist.videos.find((v) => v._id.toString() === videoId)
//           if (video) {
//             reorderedVideos.push(video)
//           }
//         }

//         playlist.videos = reorderedVideos
//         await playlist.save()

//         console.log("✅ Videos reordered successfully")
//         res.status(200).json({ success: true, message: "Videos reordered successfully!", playlist })
//       } catch (error) {
//         console.error("❌ Error reordering videos:", error)
//         res.status(500).json({ success: false, message: "Failed to reorder videos.", error: error.message })
//       }
//     })

//     console.log("✅ Playlist routes setup complete!")

//     // Course Routes
//     app.post("/api/courses", async (req, res) => {
//       try {
//         const { title, description, videoUrl, thumbnailUrl, createdBy, instructorName, category, price, duration } =
//           req.body
//         if (!title || !videoUrl || !createdBy) {
//           return res.status(400).json({ success: false, message: "Title, video URL, and creator are required." })
//         }
//         const newCourse = new Course({
//           title,
//           description,
//           videoUrl,
//           thumbnailUrl,
//           createdBy,
//           instructorName,
//           category,
//           price: Number.parseFloat(price) || 0,
//           duration,
//         })
//         await newCourse.save()
//         res.status(201).json({ success: true, message: "Course created successfully!", course: newCourse })
//       } catch (error) {
//         console.error("Error creating course:", error)
//         res.status(500).json({ success: false, message: "Failed to create course.", error: error.message })
//       }
//     })

//     app.put("/api/courses/like/:id", async (req, res) => {
//       const { userId } = req.body
//       try {
//         const course = await Course.findById(req.params.id)
//         if (!course) return res.status(404).json({ success: false, message: "Course not found" })
//         const userIdStr = userId.toString()
//         if (course.likes.includes(userIdStr)) {
//           course.likes = course.likes.filter((id) => id.toString() !== userIdStr)
//         } else {
//           course.likes.push(userIdStr)
//         }
//         await course.save()
//         res.json({ success: true, course })
//       } catch (err) {
//         console.error("Course like/unlike error:", err)
//         res.status(500).json({ success: false, message: err.message })
//       }
//     })

//     app.put("/api/courses/comment/:id", async (req, res) => {
//       const { userId, text } = req.body
//       try {
//         const course = await Course.findById(req.params.id)
//         if (!course) return res.status(404).json({ success: false, message: "Course not found" })
//         course.comments.push({ userId, text })
//         await course.save()
//         const populatedCourse = await Course.findById(course._id)
//           .populate("createdBy", "name profilePicture")
//           .populate("comments.userId", "name profilePicture")
//         res.json({ success: true, course: populatedCourse })
//       } catch (err) {
//         console.error("Course comment error:", err)
//         res.status(500).json({ success: false, message: err.message })
//       }
//     })

//     app.put("/api/courses/view/:id", async (req, res) => {
//       try {
//         const course = await Course.findById(req.params.id)
//         if (!course) return res.status(404).json({ success: false, message: "Course not found" })
//         course.views = (course.views || 0) + 1
//         await course.save()
//         res.status(200).json({ success: true, message: "View count incremented", views: course.views })
//       } catch (err) {
//         console.error("Course view increment error:", err)
//         res.status(500).json({ success: false, message: err.message })
//       }
//     })

//     app.delete("/api/courses/:courseId", async (req, res) => {
//       try {
//         const { courseId } = req.params
//         const { userId } = req.query
//         if (!courseId || !userId) {
//           return res.status(400).json({ success: false, message: "Course ID and User ID are required" })
//         }
//         const course = await Course.findById(courseId)
//         if (!course) {
//           return res.status(404).json({ success: false, message: "Course not found" })
//         }
//         if (course.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only delete your own courses" })
//         }
//         await Course.findByIdAndDelete(courseId)
//         res.status(200).json({ success: true, message: "Course deleted successfully" })
//       } catch (error) {
//         console.error("Delete course error:", error)
//         res.status(500).json({ success: false, message: "Failed to delete course", error: error.message })
//       }
//     })

//     app.get("/api/users/achievements/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const courseStats = await Course.aggregate([
//           { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
//           {
//             $group: {
//               _id: null,
//               totalCourses: { $sum: 1 },
//               totalViews: { $sum: "$views" },
//               totalLikes: { $sum: { $size: "$likes" } },
//             },
//           },
//         ])
//         const totalCoursesCreated = courseStats[0]?.totalCourses || 0
//         const totalCourseViews = courseStats[0]?.totalViews || 0
//         const totalCourseLikes = courseStats[0]?.totalLikes || 0
//         const commentsOnCourses = await Course.aggregate([
//           { $unwind: "$comments" },
//           { $match: { "comments.userId": new mongoose.Types.ObjectId(userId) } },
//           { $count: "totalComments" },
//         ])
//         const totalCommentsOnCourses = commentsOnCourses[0]?.totalComments || 0
//         const commentsOnPosts = await Post.aggregate([
//           { $unwind: "$comments" },
//           { $match: { "comments.userId": new mongoose.Types.ObjectId(userId) } },
//           { $count: "totalComments" },
//         ])
//         const totalCommentsOnPosts = commentsOnPosts[0]?.totalComments || 0
//         const totalCommentsMade = totalCommentsOnCourses + totalCommentsOnPosts
//         const groupMessagesSent = await Message.aggregate([{ $match: { sender: userId } }, { $count: "totalMessages" }])
//         const totalGroupMessages = groupMessagesSent[0]?.totalMessages || 0

//         // 🎵 Add playlist achievements
//         const playlistStats = await Playlist.aggregate([
//           { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
//           {
//             $group: {
//               _id: null,
//               totalPlaylists: { $sum: 1 },
//               totalPlaylistViews: { $sum: "$views" },
//               totalVideosInPlaylists: { $sum: { $size: "$videos" } },
//             },
//           },
//         ])
//         const totalPlaylistsCreated = playlistStats[0]?.totalPlaylists || 0
//         const totalPlaylistViews = playlistStats[0]?.totalPlaylistViews || 0
//         const totalVideosInPlaylists = playlistStats[0]?.totalVideosInPlaylists || 0

//         const achievements = []
//         if (totalCoursesCreated >= 1) {
//           achievements.push({
//             _id: "ach_course_1",
//             name: "First Course Published 🎓",
//             description: "You've published your very first course on the platform!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "book-plus-outline",
//           })
//         }
//         if (totalCoursesCreated >= 5) {
//           achievements.push({
//             _id: "ach_course_5",
//             name: "Prolific Instructor 📚",
//             description: "You've published 5 or more courses!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "bookshelf",
//           })
//         }
//         if (totalCourseViews >= 1000) {
//           achievements.push({
//             _id: "ach_views_1k",
//             name: "Popular Educator ⭐",
//             description: `Your courses have collectively reached ${totalCourseViews} views!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "eye-check-outline",
//           })
//         }
//         if (totalCourseLikes >= 500) {
//           achievements.push({
//             _id: "ach_likes_500",
//             name: "Fan Favorite Creator ❤️",
//             description: `Your courses have received ${totalCourseLikes} likes!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "heart-multiple-outline",
//           })
//         }
//         if (totalCommentsMade >= 50) {
//           achievements.push({
//             _id: "ach_comment_50",
//             name: "Community Engager 💬",
//             description: `You've made ${totalCommentsMade} comments on courses and posts!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "comment-multiple-outline",
//           })
//         }
//         if (totalGroupMessages >= 100) {
//           achievements.push({
//             _id: "ach_group_100",
//             name: "Chatty Member 🗣️",
//             description: `You've sent ${totalGroupMessages} messages in groups!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "chat-processing-outline",
//           })
//         }

//         // 🎵 Playlist achievements
//         if (totalPlaylistsCreated >= 1) {
//           achievements.push({
//             _id: "ach_playlist_1",
//             name: "Playlist Creator 🎵",
//             description: "You've created your first playlist!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "playlist-music",
//           })
//         }
//         if (totalPlaylistsCreated >= 5) {
//           achievements.push({
//             _id: "ach_playlist_5",
//             name: "Playlist Master 🎼",
//             description: "You've created 5 or more playlists!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "playlist-star",
//           })
//         }
//         if (totalVideosInPlaylists >= 50) {
//           achievements.push({
//             _id: "ach_playlist_videos_50",
//             name: "Video Curator 📹",
//             description: `You've added ${totalVideosInPlaylists} videos to your playlists!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "video-plus-outline",
//           })
//         }
//         if (totalPlaylistViews >= 1000) {
//           achievements.push({
//             _id: "ach_playlist_views_1k",
//             name: "Popular Playlist Creator 🌟",
//             description: `Your playlists have received ${totalPlaylistViews} views!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "eye-star-outline",
//           })
//         }

//         res.json({ success: true, achievements })
//       } catch (error) {
//         console.error("❌ Error fetching user achievements:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user achievements.", error: error.message })
//       }
//     })

//     // Connection Routes
//     app.post("/api/connections/request", async (req, res) => {
//       try {
//         const { senderId, receiverId } = req.body
//         if (!senderId || !receiverId) {
//           return res.status(400).json({ success: false, message: "Sender and receiver IDs are required." })
//         }
//         if (senderId === receiverId) {
//           return res.status(400).json({ success: false, message: "Cannot send a connection request to yourself." })
//         }
//         const existingRequest = await ConnectionRequest.findOne({
//           $or: [
//             { sender: senderId, receiver: receiverId },
//             { sender: receiverId, receiver: senderId, status: "accepted" },
//           ],
//         })
//         if (existingRequest) {
//           if (existingRequest.status === "pending") {
//             return res.status(409).json({ success: false, message: "Connection request already sent." })
//           } else if (existingRequest.status === "accepted") {
//             return res.status(409).json({ success: false, message: "Already connected with this user." })
//           }
//         }
//         const newRequest = new ConnectionRequest({ sender: senderId, receiver: receiverId })
//         await newRequest.save()
//         // ✅ FIXED: Safe notification sending
//         if (admin) {
//           try {
//             const receiverUser = await User.findById(receiverId).select("fcmToken name")
//             if (receiverUser && receiverUser.fcmToken) {
//               const senderUser = await User.findById(senderId).select("name")
//               await admin.messaging().send({
//                 token: receiverUser.fcmToken,
//                 notification: {
//                   title: "New Connection Request! 🤝",
//                   body: `${senderUser?.name || "Someone"} wants to connect with you.`,
//                 },
//                 data: {
//                   type: "connection_request",
//                   senderId: senderId,
//                   requestId: newRequest._id.toString(),
//                 },
//               })
//             }
//           } catch (notificationError) {
//             console.error("❌ Notification error:", notificationError)
//             // Don't fail the request if notification fails
//           }
//         }
//         res.status(201).json({ success: true, message: "Connection request sent.", request: newRequest })
//       } catch (error) {
//         console.error("Error sending connection request:", error)
//         res.status(500).json({ success: false, message: "Failed to send connection request.", error: error.message })
//       }
//     })

//     app.put("/api/connections/accept/:requestId", async (req, res) => {
//       try {
//         const { requestId } = req.params
//         const { userId } = req.body
//         console.log(`✅ Accepting connection request: ${requestId} by user: ${userId}`)
//         const request = await ConnectionRequest.findById(requestId)
//         if (!request) {
//           return res.status(404).json({ success: false, message: "Connection request not found." })
//         }
//         if (request.receiver.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You are not authorized to accept this request." })
//         }
//         if (request.status !== "pending") {
//           return res.status(409).json({ success: false, message: "Request is not pending." })
//         }
//         request.status = "accepted"
//         await request.save()
//         await User.findByIdAndUpdate(request.sender, { $addToSet: { connections: request.receiver } })
//         await User.findByIdAndUpdate(request.receiver, { $addToSet: { connections: request.sender } })
//         let chat = await PrivateChat.findOne({
//           participants: { $all: [request.sender, request.receiver] },
//         })
//         if (!chat) {
//           chat = new PrivateChat({ participants: [request.sender, request.receiver] })
//           await chat.save()
//           console.log("✅ Private chat created successfully")
//         }
//         // ✅ FIXED: Safe notification sending
//         if (admin) {
//           try {
//             const senderUser = await User.findById(request.sender).select("fcmToken name")
//             if (senderUser && senderUser.fcmToken) {
//               const receiverUser = await User.findById(request.receiver).select("name")
//               await admin.messaging().send({
//                 token: senderUser.fcmToken,
//                 notification: {
//                   title: "Connection Accepted! 🎉",
//                   body: `${receiverUser?.name || "Someone"} accepted your connection request.`,
//                 },
//                 data: {
//                   type: "connection_accepted",
//                   receiverId: request.receiver.toString(),
//                   chatId: chat._id.toString(),
//                 },
//               })
//             }
//           } catch (notificationError) {
//             console.error("❌ Notification error:", notificationError)
//             // Don't fail the request if notification fails
//           }
//         }
//         console.log("✅ Connection request accepted successfully")
//         res.status(200).json({ success: true, message: "Connection request accepted.", request })
//       } catch (error) {
//         console.error("❌ Error accepting connection request:", error)
//         res.status(500).json({ success: false, message: "Failed to accept connection request.", error: error.message })
//       }
//     })

//     app.put("/api/connections/reject/:requestId", async (req, res) => {
//       try {
//         const { requestId } = req.params
//         const { userId } = req.body
//         const request = await ConnectionRequest.findById(requestId)
//         if (!request) {
//           return res.status(404).json({ success: false, message: "Connection request not found." })
//         }
//         if (request.receiver.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You are not authorized to reject this request." })
//         }
//         if (request.status !== "pending") {
//           return res.status(409).json({ success: false, message: "Request is not pending." })
//         }
//         request.status = "rejected"
//         await request.save()
//         res.status(200).json({ success: true, message: "Connection request rejected.", request })
//       } catch (error) {
//         console.error("Error rejecting connection request:", error)
//         res.status(500).json({ success: false, message: "Failed to reject connection request.", error: error.message })
//       }
//     })

//     app.get("/api/connections/pending/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const pendingRequests = await ConnectionRequest.find({ receiver: userId, status: "pending" }).populate(
//           "sender",
//           "name profilePicture",
//         )
//         res.status(200).json({ success: true, requests: pendingRequests })
//       } catch (error) {
//         console.error("Error fetching pending requests:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch pending requests.", error: error.message })
//       }
//     })

//     app.get("/api/connections/sent/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const sentRequests = await ConnectionRequest.find({ sender: userId, status: "pending" }).populate(
//           "receiver",
//           "name profilePicture",
//         )
//         res.status(200).json({ success: true, requests: sentRequests })
//       } catch (error) {
//         console.error("Error fetching sent requests:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch sent requests.", error: error.message })
//       }
//     })

//     app.get("/api/connections/accepted/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const acceptedConnections = await ConnectionRequest.find({
//           $or: [{ sender: userId }, { receiver: userId }],
//           status: "accepted",
//         })
//           .populate("sender", "name profilePicture")
//           .populate("receiver", "name profilePicture")
//         const connections = acceptedConnections
//           .map((conn) => {
//             if (conn.sender._id.toString() === userId) {
//               return conn.receiver
//             } else {
//               return conn.sender
//             }
//           })
//           .filter(
//             (value, index, self) => self.findIndex((user) => user._id.toString() === value._id.toString()) === index,
//           )
//         res.status(200).json({ success: true, connections })
//       } catch (error) {
//         console.error("Error fetching accepted connections:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch accepted connections.", error: error.message })
//       }
//     })

//     // Private Chat Routes
//     app.get("/api/chats/find/:user1Id/:user2Id", async (req, res) => {
//       try {
//         const { user1Id, user2Id } = req.params
//         let chat = await PrivateChat.findOne({
//           participants: { $all: [user1Id, user2Id] },
//         })
//         if (!chat) {
//           chat = new PrivateChat({ participants: [user1Id, user2Id] })
//           await chat.save()
//         }
//         res.status(200).json({ success: true, chat })
//       } catch (error) {
//         console.error("Error finding/creating chat:", error)
//         res.status(500).json({ success: false, message: "Failed to find or create chat.", error: error.message })
//       }
//     })

//     app.get("/api/chats/user/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const chats = await PrivateChat.find({ participants: userId })
//           .populate("participants", "name profilePicture")
//           .populate("lastMessage")
//           .sort({ lastMessageAt: -1 })
//         res.status(200).json({ success: true, chats })
//       } catch (error) {
//         console.error("Error fetching user chats:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user chats.", error: error.message })
//       }
//     })

//     app.get("/api/chats/:chatId/messages", async (req, res) => {
//       try {
//         const { chatId } = req.params
//         const messages = await PrivateMessage.find({ chat: chatId })
//           .populate("sender", "name profilePicture")
//           .sort({ createdAt: 1 })
//         res.status(200).json({ success: true, messages })
//       } catch (error) {
//         console.error("Error fetching chat messages:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch chat messages.", error: error.message })
//       }
//     })

//     app.post("/api/chats/message", async (req, res) => {
//       try {
//         const { chatId, senderId, text } = req.body
//         if (!chatId || !senderId || !text) {
//           return res.status(400).json({ success: false, message: "Chat ID, sender ID, and text are required." })
//         }
//         const newMessage = new PrivateMessage({ chat: chatId, sender: senderId, text })
//         await newMessage.save()
//         await PrivateChat.findByIdAndUpdate(chatId, {
//           lastMessage: newMessage._id,
//           lastMessageAt: newMessage.createdAt,
//         })
//         const populatedMessage = await PrivateMessage.findById(newMessage._id).populate("sender", "name profilePicture")
//         io.to(chatId).emit("receivePrivateMessage", populatedMessage)
//         // ✅ FIXED: Safe notification sending
//         if (admin) {
//           try {
//             const chat = await PrivateChat.findById(chatId).populate("participants", "fcmToken name")
//             if (chat) {
//               const otherParticipant = chat.participants.find((p) => p._id.toString() !== senderId)
//               if (otherParticipant && otherParticipant.fcmToken) {
//                 const senderUser = await User.findById(senderId).select("name")
//                 await admin.messaging().send({
//                   token: otherParticipant.fcmToken,
//                   notification: {
//                     title: `New Message from ${senderUser?.name || "Someone"}`,
//                     body: text,
//                   },
//                   data: {
//                     type: "private_message",
//                     chatId: chatId,
//                     senderId: senderId,
//                   },
//                 })
//               }
//             }
//           } catch (notificationError) {
//             console.error("❌ Notification error:", notificationError)
//             // Don't fail the request if notification fails
//           }
//         }
//         res.status(201).json({ success: true, message: "Message sent.", message: populatedMessage })
//       } catch (error) {
//         console.error("Error sending private message:", error)
//         res.status(500).json({ success: false, message: "Failed to send private message.", error: error.message })
//       }
//     })

//     // Get all posts
//     app.get("/api/posts/", async (req, res) => {
//       try {
//         console.log("📝 Fetching all posts...")
//         const posts = await Post.find()
//           .populate("userId", "name email profilePicture isVerified")
//           .sort({ createdAt: -1 })
//         console.log(`✅ Found ${posts.length} posts`)
//         res.status(200).json({ success: true, posts })
//       } catch (error) {
//         console.error("❌ Error fetching posts:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch posts.", error: error.message })
//       }
//     })

//     app.get("/api/users/profile/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         console.log(`👤 Fetching profile for userId: ${userId}`)
//         if (!userId) {
//           return res.status(400).json({ success: false, message: "User ID is required" })
//         }
//         const user = await User.findById(userId).select("name email profilePicture bio isVerified isPrivate createdAt")
//         if (!user) {
//           return res.status(404).json({ success: false, message: "User not found" })
//         }
//         console.log(`✅ Found user profile: ${user.name}`)
//         res.status(200).json({ success: true, user })
//       } catch (error) {
//         console.error("❌ Error fetching user profile:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user profile.", error: error.message })
//       }
//     })

//     app.get("/api/posts/user/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         console.log(`📝 Fetching posts for userId: ${userId}`)
//         if (!userId) {
//           return res.status(400).json({ success: false, message: "User ID is required" })
//         }
//         const posts = await Post.find({ userId: userId })
//           .populate("userId", "name email profilePicture")
//           .sort({ createdAt: -1 })
//         console.log(`✅ Found ${posts.length} posts for user`)
//         res.status(200).json({ success: true, posts })
//       } catch (error) {
//         console.error("❌ Error fetching user posts:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user posts.", error: error.message })
//       }
//     })

//     app.put("/api/posts/like/:postId", async (req, res) => {
//       try {
//         const { postId } = req.params
//         const { userId } = req.body
//         console.log(`❤️ Like request for post: ${postId} by user: ${userId}`)
//         const post = await Post.findById(postId)
//         if (!post) {
//           return res.status(404).json({ success: false, message: "Post not found" })
//         }
//         const likeIndex = post.likes.indexOf(userId)
//         if (likeIndex > -1) {
//           post.likes.splice(likeIndex, 1)
//           console.log("👎 Post unliked")
//         } else {
//           post.likes.push(userId)
//           console.log("👍 Post liked")
//         }
//         await post.save()
//         res.status(200).json({ success: true, message: "Post like updated", likes: post.likes.length })
//       } catch (error) {
//         console.error("❌ Error updating post like:", error)
//         res.status(500).json({ success: false, message: "Failed to update like.", error: error.message })
//       }
//     })

//     app.put("/api/posts/comment/:postId", async (req, res) => {
//       try {
//         const { postId } = req.params
//         const { userId, text } = req.body
//         console.log(`💬 Comment request for post: ${postId} by user: ${userId}`)
//         if (!text || !text.trim()) {
//           return res.status(400).json({ success: false, message: "Comment text is required" })
//         }
//         const post = await Post.findById(postId)
//         if (!post) {
//           return res.status(404).json({ success: false, message: "Post not found" })
//         }
//         const newComment = {
//           userId,
//           text: text.trim(),
//           createdAt: new Date(),
//         }
//         post.comments.push(newComment)
//         await post.save()
//         console.log("✅ Comment added successfully")
//         res.status(200).json({ success: true, message: "Comment added successfully", comments: post.comments.length })
//       } catch (error) {
//         console.error("❌ Error adding comment:", error)
//         res.status(500).json({ success: false, message: "Failed to add comment.", error: error.message })
//       }
//     })

//     app.get("/api/users/discoverable/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         console.log(`🔍 Fetching discoverable users for userId: ${userId}`)
//         const users = await User.find({
//           _id: { $ne: userId },
//         }).select("name email profilePicture bio isVerified")
//         console.log(`✅ Found ${users.length} discoverable users`)
//         res.status(200).json({ success: true, users })
//       } catch (error) {
//         console.error("❌ Error fetching discoverable users:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch users.", error: error.message })
//       }
//     })

//     // Basic Routes
//     app.get("/", (req, res) => {
//       res.json({ message: "YouTube Chat Backend is running! 🚀" })
//     })

//     app.get("/api/users/test", (req, res) => {
//       res.send("✅ Server working!")
//     })

//     app.get("/api/posts/new-creators", async (req, res) => {
//       try {
//         const { page = 1, limit = 20 } = req.query
//         console.log("🌟 Fetching new creators posts...")
//         const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)
//         const newCreators = await User.find({
//           createdAt: { $gte: threeMonthsAgo },
//         }).select("_id")
//         if (newCreators.length === 0) {
//           return res.json({ success: true, posts: [], totalPages: 0, creators: 0 })
//         }
//         const newCreatorIds = newCreators.map((user) => user._id)
//         const posts = await Post.find({
//           userId: { $in: newCreatorIds },
//           likes: { $lt: 50 },
//         })
//           .populate("userId", "name email profilePicture createdAt")
//           .sort({ createdAt: -1 })
//           .skip((page - 1) * limit)
//           .limit(Number.parseInt(limit))
//         const totalPosts = await Post.countDocuments({
//           userId: { $in: newCreatorIds },
//           likes: { $lt: 50 },
//         })
//         const totalPages = Math.ceil(totalPosts / limit)
//         console.log(`✅ Found ${posts.length} posts from new creators`)
//         if (posts.length > 0) {
//           console.log("📝 Sample post structure:", {
//             _id: posts[0]._id,
//             userId: posts[0].userId,
//             userIdType: typeof posts[0].userId,
//           })
//         }
//         res.json({
//           success: true,
//           posts,
//           currentPage: Number.parseInt(page),
//           totalPages,
//           totalPosts,
//           creators: newCreators.length,
//         })
//       } catch (error) {
//         console.error("❌ Error fetching new creators posts:", error)
//         res.status(500).json({ success: false, error: error.message })
//       }
//     })

//     app.get("/api/posts/stats", async (req, res) => {
//       try {
//         console.log("📊 Fetching posts stats...")
//         const totalPosts = await Post.countDocuments()
//         const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
//         const recentPosts = await Post.countDocuments({
//           createdAt: { $gte: thirtyDaysAgo },
//         })
//         const likesResult = await Post.aggregate([
//           {
//             $group: {
//               _id: null,
//               totalLikes: { $sum: "$likes" },
//             },
//           },
//         ])
//         const totalLikes = likesResult[0]?.totalLikes || 0
//         const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)
//         const newCreators = await User.countDocuments({
//           createdAt: { $gte: threeMonthsAgo },
//         })
//         const newCreatorUsers = await User.find({
//           createdAt: { $gte: threeMonthsAgo },
//         }).select("_id")
//         const newCreatorIds = newCreatorUsers.map((user) => user._id)
//         const newCreatorPosts = await Post.countDocuments({
//           userId: { $in: newCreatorIds },
//         })
//         const stats = {
//           totalPosts,
//           recentPosts,
//           totalLikes,
//           newCreators,
//           newCreatorPosts,
//           avgLikesPerPost: totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0,
//         }
//         console.log("✅ Stats calculated:", stats)
//         res.json({
//           success: true,
//           stats,
//         })
//       } catch (error) {
//         console.error("❌ Error fetching stats:", error)
//         res.status(500).json({
//           success: false,
//           error: "Failed to fetch stats",
//         })
//       }
//     })

//     // Groups Routes
//     app.get("/api/groups", async (req, res) => {
//       try {
//         const groups = await Group.find().sort({ createdAt: -1 })
//         res.json(groups)
//       } catch (err) {
//         res.status(500).json({ message: "Error fetching groups" })
//       }
//     })

//     app.post("/api/groups", async (req, res) => {
//       try {
//         console.log("Received group creation request with body:", req.body)
//         const { name, createdBy, profilePicture, description } = req.body
//         const group = new Group({
//           name,
//           createdBy,
//           members: createdBy ? [createdBy] : [],
//           profilePicture: profilePicture || "",
//           description: description || "",
//         })
//         console.log("Saving group to DB:", group)
//         await group.save()
//         if (createdBy) {
//           await User.findByIdAndUpdate(createdBy, { $addToSet: { groups: group._id.toString() } })
//         }
//         res.status(201).json(group)
//       } catch (err) {
//         res.status(500).json({ message: "Error creating group" })
//       }
//     })

//     app.get("/api/messages/:group", async (req, res) => {
//       try {
//         const messages = await Message.find({ group: req.params.group }).sort({ createdAt: 1 })
//         res.json(messages)
//       } catch (err) {
//         res.status(500).json({ message: "Error fetching messages" })
//       }
//     })

//     app.post("/api/users/fcm-token", async (req, res) => {
//       const { userId, fcmToken } = req.body
//       try {
//         console.log(`💾 Saving FCM token for user: ${userId}`)
//         if (!userId || !fcmToken) {
//           return res.status(400).json({ success: false, message: "userId and fcmToken required" })
//         }
//         const updatedUser = await User.findByIdAndUpdate(userId, { fcmToken }, { new: true })
//         if (!updatedUser) {
//           console.log(`❌ User not found: ${userId}`)
//           return res.status(404).json({ success: false, message: "User not found" })
//         }
//         for (const [key] of tokenCache) {
//           if (key.includes(userId)) {
//             tokenCache.delete(key)
//           }
//         }
//         console.log(`✅ FCM token saved for user: ${updatedUser.name}`)
//         res.json({ success: true })
//       } catch (err) {
//         console.error("❌ Error saving FCM token:", err)
//         res.status(500).json({ success: false, message: "Error saving FCM token" })
//       }
//     })

//     app.post("/api/users/join-group", async (req, res) => {
//       const { userId, groupId } = req.body
//       try {
//         console.log(`👥 Adding user ${userId} to group ${groupId}`)
//         if (!userId || !groupId) {
//           return res.status(400).json({ success: false, message: "userId and groupId required" })
//         }
//         const updatedUser = await User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } }, { new: true })
//         if (!updatedUser) {
//           return res.status(404).json({ success: false, message: "User not found" })
//         }
//         await Group.findByIdAndUpdate(groupId, { $addToSet: { members: userId } })
//         for (const [key] of tokenCache) {
//           if (key.startsWith(groupId)) {
//             tokenCache.delete(key)
//           }
//         }
//         console.log(`✅ User ${updatedUser.name} added to group`)
//         res.json({ success: true })
//       } catch (err) {
//         console.error("❌ Error joining group:", err)
//         res.status(500).json({ success: false })
//       }
//     })

//     app.get("/api/courses", async (req, res) => {
//       try {
//         const { page = 1, limit = 20, search = "", category = "" } = req.query
//         const query = {}
//         if (search) {
//           query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
//         }
//         if (category) {
//           query.category = { $regex: category, $options: "i" }
//         }
//         const courses = await Course.find(query)
//           .populate("createdBy", "name profilePicture")
//           .populate("comments.userId", "name profilePicture")
//           .sort({ createdAt: -1 })
//           .skip((page - 1) * limit)
//           .limit(Number.parseInt(limit))
//         const totalCourses = await Course.countDocuments(query)
//         const totalPages = Math.ceil(totalCourses / limit)
//         res.json({
//           success: true,
//           courses,
//           currentPage: Number.parseInt(page),
//           totalPages,
//           totalCourses,
//         })
//       } catch (error) {
//         console.error("❌ Error fetching courses:", error)
//         res.status(500).json({ success: false, error: error.message })
//       }
//     })

//     app.get("/api/courses/user/:userId", async (req, res) => {
//       try {
//         const courses = await Course.find({ createdBy: req.params.userId })
//           .populate("createdBy", "name profilePicture")
//           .populate("comments.userId", "name profilePicture")
//           .sort({ createdAt: -1 })
//         res.json({ success: true, courses })
//       } catch (error) {
//         console.error("❌ Error fetching user courses:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user courses." })
//       }
//     })
//   })
//   .catch((err) => {
//     console.log("❌ MongoDB Connection Error:", err)
//     process.exit(1)
//   })

// // Socket.io handlers
// io.on("connection", (socket) => {
//   console.log("🟢 User connected:", socket.id)

//   socket.on("joinGroup", (groupId) => {
//     socket.join(groupId)
//     console.log(`👥 Socket joined group: ${groupId}`)
//   })

//   socket.on("joinPrivateChat", (chatId) => {
//     socket.join(chatId)
//     console.log(`👥 Socket joined private chat: ${chatId}`)
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
//         const result = await sendFirebaseNotification(
//           tokens,
//           {
//             title: `💬 New Message`,
//             body: `${messageData.senderName}: ${messageData.message}`,
//           },
//           {
//             type: "group_message",
//             groupId: data.group,
//             messageId: newMsg._id.toString(),
//             senderName: messageData.senderName,
//             message: messageData.message,
//           },
//         )
//         const processingTime = Date.now() - startTime
//         console.log(
//           `✅ Notifications sent in ${processingTime}ms - Success: ${result.successCount}, Failed: ${result.failureCount}`,
//         )
//         if (result.failureCount > 0) {
//           console.log("❌ Failed notifications:")
//           result.responses?.forEach((response, index) => {
//             if (!response.success) {
//               console.log(`   Token ${index}: ${response.error?.message}`)
//             }
//           })
//         }
//       } else {
//         console.log("⚠️ No FCM tokens found for group members")
//       }
//       const totalTime = Date.now() - startTime
//       console.log(`⏱️ Total message processing time: ${totalTime}ms`)
//     } catch (error) {
//       console.error("❌ Error in sendMessage:", error)
//     }
//   })

//   // Add this in the socket.io handlers section, after the existing sendMessage handler
//   socket.on("sendPrivateMessage", async (data) => {
//     try {
//       console.log("📨 Processing private message:", data)
//       const { chatId, senderId, text, senderName } = data
//       if (!chatId || !senderId || !text) {
//         console.error("❌ Invalid private message data")
//         return
//       }
//       // Save message to database
//       const newMessage = new PrivateMessage({
//         chat: chatId,
//         sender: senderId,
//         text: text.trim(),
//       })
//       await newMessage.save()
//       // Update chat's last message
//       await PrivateChat.findByIdAndUpdate(chatId, {
//         lastMessage: newMessage._id,
//         lastMessageAt: newMessage.createdAt,
//       })
//       // Populate sender info
//       const populatedMessage = await PrivateMessage.findById(newMessage._id).populate("sender", "name profilePicture")
//       // Emit to all users in this private chat
//       io.to(chatId).emit("receivePrivateMessage", populatedMessage)
//       // Send confirmation back to sender
//       socket.emit("privateMessageSent", populatedMessage)
//       console.log("✅ Private message sent successfully via socket")
//       // ✅ Firebase notification in background (non-blocking)
//       setImmediate(async () => {
//         try {
//           if (admin) {
//             const chat = await PrivateChat.findById(chatId).populate("participants", "fcmToken name")
//             if (chat) {
//               const otherParticipant = chat.participants.find((p) => p._id.toString() !== senderId)
//               if (otherParticipant && otherParticipant.fcmToken) {
//                 await admin.messaging().send({
//                   token: otherParticipant.fcmToken,
//                   notification: {
//                     title: `New Message from ${senderName || "Someone"}`,
//                     body: text,
//                   },
//                   data: {
//                     type: "private_message",
//                     chatId: chatId,
//                     senderId: senderId,
//                   },
//                 })
//                 console.log("✅ Private message notification sent")
//               }
//             }
//           }
//         } catch (notificationError) {
//           console.error("❌ Private message notification error:", notificationError)
//           // Don't affect the main message flow
//         }
//       })
//     } catch (error) {
//       console.error("❌ Error in sendPrivateMessage:", error)
//       socket.emit("privateMessageError", { error: "Failed to send message" })
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
//   console.log(`📡 API URL: http://localhost:${PORT}`)
//   console.log(`📱 Android Emulator URL: http://10.0.2.2:${PORT}`)
//   console.log("🎵 Playlist functionality ready!")
// })





// const express = require("express")
// const http = require("http")
// const { Server } = require("socket.io")
// const mongoose = require("mongoose")
// const cors = require("cors")
// require("dotenv").config()

// // ✅ FIXED: Firebase Admin SDK Configuration
// let admin
// try {
//   admin = require("firebase-admin")
//   // Check if Firebase is already initialized
//   if (!admin.apps.length) {
//     // Try to use environment variables first (recommended for production)
//     if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
//       console.log("🔥 Initializing Firebase with environment variables...")
//       admin.initializeApp({
//         credential: admin.credential.cert({
//           type: "service_account",
//           project_id: process.env.FIREBASE_PROJECT_ID,
//           private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
//           private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//           client_email: process.env.FIREBASE_CLIENT_EMAIL,
//           client_id: process.env.FIREBASE_CLIENT_ID,
//           auth_uri: "https://accounts.google.com/o/oauth2/auth",
//           token_uri: "https://oauth2.googleapis.com/token",
//           auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
//           client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
//         }),
//       })
//       console.log("✅ Firebase initialized with environment variables")
//     } else {
//       // Fallback to service account file (for development)
//       console.log("🔥 Initializing Firebase with service account file...")
//       const serviceAccount = require("./firebase-service-account.json") // Rename your file
//       admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount),
//       })
//       console.log("✅ Firebase initialized with service account file")
//     }
//   } else {
//     console.log("🔥 Firebase already initialized")
//   }
// } catch (error) {
//   console.error("❌ Firebase initialization error:", error.message)
//   console.log("⚠️ Continuing without Firebase (notifications will not work)")
//   admin = null
// }

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

// const corsOptions = {
//   origin: [
//     'http://localhost:3000',
//     'http://localhost:19006',
//     'https://kanu-youtube.onrender.com'
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// };

// app.use(cors(corsOptions));
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
//     profilePicture: { type: String, default: "" },
//   },
//   { timestamps: true },
// )

// const courseSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true, trim: true },
//     description: { type: String, trim: true },
//     videoUrl: { type: String, default: "" },
//     thumbnailUrl: { type: String, default: "" },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     instructorName: { type: String },
//     category: { type: String, default: "General" },
//     price: { type: Number, default: 0 },
//     duration: { type: String, default: "" },
//     likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     savedCourses: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Course'
//   }],
//     comments: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         text: String,
//         createdAt: { type: Date, default: Date.now },
//       },
//     ],
//     views: { type: Number, default: 0 },
//   },
//   { timestamps: true },
// )

// // ✅ FIXED: Course Playlist Schema - Using proper references
// const coursePlaylistSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     description: { type: String, default: "", trim: true },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     isPrivate: { type: Boolean, default: false },
//     courses: [
//       {
//         courseId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Course", // ✅ This references the Course model
//           required: false, // ✅ Made optional to handle cleanup
//         },
//         addedAt: { type: Date, default: Date.now },
//       },
//     ],
//     views: { type: Number, default: 0 },
//   },
//   { timestamps: true },
// )

// // 🎵 Video Playlist Schema (using 'videos' and 'Post' ref)
// const playlistSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     description: { type: String, default: "", trim: true },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     isPrivate: { type: Boolean, default: false },
//     videos: [
//       {
//         _id: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // Reference to Post model
//         caption: String,
//         videoUrl: String,
//         thumbnailUrl: String, // This will come from Post.imageUrl
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Creator of the video
//         addedAt: { type: Date, default: Date.now },
//       },
//     ],
//     thumbnailUrl: { type: String, default: "" }, // Optional: for playlist cover
//     totalDuration: { type: String, default: "0:00" }, // Optional: sum of video durations
//     views: { type: Number, default: 0 },
//   },
//   { timestamps: true },
// )

// const connectionRequestSchema = new mongoose.Schema(
//   {
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
//   },
//   { timestamps: true },
// )

// const privateChatSchema = new mongoose.Schema(
//   {
//     participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
//     lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "PrivateMessage" },
//     lastMessageAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true },
// )

// const privateMessageSchema = new mongoose.Schema(
//   {
//     chat: { type: mongoose.Schema.Types.ObjectId, ref: "PrivateChat", required: true },
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     text: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
//     seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   },
//   { timestamps: true },
// )

// const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)
// const Group = mongoose.models.Group || mongoose.model("Group", groupSchema)
// const User = require("./models/user")
// const Post = require("./models/post")
// const Course = mongoose.models.Course || mongoose.model("Course", courseSchema)
// const CoursePlaylist = mongoose.models.CoursePlaylist || mongoose.model("CoursePlaylist", coursePlaylistSchema) // ✅ FIXED
// const Playlist = mongoose.models.Playlist || mongoose.model("Playlist", playlistSchema) // 🎵 Video Playlist Model
// const ConnectionRequest =
//   mongoose.models.ConnectionRequest || mongoose.model("ConnectionRequest", connectionRequestSchema)
// const PrivateChat = mongoose.models.PrivateChat || mongoose.model("PrivateChat", privateChatSchema)
// const PrivateMessage = mongoose.models.PrivateMessage || mongoose.model("PrivateMessage", privateMessageSchema)

// // FCM token cache
// const tokenCache = new Map()
// const CACHE_DURATION = 5 * 60 * 1000

// // ✅ FIXED: Safe Firebase messaging function
// async function sendFirebaseNotification(tokens, notification, data) {
//   if (!admin) {
//     console.log("⚠️ Firebase not initialized, skipping notification")
//     return { successCount: 0, failureCount: tokens.length }
//   }
//   try {
//     const result = await admin.messaging().sendEachForMulticast({
//       tokens,
//       notification,
//       data,
//       android: {
//         priority: "high",
//         notification: {
//           channelId: "default",
//           sound: "default",
//           priority: "high",
//           defaultSound: true,
//           defaultVibrateTimings: true,
//         },
//         ttl: 3600000,
//       },
//       apns: {
//         headers: {
//           "apns-priority": "10",
//         },
//         payload: {
//           aps: {
//             alert: {
//               title: notification.title,
//               body: notification.body,
//             },
//             sound: "default",
//             badge: 1,
//           },
//         },
//       },
//     })
//     return result
//   } catch (error) {
//     console.error("❌ Firebase notification error:", error)
//     return { successCount: 0, failureCount: tokens.length }
//   }
// }

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

//     // NEW: Test JSON endpoint
//     app.get("/api/test-json", (req, res) => {
//       res.json({ success: true, message: "JSON response from server!" })
//     })

//     // 🎵 ===== COURSE PLAYLIST ROUTES ===== 🎵
//     console.log("🎵 Setting up Course Playlist routes...")

//     // ✅ FIXED: Create new course playlist
//     app.post("/api/course-playlists/create", async (req, res) => {
//       try {
//         const { name, description, isPrivate, createdBy, courses } = req.body
//         console.log("🎵 Creating new course playlist:", { name, createdBy, isPrivate })

//         if (!name || !createdBy) {
//           return res.status(400).json({ success: false, message: "Name and creator are required." })
//         }

//         // ✅ FIXED: Store only course references, not full course data
//         let courseReferences = []
//         if (courses && courses.length > 0) {
//           // Validate that courses exist
//           const existingCourses = await Course.find({ _id: { $in: courses } }).select("_id")
//           courseReferences = existingCourses.map((course) => ({
//             courseId: course._id,
//             addedAt: new Date(),
//           }))
//         }

//         const newPlaylist = new CoursePlaylist({
//           name: name.trim(),
//           description: description?.trim() || "",
//           isPrivate: isPrivate || false,
//           createdBy,
//           courses: courseReferences, // ✅ Store references only
//         })

//         await newPlaylist.save()
//         console.log("✅ Course playlist created:", newPlaylist.name)

//         res.status(201).json({
//           success: true,
//           message: "Course playlist created successfully!",
//           playlist: newPlaylist,
//         })
//       } catch (error) {
//         console.error("❌ Error creating course playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to create playlist.", error: error.message })
//       }
//     })

//     // ✅ FIXED: Get user's course playlists (corrected route)
//     app.get("/api/course-playlists/user/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         console.log(`📋 Fetching course playlists for user: ${userId}`)

//         if (!userId || userId === "undefined") {
//           return res.status(400).json({ success: false, message: "Valid User ID is required" })
//         }

//         const playlists = await CoursePlaylist.find({ createdBy: userId })
//           .populate("createdBy", "name profilePicture")
//           .populate({
//             path: "courses.courseId",
//             model: "Course",
//             select:
//               "title description videoUrl thumbnailUrl instructorName category price duration likes comments views createdAt createdBy",
//             populate: {
//               path: "createdBy",
//               select: "name profilePicture",
//             },
//           })
//           .sort({ createdAt: -1 })

//         // ✅ Filter out courses where courseId is null (deleted courses)
//         const cleanedPlaylists = playlists.map((playlist) => {
//           playlist.courses = playlist.courses.filter((course) => course.courseId !== null)
//           return playlist
//         })

//         console.log(`✅ Found ${cleanedPlaylists.length} course playlists`)
//         res.status(200).json({ success: true, playlists: cleanedPlaylists })
//       } catch (error) {
//         console.error("❌ Error fetching user course playlists:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch playlists.", error: error.message })
//       }
//     })

//     // ✅ FIXED: Get single course playlist with populated courses (using aggregation to avoid validation errors)
//     app.get("/api/course-playlists/:playlistId", async (req, res) => {
//       try {
//         const { playlistId } = req.params
//         console.log(`📋 Fetching course playlist: ${playlistId}`)

//         // ✅ Use aggregation to filter out invalid courses at database level
//         const playlistData = await CoursePlaylist.aggregate([
//           { $match: { _id: new mongoose.Types.ObjectId(playlistId) } },
//           {
//             // Filter out courses with null courseId before population
//             $addFields: {
//               courses: {
//                 $filter: {
//                   input: "$courses",
//                   cond: {
//                     $and: [{ $ne: ["$$this.courseId", null] }, { $ne: ["$$this.courseId", undefined] }],
//                   },
//                 },
//               },
//             },
//           },
//           {
//             $lookup: {
//               from: "users",
//               localField: "createdBy",
//               foreignField: "_id",
//               as: "createdBy",
//               pipeline: [{ $project: { name: 1, profilePicture: 1 } }],
//             },
//           },
//           {
//             $lookup: {
//               from: "courses",
//               localField: "courses.courseId",
//               foreignField: "_id",
//               as: "courseDetails",
//               pipeline: [
//                 {
//                   $lookup: {
//                     from: "users",
//                     localField: "createdBy",
//                     foreignField: "_id",
//                     as: "createdBy",
//                     pipeline: [{ $project: { name: 1, profilePicture: 1 } }],
//                   },
//                 },
//                 { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
//               ],
//             },
//           },
//           {
//             $addFields: {
//               courses: {
//                 $map: {
//                   input: "$courses",
//                   as: "course",
//                   in: {
//                     courseId: {
//                       $arrayElemAt: [
//                         {
//                           $filter: {
//                             input: "$courseDetails",
//                             cond: { $eq: ["$$this._id", "$$course.courseId"] },
//                           },
//                         },
//                         0,
//                       ],
//                     },
//                     addedAt: "$$course.addedAt",
//                   },
//                 },
//               },
//             },
//           },
//           { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
//           { $project: { courseDetails: 0 } },
//         ])

//         if (!playlistData || playlistData.length === 0) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         const playlist = playlistData[0]

//         // ✅ Update view count using findByIdAndUpdate to avoid validation issues
//         await CoursePlaylist.findByIdAndUpdate(playlistId, { $inc: { views: 1 } }, { runValidators: false })

//         console.log(`✅ Found course playlist: ${playlist.name}`)
//         console.log(`📚 Courses in playlist:`, playlist.courses.length)

//         // ✅ Log the structure to debug
//         if (playlist.courses.length > 0) {
//           console.log("📝 Sample course structure:", JSON.stringify(playlist.courses[0], null, 2))
//         }

//         res.status(200).json({ success: true, playlist })
//       } catch (error) {
//         console.error("❌ Error fetching course playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch playlist.", error: error.message })
//       }
//     })

//     // ✅ FIXED: Add course to playlist
//     app.put("/api/course-playlists/add-course", async (req, res) => {
//       try {
//         const { playlistId, courseId, userId } = req.body
//         console.log(`➕ Adding course ${courseId} to playlist ${playlistId}`)

//         if (!playlistId || !courseId || !userId) {
//           return res.status(400).json({ success: false, message: "Playlist ID, course ID, and user ID are required." })
//         }

//         const playlist = await CoursePlaylist.findById(playlistId)
//         if (!playlist) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         // Check if user owns the playlist
//         if (playlist.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only add courses to your own playlists" })
//         }

//         // Check if course already exists in playlist
//         const courseExists = playlist.courses.some(
//           (course) => course.courseId && course.courseId.toString() === courseId,
//         )
//         if (courseExists) {
//           return res.status(409).json({ success: false, message: "Course already exists in this playlist" })
//         }

//         // Verify course exists
//         const course = await Course.findById(courseId)
//         if (!course) {
//           return res.status(404).json({ success: false, message: "Course not found" })
//         }

//         // ✅ FIXED: Add course reference only
//         const courseReference = {
//           courseId: courseId, // ✅ Store only the ObjectId reference
//           addedAt: new Date(),
//         }

//         playlist.courses.push(courseReference)
//         await playlist.save()

//         // ✅ Populate the playlist before sending response
//         const populatedPlaylist = await CoursePlaylist.findById(playlistId)
//           .populate("createdBy", "name profilePicture")
//           .populate({
//             path: "courses.courseId",
//             model: "Course",
//             select:
//               "title description videoUrl thumbnailUrl instructorName category price duration likes comments views createdAt createdBy",
//             populate: {
//               path: "createdBy",
//               select: "name profilePicture",
//             },
//           })

//         console.log("✅ Course added to playlist successfully")
//         res.status(200).json({ success: true, message: "Course added to playlist!", playlist: populatedPlaylist })
//       } catch (error) {
//         console.error("❌ Error adding course to playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to add course to playlist.", error: error.message })
//       }
//     })



//     // Save/Unsave Course
// app.put('/api/courses/save/:courseId', async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const { userId } = req.body;

//     if (!userId || !courseId) {
//       return res.status(400).json({ success: false, message: "User ID and Course ID are required" });
//     }

//     const user = await User.findById(userId);
//     const course = await Course.findById(courseId);

//     if (!user || !course) {
//       return res.status(404).json({ success: false, message: "User or Course not found" });
//     }

//     const isSaved = user.savedCourses.includes(courseId);
    
//     if (isSaved) {
//       // Remove from saved
//       user.savedCourses = user.savedCourses.filter(id => id.toString() !== courseId);
//       await user.save();
//       return res.json({ success: true, isSaved: false, message: "Course removed from saved" });
//     } else {
//       // Add to saved
//       user.savedCourses.push(courseId);
//       await user.save();
//       return res.json({ success: true, isSaved: true, message: "Course saved successfully" });
//     }
//   } catch (error) {
//     console.error("Save course error:", error);
//     res.status(500).json({ success: false, message: "Failed to save course" });
//   }
// });

// // Check if course is saved
// app.get('/api/courses/check-saved/:courseId/:userId', async (req, res) => {
//   try {
//     const { courseId, userId } = req.params;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     const isSaved = user.savedCourses.some(id => id.toString() === courseId);
//     res.json({ success: true, isSaved });
//   } catch (error) {
//     console.error("Check saved error:", error);
//     res.status(500).json({ success: false, message: "Failed to check saved status" });
//   }
// });

// // Get user's saved courses
// app.get('/api/users/saved-courses/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const user = await User.findById(userId).populate('savedCourses');
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     res.json({ success: true, savedCourses: user.savedCourses });
//   } catch (error) {
//     console.error("Get saved courses error:", error);
//     res.status(500).json({ success: false, message: "Failed to get saved courses" });
//   }
// });




//     // ✅ FIXED: Remove course from playlist
//     app.put("/api/course-playlists/remove-course", async (req, res) => {
//       try {
//         const { playlistId, courseId, userId } = req.body
//         console.log(`➖ Removing course ${courseId} from playlist ${playlistId}`)

//         const playlist = await CoursePlaylist.findById(playlistId)
//         if (!playlist) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         // Check if user owns the playlist
//         if (playlist.createdBy.toString() !== userId) {
//           return res
//             .status(403)
//             .json({ success: false, message: "You can only remove courses from your own playlists" })
//         }

//         // ✅ FIXED: Remove course by courseId reference
//         playlist.courses = playlist.courses.filter((course) => course.courseId.toString() !== courseId)
//         await playlist.save()

//         // ✅ Populate the playlist before sending response
//         const populatedPlaylist = await CoursePlaylist.findById(playlistId)
//           .populate("createdBy", "name profilePicture")
//           .populate({
//             path: "courses.courseId",
//             model: "Course",
//             select:
//               "title description videoUrl thumbnailUrl instructorName category price duration likes comments views createdAt createdBy",
//           })

//         console.log("✅ Course removed from playlist successfully")
//         res.status(200).json({ success: true, message: "Course removed from playlist!", playlist: populatedPlaylist })
//       } catch (error) {
//         console.error("❌ Error removing course from playlist:", error)
//         res
//           .status(500)
//           .json({ success: false, message: "Failed to remove course from playlist.", error: error.message })
//       }
//     })

//     // Delete course playlist
//     app.delete("/api/course-playlists/:playlistId", async (req, res) => {
//       try {
//         const { playlistId } = req.params
//         const { userId } = req.query
//         console.log(`🗑️ Deleting course playlist: ${playlistId}`)

//         if (!userId) {
//           return res.status(400).json({ success: false, message: "User ID is required" })
//         }

//         const playlist = await CoursePlaylist.findById(playlistId)
//         if (!playlist) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         // Check if user owns the playlist
//         if (playlist.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only delete your own playlists" })
//         }

//         await CoursePlaylist.findByIdAndDelete(playlistId)
//         console.log("✅ Course playlist deleted successfully")
//         res.status(200).json({ success: true, message: "Playlist deleted successfully!" })
//       } catch (error) {
//         console.error("❌ Error deleting course playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to delete playlist.", error: error.message })
//       }
//     })

//     // ✅ ADD: Cleanup route to fix existing corrupt playlists
//     app.post("/api/course-playlists/cleanup", async (req, res) => {
//       try {
//         console.log("🧹 Starting playlist cleanup...")

//         const playlists = await CoursePlaylist.find({})
//         let cleanedCount = 0

//         for (const playlist of playlists) {
//           const originalLength = playlist.courses.length
//           playlist.courses = playlist.courses.filter(
//             (course) => course.courseId !== null && course.courseId !== undefined,
//           )

//           if (playlist.courses.length !== originalLength) {
//             await playlist.save()
//             cleanedCount++
//             console.log(
//               `✅ Cleaned playlist: ${playlist.name} (removed ${originalLength - playlist.courses.length} invalid courses)`,
//             )
//           }
//         }

//         console.log(`✅ Cleanup complete! Cleaned ${cleanedCount} playlists`)
//         res.json({
//           success: true,
//           message: `Cleanup complete! Cleaned ${cleanedCount} playlists`,
//           totalPlaylists: playlists.length,
//           cleanedPlaylists: cleanedCount,
//         })
//       } catch (error) {
//         console.error("❌ Cleanup error:", error)
//         res.status(500).json({ success: false, message: "Cleanup failed", error: error.message })
//       }
//     })

//     // ✅ ADD: Debug route to check playlist structure
//     app.get("/api/debug/course-playlist/:playlistId", async (req, res) => {
//       try {
//         const { playlistId } = req.params

//         // Get raw playlist data
//         const rawPlaylist = await CoursePlaylist.findById(playlistId)
//         console.log("🔍 Raw playlist data:", JSON.stringify(rawPlaylist, null, 2))

//         // Get populated playlist data
//         const populatedPlaylist = await CoursePlaylist.findById(playlistId).populate("createdBy", "name").populate({
//           path: "courses.courseId",
//           model: "Course",
//         })

//         console.log("🔍 Populated playlist data:", JSON.stringify(populatedPlaylist, null, 2))

//         // Course analysis
//         const courseAnalysis = {
//           totalCourses: rawPlaylist?.courses?.length || 0,
//           validCourses: rawPlaylist?.courses?.filter((c) => c.courseId).length || 0,
//           invalidCourses: rawPlaylist?.courses?.filter((c) => !c.courseId).length || 0,
//         }

//         res.json({
//           success: true,
//           raw: rawPlaylist,
//           populated: populatedPlaylist,
//           analysis: courseAnalysis,
//           recommendations:
//             courseAnalysis.invalidCourses > 0
//               ? ["Run cleanup route to remove invalid courses"]
//               : ["Playlist structure looks good"],
//         })
//       } catch (error) {
//         console.error("Debug error:", error)
//         res.status(500).json({ success: false, error: error.message })
//       }
//     })

//     console.log("✅ Course Playlist routes setup complete!")

//     // ✅ NEW: Get public course playlists for discovery (YouTube-style feed)
//     app.get("/api/course-playlists/public/discover", async (req, res) => {
//       try {
//         const { page = 1, limit = 20, search = "", category = "" } = req.query
//         console.log("🔍 Fetching public course playlists for discovery...")

//         // Build query for public playlists
//         const query = { isPrivate: false }

//         // Add search functionality
//         if (search) {
//           query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
//         }

//         const playlists = await CoursePlaylist.find(query)
//           .populate("createdBy", "name profilePicture")
//           .populate({
//             path: "courses.courseId",
//             model: "Course",
//             select: "title thumbnailUrl videoUrl category",
//             match: category && category !== "All" ? { category: { $regex: category, $options: "i" } } : {},
//           })
//           .sort({ createdAt: -1 })
//           .skip((page - 1) * limit)
//           .limit(Number.parseInt(limit))

//         // Filter out playlists with no courses (if category filter applied)
//         const filteredPlaylists = playlists.filter(
//           (playlist) => !category || category === "All" || playlist.courses.some((course) => course.courseId),
//         )

//         const totalPlaylists = await CoursePlaylist.countDocuments(query)
//         const totalPages = Math.ceil(totalPlaylists / limit)

//         console.log(`✅ Found ${filteredPlaylists.length} public course playlists`)
//         res.status(200).json({
//           success: true,
//           playlists: filteredPlaylists,
//           currentPage: Number.parseInt(page),
//           totalPages,
//           totalPlaylists,
//         })
//       } catch (error) {
//         console.error("❌ Error fetching public course playlists:", error)
//         res.status(500).json({
//           success: false,
//           message: "Failed to fetch public playlists.",
//           error: error.message,
//         })
//       }
//     })

//     console.log("✅ Public playlist discovery route added!")

//     // 🎵 ===== VIDEO PLAYLIST ROUTES ===== 🎵
//     console.log("🎵 Setting up Video Playlist routes...")

//     // Create new video playlist
//     app.post("/api/playlists/create", async (req, res) => {
//       try {
//         const { name, description, isPrivate, createdBy, videos } = req.body
//         console.log("🎵 Creating new video playlist:", { name, createdBy, isPrivate })

//         if (!name || !createdBy) {
//           return res.status(400).json({ success: false, message: "Name and creator are required." })
//         }

//         // If videos are provided, get their details from Post model
//         let videoDetails = []
//         if (videos && videos.length > 0) {
//           const postData = await Post.find({ _id: { $in: videos } })
//             .populate("userId", "name profilePicture")
//             .lean()

//           videoDetails = postData.map((post) => ({
//             _id: post._id,
//             caption: post.caption,
//             videoUrl: post.videoUrl,
//             thumbnailUrl: post.imageUrl, // Use imageUrl from Post as thumbnail
//             userId: post.userId._id,
//             addedAt: new Date(),
//           }))
//         }

//         const newPlaylist = new Playlist({
//           name: name.trim(),
//           description: description?.trim() || "",
//           isPrivate: isPrivate || false,
//           createdBy,
//           videos: videoDetails,
//         })

//         await newPlaylist.save()
//         console.log("✅ Video playlist created:", newPlaylist.name)

//         res.status(201).json({
//           success: true,
//           message: "Video playlist created successfully!",
//           playlist: newPlaylist,
//         })
//       } catch (error) {
//         console.error("❌ Error creating video playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to create playlist.", error: error.message })
//       }
//     })

//     // Get user's video playlists
//     app.get("/api/playlists/user/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         console.log(`📋 Fetching video playlists for user: ${userId}`)

//         if (!userId) {
//           return res.status(400).json({ success: false, message: "User ID is required" })
//         }

//         const playlists = await Playlist.find({ createdBy: userId })
//           .populate("createdBy", "name profilePicture")
//           .sort({ createdAt: -1 })

//         console.log(`✅ Found ${playlists.length} video playlists`)
//         res.status(200).json({ success: true, playlists })
//       } catch (error) {
//         console.error("❌ Error fetching user video playlists:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch playlists.", error: error.message })
//       }
//     })

//     // Get single video playlist with videos
//     app.get("/api/playlists/:playlistId", async (req, res) => {
//       try {
//         const { playlistId } = req.params
//         console.log(`📋 Fetching video playlist: ${playlistId}`)

//         const playlist = await Playlist.findById(playlistId)
//           .populate("createdBy", "name profilePicture")
//           .populate("videos.userId", "name profilePicture") // Populate video creators

//         if (!playlist) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         // Increment view count
//         playlist.views = (playlist.views || 0) + 1
//         await playlist.save()

//         console.log(`✅ Found video playlist: ${playlist.name}`)
//         res.status(200).json({ success: true, playlist })
//       } catch (error) {
//         console.error("❌ Error fetching video playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch playlist.", error: error.message })
//       }
//     })

//     // Add video to playlist
//     app.put("/api/playlists/add-video", async (req, res) => {
//       try {
//         const { playlistId, videoId, userId } = req.body
//         console.log(`➕ Adding video ${videoId} to playlist ${playlistId}`)

//         if (!playlistId || !videoId || !userId) {
//           return res.status(400).json({ success: false, message: "Playlist ID, video ID, and user ID are required." })
//         }

//         const playlist = await Playlist.findById(playlistId)
//         if (!playlist) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         // Check if user owns the playlist
//         if (playlist.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only add videos to your own playlists" })
//         }

//         // Check if video already exists in playlist
//         const videoExists = playlist.videos.some((video) => video._id.toString() === videoId)
//         if (videoExists) {
//           return res.status(409).json({ success: false, message: "Video already exists in this playlist" })
//         }

//         // Get video details from Post collection
//         const post = await Post.findById(videoId).populate("userId", "name profilePicture")
//         if (!post) {
//           return res.status(404).json({ success: false, message: "Video (Post) not found" })
//         }

//         if (!post.videoUrl) {
//           return res.status(400).json({ success: false, message: "Post is not a video" })
//         }

//         // Add video to playlist
//         const videoData = {
//           _id: post._id,
//           caption: post.caption,
//           videoUrl: post.videoUrl,
//           thumbnailUrl: post.imageUrl, // Use imageUrl from Post as thumbnail
//           userId: post.userId._id,
//           addedAt: new Date(),
//         }

//         playlist.videos.push(videoData)
//         await playlist.save()

//         console.log("✅ Video added to playlist successfully")
//         res.status(200).json({ success: true, message: "Video added to playlist!", playlist })
//       } catch (error) {
//         console.error("❌ Error adding video to playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to add video to playlist.", error: error.message })
//       }
//     })

//     // Remove video from playlist
//     app.put("/api/playlists/remove-video", async (req, res) => {
//       try {
//         const { playlistId, videoId, userId } = req.body
//         console.log(`➖ Removing video ${videoId} from playlist ${playlistId}`)

//         const playlist = await Playlist.findById(playlistId)
//         if (!playlist) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         // Check if user owns the playlist
//         if (playlist.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only remove videos from your own playlists" })
//         }

//         // Remove video from playlist
//         playlist.videos = playlist.videos.filter((video) => video._id.toString() !== videoId)
//         await playlist.save()

//         console.log("✅ Video removed from playlist successfully")
//         res.status(200).json({ success: true, message: "Video removed from playlist!", playlist })
//       } catch (error) {
//         console.error("❌ Error removing video from playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to remove video from playlist.", error: error.message })
//       }
//     })

//     // Update playlist details
//     app.put("/api/playlists/update/:playlistId", async (req, res) => {
//       try {
//         const { playlistId } = req.params
//         const { name, description, isPrivate, userId } = req.body
//         console.log(`✏️ Updating playlist: ${playlistId}`)

//         if (!userId) {
//           return res.status(400).json({ success: false, message: "User ID is required" })
//         }

//         const playlist = await Playlist.findById(playlistId)
//         if (!playlist) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         // Check if user owns the playlist
//         if (playlist.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only update your own playlists" })
//         }

//         // Update playlist fields
//         if (name) playlist.name = name.trim()
//         if (description !== undefined) playlist.description = description.trim()
//         if (isPrivate !== undefined) playlist.isPrivate = isPrivate

//         await playlist.save()
//         console.log("✅ Playlist updated successfully")
//         res.status(200).json({ success: true, message: "Playlist updated successfully!", playlist })
//       } catch (error) {
//         console.error("❌ Error updating playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to update playlist.", error: error.message })
//       }
//     })

//     // Delete video playlist
//     app.delete("/api/playlists/:playlistId", async (req, res) => {
//       try {
//         const { playlistId } = req.params
//         const { userId } = req.query
//         console.log(`🗑️ Deleting video playlist: ${playlistId}`)

//         if (!userId) {
//           return res.status(400).json({ success: false, message: "User ID is required" })
//         }

//         const playlist = await Playlist.findById(playlistId)
//         if (!playlist) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         // Check if user owns the playlist
//         if (playlist.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only delete your own playlists" })
//         }

//         await Playlist.findByIdAndDelete(playlistId)
//         console.log("✅ Video playlist deleted successfully")
//         res.status(200).json({ success: true, message: "Playlist deleted successfully!" })
//       } catch (error) {
//         console.error("❌ Error deleting video playlist:", error)
//         res.status(500).json({ success: false, message: "Failed to delete playlist.", error: error.message })
//       }
//     })

//     // Get all public video playlists (for discovery)
//     app.get("/api/playlists/public/discover", async (req, res) => {
//       try {
//         const { page = 1, limit = 20 } = req.query
//         console.log("🔍 Fetching public video playlists...")

//         const playlists = await Playlist.find({ isPrivate: false })
//           .populate("createdBy", "name profilePicture")
//           .sort({ createdAt: -1 })
//           .skip((page - 1) * limit)
//           .limit(Number.parseInt(limit))

//         const totalPlaylists = await Playlist.countDocuments({ isPrivate: false })
//         const totalPages = Math.ceil(totalPlaylists / limit)

//         console.log(`✅ Found ${playlists.length} public video playlists`)
//         res.status(200).json({
//           success: true,
//           playlists,
//           currentPage: Number.parseInt(page),
//           totalPages,
//           totalPlaylists,
//         })
//       } catch (error) {
//         console.error("❌ Error fetching public video playlists:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch public playlists.", error: error.message })
//       }
//     })

//     // Reorder videos in playlist
//     app.put("/api/playlists/reorder/:playlistId", async (req, res) => {
//       try {
//         const { playlistId } = req.params
//         const { videoIds, userId } = req.body // videoIds should be an array of video _ids in the desired order
//         console.log(`🔄 Reordering videos in playlist: ${playlistId}`)

//         if (!userId || !videoIds || !Array.isArray(videoIds)) {
//           return res.status(400).json({ success: false, message: "User ID and video IDs array are required" })
//         }

//         const playlist = await Playlist.findById(playlistId)
//         if (!playlist) {
//           return res.status(404).json({ success: false, message: "Playlist not found" })
//         }

//         // Check if user owns the playlist
//         if (playlist.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only reorder your own playlists" })
//         }

//         // Create a new ordered array of video objects based on videoIds
//         const reorderedVideos = []
//         for (const videoId of videoIds) {
//           const video = playlist.videos.find((v) => v._id.toString() === videoId)
//           if (video) {
//             reorderedVideos.push(video)
//           }
//         }

//         // Update the playlist's videos array
//         playlist.videos = reorderedVideos
//         await playlist.save()

//         console.log("✅ Videos reordered successfully")
//         res.status(200).json({ success: true, message: "Videos reordered successfully!", playlist })
//       } catch (error) {
//         console.error("❌ Error reordering videos:", error)
//         res.status(500).json({ success: false, message: "Failed to reorder videos.", error: error.message })
//       }
//     })

//     console.log("✅ Video Playlist routes setup complete!")

//     // ===== COURSE ROUTES =====
//     console.log("📚 Setting up Course routes...")

//     // Create new course
//     app.post("/api/courses", async (req, res) => {
//       try {
//         const { title, description, videoUrl, thumbnailUrl, createdBy, instructorName, category, price, duration } =
//           req.body

//         if (!title || !videoUrl || !createdBy) {
//           return res.status(400).json({ success: false, message: "Title, video URL, and creator are required." })
//         }

//         const newCourse = new Course({
//           title,
//           description,
//           videoUrl,
//           thumbnailUrl,
//           createdBy,
//           instructorName,
//           category,
//           price: Number.parseFloat(price) || 0,
//           duration,
//         })

//         await newCourse.save()
//         console.log("✅ Course created:", newCourse.title)
//         res.status(201).json({ success: true, message: "Course created successfully!", course: newCourse })
//       } catch (error) {
//         console.error("❌ Error creating course:", error)
//         res.status(500).json({ success: false, message: "Failed to create course.", error: error.message })
//       }
//     })

//     // Get all courses with search and filtering
//     app.get("/api/courses", async (req, res) => {
//       try {
//         const { page = 1, limit = 20, search = "", category = "" } = req.query
//         const query = {}

//         if (search) {
//           query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
//         }

//         if (category) {
//           query.category = { $regex: category, $options: "i" }
//         }

//         const courses = await Course.find(query)
//           .populate("createdBy", "name profilePicture")
//           .populate("comments.userId", "name profilePicture")
//           .sort({ createdAt: -1 })
//           .skip((page - 1) * limit)
//           .limit(Number.parseInt(limit))

//         const totalCourses = await Course.countDocuments(query)
//         const totalPages = Math.ceil(totalCourses / limit)

//         console.log(`✅ Found ${courses.length} courses`)
//         res.json({
//           success: true,
//           courses,
//           currentPage: Number.parseInt(page),
//           totalPages,
//           totalCourses,
//         })
//       } catch (error) {
//         console.error("❌ Error fetching courses:", error)
//         res.status(500).json({ success: false, error: error.message })
//       }
//     })

//     // Get courses by user
//     app.get("/api/courses/user/:userId", async (req, res) => {
//       try {
//         const courses = await Course.find({ createdBy: req.params.userId })
//           .populate("createdBy", "name profilePicture")
//           .populate("comments.userId", "name profilePicture")
//           .sort({ createdAt: -1 })

//         console.log(`✅ Found ${courses.length} courses for user`)
//         res.json({ success: true, courses })
//       } catch (error) {
//         console.error("❌ Error fetching user courses:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user courses." })
//       }
//     })

//     // Like/Unlike course
//     app.put("/api/courses/like/:id", async (req, res) => {
//       const { userId } = req.body
//       try {
//         const course = await Course.findById(req.params.id)
//         if (!course) return res.status(404).json({ success: false, message: "Course not found" })

//         const userIdStr = userId.toString()
//         if (course.likes.includes(userIdStr)) {
//           course.likes = course.likes.filter((id) => id.toString() !== userIdStr)
//           console.log("👎 Course unliked")
//         } else {
//           course.likes.push(userIdStr)
//           console.log("👍 Course liked")
//         }

//         await course.save()
//         res.json({ success: true, course })
//       } catch (err) {
//         console.error("❌ Course like/unlike error:", err)
//         res.status(500).json({ success: false, message: err.message })
//       }
//     })

//     // Add comment to course
//     app.put("/api/courses/comment/:id", async (req, res) => {
//       const { userId, text } = req.body
//       try {
//         const course = await Course.findById(req.params.id)
//         if (!course) return res.status(404).json({ success: false, message: "Course not found" })

//         course.comments.push({ userId, text })
//         await course.save()

//         const populatedCourse = await Course.findById(course._id)
//           .populate("createdBy", "name profilePicture")
//           .populate("comments.userId", "name profilePicture")

//         console.log("✅ Comment added to course")
//         res.json({ success: true, course: populatedCourse })
//       } catch (err) {
//         console.error("❌ Course comment error:", err)
//         res.status(500).json({ success: false, message: err.message })
//       }
//     })

//     // Increment course view count
//     app.put("/api/courses/view/:id", async (req, res) => {
//       try {
//         const course = await Course.findById(req.params.id)
//         if (!course) return res.status(404).json({ success: false, message: "Course not found" })

//         course.views = (course.views || 0) + 1
//         await course.save()

//         console.log(`👁️ Course view incremented: ${course.views}`)
//         res.status(200).json({ success: true, message: "View count incremented", views: course.views })
//       } catch (err) {
//         console.error("❌ Course view increment error:", err)
//         res.status(500).json({ success: false, message: err.message })
//       }
//     })

//     // Delete course
//     app.delete("/api/courses/:courseId", async (req, res) => {
//       try {
//         const { courseId } = req.params
//         const { userId } = req.query

//         if (!courseId || !userId) {
//           return res.status(400).json({ success: false, message: "Course ID and User ID are required" })
//         }

//         const course = await Course.findById(courseId)
//         if (!course) {
//           return res.status(404).json({ success: false, message: "Course not found" })
//         }

//         if (course.createdBy.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You can only delete your own courses" })
//         }

//         await Course.findByIdAndDelete(courseId)
//         console.log("✅ Course deleted successfully")
//         res.status(200).json({ success: true, message: "Course deleted successfully" })
//       } catch (error) {
//         console.error("❌ Delete course error:", error)
//         res.status(500).json({ success: false, message: "Failed to delete course", error: error.message })
//       }
//     })

//     console.log("✅ Course routes setup complete!")

//     // ===== USER ACHIEVEMENTS =====
//     app.get("/api/users/achievements/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params

//         // Course stats
//         const courseStats = await Course.aggregate([
//           { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
//           {
//             $group: {
//               _id: null,
//               totalCourses: { $sum: 1 },
//               totalViews: { $sum: "$views" },
//               totalLikes: { $sum: { $size: "$likes" } },
//             },
//           },
//         ])

//         const totalCoursesCreated = courseStats[0]?.totalCourses || 0
//         const totalCourseViews = courseStats[0]?.totalViews || 0
//         const totalCourseLikes = courseStats[0]?.totalLikes || 0

//         // Comments on courses
//         const commentsOnCourses = await Course.aggregate([
//           { $unwind: "$comments" },
//           { $match: { "comments.userId": new mongoose.Types.ObjectId(userId) } },
//           { $count: "totalComments" },
//         ])
//         const totalCommentsOnCourses = commentsOnCourses[0]?.totalComments || 0

//         // Comments on posts
//         const commentsOnPosts = await Post.aggregate([
//           { $unwind: "$comments" },
//           { $match: { "comments.userId": new mongoose.Types.ObjectId(userId) } },
//           { $count: "totalComments" },
//         ])
//         const totalCommentsOnPosts = commentsOnPosts[0]?.totalComments || 0
//         const totalCommentsMade = totalCommentsOnCourses + totalCommentsOnPosts

//         // Group messages
//         const groupMessagesSent = await Message.aggregate([{ $match: { sender: userId } }, { $count: "totalMessages" }])
//         const totalGroupMessages = groupMessagesSent[0]?.totalMessages || 0

//         // Course Playlist achievements
//         const coursePlaylistStats = await CoursePlaylist.aggregate([
//           { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
//           {
//             $group: {
//               _id: null,
//               totalPlaylists: { $sum: 1 },
//               totalPlaylistViews: { $sum: "$views" },
//               totalCoursesInPlaylists: { $sum: { $size: "$courses" } },
//             },
//           },
//         ])
//         const totalCoursePlaylistsCreated = coursePlaylistStats[0]?.totalPlaylists || 0
//         const totalCoursePlaylistViews = coursePlaylistStats[0]?.totalPlaylistViews || 0
//         const totalCoursesInPlaylists = coursePlaylistStats[0]?.totalCoursesInPlaylists || 0

//         // Video Playlist achievements
//         const videoPlaylistStats = await Playlist.aggregate([
//           { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
//           {
//             $group: {
//               _id: null,
//               totalPlaylists: { $sum: 1 },
//               totalPlaylistViews: { $sum: "$views" },
//               totalVideosInPlaylists: { $sum: { $size: "$videos" } },
//             },
//           },
//         ])
//         const totalVideoPlaylistsCreated = videoPlaylistStats[0]?.totalPlaylists || 0
//         const totalVideoPlaylistViews = videoPlaylistStats[0]?.totalPlaylistViews || 0
//         const totalVideosInPlaylists = videoPlaylistStats[0]?.totalVideosInPlaylists || 0

//         const achievements = []

//         // Course achievements
//         if (totalCoursesCreated >= 1) {
//           achievements.push({
//             _id: "ach_course_1",
//             name: "First Course Published 🎓",
//             description: "You've published your very first course on the platform!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "book-plus-outline",
//           })
//         }

//         if (totalCoursesCreated >= 5) {
//           achievements.push({
//             _id: "ach_course_5",
//             name: "Prolific Instructor 📚",
//             description: "You've published 5 or more courses!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "bookshelf",
//           })
//         }

//         if (totalCourseViews >= 1000) {
//           achievements.push({
//             _id: "ach_views_1k",
//             name: "Popular Educator ⭐",
//             description: `Your courses have collectively reached ${totalCourseViews} views!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "eye-check-outline",
//           })
//         }

//         if (totalCourseLikes >= 500) {
//           achievements.push({
//             _id: "ach_likes_500",
//             name: "Fan Favorite Creator ❤️",
//             description: `Your courses have received ${totalCourseLikes} likes!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "heart-multiple-outline",
//           })
//         }

//         if (totalCommentsMade >= 50) {
//           achievements.push({
//             _id: "ach_comment_50",
//             name: "Community Engager 💬",
//             description: `You've made ${totalCommentsMade} comments on courses and posts!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "comment-multiple-outline",
//           })
//         }

//         if (totalGroupMessages >= 100) {
//           achievements.push({
//             _id: "ach_group_100",
//             name: "Chatty Member 🗣️",
//             description: `You've sent ${totalGroupMessages} messages in groups!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "chat-processing-outline",
//           })
//         }

//         // Course Playlist achievements
//         if (totalCoursePlaylistsCreated >= 1) {
//           achievements.push({
//             _id: "ach_course_playlist_1",
//             name: "Course Playlist Creator 📚",
//             description: "You've created your first course playlist!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "playlist-music",
//           })
//         }

//         if (totalCoursePlaylistsCreated >= 5) {
//           achievements.push({
//             _id: "ach_course_playlist_5",
//             name: "Course Playlist Master 🎓",
//             description: "You've created 5 or more course playlists!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "playlist-star",
//           })
//         }

//         if (totalCoursesInPlaylists >= 50) {
//           achievements.push({
//             _id: "ach_course_playlist_courses_50",
//             name: "Course Curator 📖",
//             description: `You've added ${totalCoursesInPlaylists} courses to your playlists!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "book-plus-outline",
//           })
//         }

//         // Video Playlist achievements
//         if (totalVideoPlaylistsCreated >= 1) {
//           achievements.push({
//             _id: "ach_video_playlist_1",
//             name: "Video Playlist Creator 🎵",
//             description: "You've created your first video playlist!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "playlist-music",
//           })
//         }

//         if (totalVideoPlaylistsCreated >= 5) {
//           achievements.push({
//             _id: "ach_video_playlist_5",
//             name: "Video Playlist Master 🎼",
//             description: "You've created 5 or more video playlists!",
//             date: new Date().toISOString().split("T")[0],
//             icon: "playlist-star",
//           })
//         }

//         if (totalVideosInPlaylists >= 50) {
//           achievements.push({
//             _id: "ach_video_playlist_videos_50",
//             name: "Video Curator 📹",
//             description: `You've added ${totalVideosInPlaylists} videos to your playlists!`,
//             date: new Date().toISOString().split("T")[0],
//             icon: "video-plus-outline",
//           })
//         }

//         console.log(`✅ Found ${achievements.length} achievements for user`)
//         res.json({ success: true, achievements })
//       } catch (error) {
//         console.error("❌ Error fetching user achievements:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user achievements.", error: error.message })
//       }
//     })

//     // ===== CONNECTION ROUTES =====
//     console.log("🤝 Setting up Connection routes...")

//     // Send connection request
//     app.post("/api/connections/request", async (req, res) => {
//       try {
//         const { senderId, receiverId } = req.body

//         if (!senderId || !receiverId) {
//           return res.status(400).json({ success: false, message: "Sender and receiver IDs are required." })
//         }

//         if (senderId === receiverId) {
//           return res.status(400).json({ success: false, message: "Cannot send a connection request to yourself." })
//         }

//         const existingRequest = await ConnectionRequest.findOne({
//           $or: [
//             { sender: senderId, receiver: receiverId },
//             { sender: receiverId, receiver: senderId, status: "accepted" },
//           ],
//         })

//         if (existingRequest) {
//           if (existingRequest.status === "pending") {
//             return res.status(409).json({ success: false, message: "Connection request already sent." })
//           } else if (existingRequest.status === "accepted") {
//             return res.status(409).json({ success: false, message: "Already connected with this user." })
//           }
//         }

//         const newRequest = new ConnectionRequest({ sender: senderId, receiver: receiverId })
//         await newRequest.save()

//         // ✅ FIXED: Safe notification sending
//         if (admin) {
//           try {
//             const receiverUser = await User.findById(receiverId).select("fcmToken name")
//             if (receiverUser && receiverUser.fcmToken) {
//               const senderUser = await User.findById(senderId).select("name")
//               await admin.messaging().send({
//                 token: receiverUser.fcmToken,
//                 notification: {
//                   title: "New Connection Request! 🤝",
//                   body: `${senderUser?.name || "Someone"} wants to connect with you.`,
//                 },
//                 data: {
//                   type: "connection_request",
//                   senderId: senderId,
//                   requestId: newRequest._id.toString(),
//                 },
//               })
//             }
//           } catch (notificationError) {
//             console.error("❌ Notification error:", notificationError)
//             // Don't fail the request if notification fails
//           }
//         }

//         console.log("✅ Connection request sent")
//         res.status(201).json({ success: true, message: "Connection request sent.", request: newRequest })
//       } catch (error) {
//         console.error("❌ Error sending connection request:", error)
//         res.status(500).json({ success: false, message: "Failed to send connection request.", error: error.message })
//       }
//     })

//     // Accept connection request
//     app.put("/api/connections/accept/:requestId", async (req, res) => {
//       try {
//         const { requestId } = req.params
//         const { userId } = req.body
//         console.log(`✅ Accepting connection request: ${requestId} by user: ${userId}`)

//         const request = await ConnectionRequest.findById(requestId)
//         if (!request) {
//           return res.status(404).json({ success: false, message: "Connection request not found." })
//         }

//         if (request.receiver.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You are not authorized to accept this request." })
//         }

//         if (request.status !== "pending") {
//           return res.status(409).json({ success: false, message: "Request is not pending." })
//         }

//         request.status = "accepted"
//         await request.save()

//         await User.findByIdAndUpdate(request.sender, { $addToSet: { connections: request.receiver } })
//         await User.findByIdAndUpdate(request.receiver, { $addToSet: { connections: request.sender } })

//         let chat = await PrivateChat.findOne({
//           participants: { $all: [request.sender, request.receiver] },
//         })

//         if (!chat) {
//           chat = new PrivateChat({ participants: [request.sender, request.receiver] })
//           await chat.save()
//           console.log("✅ Private chat created successfully")
//         }

//         // ✅ FIXED: Safe notification sending
//         if (admin) {
//           try {
//             const senderUser = await User.findById(request.sender).select("fcmToken name")
//             if (senderUser && senderUser.fcmToken) {
//               const receiverUser = await User.findById(request.receiver).select("name")
//               await admin.messaging().send({
//                 token: senderUser.fcmToken,
//                 notification: {
//                   title: "Connection Accepted! 🎉",
//                   body: `${receiverUser?.name || "Someone"} accepted your connection request.`,
//                 },
//                 data: {
//                   type: "connection_accepted",
//                   receiverId: request.receiver.toString(),
//                   chatId: chat._id.toString(),
//                 },
//               })
//             }
//           } catch (notificationError) {
//             console.error("❌ Notification error:", notificationError)
//             // Don't fail the request if notification fails
//           }
//         }

//         console.log("✅ Connection request accepted successfully")
//         res.status(200).json({ success: true, message: "Connection request accepted.", request })
//       } catch (error) {
//         console.error("❌ Error accepting connection request:", error)
//         res.status(500).json({ success: false, message: "Failed to accept connection request.", error: error.message })
//       }
//     })

//     // Reject connection request
//     app.put("/api/connections/reject/:requestId", async (req, res) => {
//       try {
//         const { requestId } = req.params
//         const { userId } = req.body

//         const request = await ConnectionRequest.findById(requestId)
//         if (!request) {
//           return res.status(404).json({ success: false, message: "Connection request not found." })
//         }

//         if (request.receiver.toString() !== userId) {
//           return res.status(403).json({ success: false, message: "You are not authorized to reject this request." })
//         }

//         if (request.status !== "pending") {
//           return res.status(409).json({ success: false, message: "Request is not pending." })
//         }

//         request.status = "rejected"
//         await request.save()

//         console.log("✅ Connection request rejected")
//         res.status(200).json({ success: true, message: "Connection request rejected.", request })
//       } catch (error) {
//         console.error("❌ Error rejecting connection request:", error)
//         res.status(500).json({ success: false, message: "Failed to reject connection request.", error: error.message })
//       }
//     })

//     // Get pending connection requests
//     app.get("/api/connections/pending/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const pendingRequests = await ConnectionRequest.find({ receiver: userId, status: "pending" }).populate(
//           "sender",
//           "name profilePicture",
//         )

//         console.log(`✅ Found ${pendingRequests.length} pending requests`)
//         res.status(200).json({ success: true, requests: pendingRequests })
//       } catch (error) {
//         console.error("❌ Error fetching pending requests:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch pending requests.", error: error.message })
//       }
//     })

//     // Get sent connection requests
//     app.get("/api/connections/sent/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const sentRequests = await ConnectionRequest.find({ sender: userId, status: "pending" }).populate(
//           "receiver",
//           "name profilePicture",
//         )

//         console.log(`✅ Found ${sentRequests.length} sent requests`)
//         res.status(200).json({ success: true, requests: sentRequests })
//       } catch (error) {
//         console.error("❌ Error fetching sent requests:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch sent requests.", error: error.message })
//       }
//     })

//     // Get accepted connections
//     app.get("/api/connections/accepted/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const acceptedConnections = await ConnectionRequest.find({
//           $or: [{ sender: userId }, { receiver: userId }],
//           status: "accepted",
//         })
//           .populate("sender", "name profilePicture")
//           .populate("receiver", "name profilePicture")

//         const connections = acceptedConnections
//           .map((conn) => {
//             if (conn.sender._id.toString() === userId) {
//               return conn.receiver
//             } else {
//               return conn.sender
//             }
//           })
//           .filter(
//             (value, index, self) => self.findIndex((user) => user._id.toString() === value._id.toString()) === index,
//           )

//         console.log(`✅ Found ${connections.length} accepted connections`)
//         res.status(200).json({ success: true, connections })
//       } catch (error) {
//         console.error("❌ Error fetching accepted connections:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch accepted connections.", error: error.message })
//       }
//     })

//     console.log("✅ Connection routes setup complete!")

//     // ===== PRIVATE CHAT ROUTES =====
//     console.log("💬 Setting up Private Chat routes...")

//     // Find or create private chat
//     app.get("/api/chats/find/:user1Id/:user2Id", async (req, res) => {
//       try {
//         const { user1Id, user2Id } = req.params
//         let chat = await PrivateChat.findOne({
//           participants: { $all: [user1Id, user2Id] },
//         })

//         if (!chat) {
//           chat = new PrivateChat({ participants: [user1Id, user2Id] })
//           await chat.save()
//           console.log("✅ New private chat created")
//         }

//         res.status(200).json({ success: true, chat })
//       } catch (error) {
//         console.error("❌ Error finding/creating chat:", error)
//         res.status(500).json({ success: false, message: "Failed to find or create chat.", error: error.message })
//       }
//     })

//     // Get user's private chats
//     app.get("/api/chats/user/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         const chats = await PrivateChat.find({ participants: userId })
//           .populate("participants", "name profilePicture")
//           .populate("lastMessage")
//           .sort({ lastMessageAt: -1 })

//         console.log(`✅ Found ${chats.length} private chats for user`)
//         res.status(200).json({ success: true, chats })
//       } catch (error) {
//         console.error("❌ Error fetching user chats:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user chats.", error: error.message })
//       }
//     })

//     // Get chat messages
//     app.get("/api/chats/:chatId/messages", async (req, res) => {
//       try {
//         const { chatId } = req.params
//         const messages = await PrivateMessage.find({ chat: chatId })
//           .populate("sender", "name profilePicture")
//           .sort({ createdAt: 1 })

//         console.log(`✅ Found ${messages.length} messages in chat`)
//         res.status(200).json({ success: true, messages })
//       } catch (error) {
//         console.error("❌ Error fetching chat messages:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch chat messages.", error: error.message })
//       }
//     })

//     // Send private message
//     app.post("/api/chats/message", async (req, res) => {
//       try {
//         const { chatId, senderId, text } = req.body

//         if (!chatId || !senderId || !text) {
//           return res.status(400).json({ success: false, message: "Chat ID, sender ID, and text are required." })
//         }

//         const newMessage = new PrivateMessage({ chat: chatId, sender: senderId, text })
//         await newMessage.save()

//         await PrivateChat.findByIdAndUpdate(chatId, {
//           lastMessage: newMessage._id,
//           lastMessageAt: newMessage.createdAt,
//         })

//         const populatedMessage = await PrivateMessage.findById(newMessage._id).populate("sender", "name profilePicture")

//         io.to(chatId).emit("receivePrivateMessage", populatedMessage)

//         // ✅ FIXED: Safe notification sending
//         if (admin) {
//           try {
//             const chat = await PrivateChat.findById(chatId).populate("participants", "fcmToken name")
//             if (chat) {
//               const otherParticipant = chat.participants.find((p) => p._id.toString() !== senderId)
//               if (otherParticipant && otherParticipant.fcmToken) {
//                 const senderUser = await User.findById(senderId).select("name")
//                 await admin.messaging().send({
//                   token: otherParticipant.fcmToken,
//                   notification: {
//                     title: `New Message from ${senderUser?.name || "Someone"}`,
//                     body: text,
//                   },
//                   data: {
//                     type: "private_message",
//                     chatId: chatId,
//                     senderId: senderId,
//                   },
//                 })
//               }
//             }
//           } catch (notificationError) {
//             console.error("❌ Notification error:", notificationError)
//             // Don't fail the request if notification fails
//           }
//         }

//         console.log("✅ Private message sent")
//         res.status(201).json({ success: true, message: "Message sent.", message: populatedMessage })
//       } catch (error) {
//         console.error("❌ Error sending private message:", error)
//         res.status(500).json({ success: false, message: "Failed to send private message.", error: error.message })
//       }
//     })

//     console.log("✅ Private Chat routes setup complete!")

//     // ===== POST ROUTES =====
//     console.log("📝 Setting up Post routes...")

//     // Get all posts
//     app.get("/api/posts/", async (req, res) => {
//       try {
//         console.log("📝 Fetching all posts...")
//         const posts = await Post.find()
//           .populate("userId", "name email profilePicture isVerified")
//           .sort({ createdAt: -1 })

//         console.log(`✅ Found ${posts.length} posts`)
//         res.status(200).json({ success: true, posts })
//       } catch (error) {
//         console.error("❌ Error fetching posts:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch posts.", error: error.message })
//       }
//     })

//     // Get user profile
//     app.get("/api/users/profile/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         console.log(`👤 Fetching profile for userId: ${userId}`)

//         if (!userId) {
//           return res.status(400).json({ success: false, message: "User ID is required" })
//         }

//         const user = await User.findById(userId).select("name email profilePicture bio isVerified isPrivate createdAt")

//         if (!user) {
//           return res.status(404).json({ success: false, message: "User not found" })
//         }

//         console.log(`✅ Found user profile: ${user.name}`)
//         res.status(200).json({ success: true, user })
//       } catch (error) {
//         console.error("❌ Error fetching user profile:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user profile.", error: error.message })
//       }
//     })

//     // Get posts by user
//     app.get("/api/posts/user/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         console.log(`📝 Fetching posts for userId: ${userId}`)

//         if (!userId) {
//           return res.status(400).json({ success: false, message: "User ID is required" })
//         }

//         const posts = await Post.find({ userId: userId })
//           .populate("userId", "name email profilePicture")
//           .sort({ createdAt: -1 })

//         console.log(`✅ Found ${posts.length} posts for user`)
//         res.status(200).json({ success: true, posts })
//       } catch (error) {
//         console.error("❌ Error fetching user posts:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch user posts." })
//       }
//     })

//     // Like/Unlike post
//     app.put("/api/posts/like/:postId", async (req, res) => {
//       try {
//         const { postId } = req.params
//         const { userId } = req.body
//         console.log(`❤️ Like request for post: ${postId} by user: ${userId}`)

//         const post = await Post.findById(postId)
//         if (!post) {
//           return res.status(404).json({ success: false, message: "Post not found" })
//         }

//         const likeIndex = post.likes.indexOf(userId)
//         if (likeIndex > -1) {
//           post.likes.splice(likeIndex, 1)
//           console.log("👎 Post unliked")
//         } else {
//           post.likes.push(userId)
//           console.log("👍 Post liked")
//         }

//         await post.save()
//         res.status(200).json({ success: true, message: "Post like updated", likes: post.likes.length })
//       } catch (error) {
//         console.error("❌ Error updating post like:", error)
//         res.status(500).json({ success: false, message: "Failed to update like.", error: error.message })
//       }
//     })

//     // Add comment to post
//     app.put("/api/posts/comment/:postId", async (req, res) => {
//       try {
//         const { postId } = req.params
//         const { userId, text } = req.body
//         console.log(`💬 Comment request for post: ${postId} by user: ${userId}`)

//         if (!text || !text.trim()) {
//           return res.status(400).json({ success: false, message: "Comment text is required" })
//         }

//         const post = await Post.findById(postId)
//         if (!post) {
//           return res.status(404).json({ success: false, message: "Post not found" })
//         }

//         const newComment = {
//           userId,
//           text: text.trim(),
//           createdAt: new Date(),
//         }

//         post.comments.push(newComment)
//         await post.save()

//         console.log("✅ Comment added successfully")
//         res.status(200).json({ success: true, message: "Comment added successfully", comments: post.comments.length })
//       } catch (error) {
//         console.error("❌ Error adding comment:", error)
//         res.status(500).json({ success: false, message: "Failed to add comment.", error: error.message })
//       }
//     })

//     // Get discoverable users
//     app.get("/api/users/discoverable/:userId", async (req, res) => {
//       try {
//         const { userId } = req.params
//         console.log(`🔍 Fetching discoverable users for userId: ${userId}`)

//         const users = await User.find({
//           _id: { $ne: userId },
//         }).select("name email profilePicture bio isVerified")

//         console.log(`✅ Found ${users.length} discoverable users`)
//         res.status(200).json({ success: true, users })
//       } catch (error) {
//         console.error("❌ Error fetching discoverable users:", error)
//         res.status(500).json({ success: false, message: "Failed to fetch users.", error: error.message })
//       }
//     })

//     console.log("✅ Post routes setup complete!")

//     // ===== BASIC ROUTES =====
//     app.get("/", (req, res) => {
//       res.json({ message: "YouTube Chat Backend is running! 🚀" })
//     })

//     app.get("/api/users/test", (req, res) => {
//       res.send("✅ Server working!")
//     })

//     // Get new creators posts
//     app.get("/api/posts/new-creators", async (req, res) => {
//       try {
//         const { page = 1, limit = 20 } = req.query
//         console.log("🌟 Fetching new creators posts...")

//         const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)
//         const newCreators = await User.find({
//           createdAt: { $gte: threeMonthsAgo },
//         }).select("_id")

//         if (newCreators.length === 0) {
//           return res.json({ success: true, posts: [], totalPages: 0, creators: 0 })
//         }

//         const newCreatorIds = newCreators.map((user) => user._id)
//         const posts = await Post.find({
//           userId: { $in: newCreatorIds },
//           likes: { $lt: 50 },
//         })
//           .populate("userId", "name email profilePicture createdAt")
//           .sort({ createdAt: -1 })
//           .skip((page - 1) * limit)
//           .limit(Number.parseInt(limit))

//         const totalPosts = await Post.countDocuments({
//           userId: { $in: newCreatorIds },
//           likes: { $lt: 50 },
//         })

//         const totalPages = Math.ceil(totalPosts / limit)

//         console.log(`✅ Found ${posts.length} posts from new creators`)
//         if (posts.length > 0) {
//           console.log("📝 Sample post structure:", {
//             _id: posts[0]._id,
//             userId: posts[0].userId,
//             userIdType: typeof posts[0].userId,
//           })
//         }

//         res.json({
//           success: true,
//           posts,
//           currentPage: Number.parseInt(page),
//           totalPages,
//           totalPosts,
//           creators: newCreators.length,
//         })
//       } catch (error) {
//         console.error("❌ Error fetching new creators posts:", error)
//         res.status(500).json({ success: false, error: error.message })
//       }
//     })

//     // Get posts stats
//     app.get("/api/posts/stats", async (req, res) => {
//       try {
//         console.log("📊 Fetching posts stats...")

//         const totalPosts = await Post.countDocuments()
//         const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
//         const recentPosts = await Post.countDocuments({
//           createdAt: { $gte: thirtyDaysAgo },
//         })

//         const likesResult = await Post.aggregate([
//           {
//             $group: {
//               _id: null,
//               totalLikes: { $sum: "$likes" },
//             },
//           },
//         ])

//         const totalLikes = likesResult[0]?.totalLikes || 0

//         const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)
//         const newCreators = await User.countDocuments({
//           createdAt: { $gte: threeMonthsAgo },
//         })

//         const newCreatorUsers = await User.find({
//           createdAt: { $gte: threeMonthsAgo },
//         }).select("_id")

//         const newCreatorIds = newCreatorUsers.map((user) => user._id)
//         const newCreatorPosts = await Post.countDocuments({
//           userId: { $in: newCreatorIds },
//         })

//         const stats = {
//           totalPosts,
//           recentPosts,
//           totalLikes,
//           newCreators,
//           newCreatorPosts,
//           avgLikesPerPost: totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0,
//         }

//         console.log("✅ Stats calculated:", stats)
//         res.json({
//           success: true,
//           stats,
//         })
//       } catch (error) {
//         console.error("❌ Error fetching stats:", error)
//         res.status(500).json({
//           success: false,
//           error: "Failed to fetch stats",
//         })
//       }
//     })

//     // ===== GROUP ROUTES =====
//     console.log("👥 Setting up Group routes...")

//     // Get all groups
//     app.get("/api/groups", async (req, res) => {
//       try {
//         const groups = await Group.find().sort({ createdAt: -1 })
//         console.log(`✅ Found ${groups.length} groups`)
//         res.json(groups)
//       } catch (err) {
//         console.error("❌ Error fetching groups:", err)
//         res.status(500).json({ message: "Error fetching groups" })
//       }
//     })

//     // Create new group
//     app.post("/api/groups", async (req, res) => {
//       try {
//         console.log("Received group creation request with body:", req.body)
//         const { name, createdBy, profilePicture, description } = req.body

//         const group = new Group({
//           name,
//           createdBy,
//           members: createdBy ? [createdBy] : [],
//           profilePicture: profilePicture || "",
//           description: description || "",
//         })

//         console.log("Saving group to DB:", group)
//         await group.save()

//         if (createdBy) {
//           await User.findByIdAndUpdate(createdBy, { $addToSet: { groups: group._id.toString() } })
//         }

//         console.log("✅ Group created successfully")
//         res.status(201).json(group)
//       } catch (err) {
//         console.error("❌ Error creating group:", err)
//         res.status(500).json({ message: "Error creating group" })
//       }
//     })

//     // Get messages for a group
//     app.get("/api/messages/:group", async (req, res) => {
//       try {
//         const messages = await Message.find({ group: req.params.group }).sort({ createdAt: 1 })
//         console.log(`✅ Found ${messages.length} messages for group`)
//         res.json(messages)
//       } catch (err) {
//         console.error("❌ Error fetching messages:", err)
//         res.status(500).json({ message: "Error fetching messages" })
//       }
//     })

//     // Save FCM token
//     app.post("/api/users/fcm-token", async (req, res) => {
//       const { userId, fcmToken } = req.body
//       try {
//         console.log(`💾 Saving FCM token for user: ${userId}`)

//         if (!userId || !fcmToken) {
//           return res.status(400).json({ success: false, message: "userId and fcmToken required" })
//         }

//         const updatedUser = await User.findByIdAndUpdate(userId, { fcmToken }, { new: true })

//         if (!updatedUser) {
//           console.log(`❌ User not found: ${userId}`)
//           return res.status(404).json({ success: false, message: "User not found" })
//         }

//         // Clear cache for this user
//         for (const [key] of tokenCache) {
//           if (key.includes(userId)) {
//             tokenCache.delete(key)
//           }
//         }

//         console.log(`✅ FCM token saved for user: ${updatedUser.name}`)
//         res.json({ success: true })
//       } catch (err) {
//         console.error("❌ Error saving FCM token:", err)
//         res.status(500).json({ success: false, message: "Error saving FCM token" })
//       }
//     })

//     // Join group
//     app.post("/api/users/join-group", async (req, res) => {
//       const { userId, groupId } = req.body
//       try {
//         console.log(`👥 Adding user ${userId} to group ${groupId}`)

//         if (!userId || !groupId) {
//           return res.status(400).json({ success: false, message: "userId and groupId required" })
//         }

//         const updatedUser = await User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } }, { new: true })

//         if (!updatedUser) {
//           return res.status(404).json({ success: false, message: "User not found" })
//         }

//         await Group.findByIdAndUpdate(groupId, { $addToSet: { members: userId } })

//         // Clear cache for this group
//         for (const [key] of tokenCache) {
//           if (key.startsWith(groupId)) {
//             tokenCache.delete(key)
//           }
//         }

//         console.log(`✅ User ${updatedUser.name} added to group`)
//         res.json({ success: true })
//       } catch (err) {
//         console.error("❌ Error joining group:", err)
//         res.status(500).json({ success: false })
//       }
//     })

//     console.log("✅ All routes setup complete!")
//   })
//   .catch((err) => {
//     console.log("❌ MongoDB Connection Error:", err)
//     process.exit(1)
//   })

// // ===== SOCKET.IO HANDLERS =====
// console.log("🔌 Setting up Socket.IO handlers...")

// io.on("connection", (socket) => {
//   console.log("🟢 User connected:", socket.id)

//   // Join group
//   socket.on("joinGroup", (groupId) => {
//     socket.join(groupId)
//     console.log(`👥 Socket joined group: ${groupId}`)
//   })

//   // Join private chat
//   socket.on("joinPrivateChat", (chatId) => {
//     socket.join(chatId)
//     console.log(`👥 Socket joined private chat: ${chatId}`)
//   })

//   // Send group message
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
//         const result = await sendFirebaseNotification(
//           tokens,
//           {
//             title: `💬 New Message`,
//             body: `${messageData.senderName}: ${messageData.message}`,
//           },
//           {
//             type: "group_message",
//             groupId: data.group,
//             messageId: newMsg._id.toString(),
//             senderName: messageData.senderName,
//             message: messageData.message,
//           },
//         )

//         const processingTime = Date.now() - startTime
//         console.log(
//           `✅ Notifications sent in ${processingTime}ms - Success: ${result.successCount}, Failed: ${result.failureCount}`,
//         )

//         if (result.failureCount > 0) {
//           console.log("❌ Failed notifications:")
//           result.responses?.forEach((response, index) => {
//             if (!response.success) {
//               console.log(`   Token ${index}: ${response.error?.message}`)
//             }
//           })
//         }
//       } else {
//         console.log("⚠️ No FCM tokens found for group members")
//       }

//       const totalTime = Date.now() - startTime
//       console.log(`⏱️ Total message processing time: ${totalTime}ms`)
//     } catch (error) {
//       console.error("❌ Error in sendMessage:", error)
//     }
//   })

//   // Send private message
//   socket.on("sendPrivateMessage", async (data) => {
//     try {
//       console.log("📨 Processing private message:", data)
//       const { chatId, senderId, text, senderName } = data

//       if (!chatId || !senderId || !text) {
//         console.error("❌ Invalid private message data")
//         return
//       }

//       // Save message to database
//       const newMessage = new PrivateMessage({
//         chat: chatId,
//         sender: senderId,
//         text: text.trim(),
//       })
//       await newMessage.save()

//       // Update chat's last message
//       await PrivateChat.findByIdAndUpdate(chatId, {
//         lastMessage: newMessage._id,
//         lastMessageAt: newMessage.createdAt,
//       })

//       // Populate sender info
//       const populatedMessage = await PrivateMessage.findById(newMessage._id).populate("sender", "name profilePicture")

//       // Emit to all users in this private chat
//       io.to(chatId).emit("receivePrivateMessage", populatedMessage)

//       // Send confirmation back to sender
//       socket.emit("privateMessageSent", populatedMessage)

//       console.log("✅ Private message sent successfully via socket")

//       // ✅ Firebase notification in background (non-blocking)
//       setImmediate(async () => {
//         try {
//           if (admin) {
//             const chat = await PrivateChat.findById(chatId).populate("participants", "fcmToken name")
//             if (chat) {
//               const otherParticipant = chat.participants.find((p) => p._id.toString() !== senderId)
//               if (otherParticipant && otherParticipant.fcmToken) {
//                 await admin.messaging().send({
//                   token: otherParticipant.fcmToken,
//                   notification: {
//                     title: `New Message from ${senderName || "Someone"}`,
//                     body: text,
//                   },
//                   data: {
//                     type: "private_message",
//                     chatId: chatId,
//                     senderId: senderId,
//                   },
//                 })
//                 console.log("✅ Private message notification sent")
//               }
//             }
//           }
//         } catch (notificationError) {
//           console.error("❌ Private message notification error:", notificationError)
//           // Don't affect the main message flow
//         }
//       })
//     } catch (error) {
//       console.error("❌ Error in sendPrivateMessage:", error)
//       socket.emit("privateMessageError", { error: "Failed to send message" })
//     }
//   })

//   // Delete message
//   socket.on("deleteMessage", async (msgId) => {
//     try {
//       await Message.findByIdAndDelete(msgId)
//       io.emit("messageDeleted", msgId)
//       console.log("✅ Message deleted")
//     } catch (err) {
//       console.error("❌ Delete failed:", err)
//     }
//   })

//   // Edit message
//   socket.on("editMessage", async (updatedMsg) => {
//     try {
//       const msg = await Message.findByIdAndUpdate(
//         updatedMsg._id,
//         { message: updatedMsg.message, edited: true },
//         { new: true },
//       )
//       io.emit("messageEdited", msg)
//       console.log("✅ Message edited")
//     } catch (err) {
//       console.error("❌ Edit failed:", err)
//     }
//   })

//   // Disconnect
//   socket.on("disconnect", () => {
//     console.log("🔴 User disconnected:", socket.id)
//   })
// })

// console.log("✅ Socket.IO handlers setup complete!")

// // Add this near your other route configurations


// // Add proper error handling middleware at the end (before listen)
// app.use((req, res, next) => {
//   res.status(404).json({ 
//     success: false,
//     message: 'Endpoint not found' 
//   });
// });

// app.use((err, req, res, next) => {
//   console.error('Server error:', err);
//   res.status(500).json({ 
//     success: false,
//     message: 'Internal server error',
//     error: err.message 
//   });
// });




// // ===== START SERVER =====
// const PORT = process.env.PORT || 5000
// server.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
//   console.log(`📡 API URL: http://localhost:${PORT}`)
//   console.log(`📱 Android Emulator URL: http://10.0.2.2:${PORT}`)
//   console.log("🎵 Course Playlist functionality ready!")
//   console.log("🎬 Video Playlist functionality ready!")
//   console.log("📚 Course functionality ready!")
//   console.log("🤝 Connection functionality ready!")
//   console.log("💬 Private Chat functionality ready!")
//   console.log("👥 Group Chat functionality ready!")
//   console.log("📝 Post functionality ready!")
//   console.log("🔥 Firebase notifications ready!")
//   console.log("✅ All systems operational!")
// })








const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

// ✅ FIXED: Firebase Admin SDK Configuration
// let admin
// try {
//   admin = require("firebase-admin")
//   // Check if Firebase is already initialized
//   if (!admin.apps.length) {
//     // Try to use environment variables first (recommended for production)
//     if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
//       console.log("🔥 Initializing Firebase with environment variables...")
//       admin.initializeApp({
//         credential: admin.credential.cert({
//           type: "service_account",
//           project_id: process.env.FIREBASE_PROJECT_ID,
//           private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
//           private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//           client_email: process.env.FIREBASE_CLIENT_EMAIL,
//           client_id: process.env.FIREBASE_CLIENT_ID,
//           auth_uri: "https://accounts.google.com/o/oauth2/auth",
//           token_uri: "https://oauth2.googleapis.com/token",
//           auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
//           client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
//         }),
//       })
//       console.log("✅ Firebase initialized with environment variables")
//     } else {
//       // Fallback to service account file (for development)
//       console.log("🔥 Initializing Firebase with service account file...")
//       const serviceAccount = require("./firebase-service-account.json") // Rename your file
//       admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount),
//       })
//       console.log("✅ Firebase initialized with service account file")
//     }
//   } else {
//     console.log("🔥 Firebase already initialized")
//   }
// } catch (error) {
//   console.error("❌ Firebase initialization error:", error.message)
//   console.log("⚠️ Continuing without Firebase (notifications will not work)")
//   admin = null
// }

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
    profilePicture: { type: String, default: "" },
  },
  { timestamps: true },
)

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
  { timestamps: true },
)

// ✅ FIXED: Course Playlist Schema - Using proper references
const coursePlaylistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPrivate: { type: Boolean, default: false },
    courses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course", // ✅ This references the Course model
          required: false, // ✅ Made optional to handle cleanup
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
)

// 🎵 Video Playlist Schema (using 'videos' and 'Post' ref)
const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPrivate: { type: Boolean, default: false },
    videos: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // Reference to Post model
        caption: String,
        videoUrl: String,
        thumbnailUrl: String, // This will come from Post.imageUrl
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Creator of the video
        addedAt: { type: Date, default: Date.now },
      },
    ],
    thumbnailUrl: { type: String, default: "" }, // Optional: for playlist cover
    totalDuration: { type: String, default: "0:00" }, // Optional: sum of video durations
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const connectionRequestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true },
)

const privateChatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "PrivateMessage" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

const privateMessageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "PrivateChat", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
)

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)
const Group = mongoose.models.Group || mongoose.model("Group", groupSchema)
const User = require("./models/user")
const Post = require("./models/post")
const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
module.exports = { Course };
const CoursePlaylist = mongoose.models.CoursePlaylist || mongoose.model("CoursePlaylist", coursePlaylistSchema) // ✅ FIXED
const Playlist = mongoose.models.Playlist || mongoose.model("Playlist", playlistSchema) // 🎵 Video Playlist Model
const ConnectionRequest =
  mongoose.models.ConnectionRequest || mongoose.model("ConnectionRequest", connectionRequestSchema)
const PrivateChat = mongoose.models.PrivateChat || mongoose.model("PrivateChat", privateChatSchema)
const PrivateMessage = mongoose.models.PrivateMessage || mongoose.model("PrivateMessage", privateMessageSchema)

// FCM token cache
const tokenCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000

// ✅ FIXED: Safe Firebase messaging function
async function sendFirebaseNotification(tokens, notification, data) {
  if (!admin) {
    console.log("⚠️ Firebase not initialized, skipping notification")
    return { successCount: 0, failureCount: tokens.length }
  }
  try {
    const result = await admin.messaging().sendEachForMulticast({
      tokens,
      notification,
      data,
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
              title: notification.title,
              body: notification.body,
            },
            sound: "default",
            badge: 1,
          },
        },
      },
    })
    return result
  } catch (error) {
    console.error("❌ Firebase notification error:", error)
    return { successCount: 0, failureCount: tokens.length }
  }
}

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

    // NEW: Test JSON endpoint
    app.get("/api/test-json", (req, res) => {
      res.json({ success: true, message: "JSON response from server!" })
    })

    // 🎵 ===== COURSE PLAYLIST ROUTES ===== 🎵
    console.log("🎵 Setting up Course Playlist routes...")

    // ✅ FIXED: Create new course playlist
    app.post("/api/course-playlists/create", async (req, res) => {
      try {
        const { name, description, isPrivate, createdBy, courses } = req.body
        console.log("🎵 Creating new course playlist:", { name, createdBy, isPrivate })

        if (!name || !createdBy) {
          return res.status(400).json({ success: false, message: "Name and creator are required." })
        }

        // ✅ FIXED: Store only course references, not full course data
        let courseReferences = []
        if (courses && courses.length > 0) {
          // Validate that courses exist
          const existingCourses = await Course.find({ _id: { $in: courses } }).select("_id")
          courseReferences = existingCourses.map((course) => ({
            courseId: course._id,
            addedAt: new Date(),
          }))
        }

        const newPlaylist = new CoursePlaylist({
          name: name.trim(),
          description: description?.trim() || "",
          isPrivate: isPrivate || false,
          createdBy,
          courses: courseReferences, // ✅ Store references only
        })

        await newPlaylist.save()
        console.log("✅ Course playlist created:", newPlaylist.name)

        res.status(201).json({
          success: true,
          message: "Course playlist created successfully!",
          playlist: newPlaylist,
        })
      } catch (error) {
        console.error("❌ Error creating course playlist:", error)
        res.status(500).json({ success: false, message: "Failed to create playlist.", error: error.message })
      }
    })

    // ✅ FIXED: Get user's course playlists (corrected route)
    app.get("/api/course-playlists/user/:userId", async (req, res) => {
      try {
        const { userId } = req.params
        console.log(`📋 Fetching course playlists for user: ${userId}`)

        if (!userId || userId === "undefined") {
          return res.status(400).json({ success: false, message: "Valid User ID is required" })
        }

        const playlists = await CoursePlaylist.find({ createdBy: userId })
          .populate("createdBy", "name profilePicture")
          .populate({
            path: "courses.courseId",
            model: "Course",
            select:
              "title description videoUrl thumbnailUrl instructorName category price duration likes comments views createdAt createdBy",
            populate: {
              path: "createdBy",
              select: "name profilePicture",
            },
          })
          .sort({ createdAt: -1 })

        // ✅ Filter out courses where courseId is null (deleted courses)
        const cleanedPlaylists = playlists.map((playlist) => {
          playlist.courses = playlist.courses.filter((course) => course.courseId !== null)
          return playlist
        })

        console.log(`✅ Found ${cleanedPlaylists.length} course playlists`)
        res.status(200).json({ success: true, playlists: cleanedPlaylists })
      } catch (error) {
        console.error("❌ Error fetching user course playlists:", error)
        res.status(500).json({ success: false, message: "Failed to fetch playlists.", error: error.message })
      }
    })

    // ✅ FIXED: Get single course playlist with populated courses (using aggregation to avoid validation errors)
    app.get("/api/course-playlists/:playlistId", async (req, res) => {
      try {
        const { playlistId } = req.params
        console.log(`📋 Fetching course playlist: ${playlistId}`)

        // ✅ Use aggregation to filter out invalid courses at database level
        const playlistData = await CoursePlaylist.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(playlistId) } },
          {
            // Filter out courses with null courseId before population
            $addFields: {
              courses: {
                $filter: {
                  input: "$courses",
                  cond: {
                    $and: [{ $ne: ["$$this.courseId", null] }, { $ne: ["$$this.courseId", undefined] }],
                  },
                },
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [{ $project: { name: 1, profilePicture: 1 } }],
            },
          },
          {
            $lookup: {
              from: "courses",
              localField: "courses.courseId",
              foreignField: "_id",
              as: "courseDetails",
              pipeline: [
                {
                  $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdBy",
                    pipeline: [{ $project: { name: 1, profilePicture: 1 } }],
                  },
                },
                { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
              ],
            },
          },
          {
            $addFields: {
              courses: {
                $map: {
                  input: "$courses",
                  as: "course",
                  in: {
                    courseId: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$courseDetails",
                            cond: { $eq: ["$$this._id", "$$course.courseId"] },
                          },
                        },
                        0,
                      ],
                    },
                    addedAt: "$$course.addedAt",
                  },
                },
              },
            },
          },
          { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
          { $project: { courseDetails: 0 } },
        ])

        if (!playlistData || playlistData.length === 0) {
          return res.status(404).json({ success: false, message: "Playlist not found" })
        }

        const playlist = playlistData[0]

        // ✅ Update view count using findByIdAndUpdate to avoid validation issues
        await CoursePlaylist.findByIdAndUpdate(playlistId, { $inc: { views: 1 } }, { runValidators: false })

        console.log(`✅ Found course playlist: ${playlist.name}`)
        console.log(`📚 Courses in playlist:`, playlist.courses.length)

        // ✅ Log the structure to debug
        if (playlist.courses.length > 0) {
          console.log("📝 Sample course structure:", JSON.stringify(playlist.courses[0], null, 2))
        }

        res.status(200).json({ success: true, playlist })
      } catch (error) {
        console.error("❌ Error fetching course playlist:", error)
        res.status(500).json({ success: false, message: "Failed to fetch playlist.", error: error.message })
      }
    })


    // ✅ FIXED: Add course to playlist
    app.put("/api/course-playlists/add-course", async (req, res) => {
      try {
        const { playlistId, courseId, userId } = req.body
        console.log(`➕ Adding course ${courseId} to playlist ${playlistId}`)

        if (!playlistId || !courseId || !userId) {
          return res.status(400).json({ success: false, message: "Playlist ID, course ID, and user ID are required." })
        }

        const playlist = await CoursePlaylist.findById(playlistId)
        if (!playlist) {
          return res.status(404).json({ success: false, message: "Playlist not found" })
        }

        // Check if user owns the playlist
        if (playlist.createdBy.toString() !== userId) {
          return res.status(403).json({ success: false, message: "You can only add courses to your own playlists" })
        }

        // Check if course already exists in playlist
        const courseExists = playlist.courses.some(
          (course) => course.courseId && course.courseId.toString() === courseId,
        )
        if (courseExists) {
          return res.status(409).json({ success: false, message: "Course already exists in this playlist" })
        }

        // Verify course exists
        const course = await Course.findById(courseId)
        if (!course) {
          return res.status(404).json({ success: false, message: "Course not found" })
        }

        // ✅ FIXED: Add course reference only
        const courseReference = {
          courseId: courseId, // ✅ Store only the ObjectId reference
          addedAt: new Date(),
        }

        playlist.courses.push(courseReference)
        await playlist.save()

        // ✅ Populate the playlist before sending response
        const populatedPlaylist = await CoursePlaylist.findById(playlistId)
          .populate("createdBy", "name profilePicture")
          .populate({
            path: "courses.courseId",
            model: "Course",
            select:
              "title description videoUrl thumbnailUrl instructorName category price duration likes comments views createdAt createdBy",
            populate: {
              path: "createdBy",
              select: "name profilePicture",
            },
          })

        console.log("✅ Course added to playlist successfully")
        res.status(200).json({ success: true, message: "Course added to playlist!", playlist: populatedPlaylist })
      } catch (error) {
        console.error("❌ Error adding course to playlist:", error)
        res.status(500).json({ success: false, message: "Failed to add course to playlist.", error: error.message })
      }
    })

    // ✅ FIXED: Remove course from playlist
    app.put("/api/course-playlists/remove-course", async (req, res) => {
      try {
        const { playlistId, courseId, userId } = req.body
        console.log(`➖ Removing course ${courseId} from playlist ${playlistId}`)

        const playlist = await CoursePlaylist.findById(playlistId)
        if (!playlist) {
          return res.status(404).json({ success: false, message: "Playlist not found" })
        }

        // Check if user owns the playlist
        if (playlist.createdBy.toString() !== userId) {
          return res
            .status(403)
            .json({ success: false, message: "You can only remove courses from your own playlists" })
        }

        // ✅ FIXED: Remove course by courseId reference
        playlist.courses = playlist.courses.filter((course) => course.courseId.toString() !== courseId)
        await playlist.save()

        // ✅ Populate the playlist before sending response
        const populatedPlaylist = await CoursePlaylist.findById(playlistId)
          .populate("createdBy", "name profilePicture")
          .populate({
            path: "courses.courseId",
            model: "Course",
            select:
              "title description videoUrl thumbnailUrl instructorName category price duration likes comments views createdAt createdBy",
          })

        console.log("✅ Course removed from playlist successfully")
        res.status(200).json({ success: true, message: "Course removed from playlist!", playlist: populatedPlaylist })
      } catch (error) {
        console.error("❌ Error removing course from playlist:", error)
        res
          .status(500)
          .json({ success: false, message: "Failed to remove course from playlist.", error: error.message })
      }
    })

    // Delete course playlist
    app.delete("/api/course-playlists/:playlistId", async (req, res) => {
      try {
        const { playlistId } = req.params
        const { userId } = req.query
        console.log(`🗑️ Deleting course playlist: ${playlistId}`)

        if (!userId) {
          return res.status(400).json({ success: false, message: "User ID is required" })
        }

        const playlist = await CoursePlaylist.findById(playlistId)
        if (!playlist) {
          return res.status(404).json({ success: false, message: "Playlist not found" })
        }

        // Check if user owns the playlist
        if (playlist.createdBy.toString() !== userId) {
          return res.status(403).json({ success: false, message: "You can only delete your own playlists" })
        }

        await CoursePlaylist.findByIdAndDelete(playlistId)
        console.log("✅ Course playlist deleted successfully")
        res.status(200).json({ success: true, message: "Playlist deleted successfully!" })
      } catch (error) {
        console.error("❌ Error deleting course playlist:", error)
        res.status(500).json({ success: false, message: "Failed to delete playlist.", error: error.message })
      }
    })

    // ✅ ADD: Cleanup route to fix existing corrupt playlists
    app.post("/api/course-playlists/cleanup", async (req, res) => {
      try {
        console.log("🧹 Starting playlist cleanup...")

        const playlists = await CoursePlaylist.find({})
        let cleanedCount = 0

        for (const playlist of playlists) {
          const originalLength = playlist.courses.length
          playlist.courses = playlist.courses.filter(
            (course) => course.courseId !== null && course.courseId !== undefined,
          )

          if (playlist.courses.length !== originalLength) {
            await playlist.save()
            cleanedCount++
            console.log(
              `✅ Cleaned playlist: ${playlist.name} (removed ${originalLength - playlist.courses.length} invalid courses)`,
            )
          }
        }

        console.log(`✅ Cleanup complete! Cleaned ${cleanedCount} playlists`)
        res.json({
          success: true,
          message: `Cleanup complete! Cleaned ${cleanedCount} playlists`,
          totalPlaylists: playlists.length,
          cleanedPlaylists: cleanedCount,
        })
      } catch (error) {
        console.error("❌ Cleanup error:", error)
        res.status(500).json({ success: false, message: "Cleanup failed", error: error.message })
      }
    })

    // ✅ ADD: Debug route to check playlist structure
    app.get("/api/debug/course-playlist/:playlistId", async (req, res) => {
      try {
        const { playlistId } = req.params

        // Get raw playlist data
        const rawPlaylist = await CoursePlaylist.findById(playlistId)
        console.log("🔍 Raw playlist data:", JSON.stringify(rawPlaylist, null, 2))

        // Get populated playlist data
        const populatedPlaylist = await CoursePlaylist.findById(playlistId).populate("createdBy", "name").populate({
          path: "courses.courseId",
          model: "Course",
        })

        console.log("🔍 Populated playlist data:", JSON.stringify(populatedPlaylist, null, 2))

        // Course analysis
        const courseAnalysis = {
          totalCourses: rawPlaylist?.courses?.length || 0,
          validCourses: rawPlaylist?.courses?.filter((c) => c.courseId).length || 0,
          invalidCourses: rawPlaylist?.courses?.filter((c) => !c.courseId).length || 0,
        }

        res.json({
          success: true,
          raw: rawPlaylist,
          populated: populatedPlaylist,
          analysis: courseAnalysis,
          recommendations:
            courseAnalysis.invalidCourses > 0
              ? ["Run cleanup route to remove invalid courses"]
              : ["Playlist structure looks good"],
        })
      } catch (error) {
        console.error("Debug error:", error)
        res.status(500).json({ success: false, error: error.message })
      }
    })


    // Save/Unsave Course
  // Save/Unsave Course - Fixed version
   // Enhanced Save/Unsave Course Endpoint


// Enhanced Check Saved Status


    console.log("✅ Course Playlist routes setup complete!")

    // ✅ NEW: Get public course playlists for discovery (YouTube-style feed)
    app.get("/api/course-playlists/public/discover", async (req, res) => {
      try {
        const { page = 1, limit = 20, search = "", category = "" } = req.query
        console.log("🔍 Fetching public course playlists for discovery...")

        // Build query for public playlists
        const query = { isPrivate: false }

        // Add search functionality
        if (search) {
          query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
        }

        const playlists = await CoursePlaylist.find(query)
          .populate("createdBy", "name profilePicture")
          .populate({
            path: "courses.courseId",
            model: "Course",
            select: "title thumbnailUrl videoUrl category",
            match: category && category !== "All" ? { category: { $regex: category, $options: "i" } } : {},
          })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number.parseInt(limit))

        // Filter out playlists with no courses (if category filter applied)
        const filteredPlaylists = playlists.filter(
          (playlist) => !category || category === "All" || playlist.courses.some((course) => course.courseId),
        )

        const totalPlaylists = await CoursePlaylist.countDocuments(query)
        const totalPages = Math.ceil(totalPlaylists / limit)

        console.log(`✅ Found ${filteredPlaylists.length} public course playlists`)
        res.status(200).json({
          success: true,
          playlists: filteredPlaylists,
          currentPage: Number.parseInt(page),
          totalPages,
          totalPlaylists,
        })
      } catch (error) {
        console.error("❌ Error fetching public course playlists:", error)
        res.status(500).json({
          success: false,
          message: "Failed to fetch public playlists.",
          error: error.message,
        })
      }
    })

    console.log("✅ Public playlist discovery route added!")

    // 🎵 ===== VIDEO PLAYLIST ROUTES ===== 🎵
    console.log("🎵 Setting up Video Playlist routes...")

    // Create new video playlist
    app.post("/api/playlists/create", async (req, res) => {
      try {
        const { name, description, isPrivate, createdBy, videos } = req.body
        console.log("🎵 Creating new video playlist:", { name, createdBy, isPrivate })

        if (!name || !createdBy) {
          return res.status(400).json({ success: false, message: "Name and creator are required." })
        }

        // If videos are provided, get their details from Post model
        let videoDetails = []
        if (videos && videos.length > 0) {
          const postData = await Post.find({ _id: { $in: videos } })
            .populate("userId", "name profilePicture")
            .lean()

          videoDetails = postData.map((post) => ({
            _id: post._id,
            caption: post.caption,
            videoUrl: post.videoUrl,
            thumbnailUrl: post.imageUrl, // Use imageUrl from Post as thumbnail
            userId: post.userId._id,
            addedAt: new Date(),
          }))
        }

        const newPlaylist = new Playlist({
          name: name.trim(),
          description: description?.trim() || "",
          isPrivate: isPrivate || false,
          createdBy,
          videos: videoDetails,
        })

        await newPlaylist.save()
        console.log("✅ Video playlist created:", newPlaylist.name)

        res.status(201).json({
          success: true,
          message: "Video playlist created successfully!",
          playlist: newPlaylist,
        })
      } catch (error) {
        console.error("❌ Error creating video playlist:", error)
        res.status(500).json({ success: false, message: "Failed to create playlist.", error: error.message })
      }
    })

    // Get user's video playlists
    app.get("/api/playlists/user/:userId", async (req, res) => {
      try {
        const { userId } = req.params
        console.log(`📋 Fetching video playlists for user: ${userId}`)

        if (!userId) {
          return res.status(400).json({ success: false, message: "User ID is required" })
        }

        const playlists = await Playlist.find({ createdBy: userId })
          .populate("createdBy", "name profilePicture")
          .sort({ createdAt: -1 })

        console.log(`✅ Found ${playlists.length} video playlists`)
        res.status(200).json({ success: true, playlists })
      } catch (error) {
        console.error("❌ Error fetching user video playlists:", error)
        res.status(500).json({ success: false, message: "Failed to fetch playlists.", error: error.message })
      }
    })

    // Get single video playlist with videos
    app.get("/api/playlists/:playlistId", async (req, res) => {
      try {
        const { playlistId } = req.params
        console.log(`📋 Fetching video playlist: ${playlistId}`)

        const playlist = await Playlist.findById(playlistId)
          .populate("createdBy", "name profilePicture")
          .populate("videos.userId", "name profilePicture") // Populate video creators

        if (!playlist) {
          return res.status(404).json({ success: false, message: "Playlist not found" })
        }

        // Increment view count
        playlist.views = (playlist.views || 0) + 1
        await playlist.save()

        console.log(`✅ Found video playlist: ${playlist.name}`)
        res.status(200).json({ success: true, playlist })
      } catch (error) {
        console.error("❌ Error fetching video playlist:", error)
        res.status(500).json({ success: false, message: "Failed to fetch playlist.", error: error.message })
      }
    })

    // Add video to playlist
    app.put("/api/playlists/add-video", async (req, res) => {
      try {
        const { playlistId, videoId, userId } = req.body
        console.log(`➕ Adding video ${videoId} to playlist ${playlistId}`)

        if (!playlistId || !videoId || !userId) {
          return res.status(400).json({ success: false, message: "Playlist ID, video ID, and user ID are required." })
        }

        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
          return res.status(404).json({ success: false, message: "Playlist not found" })
        }

        // Check if user owns the playlist
        if (playlist.createdBy.toString() !== userId) {
          return res.status(403).json({ success: false, message: "You can only add videos to your own playlists" })
        }

        // Check if video already exists in playlist
        const videoExists = playlist.videos.some((video) => video._id.toString() === videoId)
        if (videoExists) {
          return res.status(409).json({ success: false, message: "Video already exists in this playlist" })
        }

        // Get video details from Post collection
        const post = await Post.findById(videoId).populate("userId", "name profilePicture")
        if (!post) {
          return res.status(404).json({ success: false, message: "Video (Post) not found" })
        }

        if (!post.videoUrl) {
          return res.status(400).json({ success: false, message: "Post is not a video" })
        }

        // Add video to playlist
        const videoData = {
          _id: post._id,
          caption: post.caption,
          videoUrl: post.videoUrl,
          thumbnailUrl: post.imageUrl, // Use imageUrl from Post as thumbnail
          userId: post.userId._id,
          addedAt: new Date(),
        }

        playlist.videos.push(videoData)
        await playlist.save()

        console.log("✅ Video added to playlist successfully")
        res.status(200).json({ success: true, message: "Video added to playlist!", playlist })
      } catch (error) {
        console.error("❌ Error adding video to playlist:", error)
        res.status(500).json({ success: false, message: "Failed to add video to playlist.", error: error.message })
      }
    })

    // Remove video from playlist
    app.put("/api/playlists/remove-video", async (req, res) => {
      try {
        const { playlistId, videoId, userId } = req.body
        console.log(`➖ Removing video ${videoId} from playlist ${playlistId}`)

        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
          return res.status(404).json({ success: false, message: "Playlist not found" })
        }

        // Check if user owns the playlist
        if (playlist.createdBy.toString() !== userId) {
          return res.status(403).json({ success: false, message: "You can only remove videos from your own playlists" })
        }

        // Remove video from playlist
        playlist.videos = playlist.videos.filter((video) => video._id.toString() !== videoId)
        await playlist.save()

        console.log("✅ Video removed from playlist successfully")
        res.status(200).json({ success: true, message: "Video removed from playlist!", playlist })
      } catch (error) {
        console.error("❌ Error removing video from playlist:", error)
        res.status(500).json({ success: false, message: "Failed to remove video from playlist.", error: error.message })
      }
    })

    // Update playlist details
    app.put("/api/playlists/update/:playlistId", async (req, res) => {
      try {
        const { playlistId } = req.params
        const { name, description, isPrivate, userId } = req.body
        console.log(`✏️ Updating playlist: ${playlistId}`)

        if (!userId) {
          return res.status(400).json({ success: false, message: "User ID is required" })
        }

        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
          return res.status(404).json({ success: false, message: "Playlist not found" })
        }

        // Check if user owns the playlist
        if (playlist.createdBy.toString() !== userId) {
          return res.status(403).json({ success: false, message: "You can only update your own playlists" })
        }

        // Update playlist fields
        if (name) playlist.name = name.trim()
        if (description !== undefined) playlist.description = description.trim()
        if (isPrivate !== undefined) playlist.isPrivate = isPrivate

        await playlist.save()
        console.log("✅ Playlist updated successfully")
        res.status(200).json({ success: true, message: "Playlist updated successfully!", playlist })
      } catch (error) {
        console.error("❌ Error updating playlist:", error)
        res.status(500).json({ success: false, message: "Failed to update playlist.", error: error.message })
      }
    })

    // Delete video playlist
    app.delete("/api/playlists/:playlistId", async (req, res) => {
      try {
        const { playlistId } = req.params
        const { userId } = req.query
        console.log(`🗑️ Deleting video playlist: ${playlistId}`)

        if (!userId) {
          return res.status(400).json({ success: false, message: "User ID is required" })
        }

        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
          return res.status(404).json({ success: false, message: "Playlist not found" })
        }

        // Check if user owns the playlist
        if (playlist.createdBy.toString() !== userId) {
          return res.status(403).json({ success: false, message: "You can only delete your own playlists" })
        }

        await Playlist.findByIdAndDelete(playlistId)
        console.log("✅ Video playlist deleted successfully")
        res.status(200).json({ success: true, message: "Playlist deleted successfully!" })
      } catch (error) {
        console.error("❌ Error deleting video playlist:", error)
        res.status(500).json({ success: false, message: "Failed to delete playlist.", error: error.message })
      }
    })

    // Get all public video playlists (for discovery)
    app.get("/api/playlists/public/discover", async (req, res) => {
      try {
        const { page = 1, limit = 20 } = req.query
        console.log("🔍 Fetching public video playlists...")

        const playlists = await Playlist.find({ isPrivate: false })
          .populate("createdBy", "name profilePicture")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number.parseInt(limit))

        const totalPlaylists = await Playlist.countDocuments({ isPrivate: false })
        const totalPages = Math.ceil(totalPlaylists / limit)

        console.log(`✅ Found ${playlists.length} public video playlists`)
        res.status(200).json({
          success: true,
          playlists,
          currentPage: Number.parseInt(page),
          totalPages,
          totalPlaylists,
        })
      } catch (error) {
        console.error("❌ Error fetching public video playlists:", error)
        res.status(500).json({ success: false, message: "Failed to fetch public playlists.", error: error.message })
      }
    })

    // Reorder videos in playlist
    app.put("/api/playlists/reorder/:playlistId", async (req, res) => {
      try {
        const { playlistId } = req.params
        const { videoIds, userId } = req.body // videoIds should be an array of video _ids in the desired order
        console.log(`🔄 Reordering videos in playlist: ${playlistId}`)

        if (!userId || !videoIds || !Array.isArray(videoIds)) {
          return res.status(400).json({ success: false, message: "User ID and video IDs array are required" })
        }

        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
          return res.status(404).json({ success: false, message: "Playlist not found" })
        }

        // Check if user owns the playlist
        if (playlist.createdBy.toString() !== userId) {
          return res.status(403).json({ success: false, message: "You can only reorder your own playlists" })
        }

        // Create a new ordered array of video objects based on videoIds
        const reorderedVideos = []
        for (const videoId of videoIds) {
          const video = playlist.videos.find((v) => v._id.toString() === videoId)
          if (video) {
            reorderedVideos.push(video)
          }
        }

        // Update the playlist's videos array
        playlist.videos = reorderedVideos
        await playlist.save()

        console.log("✅ Videos reordered successfully")
        res.status(200).json({ success: true, message: "Videos reordered successfully!", playlist })
      } catch (error) {
        console.error("❌ Error reordering videos:", error)
        res.status(500).json({ success: false, message: "Failed to reorder videos.", error: error.message })
      }
    })

    console.log("✅ Video Playlist routes setup complete!")

    // ===== COURSE ROUTES =====
    console.log("📚 Setting up Course routes...")

    // Create new course
    app.post("/api/courses", async (req, res) => {
      try {
        const { title, description, videoUrl, thumbnailUrl, createdBy, instructorName, category, price, duration } =
          req.body

        if (!title || !videoUrl || !createdBy) {
          return res.status(400).json({ success: false, message: "Title, video URL, and creator are required." })
        }

        const newCourse = new Course({
          title,
          description,
          videoUrl,
          thumbnailUrl,
          createdBy,
          instructorName,
          category,
          price: Number.parseFloat(price) || 0,
          duration,
        })

        await newCourse.save()
        console.log("✅ Course created:", newCourse.title)
        res.status(201).json({ success: true, message: "Course created successfully!", course: newCourse })
      } catch (error) {
        console.error("❌ Error creating course:", error)
        res.status(500).json({ success: false, message: "Failed to create course.", error: error.message })
      }
    })

    // Get all courses with search and filtering
    app.get("/api/courses", async (req, res) => {
      try {
        const { page = 1, limit = 20, search = "", category = "" } = req.query
        const query = {}

        if (search) {
          query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
        }

        if (category) {
          query.category = { $regex: category, $options: "i" }
        }

        const courses = await Course.find(query)
          .populate("createdBy", "name profilePicture")
          .populate("comments.userId", "name profilePicture")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number.parseInt(limit))

        const totalCourses = await Course.countDocuments(query)
        const totalPages = Math.ceil(totalCourses / limit)

        console.log(`✅ Found ${courses.length} courses`)
        res.json({
          success: true,
          courses,
          currentPage: Number.parseInt(page),
          totalPages,
          totalCourses,
        })
      } catch (error) {
        console.error("❌ Error fetching courses:", error)
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // Get courses by user
    app.get("/api/courses/user/:userId", async (req, res) => {
      try {
        const courses = await Course.find({ createdBy: req.params.userId })
          .populate("createdBy", "name profilePicture")
          .populate("comments.userId", "name profilePicture")
          .sort({ createdAt: -1 })

        console.log(`✅ Found ${courses.length} courses for user`)
        res.json({ success: true, courses })
      } catch (error) {
        console.error("❌ Error fetching user courses:", error)
        res.status(500).json({ success: false, message: "Failed to fetch user courses." })
      }
    })

    // Like/Unlike course
    app.put("/api/courses/like/:id", async (req, res) => {
      const { userId } = req.body
      try {
        const course = await Course.findById(req.params.id)
        if (!course) return res.status(404).json({ success: false, message: "Course not found" })

        const userIdStr = userId.toString()
        if (course.likes.includes(userIdStr)) {
          course.likes = course.likes.filter((id) => id.toString() !== userIdStr)
          console.log("👎 Course unliked")
        } else {
          course.likes.push(userIdStr)
          console.log("👍 Course liked")
        }

        await course.save()
        res.json({ success: true, course })
      } catch (err) {
        console.error("❌ Course like/unlike error:", err)
        res.status(500).json({ success: false, message: err.message })
      }
    })

    // Add comment to course
    app.put("/api/courses/comment/:id", async (req, res) => {
      const { userId, text } = req.body
      try {
        const course = await Course.findById(req.params.id)
        if (!course) return res.status(404).json({ success: false, message: "Course not found" })

        course.comments.push({ userId, text })
        await course.save()

        const populatedCourse = await Course.findById(course._id)
          .populate("createdBy", "name profilePicture")
          .populate("comments.userId", "name profilePicture")

        console.log("✅ Comment added to course")
        res.json({ success: true, course: populatedCourse })
      } catch (err) {
        console.error("❌ Course comment error:", err)
        res.status(500).json({ success: false, message: err.message })
      }
    })

    // Increment course view count
    app.put("/api/courses/view/:id", async (req, res) => {
      try {
        const course = await Course.findById(req.params.id)
        if (!course) return res.status(404).json({ success: false, message: "Course not found" })

        course.views = (course.views || 0) + 1
        await course.save()

        console.log(`👁️ Course view incremented: ${course.views}`)
        res.status(200).json({ success: true, message: "View count incremented", views: course.views })
      } catch (err) {
        console.error("❌ Course view increment error:", err)
        res.status(500).json({ success: false, message: err.message })
      }
    })

    // Delete course
    app.delete("/api/courses/:courseId", async (req, res) => {
      try {
        const { courseId } = req.params
        const { userId } = req.query

        if (!courseId || !userId) {
          return res.status(400).json({ success: false, message: "Course ID and User ID are required" })
        }

        const course = await Course.findById(courseId)
        if (!course) {
          return res.status(404).json({ success: false, message: "Course not found" })
        }

        if (course.createdBy.toString() !== userId) {
          return res.status(403).json({ success: false, message: "You can only delete your own courses" })
        }

        await Course.findByIdAndDelete(courseId)
        console.log("✅ Course deleted successfully")
        res.status(200).json({ success: true, message: "Course deleted successfully" })
      } catch (error) {
        console.error("❌ Delete course error:", error)
        res.status(500).json({ success: false, message: "Failed to delete course", error: error.message })
      }
    })

    console.log("✅ Course routes setup complete!")

    // ===== USER ACHIEVEMENTS =====
    app.get("/api/users/achievements/:userId", async (req, res) => {
      try {
        const { userId } = req.params

        // Course stats
        const courseStats = await Course.aggregate([
          { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
          {
            $group: {
              _id: null,
              totalCourses: { $sum: 1 },
              totalViews: { $sum: "$views" },
              totalLikes: { $sum: { $size: "$likes" } },
            },
          },
        ])

        const totalCoursesCreated = courseStats[0]?.totalCourses || 0
        const totalCourseViews = courseStats[0]?.totalViews || 0
        const totalCourseLikes = courseStats[0]?.totalLikes || 0

        // Comments on courses
        const commentsOnCourses = await Course.aggregate([
          { $unwind: "$comments" },
          { $match: { "comments.userId": new mongoose.Types.ObjectId(userId) } },
          { $count: "totalComments" },
        ])
        const totalCommentsOnCourses = commentsOnCourses[0]?.totalComments || 0

        // Comments on posts
        const commentsOnPosts = await Post.aggregate([
          { $unwind: "$comments" },
          { $match: { "comments.userId": new mongoose.Types.ObjectId(userId) } },
          { $count: "totalComments" },
        ])
        const totalCommentsOnPosts = commentsOnPosts[0]?.totalComments || 0
        const totalCommentsMade = totalCommentsOnCourses + totalCommentsOnPosts

        // Group messages
        const groupMessagesSent = await Message.aggregate([{ $match: { sender: userId } }, { $count: "totalMessages" }])
        const totalGroupMessages = groupMessagesSent[0]?.totalMessages || 0

        // Course Playlist achievements
        const coursePlaylistStats = await CoursePlaylist.aggregate([
          { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
          {
            $group: {
              _id: null,
              totalPlaylists: { $sum: 1 },
              totalPlaylistViews: { $sum: "$views" },
              totalCoursesInPlaylists: { $sum: { $size: "$courses" } },
            },
          },
        ])
        const totalCoursePlaylistsCreated = coursePlaylistStats[0]?.totalPlaylists || 0
        const totalCoursePlaylistViews = coursePlaylistStats[0]?.totalPlaylistViews || 0
        const totalCoursesInPlaylists = coursePlaylistStats[0]?.totalCoursesInPlaylists || 0

        // Video Playlist achievements
        const videoPlaylistStats = await Playlist.aggregate([
          { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
          {
            $group: {
              _id: null,
              totalPlaylists: { $sum: 1 },
              totalPlaylistViews: { $sum: "$views" },
              totalVideosInPlaylists: { $sum: { $size: "$videos" } },
            },
          },
        ])
        const totalVideoPlaylistsCreated = videoPlaylistStats[0]?.totalPlaylists || 0
        const totalVideoPlaylistViews = videoPlaylistStats[0]?.totalPlaylistViews || 0
        const totalVideosInPlaylists = videoPlaylistStats[0]?.totalVideosInPlaylists || 0

        const achievements = []

        // Course achievements
        if (totalCoursesCreated >= 1) {
          achievements.push({
            _id: "ach_course_1",
            name: "First Course Published 🎓",
            description: "You've published your very first course on the platform!",
            date: new Date().toISOString().split("T")[0],
            icon: "book-plus-outline",
          })
        }

        if (totalCoursesCreated >= 5) {
          achievements.push({
            _id: "ach_course_5",
            name: "Prolific Instructor 📚",
            description: "You've published 5 or more courses!",
            date: new Date().toISOString().split("T")[0],
            icon: "bookshelf",
          })
        }

        if (totalCourseViews >= 1000) {
          achievements.push({
            _id: "ach_views_1k",
            name: "Popular Educator ⭐",
            description: `Your courses have collectively reached ${totalCourseViews} views!`,
            date: new Date().toISOString().split("T")[0],
            icon: "eye-check-outline",
          })
        }

        if (totalCourseLikes >= 500) {
          achievements.push({
            _id: "ach_likes_500",
            name: "Fan Favorite Creator ❤️",
            description: `Your courses have received ${totalCourseLikes} likes!`,
            date: new Date().toISOString().split("T")[0],
            icon: "heart-multiple-outline",
          })
        }

        if (totalCommentsMade >= 50) {
          achievements.push({
            _id: "ach_comment_50",
            name: "Community Engager 💬",
            description: `You've made ${totalCommentsMade} comments on courses and posts!`,
            date: new Date().toISOString().split("T")[0],
            icon: "comment-multiple-outline",
          })
        }

        if (totalGroupMessages >= 100) {
          achievements.push({
            _id: "ach_group_100",
            name: "Chatty Member 🗣️",
            description: `You've sent ${totalGroupMessages} messages in groups!`,
            date: new Date().toISOString().split("T")[0],
            icon: "chat-processing-outline",
          })
        }

        // Course Playlist achievements
        if (totalCoursePlaylistsCreated >= 1) {
          achievements.push({
            _id: "ach_course_playlist_1",
            name: "Course Playlist Creator 📚",
            description: "You've created your first course playlist!",
            date: new Date().toISOString().split("T")[0],
            icon: "playlist-music",
          })
        }

        if (totalCoursePlaylistsCreated >= 5) {
          achievements.push({
            _id: "ach_course_playlist_5",
            name: "Course Playlist Master 🎓",
            description: "You've created 5 or more course playlists!",
            date: new Date().toISOString().split("T")[0],
            icon: "playlist-star",
          })
        }

        if (totalCoursesInPlaylists >= 50) {
          achievements.push({
            _id: "ach_course_playlist_courses_50",
            name: "Course Curator 📖",
            description: `You've added ${totalCoursesInPlaylists} courses to your playlists!`,
            date: new Date().toISOString().split("T")[0],
            icon: "book-plus-outline",
          })
        }

        // Video Playlist achievements
        if (totalVideoPlaylistsCreated >= 1) {
          achievements.push({
            _id: "ach_video_playlist_1",
            name: "Video Playlist Creator 🎵",
            description: "You've created your first video playlist!",
            date: new Date().toISOString().split("T")[0],
            icon: "playlist-music",
          })
        }

        if (totalVideoPlaylistsCreated >= 5) {
          achievements.push({
            _id: "ach_video_playlist_5",
            name: "Video Playlist Master 🎼",
            description: "You've created 5 or more video playlists!",
            date: new Date().toISOString().split("T")[0],
            icon: "playlist-star",
          })
        }

        if (totalVideosInPlaylists >= 50) {
          achievements.push({
            _id: "ach_video_playlist_videos_50",
            name: "Video Curator 📹",
            description: `You've added ${totalVideosInPlaylists} videos to your playlists!`,
            date: new Date().toISOString().split("T")[0],
            icon: "video-plus-outline",
          })
        }

        console.log(`✅ Found ${achievements.length} achievements for user`)
        res.json({ success: true, achievements })
      } catch (error) {
        console.error("❌ Error fetching user achievements:", error)
        res.status(500).json({ success: false, message: "Failed to fetch user achievements.", error: error.message })
      }
    })

    // ===== CONNECTION ROUTES =====
    console.log("🤝 Setting up Connection routes...")

    // Send connection request
    app.post("/api/connections/request", async (req, res) => {
      try {
        const { senderId, receiverId } = req.body

        if (!senderId || !receiverId) {
          return res.status(400).json({ success: false, message: "Sender and receiver IDs are required." })
        }

        if (senderId === receiverId) {
          return res.status(400).json({ success: false, message: "Cannot send a connection request to yourself." })
        }

        const existingRequest = await ConnectionRequest.findOne({
          $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId, status: "accepted" },
          ],
        })

        if (existingRequest) {
          if (existingRequest.status === "pending") {
            return res.status(409).json({ success: false, message: "Connection request already sent." })
          } else if (existingRequest.status === "accepted") {
            return res.status(409).json({ success: false, message: "Already connected with this user." })
          }
        }

        const newRequest = new ConnectionRequest({ sender: senderId, receiver: receiverId })
        await newRequest.save()

        // ✅ FIXED: Safe notification sending
        if (admin) {
          try {
            const receiverUser = await User.findById(receiverId).select("fcmToken name")
            if (receiverUser && receiverUser.fcmToken) {
              const senderUser = await User.findById(senderId).select("name")
              await admin.messaging().send({
                token: receiverUser.fcmToken,
                notification: {
                  title: "New Connection Request! 🤝",
                  body: `${senderUser?.name || "Someone"} wants to connect with you.`,
                },
                data: {
                  type: "connection_request",
                  senderId: senderId,
                  requestId: newRequest._id.toString(),
                },
              })
            }
          } catch (notificationError) {
            console.error("❌ Notification error:", notificationError)
            // Don't fail the request if notification fails
          }
        }

        console.log("✅ Connection request sent")
        res.status(201).json({ success: true, message: "Connection request sent.", request: newRequest })
      } catch (error) {
        console.error("❌ Error sending connection request:", error)
        res.status(500).json({ success: false, message: "Failed to send connection request.", error: error.message })
      }
    })

    // Accept connection request
    app.put("/api/connections/accept/:requestId", async (req, res) => {
      try {
        const { requestId } = req.params
        const { userId } = req.body
        console.log(`✅ Accepting connection request: ${requestId} by user: ${userId}`)

        const request = await ConnectionRequest.findById(requestId)
        if (!request) {
          return res.status(404).json({ success: false, message: "Connection request not found." })
        }

        if (request.receiver.toString() !== userId) {
          return res.status(403).json({ success: false, message: "You are not authorized to accept this request." })
        }

        if (request.status !== "pending") {
          return res.status(409).json({ success: false, message: "Request is not pending." })
        }

        request.status = "accepted"
        await request.save()

        await User.findByIdAndUpdate(request.sender, { $addToSet: { connections: request.receiver } })
        await User.findByIdAndUpdate(request.receiver, { $addToSet: { connections: request.sender } })

        let chat = await PrivateChat.findOne({
          participants: { $all: [request.sender, request.receiver] },
        })

        if (!chat) {
          chat = new PrivateChat({ participants: [request.sender, request.receiver] })
          await chat.save()
          console.log("✅ Private chat created successfully")
        }

        // ✅ FIXED: Safe notification sending
        if (admin) {
          try {
            const senderUser = await User.findById(request.sender).select("fcmToken name")
            if (senderUser && senderUser.fcmToken) {
              const receiverUser = await User.findById(request.receiver).select("name")
              await admin.messaging().send({
                token: senderUser.fcmToken,
                notification: {
                  title: "Connection Accepted! 🎉",
                  body: `${receiverUser?.name || "Someone"} accepted your connection request.`,
                },
                data: {
                  type: "connection_accepted",
                  receiverId: request.receiver.toString(),
                  chatId: chat._id.toString(),
                },
              })
            }
          } catch (notificationError) {
            console.error("❌ Notification error:", notificationError)
            // Don't fail the request if notification fails
          }
        }

        console.log("✅ Connection request accepted successfully")
        res.status(200).json({ success: true, message: "Connection request accepted.", request })
      } catch (error) {
        console.error("❌ Error accepting connection request:", error)
        res.status(500).json({ success: false, message: "Failed to accept connection request.", error: error.message })
      }
    })

    // Reject connection request
    app.put("/api/connections/reject/:requestId", async (req, res) => {
      try {
        const { requestId } = req.params
        const { userId } = req.body

        const request = await ConnectionRequest.findById(requestId)
        if (!request) {
          return res.status(404).json({ success: false, message: "Connection request not found." })
        }

        if (request.receiver.toString() !== userId) {
          return res.status(403).json({ success: false, message: "You are not authorized to reject this request." })
        }

        if (request.status !== "pending") {
          return res.status(409).json({ success: false, message: "Request is not pending." })
        }

        request.status = "rejected"
        await request.save()

        console.log("✅ Connection request rejected")
        res.status(200).json({ success: true, message: "Connection request rejected.", request })
      } catch (error) {
        console.error("❌ Error rejecting connection request:", error)
        res.status(500).json({ success: false, message: "Failed to reject connection request.", error: error.message })
      }
    })

    // Get pending connection requests
    app.get("/api/connections/pending/:userId", async (req, res) => {
      try {
        const { userId } = req.params
        const pendingRequests = await ConnectionRequest.find({ receiver: userId, status: "pending" }).populate(
          "sender",
          "name profilePicture",
        )

        console.log(`✅ Found ${pendingRequests.length} pending requests`)
        res.status(200).json({ success: true, requests: pendingRequests })
      } catch (error) {
        console.error("❌ Error fetching pending requests:", error)
        res.status(500).json({ success: false, message: "Failed to fetch pending requests.", error: error.message })
      }
    })

    // Get sent connection requests
    app.get("/api/connections/sent/:userId", async (req, res) => {
      try {
        const { userId } = req.params
        const sentRequests = await ConnectionRequest.find({ sender: userId, status: "pending" }).populate(
          "receiver",
          "name profilePicture",
        )

        console.log(`✅ Found ${sentRequests.length} sent requests`)
        res.status(200).json({ success: true, requests: sentRequests })
      } catch (error) {
        console.error("❌ Error fetching sent requests:", error)
        res.status(500).json({ success: false, message: "Failed to fetch sent requests.", error: error.message })
      }
    })

    // Get accepted connections
    app.get("/api/connections/accepted/:userId", async (req, res) => {
      try {
        const { userId } = req.params
        const acceptedConnections = await ConnectionRequest.find({
          $or: [{ sender: userId }, { receiver: userId }],
          status: "accepted",
        })
          .populate("sender", "name profilePicture")
          .populate("receiver", "name profilePicture")

        const connections = acceptedConnections
          .map((conn) => {
            if (conn.sender._id.toString() === userId) {
              return conn.receiver
            } else {
              return conn.sender
            }
          })
          .filter(
            (value, index, self) => self.findIndex((user) => user._id.toString() === value._id.toString()) === index,
          )

        console.log(`✅ Found ${connections.length} accepted connections`)
        res.status(200).json({ success: true, connections })
      } catch (error) {
        console.error("❌ Error fetching accepted connections:", error)
        res.status(500).json({ success: false, message: "Failed to fetch accepted connections.", error: error.message })
      }
    })

    console.log("✅ Connection routes setup complete!")

    // ===== PRIVATE CHAT ROUTES =====
    console.log("💬 Setting up Private Chat routes...")

    // Find or create private chat
    app.get("/api/chats/find/:user1Id/:user2Id", async (req, res) => {
      try {
        const { user1Id, user2Id } = req.params
        let chat = await PrivateChat.findOne({
          participants: { $all: [user1Id, user2Id] },
        })

        if (!chat) {
          chat = new PrivateChat({ participants: [user1Id, user2Id] })
          await chat.save()
          console.log("✅ New private chat created")
        }

        res.status(200).json({ success: true, chat })
      } catch (error) {
        console.error("❌ Error finding/creating chat:", error)
        res.status(500).json({ success: false, message: "Failed to find or create chat.", error: error.message })
      }
    })

    // Get user's private chats
    app.get("/api/chats/user/:userId", async (req, res) => {
      try {
        const { userId } = req.params
        const chats = await PrivateChat.find({ participants: userId })
          .populate("participants", "name profilePicture")
          .populate("lastMessage")
          .sort({ lastMessageAt: -1 })

        console.log(`✅ Found ${chats.length} private chats for user`)
        res.status(200).json({ success: true, chats })
      } catch (error) {
        console.error("❌ Error fetching user chats:", error)
        res.status(500).json({ success: false, message: "Failed to fetch user chats.", error: error.message })
      }
    })

    // Get chat messages
    app.get("/api/chats/:chatId/messages", async (req, res) => {
      try {
        const { chatId } = req.params
        const messages = await PrivateMessage.find({ chat: chatId })
          .populate("sender", "name profilePicture")
          .sort({ createdAt: 1 })

        console.log(`✅ Found ${messages.length} messages in chat`)
        res.status(200).json({ success: true, messages })
      } catch (error) {
        console.error("❌ Error fetching chat messages:", error)
        res.status(500).json({ success: false, message: "Failed to fetch chat messages.", error: error.message })
      }
    })

    // Send private message
    app.post("/api/chats/message", async (req, res) => {
      try {
        const { chatId, senderId, text } = req.body

        if (!chatId || !senderId || !text) {
          return res.status(400).json({ success: false, message: "Chat ID, sender ID, and text are required." })
        }

        const newMessage = new PrivateMessage({ chat: chatId, sender: senderId, text })
        await newMessage.save()

        await PrivateChat.findByIdAndUpdate(chatId, {
          lastMessage: newMessage._id,
          lastMessageAt: newMessage.createdAt,
        })

        const populatedMessage = await PrivateMessage.findById(newMessage._id).populate("sender", "name profilePicture")

        io.to(chatId).emit("receivePrivateMessage", populatedMessage)

        // ✅ FIXED: Safe notification sending
        if (admin) {
          try {
            const chat = await PrivateChat.findById(chatId).populate("participants", "fcmToken name")
            if (chat) {
              const otherParticipant = chat.participants.find((p) => p._id.toString() !== senderId)
              if (otherParticipant && otherParticipant.fcmToken) {
                const senderUser = await User.findById(senderId).select("name")
                await admin.messaging().send({
                  token: otherParticipant.fcmToken,
                  notification: {
                    title: `New Message from ${senderUser?.name || "Someone"}`,
                    body: text,
                  },
                  data: {
                    type: "private_message",
                    chatId: chatId,
                    senderId: senderId,
                  },
                })
              }
            }
          } catch (notificationError) {
            console.error("❌ Notification error:", notificationError)
            // Don't fail the request if notification fails
          }
        }

        console.log("✅ Private message sent")
        res.status(201).json({ success: true, message: "Message sent.", message: populatedMessage })
      } catch (error) {
        console.error("❌ Error sending private message:", error)
        res.status(500).json({ success: false, message: "Failed to send private message.", error: error.message })
      }
    })

    console.log("✅ Private Chat routes setup complete!")

    // ===== POST ROUTES =====
    console.log("📝 Setting up Post routes...")

    // Get all posts
    app.get("/api/posts/", async (req, res) => {
      try {
        console.log("📝 Fetching all posts...")
        const posts = await Post.find()
          .populate("userId", "name email profilePicture isVerified")
          .sort({ createdAt: -1 })

        console.log(`✅ Found ${posts.length} posts`)
        res.status(200).json({ success: true, posts })
      } catch (error) {
        console.error("❌ Error fetching posts:", error)
        res.status(500).json({ success: false, message: "Failed to fetch posts.", error: error.message })
      }
    })

    // Get user profile
    app.get("/api/users/profile/:userId", async (req, res) => {
      try {
        const { userId } = req.params
        console.log(`👤 Fetching profile for userId: ${userId}`)

        if (!userId) {
          return res.status(400).json({ success: false, message: "User ID is required" })
        }

        const user = await User.findById(userId).select("name email profilePicture bio isVerified isPrivate createdAt")

        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" })
        }

        console.log(`✅ Found user profile: ${user.name}`)
        res.status(200).json({ success: true, user })
      } catch (error) {
        console.error("❌ Error fetching user profile:", error)
        res.status(500).json({ success: false, message: "Failed to fetch user profile.", error: error.message })
      }
    })

    // Get posts by user
    app.get("/api/posts/user/:userId", async (req, res) => {
      try {
        const { userId } = req.params
        console.log(`📝 Fetching posts for userId: ${userId}`)

        if (!userId) {
          return res.status(400).json({ success: false, message: "User ID is required" })
        }

        const posts = await Post.find({ userId: userId })
          .populate("userId", "name email profilePicture")
          .sort({ createdAt: -1 })

        console.log(`✅ Found ${posts.length} posts for user`)
        res.status(200).json({ success: true, posts })
      } catch (error) {
        console.error("❌ Error fetching user posts:", error)
        res.status(500).json({ success: false, message: "Failed to fetch user posts." })
      }
    })

    // Like/Unlike post
    app.put("/api/posts/like/:postId", async (req, res) => {
      try {
        const { postId } = req.params
        const { userId } = req.body
        console.log(`❤️ Like request for post: ${postId} by user: ${userId}`)

        const post = await Post.findById(postId)
        if (!post) {
          return res.status(404).json({ success: false, message: "Post not found" })
        }

        const likeIndex = post.likes.indexOf(userId)
        if (likeIndex > -1) {
          post.likes.splice(likeIndex, 1)
          console.log("👎 Post unliked")
        } else {
          post.likes.push(userId)
          console.log("👍 Post liked")
        }

        await post.save()
        res.status(200).json({ success: true, message: "Post like updated", likes: post.likes.length })
      } catch (error) {
        console.error("❌ Error updating post like:", error)
        res.status(500).json({ success: false, message: "Failed to update like.", error: error.message })
      }
    })

    // Add comment to post
    app.put("/api/posts/comment/:postId", async (req, res) => {
      try {
        const { postId } = req.params
        const { userId, text } = req.body
        console.log(`💬 Comment request for post: ${postId} by user: ${userId}`)

        if (!text || !text.trim()) {
          return res.status(400).json({ success: false, message: "Comment text is required" })
        }

        const post = await Post.findById(postId)
        if (!post) {
          return res.status(404).json({ success: false, message: "Post not found" })
        }

        const newComment = {
          userId,
          text: text.trim(),
          createdAt: new Date(),
        }

        post.comments.push(newComment)
        await post.save()

        console.log("✅ Comment added successfully")
        res.status(200).json({ success: true, message: "Comment added successfully", comments: post.comments.length })
      } catch (error) {
        console.error("❌ Error adding comment:", error)
        res.status(500).json({ success: false, message: "Failed to add comment.", error: error.message })
      }
    })

    // Get discoverable users
    app.get("/api/users/discoverable/:userId", async (req, res) => {
      try {
        const { userId } = req.params
        console.log(`🔍 Fetching discoverable users for userId: ${userId}`)

        const users = await User.find({
          _id: { $ne: userId },
        }).select("name email profilePicture bio isVerified")

        console.log(`✅ Found ${users.length} discoverable users`)
        res.status(200).json({ success: true, users })
      } catch (error) {
        console.error("❌ Error fetching discoverable users:", error)
        res.status(500).json({ success: false, message: "Failed to fetch users.", error: error.message })
      }
    })

    console.log("✅ Post routes setup complete!")

    // ===== BASIC ROUTES =====
    app.get("/", (req, res) => {
      res.json({ message: "YouTube Chat Backend is running! 🚀" })
    })

    app.get("/api/users/test", (req, res) => {
      res.send("✅ Server working!")
    })

    // Get new creators posts
    app.get("/api/posts/new-creators", async (req, res) => {
      try {
        const { page = 1, limit = 20 } = req.query
        console.log("🌟 Fetching new creators posts...")

        const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)
        const newCreators = await User.find({
          createdAt: { $gte: threeMonthsAgo },
        }).select("_id")

        if (newCreators.length === 0) {
          return res.json({ success: true, posts: [], totalPages: 0, creators: 0 })
        }

        const newCreatorIds = newCreators.map((user) => user._id)
        const posts = await Post.find({
          userId: { $in: newCreatorIds },
          likes: { $lt: 50 },
        })
          .populate("userId", "name email profilePicture createdAt")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number.parseInt(limit))

        const totalPosts = await Post.countDocuments({
          userId: { $in: newCreatorIds },
          likes: { $lt: 50 },
        })

        const totalPages = Math.ceil(totalPosts / limit)

        console.log(`✅ Found ${posts.length} posts from new creators`)
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

    // Get posts stats
    app.get("/api/posts/stats", async (req, res) => {
      try {
        console.log("📊 Fetching posts stats...")

        const totalPosts = await Post.countDocuments()
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const recentPosts = await Post.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
        })

        const likesResult = await Post.aggregate([
          {
            $group: {
              _id: null,
              totalLikes: { $sum: "$likes" },
            },
          },
        ])

        const totalLikes = likesResult[0]?.totalLikes || 0

        const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)
        const newCreators = await User.countDocuments({
          createdAt: { $gte: threeMonthsAgo },
        })

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

    // ===== GROUP ROUTES =====
    console.log("👥 Setting up Group routes...")

    // Get all groups
    app.get("/api/groups", async (req, res) => {
      try {
        const groups = await Group.find().sort({ createdAt: -1 })
        console.log(`✅ Found ${groups.length} groups`)
        res.json(groups)
      } catch (err) {
        console.error("❌ Error fetching groups:", err)
        res.status(500).json({ message: "Error fetching groups" })
      }
    })

    // Create new group
    app.post("/api/groups", async (req, res) => {
      try {
        console.log("Received group creation request with body:", req.body)
        const { name, createdBy, profilePicture, description } = req.body

        const group = new Group({
          name,
          createdBy,
          members: createdBy ? [createdBy] : [],
          profilePicture: profilePicture || "",
          description: description || "",
        })

        console.log("Saving group to DB:", group)
        await group.save()

        if (createdBy) {
          await User.findByIdAndUpdate(createdBy, { $addToSet: { groups: group._id.toString() } })
        }

        console.log("✅ Group created successfully")
        res.status(201).json(group)
      } catch (err) {
        console.error("❌ Error creating group:", err)
        res.status(500).json({ message: "Error creating group" })
      }
    })

    // Get messages for a group
    app.get("/api/messages/:group", async (req, res) => {
      try {
        const messages = await Message.find({ group: req.params.group }).sort({ createdAt: 1 })
        console.log(`✅ Found ${messages.length} messages for group`)
        res.json(messages)
      } catch (err) {
        console.error("❌ Error fetching messages:", err)
        res.status(500).json({ message: "Error fetching messages" })
      }
    })

    // Save FCM token
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

        // Clear cache for this user
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

    // Join group
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

        // Clear cache for this group
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

    console.log("✅ All routes setup complete!")
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err)
    process.exit(1)
  })

// ===== SOCKET.IO HANDLERS =====
console.log("🔌 Setting up Socket.IO handlers...")

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id)

  // Join group
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId)
    console.log(`👥 Socket joined group: ${groupId}`)
  })

  // Join private chat
  socket.on("joinPrivateChat", (chatId) => {
    socket.join(chatId)
    console.log(`👥 Socket joined private chat: ${chatId}`)
  })

  // Send group message
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
        const result = await sendFirebaseNotification(
          tokens,
          {
            title: `💬 New Message`,
            body: `${messageData.senderName}: ${messageData.message}`,
          },
          {
            type: "group_message",
            groupId: data.group,
            messageId: newMsg._id.toString(),
            senderName: messageData.senderName,
            message: messageData.message,
          },
        )

        const processingTime = Date.now() - startTime
        console.log(
          `✅ Notifications sent in ${processingTime}ms - Success: ${result.successCount}, Failed: ${result.failureCount}`,
        )

        if (result.failureCount > 0) {
          console.log("❌ Failed notifications:")
          result.responses?.forEach((response, index) => {
            if (!response.success) {
              console.log(`   Token ${index}: ${response.error?.message}`)
            }
          })
        }
      } else {
        console.log("⚠️ No FCM tokens found for group members")
      }

      const totalTime = Date.now() - startTime
      console.log(`⏱️ Total message processing time: ${totalTime}ms`)
    } catch (error) {
      console.error("❌ Error in sendMessage:", error)
    }
  })

  // Send private message
  socket.on("sendPrivateMessage", async (data) => {
    try {
      console.log("📨 Processing private message:", data)
      const { chatId, senderId, text, senderName } = data

      if (!chatId || !senderId || !text) {
        console.error("❌ Invalid private message data")
        return
      }

      // Save message to database
      const newMessage = new PrivateMessage({
        chat: chatId,
        sender: senderId,
        text: text.trim(),
      })
      await newMessage.save()

      // Update chat's last message
      await PrivateChat.findByIdAndUpdate(chatId, {
        lastMessage: newMessage._id,
        lastMessageAt: newMessage.createdAt,
      })

      // Populate sender info
      const populatedMessage = await PrivateMessage.findById(newMessage._id).populate("sender", "name profilePicture")

      // Emit to all users in this private chat
      io.to(chatId).emit("receivePrivateMessage", populatedMessage)

      // Send confirmation back to sender
      socket.emit("privateMessageSent", populatedMessage)

      console.log("✅ Private message sent successfully via socket")

      // ✅ Firebase notification in background (non-blocking)
      setImmediate(async () => {
        try {
          if (admin) {
            const chat = await PrivateChat.findById(chatId).populate("participants", "fcmToken name")
            if (chat) {
              const otherParticipant = chat.participants.find((p) => p._id.toString() !== senderId)
              if (otherParticipant && otherParticipant.fcmToken) {
                await admin.messaging().send({
                  token: otherParticipant.fcmToken,
                  notification: {
                    title: `New Message from ${senderName || "Someone"}`,
                    body: text,
                  },
                  data: {
                    type: "private_message",
                    chatId: chatId,
                    senderId: senderId,
                  },
                })
                console.log("✅ Private message notification sent")
              }
            }
          }
        } catch (notificationError) {
          console.error("❌ Private message notification error:", notificationError)
          // Don't affect the main message flow
        }
      })
    } catch (error) {
      console.error("❌ Error in sendPrivateMessage:", error)
      socket.emit("privateMessageError", { error: "Failed to send message" })
    }
  })

  // Delete message
  socket.on("deleteMessage", async (msgId) => {
    try {
      await Message.findByIdAndDelete(msgId)
      io.emit("messageDeleted", msgId)
      console.log("✅ Message deleted")
    } catch (err) {
      console.error("❌ Delete failed:", err)
    }
  })

  // Edit message
  socket.on("editMessage", async (updatedMsg) => {
    try {
      const msg = await Message.findByIdAndUpdate(
        updatedMsg._id,
        { message: updatedMsg.message, edited: true },
        { new: true },
      )
      io.emit("messageEdited", msg)
      console.log("✅ Message edited")
    } catch (err) {
      console.error("❌ Edit failed:", err)
    }
  })

  // Disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id)
  })
})

console.log("✅ Socket.IO handlers setup complete!")

// ===== START SERVER =====
const PORT = process.env.PORT || 5000
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
  console.log(`📡 API URL: http://localhost:${PORT}`)
  console.log(`📱 Android Emulator URL: http://10.0.2.2:${PORT}`)
  console.log("🎵 Course Playlist functionality ready!")
  console.log("🎬 Video Playlist functionality ready!")
  console.log("📚 Course functionality ready!")
  console.log("🤝 Connection functionality ready!")
  console.log("💬 Private Chat functionality ready!")
  console.log("👥 Group Chat functionality ready!")
  console.log("📝 Post functionality ready!")
  console.log("🔥 Firebase notifications ready!")
  console.log("✅ All systems operational!")
})
