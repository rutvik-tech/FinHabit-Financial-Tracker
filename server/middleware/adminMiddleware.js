const User = require("../models/User");

const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const user = await User.findById(userId).select("role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found."
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Administrator access required."
      });
    }

    req.admin = {
      id: user._id.toString()
    };

    next();
  } catch (error) {
    console.error("ADMIN AUTHORIZATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify administrator permissions."
    });
  }
};

module.exports = requireAdmin;