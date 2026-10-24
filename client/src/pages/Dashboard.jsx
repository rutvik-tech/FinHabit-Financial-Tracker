import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useAuth } from "../context/AuthContext";
import {
  getIncome,
  getExpenses,
  getHabits,
  getGoals,
  getWealthSnapshots
} from "../services/api";

function formatDate(date) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(parsed);
}

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function Dashboard() {
  const { user } = useAuth();

  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [wealthSnapshots, setWealthSnapshots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        incomeResponse,
        expenseResponse,
        habitResponse,
        goalResponse,
        wealthResponse
      ] = await Promise.all([
        getIncome(),
        getExpenses(),
        getHabits(),
        getGoals(),
        getWealthSnapshots()
      ]);

      const extractArray = (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.income)) return response.income;
        if (Array.isArray(response?.expenses)) return response.expenses;
        if (Array.isArray(response?.habits)) return response.habits;
        if (Array.isArray(response?.goals)) return response.goals;
        if (Array.isArray(response?.snapshots)) return response.snapshots;
        return [];
      };

      setIncome(extractArray(incomeResponse));
      setExpenses(extractArray(expenseResponse));
      setHabits(extractArray(habitResponse));
      setGoals(extractArray(goalResponse));
      setWealthSnapshots(extractArray(wealthResponse));
    } catch (err) {
      console.error("DASHBOARD DATA ERROR:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getAmount = (item) => {
    return Number(item?.amount ?? item?.value ?? item?.total ?? 0);
  };

  // Calculations
  const totalIncome = useMemo(() => {
    return income.reduce((total, item) => total + getAmount(item), 0);
  }, [income]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((total, item) => total + getAmount(item), 0);
  }, [expenses]);

  const totalSavings = totalIncome - totalExpenses;

  const savingsRate = useMemo(() => {
    if (totalIncome <= 0) return 0;
    const rate = Math.round((totalSavings / totalIncome) * 100);
    return Math.max(0, rate);
  }, [totalIncome, totalSavings]);

  const latestWealth = useMemo(() => {
    if (!wealthSnapshots.length) return null;
    return [...wealthSnapshots].sort(
      (a, b) => new Date(a.snapshotDate) - new Date(b.snapshotDate)
    )[wealthSnapshots.length - 1];
  }, [wealthSnapshots]);

  const netWorth = latestWealth?.netWorth ?? totalSavings;

  const wealthData = useMemo(() => {
    return [...wealthSnapshots]
      .sort((a, b) => new Date(a.snapshotDate) - new Date(b.snapshotDate))
      .map((snapshot) => ({
        month: new Date(snapshot.snapshotDate).toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit"
        }),
        netWorth: Number(snapshot.netWorth || 0)
      }));
  }, [wealthSnapshots]);

  const completedHabits = habits.filter((habit) => {
    if (!habit.completedDates?.length) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return habit.completedDates.some((date) => {
      const completedDate = new Date(date);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });
  }).length;

  const activeGoals = goals.filter((goal) => goal.isActive !== false);

  const getGoalProgress = (goal) => {
    if (!goal.targetAmount) return 0;
    return Math.min(
      100,
      Math.round(
        (Number(goal.currentAmount || 0) / Number(goal.targetAmount)) * 100
      )
    );
  };

  // Combined Recent Transactions
  const recentTransactions = useMemo(() => {
    const incList = income.map((item) => ({
      id: item._id,
      type: "income",
      title: item.source || "Income",
      subtitle: item.note || "Income added",
      amount: getAmount(item),
      date: item.date || item.createdAt
    }));

    const expList = expenses.map((item) => ({
      id: item._id,
      type: "expense",
      title: item.category || "Expense",
      subtitle: item.description || "Expense logged",
      amount: getAmount(item),
      date: item.date || item.createdAt
    }));

    return [...incList, ...expList]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [income, expenses]);

  return (
    <div className="dashboard-content">
      <div className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">FINANCIAL OVERVIEW</span>
          <h1>Welcome back, {user?.name || "User"}</h1>
          <p>Keep track of your financial progress and build better money habits.</p>
        </div>
        <button
          type="button"
          className="admin-users-refresh"
          onClick={loadDashboardData}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Overview"}
        </button>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {/* Primary Financial Metric Cards */}
      <div className="dashboard-summary-grid">
        <div className="dashboard-summary-card">
          <div className="summary-card-icon income">↑</div>
          <div>
            <span>Total Income</span>
            <strong>{loading ? "Loading..." : formatCurrency(totalIncome)}</strong>
          </div>
        </div>

        <div className="dashboard-summary-card">
          <div className="summary-card-icon expense">↓</div>
          <div>
            <span>Total Expenses</span>
            <strong>{loading ? "Loading..." : formatCurrency(totalExpenses)}</strong>
          </div>
        </div>

        <div className="dashboard-summary-card">
          <div className="summary-card-icon savings">₹</div>
          <div>
            <span>Total Savings</span>
            <strong>{loading ? "Loading..." : formatCurrency(totalSavings)}</strong>
          </div>
        </div>

        <div className="dashboard-summary-card">
          <div className="summary-card-icon wealth">%</div>
          <div>
            <span>Savings Rate</span>
            <strong>{loading ? "Loading..." : `${savingsRate}%`}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Today's Habits */}
      <div className="dashboard-main-grid">
        <section className="dashboard-chart-card">
          <div className="dashboard-section-header">
            <div>
              <h2>Net Worth Growth</h2>
              <p>Your recorded wealth over time (Current Net Worth: {formatCurrency(netWorth)})</p>
            </div>
            <Link to="/wealth">View Wealth</Link>
          </div>

          {wealthData.length > 0 ? (
            <div className="dashboard-chart">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={wealthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN")}`
                    }
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="netWorth"
                    name="Net Worth"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <h3>No wealth data yet</h3>
              <p>Add a wealth snapshot to see your net worth growth here.</p>
              <Link to="/wealth">Add Wealth Snapshot</Link>
            </div>
          )}
        </section>

        <section className="dashboard-habits-card">
          <div className="dashboard-section-header">
            <div>
              <h2>Today's Habits</h2>
              <p>{completedHabits} of {habits.length} completed today</p>
            </div>
            <Link to="/habits">View All</Link>
          </div>

          {habits.length === 0 ? (
            <div className="dashboard-empty-small">
              <p>No habits added yet.</p>
              <Link to="/habits">Create Habit</Link>
            </div>
          ) : (
            <div className="dashboard-habit-list">
              {habits.slice(0, 4).map((habit) => {
                const completedToday = habit.completedDates?.some((date) => {
                  const completedDate = new Date(date);
                  const today = new Date();
                  completedDate.setHours(0, 0, 0, 0);
                  today.setHours(0, 0, 0, 0);
                  return completedDate.getTime() === today.getTime();
                });

                return (
                  <div className="dashboard-habit-item" key={habit._id}>
                    <div
                      className={`dashboard-habit-check ${
                        completedToday ? "completed" : ""
                      }`}
                    >
                      {completedToday ? "✓" : ""}
                    </div>
                    <div>
                      <strong>{habit.title || habit.name}</strong>
                      <span>{habit.streak || 0} day streak</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Secondary Grid: Savings Goals & Recent Transactions */}
      <div className="dashboard-secondary-grid">
        <section className="dashboard-goal-card">
          <div className="dashboard-section-header">
            <div>
              <h2>Savings Goals</h2>
              <p>Track your active financial targets</p>
            </div>
            <Link to="/goals">View All</Link>
          </div>

          {activeGoals.length === 0 ? (
            <div className="dashboard-empty-small">
              <p>No savings goals created yet.</p>
              <Link to="/goals">Create Goal</Link>
            </div>
          ) : (
            <div className="dashboard-goal-list">
              {activeGoals.slice(0, 3).map((goal) => {
                const progress = getGoalProgress(goal);

                return (
                  <div className="dashboard-goal-item" key={goal._id}>
                    <div className="dashboard-goal-top">
                      <strong>{goal.title || goal.name}</strong>
                      <span>{progress}%</span>
                    </div>

                    <div className="dashboard-progress">
                      <div style={{ width: `${progress}%` }} />
                    </div>

                    <div className="dashboard-goal-amount">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Transactions List */}
        <section className="dashboard-goal-card">
          <div className="dashboard-section-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest recorded cash inflows and outflows</p>
            </div>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="dashboard-empty-small">
              <p>No transactions recorded yet.</p>
            </div>
          ) : (
            <div className="dashboard-habit-list">
              {recentTransactions.map((tx) => (
                <div className="dashboard-habit-item" key={`${tx.type}-${tx.id}`}>
                  <div
                    className={`summary-card-icon ${
                      tx.type === "income" ? "income" : "expense"
                    }`}
                    style={{ width: "36px", height: "36px", fontSize: "0.85rem" }}
                  >
                    {tx.type === "income" ? "↑" : "↓"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>{tx.title}</strong>
                      <span
                        style={{
                          fontWeight: "700",
                          color: tx.type === "income" ? "#16a34a" : "#dc2626"
                        }}
                      >
                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "0.8rem" }}>
                      <span>{tx.subtitle}</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Quick Actions Card */}
      <section className="dashboard-actions-card">
        <div className="dashboard-section-header">
          <div>
            <h2>Quick Actions</h2>
            <p>Update your financial records</p>
          </div>
        </div>

        <div className="dashboard-quick-actions">
          <Link to="/income">
            <span>+</span>
            Add Income
          </Link>
          <Link to="/expenses">
            <span>−</span>
            Add Expense
          </Link>
          <Link to="/habits">
            <span>✓</span>
            Add Habit
          </Link>
          <Link to="/goals">
            <span>◎</span>
            Add Goal
          </Link>
          <Link to="/wealth">
            <span>↗</span>
            Update Wealth
          </Link>
        </div>
      </section>

      {/* Financial Health Insight */}
      <section className="dashboard-insight-card">
        <div className="dashboard-insight-icon">i</div>
        <div>
          <h3>Financial Insight</h3>
          {totalIncome === 0 && totalExpenses === 0 ? (
            <p>
              Start by recording your income and expenses. Your dashboard will calculate your savings and savings rate automatically.
            </p>
          ) : totalSavings > 0 ? (
            <p>
              You currently have <strong>{formatCurrency(totalSavings)}</strong> in savings with a healthy <strong>{savingsRate}%</strong> savings rate.
            </p>
          ) : (
            <p>
              Your expenses match or exceed your income. Consider reviewing non-essential spending to build your monthly savings buffer.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;