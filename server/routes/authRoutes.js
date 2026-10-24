const express = require("express");

const {
  registerUser,
  loginUser,
  updateProfile,
  changePassword
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Update profile name
router.put("/profile", protect, updateProfile);

// Change password
router.put("/change-password", protect, changePassword);

// Protected test route
router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "You are authorized.",
    user: req.user
  });
});

module.exports = router;