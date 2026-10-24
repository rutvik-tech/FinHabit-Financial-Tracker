const express = require("express");
const {
  getHabits,
  createHabit,
  updateHabit,
  completeHabit,
  deleteHabit
} = require("../controllers/habitController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getHabits);
router.post("/", authMiddleware, createHabit);
router.put("/:id", authMiddleware, updateHabit);
router.patch("/:id/complete", authMiddleware, completeHabit);
router.delete("/:id", authMiddleware, deleteHabit);

module.exports = router;