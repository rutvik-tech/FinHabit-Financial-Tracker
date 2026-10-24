const Income = require("../models/Income");
const Expense = require("../models/Expense");

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const getCashFlowAnalytics = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const requestedYear = parseInt(req.query.year, 10) || new Date().getFullYear();

    const startOfYear = new Date(requestedYear, 0, 1);
    const endOfYear = new Date(requestedYear, 11, 31, 23, 59, 59, 999);

    // Fetch incomes and expenses for the selected year
    const [incomes, expenses] = await Promise.all([
      Income.find({
        user: userId,
        date: { $gte: startOfYear, $lte: endOfYear }
      }),
      Expense.find({
        user: userId,
        date: { $gte: startOfYear, $lte: endOfYear }
      })
    ]);

    // Initialize monthly slots (0 to 11)
    const monthlyData = MONTH_NAMES.map((name, index) => ({
      monthIndex: index,
      month: name,
      income: 0,
      expenses: 0,
      netSavings: 0,
      savingsRate: 0
    }));

    incomes.forEach((item) => {
      const m = new Date(item.date).getMonth();
      if (m >= 0 && m < 12) {
        monthlyData[m].income += Number(item.amount || 0);
      }
    });

    expenses.forEach((item) => {
      const m = new Date(item.date).getMonth();
      if (m >= 0 && m < 12) {
        monthlyData[m].expenses += Number(item.amount || 0);
      }
    });

    // Compute net and savings rates
    let totalAnnualIncome = 0;
    let totalAnnualExpenses = 0;

    monthlyData.forEach((m) => {
      m.netSavings = m.income - m.expenses;
      m.savingsRate =
        m.income > 0
          ? Math.max(0, Math.round(((m.income - m.expenses) / m.income) * 100))
          : 0;

      totalAnnualIncome += m.income;
      totalAnnualExpenses += m.expenses;
    });

    const netAnnualSavings = totalAnnualIncome - totalAnnualExpenses;
    const annualSavingsRate =
      totalAnnualIncome > 0
        ? Math.max(0, Math.round((netAnnualSavings / totalAnnualIncome) * 100))
        : 0;

    // Determine highest earning and spending months
    let highestIncome = { month: "—", amount: 0 };
    let highestExpense = { month: "—", amount: 0 };

    monthlyData.forEach((m) => {
      if (m.income > highestIncome.amount) {
        highestIncome = { month: m.month, amount: m.income };
      }
      if (m.expenses > highestExpense.amount) {
        highestExpense = { month: m.month, amount: m.expenses };
      }
    });

    res.status(200).json({
      success: true,
      year: requestedYear,
      summary: {
        totalIncome: totalAnnualIncome,
        totalExpenses: totalAnnualExpenses,
        netSavings: netAnnualSavings,
        savingsRate: annualSavingsRate,
        highestIncomeMonth: highestIncome,
        highestExpenseMonth: highestExpense
      },
      monthlyBreakdown: monthlyData
    });
  } catch (error) {
    console.error("GET CASH FLOW ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate cash flow analytics."
    });
  }
};

module.exports = {
  getCashFlowAnalytics
};