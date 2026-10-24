const Habit = require("../models/Habit");

// Helper function to calculate current consecutive streak
const calculateStreak = (completedDates) => {
  if (!completedDates || completedDates.length === 0) return 0;

  // Extract unique normalized dates (YYYY-MM-DD) sorted descending
  const uniqueDateStrings = Array.from(
    new Set(
      completedDates.map((d) => {
        const dateObj = new Date(d);
        return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
      })
    )
  ).sort((a, b) => b - a);

  if (uniqueDateStrings.length === 0) return 0;

  const today = new Date();
  const todayTimestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const yesterdayTimestamp = todayTimestamp - oneDayMs;

  const latestDate = uniqueDateStrings[0];

  // If the habit was not completed today or yesterday, the active streak is broken
  if (latestDate !== todayTimestamp && latestDate !== yesterdayTimestamp) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < uniqueDateStrings.length - 1; i++) {
    const current = uniqueDateStrings[i];
    const prev = uniqueDateStrings[i + 1];

    if (current - prev === oneDayMs) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
};

const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({
      user: req.user.id || req.user.userId,
      isActive: true
    }).sort({ createdAt: -1 });

    // Ensure stored streak matches real consecutive dates
    const updatedHabits = await Promise.all(
      habits.map(async (habit) => {
        const computedStreak = calculateStreak(habit.completedDates);
        if (habit.streak !== computedStreak) {
          habit.streak = computedStreak;
          await habit.save();
        }
        return habit;
      })
    );

    res.status(200).json(updatedHabits);
  } catch (error) {
    console.error("GET HABITS ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch habits."
    });
  }
};

const createHabit = async (req, res) => {
  try {
    const { name, description, frequency } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Habit name is required."
      });
    }

    const habit = await Habit.create({
      user: req.user.id || req.user.userId,
      name: name.trim(),
      description: description ? description.trim() : "",
      frequency: frequency || "daily"
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error("CREATE HABIT ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to create habit."
    });
  }
};

const updateHabit = async (req, res) => {
  try {
    const { name, description, frequency } = req.body;

    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user.id || req.user.userId,
      isActive: true
    });

    if (!habit) {
      return res.status(404).json({
        message: "Habit not found."
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Habit name cannot be empty."
        });
      }
      habit.name = name.trim();
    }

    if (description !== undefined) {
      habit.description = description.trim();
    }

    if (frequency !== undefined) {
      habit.frequency = frequency;
    }

    await habit.save();

    res.status(200).json(habit);
  } catch (error) {
    console.error("UPDATE HABIT ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to update habit."
    });
  }
};

// Toggle today's completion status
const completeHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user.id || req.user.userId,
      isActive: true
    });

    if (!habit) {
      return res.status(404).json({
        message: "Habit not found."
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const existingIndex = habit.completedDates.findIndex((date) => {
      const completedDate = new Date(date);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === todayTimestamp;
    });

    if (existingIndex > -1) {
      // Toggle off if already completed today
      habit.completedDates.splice(existingIndex, 1);
    } else {
      // Toggle on
      habit.completedDates.push(today);
    }

    habit.streak = calculateStreak(habit.completedDates);
    await habit.save();

    res.status(200).json(habit);
  } catch (error) {
    console.error("COMPLETE HABIT ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to complete habit."
    });
  }
};

const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
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

    if (!habit) {
      return res.status(404).json({
        message: "Habit not found."
      });
    }

    res.status(200).json({
      message: "Habit deleted successfully."
    });
  } catch (error) {
    console.error("DELETE HABIT ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to delete habit."
    });
  }
};

module.exports = {
  getHabits,
  createHabit,
  updateHabit,
  completeHabit,
  deleteHabit
};