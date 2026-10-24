const express = require("express");

const {
  getAdminDashboard,
  getUsers,
  getUserDetails,
  updateUserStatus,
  getAdminActivities
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/dashboard", getAdminDashboard);
router.get("/users", getUsers);
router.get("/users/:id", getUserDetails);
router.patch("/users/:id/status", updateUserStatus);
router.get("/activities", getAdminActivities);

module.exports = router;