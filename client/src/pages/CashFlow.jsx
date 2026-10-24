import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { getCashFlowAnalytics } from "../services/api";
import "../styles/cashflow.css";

function CashFlow() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dynamically generate years from account registration up to current year
  const yearsList = useMemo(() => {
    let startYear = currentYear - 4;

    if (user?.createdAt) {
      const registeredYear = new Date(user.createdAt).getFullYear();
      if (!isNaN(registeredYear) && registeredYear <= currentYear) {
        startYear = registeredYear;
      }
    }

    const years = [];
    for (let y = startYear; y <= currentYear; y++) {
      years.push(y);
    }

    return years;
  }, [user, currentYear]);

  const loadData = async (year) => {
    try {
      setLoading(true);
      setError("");
      const res = await getCashFlowAnalytics(year);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load cash flow analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedYear);
  }, [selectedYear]);

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  return (
    <div className="cashflow-page">
      <div className="cashflow-header">
        <div>
          <span className="cashflow-eyebrow">ANNUAL PERFORMANCE</span>
          <h1>Cash Flow Analytics</h1>
          <p>Analyze money coming in versus money going out month-by-month.</p>
        </div>

        <div className="cashflow-year-selector">
          <label htmlFor="yearSelect">Year:</label>
          <select
            id="yearSelect"
            className="cashflow-year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {yearsList.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div
          className="cashflow-alert"
          style={{
            background: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
            padding: "12px 18px",
            borderRadius: "10px",
            marginBottom: "24px"
          }}
        >
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="cashflow-loading">Analyzing cash flow records...</div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="cashflow-summary-grid">
            <div className="cashflow-summary-card">
              <span>Total Inflow ({data.year})</span>
              <strong style={{ color: "#16a34a" }}>
                {formatCurrency(data.summary.totalIncome)}
              </strong>
              <small>
                Peak: {data.summary.highestIncomeMonth.month} (
                {formatCurrency(data.summary.highestIncomeMonth.amount)})
              </small>
            </div>

            <div className="cashflow-summary-card">
              <span>Total Outflow ({data.year})</span>
              <strong style={{ color: "#0f172a" }}>
                {formatCurrency(data.summary.totalExpenses)}
              </strong>
              <small>
                Peak: {data.summary.highestExpenseMonth.month} (
                {formatCurrency(data.summary.highestExpenseMonth.amount)})
              </small>
            </div>

            <div className="cashflow-summary-card">
              <span>Net Annual Savings</span>
              <strong
                style={{
                  color: data.summary.netSavings >= 0 ? "#16a34a" : "#dc2626"
                }}
              >
                {data.summary.netSavings >= 0 ? "+" : ""}
                {formatCurrency(data.summary.netSavings)}
              </strong>
              <small>Retained cash surplus</small>
            </div>

            <div className="cashflow-summary-card">
              <span>Annual Savings Rate</span>
              <strong style={{ color: "#2563eb" }}>
                {data.summary.savingsRate}%
              </strong>
              <small>Target benchmark: 20% or more</small>
            </div>
          </div>

          {/* Grouped Bar Chart */}
          <section className="cashflow-chart-card">
            <div className="cashflow-chart-header">
              <span className="panel-label">VISUAL COMPARISON</span>
              <h2>Monthly Inflow vs Outflow</h2>
            </div>

            <div className="cashflow-chart-container">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={data.monthlyBreakdown}
                  margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis
                    stroke="#64748b"
                    tickFormatter={(val) =>
                      `₹${Number(val).toLocaleString("en-IN")}`
                    }
                  />
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)"
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "12px" }} />
                  <Bar
                    dataKey="income"
                    name="Income (+)"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses (−)"
                    fill="#94a3b8"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Detailed Ledger Breakdown */}
          <section className="cashflow-table-card">
            <div className="cashflow-table-header">
              <span className="panel-label">MONTHLY LEDGER</span>
              <h2>Detailed Breakdown ({data.year})</h2>
            </div>

            <div className="cashflow-table-wrapper">
              <table className="cashflow-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Income</th>
                    <th>Expenses</th>
                    <th>Net Balance</th>
                    <th>Savings Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthlyBreakdown.map((row) => (
                    <tr key={row.month}>
                      <td>
                        <strong>{row.month}</strong>
                      </td>
                      <td style={{ color: "#16a34a" }}>
                        +{formatCurrency(row.income)}
                      </td>
                      <td style={{ color: "#0f172a" }}>
                        −{formatCurrency(row.expenses)}
                      </td>
                      <td
                        className={
                          row.netSavings >= 0
                            ? "cashflow-positive"
                            : "cashflow-negative"
                        }
                      >
                        {row.netSavings >= 0 ? "+" : ""}
                        {formatCurrency(row.netSavings)}
                      </td>
                      <td>
                        <span
                          className={`cashflow-rate-badge ${
                            row.savingsRate >= 20
                              ? "cashflow-rate-good"
                              : "cashflow-rate-low"
                          }`}
                        >
                          {row.savingsRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

export default CashFlow;