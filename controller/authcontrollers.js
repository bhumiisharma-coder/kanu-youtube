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


const User = require("../models/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// ✅ Register function
const register = async (req, res) => {
  const { name, email, password } = req.body
  try {
    console.log("📝 Registration request:", { name, email })

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ name, email, password: hashedPassword })
    await newUser.save()

    console.log(`✅ User registered: ${newUser.name} (ID: ${newUser._id})`)

    // ✅ Generate token immediately after registration
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    })

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token, // ✅ Include token in registration response
      user: {
        id: newUser._id.toString(), // ✅ String format for React Native
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePicture: newUser.profilePicture || "",
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      error: "Something went wrong",
    })
  }
}

// ✅ Login function
const login = async (req, res) => {
  const { email, password } = req.body
  try {
    console.log("🔐 Login request:", { email })

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials",
      })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    })

    console.log(`✅ User logged in: ${user.name} (ID: ${user._id})`)
    console.log(`🔑 Token generated for user: ${user._id.toString()}`) // ✅ Debug log

    // ✅ Return user data exactly as React Native expects
    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(), // ✅ React Native के लिए string format
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || "",
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      error: "Login failed",
    })
  }
}

// ✅ Export functions properly
module.exports = {
  register,
  login,
}
