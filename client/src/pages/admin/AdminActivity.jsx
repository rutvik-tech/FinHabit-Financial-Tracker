import { useCallback, useEffect, useState } from "react";
import { getAdminActivities } from "../../services/adminApi";
import "./AdminActivity.css";

const FILTER_TABS = [
  { key: "all", label: "All Activities" },
  { key: "registration", label: "Registrations" },
  { key: "expense", label: "Expenses" },
  { key: "income", label: "Incomes" },
  { key: "habit", label: "Habits" },
  { key: "goal", label: "Savings Goals" }
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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(parsedDate);
}

function getActivityBadgeClass(type) {
  switch (type) {
    case "registration":
      return "badge-registration";
    case "income":
      return "badge-income";
    case "expense":
      return "badge-expense";
    case "habit":
      return "badge-habit";
    case "goal":
      return "badge-goal";
    default:
      return "badge-default";
  }
}

function AdminActivity() {
  const [activities, setActivities] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalActivities: 0,
    limit: 15
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminActivities(filterType, page, 15);

      setActivities(response.activities || []);
      setPagination(
        response.pagination || {
          currentPage: page,
          totalPages: 1,
          totalActivities: 0,
          limit: 15
        }
      );
    } catch (err) {
      setError(err.message || "Unable to load activity logs.");
    } finally {
      setLoading(false);
    }
  }, [filterType, page]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleFilterChange = (type) => {
    setFilterType(type);
    setPage(1);
  };

  return (
    <div className="admin-activity-page">
      <header className="admin-activity-header">
        <div>
          <span className="admin-activity-eyebrow">ADMINISTRATION</span>
          <h1>Activity Monitoring</h1>
          <p>Real-time audit log of user actions and transactions across FinHabit.</p>
        </div>

        <button
          className="admin-activity-refresh"
          type="button"
          onClick={loadActivities}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Feed"}
        </button>
      </header>

      <section className="admin-activity-tabs">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-activity-tab ${filterType === tab.key ? "active" : ""}`}
            onClick={() => handleFilterChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {error && (
        <div className="admin-activity-error" role="alert">
          {error}
        </div>
      )}

      <section className="admin-activity-content">
        {loading ? (
          <div className="admin-activity-state">Loading activity records...</div>
        ) : activities.length === 0 ? (
          <div className="admin-activity-state">No activities recorded under this category.</div>
        ) : (
          <div className="admin-activity-list">
            {activities.map((item) => (
              <article key={`${item.type}-${item.id}`} className="admin-activity-item">
                <div className="admin-activity-item-left">
                  <span className={`admin-activity-badge ${getActivityBadgeClass(item.type)}`}>
                    {item.type.toUpperCase()}
                  </span>
                  <div>
                    <strong>{item.action}</strong>
                    <p className="admin-activity-details">{item.details}</p>
                    <span className="admin-activity-user">
                      By {item.userName} ({item.userEmail})
                    </span>
                  </div>
                </div>

                <time className="admin-activity-time">
                  {formatDate(item.timestamp)}
                </time>
              </article>
            ))}
          </div>
        )}

        <div className="admin-activity-pagination">
          <span>
            Page {pagination.currentPage || 1} of {Math.max(1, pagination.totalPages || 1)}
          </span>

          <div>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={loading || page <= 1}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={loading || page >= Math.max(1, pagination.totalPages || 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminActivity;