const WealthSnapshot = require("../models/WealthSnapshot");

const getWealthSnapshots = async (req, res) => {
  try {
    const snapshots = await WealthSnapshot.find({
      user: req.user.id || req.user.userId
    }).sort({ snapshotDate: 1 });

    res.status(200).json(snapshots);
  } catch (error) {
    console.error("GET WEALTH SNAPSHOTS ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch wealth data."
    });
  }
};

const createWealthSnapshot = async (req, res) => {
  try {
    const {
      snapshotDate,
      savings,
      investments,
      otherAssets,
      liabilities,
      note
    } = req.body;

    if (!snapshotDate) {
      return res.status(400).json({
        message: "Snapshot date is required."
      });
    }

    const selectedDate = new Date(snapshotDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        message: "Please enter a valid snapshot date."
      });
    }

    if (selectedDate > today) {
      return res.status(400).json({
        message: "Snapshot date cannot be in the future."
      });
    }

    const savingsAmount = Number(savings) || 0;
    const investmentsAmount = Number(investments) || 0;
    const otherAssetsAmount = Number(otherAssets) || 0;
    const liabilitiesAmount = Number(liabilities) || 0;

    if (
      savingsAmount < 0 ||
      investmentsAmount < 0 ||
      otherAssetsAmount < 0 ||
      liabilitiesAmount < 0
    ) {
      return res.status(400).json({
        message: "Financial amounts cannot be negative."
      });
    }

    const totalAssets =
      savingsAmount +
      investmentsAmount +
      otherAssetsAmount;

    const netWorth =
      totalAssets -
      liabilitiesAmount;

    const snapshot = await WealthSnapshot.create({
      user: req.user.id || req.user.userId,
      snapshotDate: selectedDate,
      savings: savingsAmount,
      investments: investmentsAmount,
      otherAssets: otherAssetsAmount,
      liabilities: liabilitiesAmount,
      totalAssets,
      netWorth,
      note: note ? note.trim() : ""
    });

    res.status(201).json(snapshot);
  } catch (error) {
    console.error("CREATE WEALTH SNAPSHOT ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to create wealth snapshot."
    });
  }
};

const updateWealthSnapshot = async (req, res) => {
  try {
    const {
      snapshotDate,
      savings,
      investments,
      otherAssets,
      liabilities,
      note
    } = req.body;

    const snapshot = await WealthSnapshot.findOne({
      _id: req.params.id,
      user: req.user.id || req.user.userId
    });

    if (!snapshot) {
      return res.status(404).json({
        message: "Wealth snapshot not found."
      });
    }

    if (snapshotDate) {
      const selectedDate = new Date(snapshotDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (isNaN(selectedDate.getTime())) {
        return res.status(400).json({
          message: "Please enter a valid snapshot date."
        });
      }

      if (selectedDate > today) {
        return res.status(400).json({
          message: "Snapshot date cannot be in the future."
        });
      }
      snapshot.snapshotDate = selectedDate;
    }

    const savingsAmount =
      savings === undefined
        ? snapshot.savings
        : Number(savings) || 0;

    const investmentsAmount =
      investments === undefined
        ? snapshot.investments
        : Number(investments) || 0;

    const otherAssetsAmount =
      otherAssets === undefined
        ? snapshot.otherAssets
        : Number(otherAssets) || 0;

    const liabilitiesAmount =
      liabilities === undefined
        ? snapshot.liabilities
        : Number(liabilities) || 0;

    if (
      savingsAmount < 0 ||
      investmentsAmount < 0 ||
      otherAssetsAmount < 0 ||
      liabilitiesAmount < 0
    ) {
      return res.status(400).json({
        message: "Financial amounts cannot be negative."
      });
    }

    const totalAssets =
      savingsAmount +
      investmentsAmount +
      otherAssetsAmount;

    const netWorth =
      totalAssets -
      liabilitiesAmount;

    snapshot.savings = savingsAmount;
    snapshot.investments = investmentsAmount;
    snapshot.otherAssets = otherAssetsAmount;
    snapshot.liabilities = liabilitiesAmount;
    snapshot.totalAssets = totalAssets;
    snapshot.netWorth = netWorth;

    if (note !== undefined) {
      snapshot.note = note.trim();
    }

    await snapshot.save();

    res.status(200).json(snapshot);
  } catch (error) {
    console.error("UPDATE WEALTH SNAPSHOT ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to update wealth snapshot."
    });
  }
};

const deleteWealthSnapshot = async (req, res) => {
  try {
    const snapshot = await WealthSnapshot.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id || req.user.userId
    });

    if (!snapshot) {
      return res.status(404).json({
        message: "Wealth snapshot not found."
      });
    }

    res.status(200).json({
      message: "Wealth snapshot deleted successfully."
    });
  } catch (error) {
    console.error("DELETE WEALTH SNAPSHOT ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to delete wealth snapshot."
    });
  }
};

module.exports = {
  getWealthSnapshots,
  createWealthSnapshot,
  updateWealthSnapshot,
  deleteWealthSnapshot
};