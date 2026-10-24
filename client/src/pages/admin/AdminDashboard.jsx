import { useCallback, useEffect, useState } from "react";
import { getAdminDashboard } from "../../services/adminApi";
import "./AdminDashboard.css";

const STAT_CARDS = [
  {
    key: "totalUsers",
    label: "Total Users",
    description: "Registered accounts",
    icon: "U"
  },
  {
    key: "activeUsers",
    label: "Active Users",
    description: "Accounts currently active",
    icon: "A"
  },
  {
    key: "inactiveUsers",
    label: "Inactive Users",
    description: "Deactivated accounts",
    icon: "I"
  }
];

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(parsedDate);
}

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminDashboard();
      const data = response.data || response;

      if (data.success === false) {
        throw new Error(
          data.message || "Unable to load administrator statistics."
        );
      }

      setDashboard(data);
    } catch (err) {
      setError(
        err.message || "Unable to load the administrator dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          Loading administrator dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <p>{error}</p>

          <button type="button" onClick={loadDashboard}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statistics = dashboard?.statistics || {};
  const recentUsers = dashboard?.recentUsers || [];

  const records = [
    ["Income Records", statistics.totalIncome],
    ["Expense Records", statistics.totalExpenses],
    ["Habit Records", statistics.totalHabits],
    ["Savings Goals", statistics.totalGoals],
    ["Wealth Snapshots", statistics.totalWealthSnapshots]
  ];

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">ADMINISTRATION</span>
          <h1>Admin Dashboard</h1>
          <p>Monitor registered users and activity across FinHabit.</p>
        </div>

        <button
          className="admin-refresh-button"
          type="button"
          onClick={loadDashboard}
        >
          Refresh Data
        </button>
      </header>

      <section className="admin-stats-grid">
        {STAT_CARDS.map((card) => (
          <article className="admin-stat-card" key={card.key}>
            <div className="admin-stat-top">
              <span className="admin-stat-icon">{card.icon}</span>
              <span className="admin-stat-label">{card.label}</span>
            </div>

            <strong className="admin-stat-number">
              {Number(statistics[card.key] ?? 0).toLocaleString("en-IN")}
            </strong>

            <span className="admin-stat-description">
              {card.description}
            </span>
          </article>
        ))}
      </section>

      <section className="admin-records-section">
        <div className="admin-section-heading">
          <div>
            <h2>Platform Records</h2>
            <p>Records currently stored across the application.</p>
          </div>
        </div>

        <div className="admin-records-grid">
          {records.map(([label, value]) => (
            <article className="admin-record-card" key={label}>
              <span>{label}</span>

              <strong>
                {Number(value ?? 0).toLocaleString("en-IN")}
              </strong>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-recent-section">
        <div className="admin-section-heading">
          <div>
            <h2>Recently Registered Users</h2>
            <p>The latest accounts registered on the platform.</p>
          </div>
        </div>

        {recentUsers.length === 0 ? (
          <div className="admin-empty-state">
            No registered users to display.
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>

              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user._id || user.id}>
                    <td>
                      <div className="admin-user-cell">
                        <span className="admin-user-avatar">
                          {(user.name || "U").charAt(0).toUpperCase()}
                        </span>

                        <strong>{user.name || "Unnamed User"}</strong>
                      </div>
                    </td>

                    <td>{user.email}</td>

                    <td>
                      <span className="admin-role-badge">
                        {user.role || "user"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-status-badge ${
                          user.isActive === false ? "inactive" : "active"
                        }`}
                      >
                        {user.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>

                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;