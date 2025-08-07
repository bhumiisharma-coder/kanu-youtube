const jwt = require("jsonwebtoken")

// ✅ Enhanced token verification middleware
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    console.log("🔍 Auth header:", authHeader ? "Present" : "Missing")
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: "No authorization header provided" 
      })
    }

    const token = authHeader.split(" ")[1]
    console.log("🔑 Extracted token:", token ? "Present" : "Missing")
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
    console.log("✅ Token decoded successfully for user:", decoded.userId)
    
    req.userId = decoded.userId
    next()
  } catch (error) {
    console.error("❌ Token verification error:", error.message)
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token has expired. Please login again." 
      })
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token. Please login again." 
      })
    }
    
    return res.status(401).json({ 
      success: false, 
      message: "Token verification failed" 
    })
  }
}

module.exports = { verifyToken }
