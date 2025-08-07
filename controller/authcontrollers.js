// // const User = require("../models/User");
// // const bcrypt = require("bcryptjs");
// // const jwt = require("jsonwebtoken");

// // exports.register = async (req, res) => {
// //   const { name, email, password } = req.body;
// //   try {
// //     const existingUser = await User.findOne({ email });
// //     if (existingUser) return res.status(400).json({ error: "Email already exists" });

// //     const hashedPassword = await bcrypt.hash(password, 10);
// //     const newUser = new User({ name, email, password: hashedPassword });
// //     await newUser.save();

// //     res.status(201).json({ message: "User registered successfully" });
// //   } catch (error) {
// //     res.status(500).json({ error: "Something went wrong" });
// //   }
// // };

// // exports.login = async (req, res) => {
// //   const { email, password } = req.body;
// //   try {
// //     const user = await User.findOne({ email });
// //     if (!user) return res.status(404).json({ error: "User not found" });

// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

// //     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

// //     // ✅ Send user data too
// //     res.json({
// //       token,
// //       user: {
// //         _id: user._id,
// //         name: user.name,
// //         email: user.email
// //       }
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: "Login failed" });
// //   }
// // };


// const User = require("../models/user")
// const bcrypt = require("bcryptjs")
// const jwt = require("jsonwebtoken")

// // ✅ Register function
// const register = async (req, res) => {
//   const { name, email, password } = req.body
//   try {
//     console.log("📝 Registration request:", { name, email })

//     // Input validation
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         error: "Name, email, and password are required",
//       })
//     }

//     if (password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         error: "Password must be at least 6 characters",
//       })
//     }

//     const existingUser = await User.findOne({ email })
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         error: "Email already exists",
//       })
//     }

//     const hashedPassword = await bcrypt.hash(password, 10)
//     const newUser = new User({ name, email, password: hashedPassword })
//     await newUser.save()

//     console.log(`✅ User registered: ${newUser.name} (ID: ${newUser._id})`)

//     res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       user: {
//         id: newUser._id.toString(), // ← React Native के लिए string format
//         _id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//       },
//     })
//   } catch (error) {
//     console.error("Registration error:", error)
//     res.status(500).json({
//       success: false,
//       error: "Something went wrong",
//     })
//   }
// }

// // ✅ Login function
// const login = async (req, res) => {
//   const { email, password } = req.body
//   try {
//     console.log("🔐 Login request:", { email })

//     // Input validation
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         error: "Email and password are required",
//       })
//     }

//     const user = await User.findOne({ email })
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: "User not found",
//       })
//     }

//     const isMatch = await bcrypt.compare(password, user.password)
//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid credentials",
//       })
//     }

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "fallback-secret", {
//       expiresIn: "7d",
//     })

//     console.log(`✅ User logged in: ${user.name} (ID: ${user._id})`)

//     // ✅ Return user data exactly as React Native expects
//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id.toString(), // ← React Native के लिए string format
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         profilePicture: user.profilePicture || "",
//       },
//     })
//   } catch (error) {
//     console.error("Login error:", error)
//     res.status(500).json({
//       success: false,
//       error: "Login failed",
//     })
//   }
// }

// // ✅ Export functions properly
// module.exports = {
//   register,
//   login,
// }


// const User = require("../models/user")
// const bcrypt = require("bcryptjs")
// const jwt = require("jsonwebtoken")

// // ✅ Register function
// const register = async (req, res) => {
//   const { name, email, password } = req.body
//   try {
//     console.log("📝 Registration request:", { name, email })

//     // Input validation
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         error: "Name, email, and password are required",
//       })
//     }

//     if (password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         error: "Password must be at least 6 characters",
//       })
//     }

//     const existingUser = await User.findOne({ email })
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         error: "Email already exists",
//       })
//     }

//     const hashedPassword = await bcrypt.hash(password, 10)
//     const newUser = new User({ name, email, password: hashedPassword })
//     await newUser.save()

//     console.log(`✅ User registered: ${newUser.name} (ID: ${newUser._id})`)

//     // ✅ Generate token immediately after registration
//     const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET || "fallback-secret", {
//       expiresIn: "7d",
//     })

//     res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       token, // ✅ Include token in registration response
//       user: {
//         id: newUser._id.toString(), // ✅ String format for React Native
//         _id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//         profilePicture: newUser.profilePicture || "",
//       },
//     })
//   } catch (error) {
//     console.error("Registration error:", error)
//     res.status(500).json({
//       success: false,
//       error: "Something went wrong",
//     })
//   }
// }

// // ✅ Login function
// const login = async (req, res) => {
//   const { email, password } = req.body
//   try {
//     console.log("🔐 Login request:", { email })

//     // Input validation
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         error: "Email and password are required",
//       })
//     }

//     const user = await User.findOne({ email })
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: "User not found",
//       })
//     }

//     const isMatch = await bcrypt.compare(password, user.password)
//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid credentials",
//       })
//     }

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "fallback-secret", {
//       expiresIn: "7d",
//     })

//     console.log(`✅ User logged in: ${user.name} (ID: ${user._id})`)
//     console.log(`🔑 Token generated for user: ${user._id.toString()}`) // ✅ Debug log

//     // ✅ Return user data exactly as React Native expects
//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id.toString(), // ✅ React Native के लिए string format
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         profilePicture: user.profilePicture || "",
//       },
//     })
//   } catch (error) {
//     console.error("Login error:", error)
//     res.status(500).json({
//       success: false,
//       error: "Login failed",
//     })
//   }
// }

// // ✅ Export functions properly
// module.exports = {
//   register,
//   login,
// }








const User = require("../models/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// ✅ Debug JWT_SECRET on startup
console.log("🔍 Auth Controller - JWT_SECRET exists:", !!process.env.JWT_SECRET)
console.log("🔍 Auth Controller - JWT_SECRET length:", process.env.JWT_SECRET?.length)

// ✅ Register function with enhanced error handling
const register = async (req, res) => {
  const { name, email, password } = req.body
  
  try {
    console.log("📝 Registration request:", { name, email })
    
    // Input validation
    if (!name || !email || !password) {
      console.log("❌ Missing required fields")
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      })
    }
    
    if (password.length < 6) {
      console.log("❌ Password too short")
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      })
    }

    // Check if user already exists
    console.log("🔍 Checking if user exists...")
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      console.log("❌ User already exists:", email)
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      })
    }

    // Hash password
    console.log("🔐 Hashing password...")
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create new user
    console.log("👤 Creating new user...")
    const newUser = new User({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password: hashedPassword 
    })
    
    const savedUser = await newUser.save()
    console.log(`✅ User registered successfully: ${savedUser.name} (ID: ${savedUser._id})`)

    // ✅ Check JWT_SECRET before generating token
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET not found in environment variables")
      return res.status(500).json({
        success: false,
        error: "Server configuration error - JWT_SECRET missing",
      })
    }

    // ✅ Generate token immediately after registration
    const token = jwt.sign(
      { userId: savedUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    )

    console.log("✅ Token generated for new user:", {
      userId: savedUser._id.toString(),
      tokenLength: token.length
    })

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token, // ✅ Include token in registration response
      user: {
        id: savedUser._id.toString(), // ✅ String format for React Native
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        profilePicture: savedUser.profilePicture || "",
      },
    })
  } catch (error) {
    console.error("❌ Registration error:", error)
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      })
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
      })
    }
    
    res.status(500).json({
      success: false,
      error: "Something went wrong during registration",
    })
  }
}

// ✅ Login function with enhanced error handling
const login = async (req, res) => {
  const { email, password } = req.body
  
  try {
    console.log("🔐 Login request:", { email })
    
    // Input validation
    if (!email || !password) {
      console.log("❌ Missing email or password")
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      })
    }

    // Find user (include password for comparison)
    console.log("🔍 Finding user in database for email:", email.toLowerCase().trim())
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
    
    if (!user) {
      console.log("❌ User not found for email:", email)
      return res.status(404).json({
        success: false,
        error: "Invalid email or password", // Don't reveal if email exists
      })
    }

    console.log("✅ User found:", user.name)
    // ✅ IMPORTANT DEBUGGING STEP: Log the password field
    console.log("DEBUG: user.password (exists):", !!user.password);
    console.log("DEBUG: user.password (type):", typeof user.password);
    console.log("DEBUG: user.password (length):", user.password ? user.password.length : 'N/A');

    // Check password
    console.log("🔐 Comparing passwords...")
    // This is the line where the error occurs if user.password is undefined
    const isMatch = await bcrypt.compare(password, user.password) 
    
    if (!isMatch) {
      console.log("❌ Password mismatch for user:", email)
      return res.status(400).json({
        success: false,
        error: "Invalid email or password",
      })
    }

    console.log("✅ Password match successful")

    // ✅ Check JWT_SECRET before generating token
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET not found in environment variables")
      return res.status(500).json({
        success: false,
        error: "Server configuration error - JWT_SECRET missing",
      })
    }

    // Generate token
    console.log("🔑 Generating JWT token...")
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    )

    console.log(`✅ Login successful: ${user.name} (ID: ${user._id})`)
    console.log(`🔑 Token generated:`, {
      userId: user._id.toString(),
      tokenLength: token.length
    })

    // ✅ Return user data exactly as React Native expects
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || "",
      },
    })
  } catch (error) {
    console.error("❌ Login error details:", error)
    console.error("❌ Error name:", error.name)
    console.error("❌ Error message:", error.message)
    
    res.status(500).json({
      success: false,
      error: "Login failed - server error",
    })
  }
}

// ✅ Export functions properly
module.exports = {
  register,
  login,
}
