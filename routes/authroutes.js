// const express = require("express");
// const router = express.Router();
// const { register, login } = require("../controller/authcontrollers");

// router.post("/register", register);
// router.post("/login", login);

// module.exports = router;

const express = require("express")
const router = express.Router()
const { register, login } = require("../controller/authcontrollers")

// ✅ Debug: Check if functions are properly imported
console.log("🔍 Auth functions check:")
console.log("- register:", typeof register)
console.log("- login:", typeof login)

// ✅ Routes - Support both /register and /signup
router.post("/register", register)
router.post("/signup", register) // ✅ Add signup alias
router.post("/login", login)

// ✅ Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes working!",
    endpoints: {
      register: "POST /api/auth/register",
      signup: "POST /api/auth/signup",
      login: "POST /api/auth/login",
    },
  })
})

module.exports = router
