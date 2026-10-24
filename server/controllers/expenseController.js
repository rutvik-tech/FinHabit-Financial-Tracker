const Expense = require("../models/Expense");

const addExpense = async (req, res) => {
  try {
    const body = req.body || {};
    const { amount, category, description, date } = body;

    const numericAmount = Number(amount);
    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid positive amount."
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required."
      });
    }

    const expense = await Expense.create({
      user: req.user.userId,
      amount: numericAmount,
      category: category.trim(),
      description: description ? description.trim() : "",
      date: date ? new Date(date) : Date.now()
    });

    res.status(201).json({
      success: true,
      message: "Expense added successfully.",
      expense
    });
  } catch (error) {
    console.error("ADD EXPENSE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add expense."
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user.userId
    }).sort({ date: -1 });

    res.json({
      success: true,
      expenses
    });
  } catch (error) {
    console.error("GET EXPENSES ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch expenses."
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body || {};

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found."
      });
    }

    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid positive amount."
        });
      }
      expense.amount = numericAmount;
    }

    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category cannot be empty."
        });
      }
      expense.category = category.trim();
    }

    if (description !== undefined) {
      expense.description = description.trim();
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid date."
        });
      }
      expense.date = parsedDate;
    }

    await expense.save();

    res.json({
      success: true,
      message: "Expense updated successfully.",
      expense
    });
  } catch (error) {
    console.error("UPDATE EXPENSE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update expense."
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found."
      });
    }

    res.json({
      success: true,
      message: "Expense deleted successfully."
    });
  } catch (error) {
    console.error("DELETE EXPENSE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete expense."
    });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense
};