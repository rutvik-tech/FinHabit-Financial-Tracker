const SavingsGoal = require("../models/SavingsGoal");

const getGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({
      user: req.user.id || req.user.userId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json(goals);
  } catch (error) {
    console.error("GET GOALS ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch savings goals."
    });
  }
};

const createGoal = async (req, res) => {
  try {
    const {
      name,
      targetAmount,
      currentAmount,
      targetDate,
      description
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Goal name is required."
      });
    }

    const numericTarget = Number(targetAmount);
    if (
      targetAmount === undefined ||
      targetAmount === null ||
      isNaN(numericTarget) ||
      numericTarget <= 0
    ) {
      return res.status(400).json({
        message: "Target amount must be a valid number greater than 0."
      });
    }

    const numericCurrent = currentAmount ? Number(currentAmount) : 0;
    if (isNaN(numericCurrent) || numericCurrent < 0) {
      return res.status(400).json({
        message: "Already saved amount cannot be negative."
      });
    }

    if (!targetDate) {
      return res.status(400).json({
        message: "Target date is required."
      });
    }

    const parsedDate = new Date(targetDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        message: "Please provide a valid target date."
      });
    }

    const goal = await SavingsGoal.create({
      user: req.user.id || req.user.userId,
      name: name.trim(),
      targetAmount: numericTarget,
      currentAmount: Math.min(numericCurrent, numericTarget),
      targetDate: parsedDate,
      description: description ? description.trim() : ""
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error("CREATE GOAL ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to create savings goal."
    });
  }
};

const updateGoal = async (req, res) => {
  try {
    const {
      name,
      targetAmount,
      currentAmount,
      targetDate,
      description
    } = req.body;

    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      user: req.user.id || req.user.userId,
      isActive: true
    });

    if (!goal) {
      return res.status(404).json({
        message: "Savings goal not found."
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Goal name cannot be empty."
        });
      }
      goal.name = name.trim();
    }

    if (targetAmount !== undefined) {
      const numericTarget = Number(targetAmount);
      if (isNaN(numericTarget) || numericTarget <= 0) {
        return res.status(400).json({
          message: "Target amount must be greater than 0."
        });
      }
      goal.targetAmount = numericTarget;
    }

    if (currentAmount !== undefined) {
      const numericCurrent = Number(currentAmount);
      if (isNaN(numericCurrent) || numericCurrent < 0) {
        return res.status(400).json({
          message: "Current saved amount cannot be negative."
        });
      }
      goal.currentAmount = numericCurrent;
    }

    // Cap currentAmount if it exceeds targetAmount
    if (goal.currentAmount > goal.targetAmount) {
      goal.currentAmount = goal.targetAmount;
    }

    if (targetDate !== undefined) {
      const parsedDate = new Date(targetDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          message: "Please provide a valid date."
        });
      }
      goal.targetDate = parsedDate;
    }

    if (description !== undefined) {
      goal.description = description.trim();
    }

    await goal.save();

    res.status(200).json(goal);
  } catch (error) {
    console.error("UPDATE GOAL ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to update savings goal."
    });
  }
};

const addMoneyToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    const numericAmount = Number(amount);

    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Please enter a valid positive amount."
      });
    }

    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      user: req.user.id || req.user.userId,
      isActive: true
    });

    if (!goal) {
      return res.status(404).json({
        message: "Savings goal not found."
      });
    }

    goal.currentAmount += numericAmount;

    if (goal.currentAmount > goal.targetAmount) {
      goal.currentAmount = goal.targetAmount;
    }

    await goal.save();

    res.status(200).json(goal);
  } catch (error) {
    console.error("ADD MONEY TO GOAL ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to update savings goal."
    });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id || req.user.userId
      },
      {
        isActive: false
      },
      {
        returnDocument: "after"
      }
    );

    if (!goal) {
      return res.status(404).json({
        message: "Savings goal not found."
      });
    }

    res.status(200).json({
      message: "Savings goal deleted successfully."
    });
  } catch (error) {
    console.error("DELETE GOAL ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to delete savings goal."
    });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  addMoneyToGoal,
  deleteGoal
};