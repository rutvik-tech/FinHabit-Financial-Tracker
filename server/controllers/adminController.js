const mongoose = require("mongoose");
const User = require("../models/User");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Habit = require("../models/Habit");
const SavingsGoal = require("../models/SavingsGoal");
const WealthSnapshot = require("../models/WealthSnapshot");

const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalExpenses,
      totalIncome,
      totalHabits,
      totalGoals,
      totalWealthSnapshots,
      recentUsers
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({
        role: "user",
        isActive: { $ne: false }
      }),
      User.countDocuments({
        role: "user",
        isActive: false
      }),
      Expense.countDocuments(),
      Income.countDocuments(),
      Habit.countDocuments(),
      SavingsGoal.countDocuments(),
      WealthSnapshot.countDocuments(),
      User.find({ role: "user" })
        .select("name email role isActive createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    const registrations = await User.aggregate([
      {
        $match: {
          role: "user",
          createdAt: {
            $gte: new Date( Date.now() - 29 * 24 * 60 * 60 * 1000 ) } } }, {$group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 } } }, {$sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1
        }
      }
    ]);

    res.json({
      success: true,
      statistics: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalExpenses,
        totalIncome,
        totalHabits,
        totalGoals,
        totalWealthSnapshots
      },
      registrations,
      recentUsers
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load administrator dashboard."
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const search = String(req.query.search || "")
      .trim()
      .slice(0, 100);

    const filter = {
      role: "user"
    };

    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { name: { $regex: escapedSearch,$options: "i" } },
        { email: { $regex: escapedSearch,$options: "i" } }
      ];
    }

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("name email role isActive createdAt updatedAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      users: users.map((user) => ({
        ...user,
        isActive: user.isActive !== false
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit
      }
    });
  } catch (error) {
    console.error("ADMIN GET USERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve users."
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    const user = await User.findOne({
      _id: req.params.id,
      role: "user"
    })
      .select("name email role isActive createdAt updatedAt")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    res.json({
      success: true,
      user: {
        ...user,
        isActive: user.isActive !== false
      }
    });
  } catch (error) {
    console.error("ADMIN USER DETAILS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve user details."
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    const { isActive } = req.body || {};

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "A valid account status is required."
      });
    }

    const currentAdminId = req.user?.id || req.user?.userId;
    if (req.params.id === currentAdminId) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status here."
      });
    }

    const user = await User.findOne({
      _id: req.params.id,
      role: "user"
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: isActive
        ? "User account activated successfully."
        : "User account deactivated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("ADMIN UPDATE USER STATUS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user account status."
    });
  }
};

const getAdminActivities = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 15));
    const filterType = req.query.type || "all";
    const fetchLimit = page * limit + 30;

    const [usersRaw, expensesRaw, incomesRaw, habitsRaw, goalsRaw] = await Promise.all([
      filterType === "all" || filterType === "registration"
        ? User.find({ role: "user" })
            .select("name email createdAt")
            .sort({ createdAt: -1 })
            .limit(fetchLimit)
            .lean()
        : Promise.resolve([]),

      filterType === "all" || filterType === "expense"
        ? Expense.find()
            .sort({ createdAt: -1, date: -1 })
            .limit(fetchLimit)
            .lean()
        : Promise.resolve([]),

      filterType === "all" || filterType === "income"
        ? Income.find()
            .sort({ createdAt: -1, date: -1 })
            .limit(fetchLimit)
            .lean()
        : Promise.resolve([]),

      filterType === "all" || filterType === "habit"
        ? Habit.find()
            .sort({ createdAt: -1 })
            .limit(fetchLimit)
            .lean()
        : Promise.resolve([]),

      filterType === "all" || filterType === "goal"
        ? SavingsGoal.find()
            .sort({ createdAt: -1 })
            .limit(fetchLimit)
            .lean()
        : Promise.resolve([])
    ]);

    // Collect all referenced user IDs across documents
    const referencedUserIds = new Set();
    const extractUserId = (item) => {
      const candidate = item.user || item.userId;
      if (candidate) {
        const idString = candidate._id ? candidate._id.toString() : candidate.toString();
        if (mongoose.isValidObjectId(idString)) {
          referencedUserIds.add(idString);
          return idString;
        }
      }
      return null;
    };

    expensesRaw.forEach(extractUserId);
    incomesRaw.forEach(extractUserId);
    habitsRaw.forEach(extractUserId);
    goalsRaw.forEach(extractUserId);

    // Fetch user map in one single query
    const userMap = new Map();
    if (referencedUserIds.size > 0) {
      const usersFound = await User.find({ _id: { $in: Array.from(referencedUserIds) } })
        .select("name email")
        .lean();

      usersFound.forEach((u) => {
        userMap.set(u._id.toString(), { name: u.name, email: u.email });
      });
    }

    const getUserMeta = (item) => {
      const uid = extractUserId(item);
      if (uid && userMap.has(uid)) {
        return userMap.get(uid);
      }
      return { name: "User", email: "—" };
    };

    const activities = [];

    // 1. Registrations
    usersRaw.forEach((u) => {
      activities.push({
        id: u._id.toString(),
        type: "registration",
        action: "Registered a new account",
        userName: u.name || "User",
        userEmail: u.email || "—",
        timestamp: u.createdAt || new Date(),
        details: "Joined FinHabit"
      });
    });

    // 2. Expenses
    expensesRaw.forEach((e) => {
      const meta = getUserMeta(e);
      activities.push({
        id: e._id.toString(),
        type: "expense",
        action: "Logged an expense",
        userName: meta.name,
        userEmail: meta.email,
        timestamp: e.createdAt || e.date || new Date(),
        details: `${e.title || e.category || "Expense"}: ₹${Number(e.amount || 0).toLocaleString("en-IN")}`
      });
    });

    // 3. Incomes
    incomesRaw.forEach((i) => {
      const meta = getUserMeta(i);
      activities.push({
        id: i._id.toString(),
        type: "income",
        action: "Added income",
        userName: meta.name,
        userEmail: meta.email,
        timestamp: i.createdAt || i.date || new Date(),
        details: `${i.source || i.title || "Income"}: ₹${Number(i.amount || 0).toLocaleString("en-IN")}`
      });
    });

    // 4. Habits
    habitsRaw.forEach((h) => {
      const meta = getUserMeta(h);
      activities.push({
        id: h._id.toString(),
        type: "habit",
        action: "Created a financial habit",
        userName: meta.name,
        userEmail: meta.email,
        timestamp: h.createdAt || new Date(),
        details: h.title || h.name || "Habit"
      });
    });

    // 5. Savings Goals
    goalsRaw.forEach((g) => {
      const meta = getUserMeta(g);
      activities.push({
        id: g._id.toString(),
        type: "goal",
        action: "Set a savings goal",
        userName: meta.name,
        userEmail: meta.email,
        timestamp: g.createdAt || new Date(),
        details: `${g.title || g.goalName || "Savings Goal"}: Target ₹${Number(g.targetAmount || 0).toLocaleString("en-IN")}`
      });
    });

    // Sort descending by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const totalActivities = activities.length;
    const startIndex = (page - 1) * limit;
    const paginated = activities.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      activities: paginated,
      pagination: {
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(totalActivities / limit)),
        totalActivities,
        limit
      }
    });
  } catch (error) {
    console.error("ADMIN ACTIVITIES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve platform activities."
    });
  }
};

module.exports = {
  getAdminDashboard,
  getUsers,
  getUserDetails,
  updateUserStatus,
  getAdminActivities
};