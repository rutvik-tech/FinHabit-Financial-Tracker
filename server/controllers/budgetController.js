const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

// Fetch all budgets for the authenticated user and compute current month spending
const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const budgets = await Budget.find({ user: userId }).sort({ createdAt: -1 });

    // Determine current month start and end timestamps
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Fetch expenses recorded in the current month
    const monthlyExpenses = await Expense.find({
      user: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Group actual spending by category
    const spendingMap = {};
    monthlyExpenses.forEach((exp) => {
      const cat = exp.category;
      spendingMap[cat] = (spendingMap[cat] || 0) + Number(exp.amount || 0);
    });

    // Combine budget limits with live monthly spending
    const budgetsWithSpending = budgets.map((b) => {
      const spent = spendingMap[b.category] || 0;
      const remaining = b.monthlyLimit - spent;
      const percentage = Math.round((spent / b.monthlyLimit) * 100);

      return {
        _id: b._id,
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        spent,
        remaining,
        percentage,
        isExceeded: spent > b.monthlyLimit,
        createdAt: b.createdAt
      };
    });

    res.status(200).json({
      success: true,
      budgets: budgetsWithSpending
    });
  } catch (error) {
    console.error("GET BUDGETS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch budgets."
    });
  }
};

// Create a new category budget
const createBudget = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { category, monthlyLimit } = req.body;

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required."
      });
    }

    const numericLimit = Number(monthlyLimit);
    if (!monthlyLimit || isNaN(numericLimit) || numericLimit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Monthly limit must be a positive number greater than 0."
      });
    }

    // Check if budget for category already exists
    const existing = await Budget.findOne({
      user: userId,
      category: category.trim()
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A budget for "${category.trim()}" already exists. Please edit the existing budget.`
      });
    }

    const budget = await Budget.create({
      user: userId,
      category: category.trim(),
      monthlyLimit: numericLimit
    });

    res.status(201).json({
      success: true,
      message: "Budget created successfully.",
      budget
    });
  } catch (error) {
    console.error("CREATE BUDGET ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create budget."
    });
  }
};

// Update existing budget limit
const updateBudget = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { monthlyLimit } = req.body;

    const numericLimit = Number(monthlyLimit);
    if (!monthlyLimit || isNaN(numericLimit) || numericLimit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Monthly limit must be a positive number greater than 0."
      });
    }

    const budget = await Budget.findOne({
      _id: req.params.id,
      user: userId
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget record not found."
      });
    }

    budget.monthlyLimit = numericLimit;
    await budget.save();

    res.status(200).json({
      success: true,
      message: "Budget updated successfully.",
      budget
    });
  } catch (error) {
    console.error("UPDATE BUDGET ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update budget."
    });
  }
};

// Delete a budget record
const deleteBudget = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: userId
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget record not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully."
    });
  } catch (error) {
    console.error("DELETE BUDGET ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete budget."
    });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};