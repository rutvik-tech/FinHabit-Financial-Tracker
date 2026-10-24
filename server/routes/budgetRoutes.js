const express = require("express");
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
} = require("../controllers/budgetController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getBudgets);
router.post("/", protect, createBudget);
router.put("/:id", protect, updateBudget);
router.delete("/:id", protect, deleteBudget);

module.exports = router;