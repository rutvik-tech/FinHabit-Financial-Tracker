const express = require("express");

const {
  addIncome,
  getIncome,
  updateIncome,
  deleteIncome
} = require("../controllers/incomeController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addIncome);
router.get("/", protect, getIncome);
router.put("/:id", protect, updateIncome);
router.delete("/:id", protect, deleteIncome);

module.exports = router;