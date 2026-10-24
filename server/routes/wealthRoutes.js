const express = require("express");

const {
  getWealthSnapshots,
  createWealthSnapshot,
  updateWealthSnapshot,
  deleteWealthSnapshot
} = require("../controllers/wealthController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getWealthSnapshots);

router.post("/", authMiddleware, createWealthSnapshot);

router.put("/:id", authMiddleware, updateWealthSnapshot);

router.delete("/:id", authMiddleware, deleteWealthSnapshot);

module.exports = router;