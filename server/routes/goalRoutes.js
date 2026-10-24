const express = require("express");

const {
  getGoals,
  createGoal,
  updateGoal,
  addMoneyToGoal,
  deleteGoal
} = require("../controllers/goalController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getGoals);
router.post("/", authMiddleware, createGoal);
router.put("/:id", authMiddleware, updateGoal);
router.patch("/:id/add-money", authMiddleware, addMoneyToGoal);
router.delete("/:id", authMiddleware, deleteGoal);

module.exports = router;