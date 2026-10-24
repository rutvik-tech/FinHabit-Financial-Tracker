const Income = require("../models/Income");

const addIncome = async (req, res) => {
  try {
    const { amount, source, date, note } = req.body;

    const numericAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid positive amount."
      });
    }

    if (!source || !source.trim()) {
      return res.status(400).json({
        success: false,
        message: "Source is required."
      });
    }

    const income = await Income.create({
      user: req.user.userId,
      amount: numericAmount,
      source: source.trim(),
      date: date ? new Date(date) : Date.now(),
      note: note ? note.trim() : ""
    });

    res.status(201).json({
      success: true,
      message: "Income added successfully.",
      income
    });
  } catch (error) {
    console.error("ADD INCOME ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add income."
    });
  }
};

const getIncome = async (req, res) => {
  try {
    const income = await Income.find({
      user: req.user.userId
    }).sort({ date: -1 });

    res.json({
      success: true,
      income
    });
  } catch (error) {
    console.error("GET INCOME ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch income."
    });
  }
};

const updateIncome = async (req, res) => {
  try {
    const { amount, source, date, note } = req.body;

    const income = await Income.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income record not found."
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
      income.amount = numericAmount;
    }

    if (source !== undefined) {
      if (!source.trim()) {
        return res.status(400).json({
          success: false,
          message: "Source cannot be empty."
        });
      }
      income.source = source.trim();
    }

    if (note !== undefined) {
      income.note = note.trim();
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid date."
        });
      }
      income.date = parsedDate;
    }

    await income.save();

    res.json({
      success: true,
      message: "Income updated successfully.",
      income
    });
  } catch (error) {
    console.error("UPDATE INCOME ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update income."
    });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income record not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Income deleted successfully."
    });
  } catch (error) {
    console.error("DELETE INCOME ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete income."
    });
  }
};

module.exports = {
  addIncome,
  getIncome,
  updateIncome,
  deleteIncome
};