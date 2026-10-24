const express = require("express");
const { getCashFlowAnalytics } = require("../controllers/analyticsController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/cash-flow", protect, getCashFlowAnalytics);

module.exports = router;