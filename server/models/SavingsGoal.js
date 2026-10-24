const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    targetAmount: {
      type: Number,
      required: true,
      min: 0
    },

    currentAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    targetDate: {
      type: Date,
      required: true
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);