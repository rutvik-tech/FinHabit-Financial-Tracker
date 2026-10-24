import { useEffect, useState } from "react";
import {
  getBudgets,
  addBudget,
  updateBudget,
  deleteBudget
} from "../services/api";
import "../styles/budgets.css";

const CATEGORY_OPTIONS = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Other"
];

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    category: "Food",
    monthlyLimit: ""
  });

  // Edit State
  const [editingBudget, setEditingBudget] = useState(null);
  const [editLimit, setEditLimit] = useState("");
  const [updating, setUpdating] = useState(false);

  // Delete State
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getBudgets();
      setBudgets(res.budgets || []);
    } catch (err) {
      setError(err.message || "Failed to load budgets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const limit = Number(formData.monthlyLimit);
    if (!formData.monthlyLimit || isNaN(limit) || limit <= 0) {
      setError("Please enter a valid monthly limit greater than 0.");
      return;
    }

    try {
      await addBudget({
        category: formData.category,
        monthlyLimit: limit
      });

      setSuccessMessage(`Budget for "${formData.category}" created successfully.`);
      setFormData({
        category: "Food",
        monthlyLimit: ""
      });
      setShowForm(false);
      await loadBudgets();
    } catch (err) {
      setError(err.message || "Failed to create budget.");
    }
  };

  // Edit Handlers
  const handleEditClick = (budget) => {
    setError("");
    setSuccessMessage("");
    setEditingBudget(budget);
    setEditLimit(budget.monthlyLimit);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingBudget || updating) return;

    setError("");
    const limit = Number(editLimit);
    if (!editLimit || isNaN(limit) || limit <= 0) {
      setError("Please enter a valid monthly limit greater than 0.");
      return;
    }

    try {
      setUpdating(true);
      await updateBudget(editingBudget._id, { monthlyLimit: limit });
      setSuccessMessage(`Budget for "${editingBudget.category}" updated.`);
      setEditingBudget(null);
      await loadBudgets();
    } catch (err) {
      setError(err.message || "Failed to update budget.");
    } finally {
      setUpdating(false);
    }
  };

  // Delete Handlers
  const handleDeleteRequest = (budget) => {
    setError("");
    setSuccessMessage("");
    setBudgetToDelete(budget);
  };

  const handleDeleteConfirm = async () => {
    if (!budgetToDelete || deleting) return;

    try {
      setDeleting(true);
      setError("");
      await deleteBudget(budgetToDelete._id);
      setSuccessMessage(`Budget for "${budgetToDelete.category}" removed.`);
      setBudgetToDelete(null);
      await loadBudgets();
    } catch (err) {
      setError(err.message || "Failed to delete budget.");
    } finally {
      setDeleting(false);
    }
  };

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  // Aggregate stats
  const totalBudget = budgets.reduce((acc, b) => acc + Number(b.monthlyLimit || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + Number(b.spent || 0), 0);
  const remainingBudget = totalBudget - totalSpent;
  const exceededCount = budgets.filter((b) => b.isExceeded).length;

  return (
    <div className="budgets-page">
      <div className="budgets-header">
        <div>
          <span className="budgets-eyebrow">SPENDING CONTROLS</span>
          <h1>Monthly Budgets</h1>
          <p>Set spending targets by category and prevent overspending.</p>
        </div>

        <button
          type="button"
          className="budget-add-button"
          onClick={() => {
            setShowForm((prev) => !prev);
            setError("");
          }}
        >
          {showForm ? "Close Form" : "+ Set Category Budget"}
        </button>
      </div>

      {error && (
        <div className="budget-alert budget-alert-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="budget-alert-close"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="budget-alert budget-alert-success" role="status">
          <span>{successMessage}</span>
          <button
            type="button"
            className="budget-alert-close"
            onClick={() => setSuccessMessage("")}
          >
            ×
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="budget-overview">
        <div className="budget-overview-card">
          <span>Total Monthly Budget</span>
          <strong>{formatAmount(totalBudget)}</strong>
        </div>

        <div className="budget-overview-card">
          <span>Total Spent This Month</span>
          <strong>{formatAmount(totalSpent)}</strong>
        </div>

        <div className="budget-overview-card">
          <span>Remaining Balance</span>
          <strong
            style={{
              color: remainingBudget < 0 ? "#dc2626" : "#0f172a"
            }}
          >
            {formatAmount(remainingBudget)}
          </strong>
        </div>

        <div className="budget-overview-card">
          <span>Exceeded Categories</span>
          <strong style={{ color: exceededCount > 0 ? "#dc2626" : "#16a34a" }}>
            {exceededCount}
          </strong>
        </div>
      </div>

      {/* Add Budget Form Card */}
      {showForm && (
        <section className="budget-form-card">
          <div className="budget-form-header">
            <span className="panel-label">NEW BUDGET</span>
            <h2>Set a Category Spending Limit</h2>
          </div>

          <form onSubmit={handleCreateSubmit}>
            <div className="budget-form-grid">
              <div className="budget-form-group">
                <label htmlFor="category">Expense Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="budget-form-group">
                <label htmlFor="monthlyLimit">Monthly Spending Limit (₹)</label>
                <input
                  id="monthlyLimit"
                  name="monthlyLimit"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="e.g. 10000"
                  value={formData.monthlyLimit}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="budget-form-actions">
              <button
                type="button"
                className="budget-cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button type="submit" className="budget-save-button">
                Save Budget
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Budgets Grid */}
      <section className="budgets-list-section">
        <div className="budgets-list-header">
          <span className="panel-label">CURRENT MONTH SPENDING</span>
          <h2>Active Category Budgets</h2>
        </div>

        {loading ? (
          <div className="budgets-empty-state">Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div className="budgets-empty-state">
            <div className="empty-budget-icon">₹</div>
            <h3>No budgets set</h3>
            <p>
              Create spending limits for your frequent expenses to keep your finances on track.
            </p>
            <button
              type="button"
              className="budget-add-button"
              onClick={() => setShowForm(true)}
            >
              + Set Your First Budget
            </button>
          </div>
        ) : (
          <div className="budgets-grid">
            {budgets.map((b) => {
              const isWarning = b.percentage >= 80 && !b.isExceeded;
              const cardClass = b.isExceeded
                ? "exceeded"
                : isWarning
                ? "warning"
                : "";

              const barClass = b.isExceeded
                ? "danger"
                : isWarning
                ? "warning"
                : "";

              return (
                <div className={`budget-card ${cardClass}`} key={b._id}>
                  <div className="budget-card-top">
                    <div className="budget-icon">
                      {b.isExceeded ? "!" : b.category.charAt(0).toUpperCase()}
                    </div>

                    <div className="budget-card-actions">
                      <button
                        type="button"
                        className="budget-edit-button"
                        onClick={() => handleEditClick(b)}
                        title="Edit limit"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        Edit
                      </button>

                      <button
                        type="button"
                        className="budget-delete-button"
                        onClick={() => handleDeleteRequest(b)}
                        title="Delete budget"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <h3>{b.category}</h3>

                  <div className="budget-amounts">
                    <div>
                      <span>Spent This Month</span>
                      <strong>{formatAmount(b.spent)}</strong>
                    </div>

                    <div>
                      <span>Monthly Limit</span>
                      <strong>{formatAmount(b.monthlyLimit)}</strong>
                    </div>
                  </div>

                  <div className="budget-progress-section">
                    <div className="budget-progress-header">
                      <span>Budget Used</span>
                      <strong
                        style={{
                          color: b.isExceeded
                            ? "#dc2626"
                            : isWarning
                            ? "#d97706"
                            : "#2563eb"
                        }}
                      >
                        {b.percentage}%
                      </strong>
                    </div>

                    <div className="budget-progress-bar">
                      <div
                        className={`budget-progress-fill ${barClass}`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                  </div>

                  {b.isExceeded ? (
                    <span className="budget-status-tag danger">
                      Exceeded by {formatAmount(Math.abs(b.remaining))}
                    </span>
                  ) : isWarning ? (
                    <span className="budget-status-tag warning">
                      Nearing limit: {formatAmount(b.remaining)} left
                    </span>
                  ) : (
                    <span className="budget-status-tag safe">
                      {formatAmount(b.remaining)} remaining
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit Budget Modal */}
      {editingBudget && (
        <div
          className="budget-modal-overlay"
          onClick={() => setEditingBudget(null)}
        >
          <div className="budget-modal" onClick={(e) => e.stopPropagation()}>
            <div className="budget-modal-header">
              <span className="panel-label">UPDATE LIMIT</span>
              <h2>Edit Budget for {editingBudget.category}</h2>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="budget-form-group">
                <label htmlFor="editLimit">Monthly Spending Limit (₹)</label>
                <input
                  id="editLimit"
                  type="number"
                  min="1"
                  step="0.01"
                  value={editLimit}
                  onChange={(e) => setEditLimit(e.target.value)}
                  disabled={updating}
                  required
                />
              </div>

              <div className="budget-modal-actions">
                <button
                  type="button"
                  className="budget-cancel-button"
                  onClick={() => setEditingBudget(null)}
                  disabled={updating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="budget-save-button"
                  disabled={updating}
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {budgetToDelete && (
        <div
          className="budget-modal-overlay"
          onClick={() => setBudgetToDelete(null)}
        >
          <div
            className="budget-modal budget-delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="budget-delete-icon">!</div>

            <div className="budget-delete-content">
              <h2>Remove Budget?</h2>
              <p>
                Are you sure you want to remove the spending limit for{" "}
                {budgetToDelete.category}? Your expenses will remain intact.
              </p>
              <strong>Limit: {formatAmount(budgetToDelete.monthlyLimit)}</strong>
            </div>

            <div
              className="budget-modal-actions"
              style={{ justifyContent: "center" }}
            >
              <button
                type="button"
                className="budget-cancel-button"
                onClick={() => setBudgetToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="budget-delete-confirm-btn"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Remove Budget"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budgets;