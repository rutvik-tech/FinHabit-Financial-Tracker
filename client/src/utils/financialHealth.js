const clamp = (value, min = 0, max = 100) => {
  return Math.min(Math.max(value, min), max);
};

const getCurrentMonthRange = () => {
  const now = new Date();

  return {
    start: new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ),
    end: new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    )
  };
};

const getMonthlyTransactions = (transactions = []) => {
  const { start, end } = getCurrentMonthRange();

  return transactions.filter((transaction) => {
    const rawDate =
      transaction.date ||
      transaction.createdAt;

    if (!rawDate) {
      return false;
    }

    const date = new Date(rawDate);

    return (
      !Number.isNaN(date.getTime()) &&
      date >= start &&
      date < end
    );
  });
};

const calculateSavingsRateScore = (
  income,
  expenses
) => {
  if (income <= 0) {
    return null;
  }

  const savings = income - expenses;
  const savingsRate = (savings / income) * 100;

  if (savingsRate <= 0) {
    return 0;
  }

  if (savingsRate >= 20) {
    return 100;
  }

  return clamp(
    (savingsRate / 20) * 100
  );
};

const calculateExpenseManagementScore = (
  income,
  expenses
) => {
  if (income <= 0) {
    return null;
  }

  const expenseRate =
    (expenses / income) * 100;

  if (expenseRate <= 50) {
    return 100;
  }

  if (expenseRate >= 100) {
    return 0;
  }

  return clamp(
    100 -
      ((expenseRate - 50) / 50) * 100
  );
};

const calculateGoalScore = (goals = []) => {
  const validGoals = goals.filter(
    (goal) =>
      Number(goal.targetAmount) > 0
  );

  if (!validGoals.length) {
    return null;
  }

  const totalProgress = validGoals.reduce(
    (sum, goal) => {
      const target =
        Number(goal.targetAmount) || 0;

      const current =
        Number(goal.currentAmount) || 0;

      const progress =
        (current / target) * 100;

      return sum + clamp(progress);
    },
    0
  );

  return clamp(
    totalProgress / validGoals.length
  );
};

const isCompletedRecently = (
  completedDates = [],
  days
) => {
  const now = new Date();

  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(
    startDate.getDate() - (days - 1)
  );

  return completedDates.some((date) => {
    const completedDate = new Date(date);

    if (Number.isNaN(completedDate.getTime())) {
      return false;
    }

    completedDate.setHours(0, 0, 0, 0);

    return completedDate >= startDate;
  });
};

const calculateHabitScore = (habits = []) => {
  if (!habits.length) {
    return null;
  }

  const completedHabits = habits.filter(
    (habit) => {
      const frequency =
        habit.frequency || "daily";

      if (frequency === "weekly") {
        return isCompletedRecently(
          habit.completedDates,
          7
        );
      }

      return isCompletedRecently(
        habit.completedDates,
        1
      );
    }
  ).length;

  return clamp(
    (completedHabits / habits.length) * 100
  );
};

const calculateWealthScore = (
  wealthSnapshots = []
) => {
  if (!wealthSnapshots.length) {
    return null;
  }

  const latestSnapshot =
    wealthSnapshots[
      wealthSnapshots.length - 1
    ];

  const assets =
    Number(latestSnapshot.totalAssets) || 0;

  const liabilities =
    Number(latestSnapshot.liabilities) || 0;

  if (assets <= 0) {
    return liabilities <= 0 ? 60 : 0;
  }

  const liabilityRatio =
    (liabilities / assets) * 100;

  if (liabilityRatio <= 20) {
    return 100;
  }

  if (liabilityRatio >= 100) {
    return 0;
  }

  if (liabilityRatio <= 50) {
    return clamp(
      100 -
        ((liabilityRatio - 20) / 30) * 40
    );
  }

  return clamp(
    60 -
      ((liabilityRatio - 50) / 50) * 60
  );
};

const calculateWeightedScore = (components) => {
  const weights = {
    savingsRate: 0.3,
    expenseManagement: 0.2,
    goals: 0.2,
    habits: 0.15,
    wealth: 0.15
  };

  let weightedTotal = 0;
  let availableWeight = 0;

  Object.entries(components).forEach(
    ([key, value]) => {
      if (
        value !== null &&
        value !== undefined
      ) {
        weightedTotal +=
          value * weights[key];

        availableWeight += weights[key];
      }
    }
  );

  if (availableWeight === 0) {
    return null;
  }

  return Math.round(
    weightedTotal / availableWeight
  );
};

export const calculateFinancialHealth = ({
  income = [],
  expenses = [],
  habits = [],
  goals = [],
  wealthSnapshots = []
}) => {
  const monthlyIncome =
    getMonthlyTransactions(income);

  const monthlyExpenses =
    getMonthlyTransactions(expenses);

  const totalIncome =
    monthlyIncome.reduce(
      (sum, transaction) =>
        sum +
        (Number(transaction.amount) || 0),
      0
    );

  const totalExpenses =
    monthlyExpenses.reduce(
      (sum, transaction) =>
        sum +
        (Number(transaction.amount) || 0),
      0
    );

  const savingsRate =
    calculateSavingsRateScore(
      totalIncome,
      totalExpenses
    );

  const expenseManagement =
    calculateExpenseManagementScore(
      totalIncome,
      totalExpenses
    );

  const goalsScore =
    calculateGoalScore(goals);

  const habitsScore =
    calculateHabitScore(habits);

  const wealthScore =
    calculateWealthScore(
      wealthSnapshots
    );

  const score = calculateWeightedScore({
    savingsRate,
    expenseManagement,
    goals: goalsScore,
    habits: habitsScore,
    wealth: wealthScore
  });

  return {
    score,

    components: {
      savingsRate:
        savingsRate === null
          ? null
          : Math.round(savingsRate),

      expenseManagement:
        expenseManagement === null
          ? null
          : Math.round(expenseManagement),

      goals:
        goalsScore === null
          ? null
          : Math.round(goalsScore),

      habits:
        habitsScore === null
          ? null
          : Math.round(habitsScore),

      wealth:
        wealthScore === null
          ? null
          : Math.round(wealthScore)
    },

    monthlyIncome: totalIncome,
    monthlyExpenses: totalExpenses
  };
};

export const getFinancialHealthLabel = (
  score
) => {
  if (score === null || score === undefined) {
    return "Start Tracking";
  }

  if (score >= 80) {
    return "Excellent";
  }

  if (score >= 65) {
    return "Good";
  }

  if (score >= 50) {
    return "Fair";
  }

  return "Needs Attention";
};

export const getFinancialHealthMessage = (
  score
) => {
  if (score === null || score === undefined) {
    return "Add your financial data to calculate your health score.";
  }

  if (score >= 80) {
    return "Your financial habits are looking strong.";
  }

  if (score >= 65) {
    return "Keep building consistent financial habits.";
  }

  if (score >= 50) {
    return "There is room to strengthen your financial habits.";
  }

  return "Focus on improving your savings and spending habits.";
};