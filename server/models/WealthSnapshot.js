const mongoose = require("mongoose");

const wealthSnapshotSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    snapshotDate: {
      type: Date,
      required: true
    },

    savings: {
      type: Number,
      default: 0,
      min: 0
    },

    investments: {
      type: Number,
      default: 0,
      min: 0
    },

    otherAssets: {
      type: Number,
      default: 0,
      min: 0
    },

    liabilities: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAssets: {
      type: Number,
      default: 0,
      min: 0
    },

    netWorth: {
      type: Number,
      default: 0
    },

    note: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("WealthSnapshot", wealthSnapshotSchema);