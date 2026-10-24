import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  addExpense,
  deleteExpense,
  updateExpense,
  getExpenses
} from "../services/api";
import { exportToCSV } from "../utils/csvExport";
import "../styles/expenses.css";

const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Other"
];

function Expenses() {
  const { user } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Edit State
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    amount: "",
    category: "Food",
    description: "",
    date: ""
  });
  const [updating, setUpdating] = useState(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Notifications
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    amount: "",
    category: "Food",
    description: "",
    date: new Date().toISOString().split("T")[0]
  });

  const userName = user?.name || "User";

  const totalExpenses = useMemo(() => {
    return expenses.reduce(
      (total, expense) => total + Number(expense.amount || 0),
      0
    );
  }, [expenses]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await getExpenses();
      setExpenses(data.expenses || []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    if (!deleteTarget && !editingItem) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (!deleting) setDeleteTarget(null);
        if (!updating) setEditingItem(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteTarget, editingItem, deleting, updating]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const numericAmount = Number(formData.amount);
    if (!formData.amount || isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage("Please enter a valid positive amount.");
      return;
    }

    if (!formData.category) {
      setErrorMessage("Please select a category.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await addExpense({
        amount: numericAmount,
        category: formData.category,
        description: formData.description.trim(),
        date: formData.date
      });

      setExpenses((current) => [data.expense, ...current]);
      setSuccessMessage("Expense recorded successfully.");

      setFormData({
        amount: "",
        category: "Food",
        description: "",
        date: new Date().toISOString().split("T")[0]
      });
    } catch (error) {
      setErrorMessage(error.message || "Failed to add expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (expense) => {
    setErrorMessage("");
    setSuccessMessage("");
    setEditingItem(expense);
    setEditFormData({
      amount: expense.amount,
      category: expense.category || "Food",
      description: expense.description || "",
      date: expense.date
        ? new Date(expense.date).toISOString().split("T")[0]
        : ""
    });
  };

  const handleEditCancel = () => {
    if (!updating) {
      setEditingItem(null);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingItem || updating) return;

    setErrorMessage("");
    const numericAmount = Number(editFormData.amount);
    if (!editFormData.amount || isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage("Please enter a valid positive amount.");
      return;
    }

    try {
      setUpdating(true);
      const res = await updateExpense(editingItem._id, {
        amount: numericAmount,
        category: editFormData.category,
        description: editFormData.description.trim(),
        date: editFormData.date
      });

      setExpenses((current) =>
        current.map((item) =>
          item._id === editingItem._id ? res.expense : item
        )
      );

      setSuccessMessage("Expense updated successfully.");
      setEditingItem(null);
    } catch (error) {
      setErrorMessage(error.message || "Failed to update expense.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = (expense) => {
    setErrorMessage("");
    setSuccessMessage("");
    setDeleteTarget(expense);
  };

  const handleDeleteCancel = () => {
    if (!deleting) {
      setDeleteTarget(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || deleting) return;

    try {
      setDeleting(true);
      setErrorMessage("");

      await deleteExpense(deleteTarget._id);

      setExpenses((current) =>
        current.filter((item) => item._id !== deleteTarget._id)
      );

      setSuccessMessage("Expense entry deleted.");
      setDeleteTarget(null);
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete expense.");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesCategory =
        filterCategory === "All" || item.category === filterCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [expenses, filterCategory, searchQuery]);

  // Export to CSV Handler
  const handleExportCSV = () => {
    try {
      setErrorMessage("");
      const recordsToExport =
        filteredExpenses.length > 0 ? filteredExpenses : expenses;

      if (recordsToExport.length === 0) {
        setErrorMessage("No expense records available to export.");
        return;
      }

      const columns = [
        { key: "date", label: "Date" },
        { key: "category", label: "Category" },
        { key: "description", label: "Description" },
        { key: "amount", label: "Amount (INR)" }
      ];

      exportToCSV(recordsToExport, columns, "FinHabit_Expenses");
      setSuccessMessage("Expense records exported successfully.");
    } catch (err) {
      setErrorMessage(err.message || "Failed to export CSV.");
    }
  };

  return (
    <div className="expenses-page">
      <div className="expenses-main">
        <section className="expenses-header">
          <div>
            <span className="expenses-eyebrow">EXPENSE TRACKER</span>
            <h1>Expenses</h1>
            <p>Track where your money is going, {userName}.</p>
          </div>

          <div className="expenses-total-card">
            <span>Total Expenses</span>
            <strong>₹{totalExpenses.toLocaleString("en-IN")}</strong>
          </div>
        </section>

        {errorMessage && (
          <div className="expenses-alert expenses-alert-error" role="alert">
            <span>{errorMessage}</span>
            <button
              type="button"
              className="expenses-alert-close"
              onClick={() => setErrorMessage("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="expenses-alert expenses-alert-success" role="status">
            <span>{successMessage}</span>
            <button
              type="button"
              className="expenses-alert-close"
              onClick={() => setSuccessMessage("")}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        )}

        <section className="expenses-grid">
          {/* Add Expense Card */}
          <div className="expense-form-card">
            <div className="section-heading">
              <span>NEW EXPENSE</span>
              <h2>Add Expense</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="expense-form-group">
                <label htmlFor="amount">Amount (₹)</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="expense-form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="expense-form-group">
                <label htmlFor="description">Description</label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  placeholder="What was this expense for?"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              <div className="expense-form-group">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />
              </div>

              <button
                type="submit"
                className="expense-submit-button"
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add Expense"}
                {!submitting && <span>→</span>}
              </button>
            </form>
          </div>

          {/* Expense History Card */}
          <div className="expense-list-card">
            <div className="expense-list-heading">
              <div className="section-heading" style={{ marginBottom: 0 }}>
                <span>RECENT ACTIVITY</span>
                <h2>Expense History</h2>
              </div>

              <span className="expense-count">
                {filteredExpenses.length} of {expenses.length}{" "}
                {expenses.length === 1 ? "expense" : "expenses"}
              </span>
            </div>

            <div className="expenses-toolbar">
              <input
                type="search"
                className="expenses-search-input"
                placeholder="Search by category or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search expenses"
              />
              <select
                className="expenses-filter-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                aria-label="Filter expenses by category"
              >
                <option value="All">All Categories</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="expenses-export-btn"
                onClick={handleExportCSV}
                title="Download CSV report"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>
            </div>

            {loading ? (
              <div className="expense-empty">
                <strong>Loading expenses...</strong>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="expense-empty">
                <strong>
                  {expenses.length === 0
                    ? "No expenses yet"
                    : "No matching expense records"}
                </strong>
                <span>
                  {expenses.length === 0
                    ? "Add your first expense to start tracking."
                    : "Try adjusting your search query or category filter."}
                </span>
              </div>
            ) : (
              <div className="expense-list">
                {filteredExpenses.map((expense) => (
                  <div className="expense-item" key={expense._id}>
                    <div className="expense-category-icon">
                      {(expense.category || "E").charAt(0).toUpperCase()}
                    </div>

                    <div className="expense-info">
                      <strong>{expense.category}</strong>
                      <span>{expense.description || "No description"}</span>
                      <small>{formatDate(expense.date)}</small>
                    </div>

                    <div className="expense-item-right">
                      <span className="expense-item-amount">
                        −₹{Number(expense.amount).toLocaleString("en-IN")}
                      </span>

                      <div className="expense-actions">
                        <button
                          type="button"
                          className="expense-edit-button"
                          onClick={() => handleEditClick(expense)}
                          disabled={deleting || updating}
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
                          className="expense-delete-button"
                          onClick={() => handleDeleteClick(expense)}
                          disabled={deleting || updating}
                          aria-label={`Delete ${expense.category} expense`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Edit Expense Modal */}
      {editingItem && (
        <div className="expense-delete-overlay" onClick={handleEditCancel}>
          <div
            className="expense-delete-modal expense-edit-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-expense-title"
          >
            <div className="expense-modal-header">
              <span className="expenses-eyebrow">UPDATE RECORD</span>
              <h2 id="edit-expense-title">Edit Expense</h2>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="expense-form-group">
                <label htmlFor="edit-amount">Amount (₹)</label>
                <input
                  id="edit-amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editFormData.amount}
                  onChange={handleEditChange}
                  disabled={updating}
                  required
                />
              </div>

              <div className="expense-form-group">
                <label htmlFor="edit-category">Category</label>
                <select
                  id="edit-category"
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditChange}
                  disabled={updating}
                  required
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="expense-form-group">
                <label htmlFor="edit-description">Description</label>
                <input
                  id="edit-description"
                  name="description"
                  type="text"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  disabled={updating}
                />
              </div>

              <div className="expense-form-group">
                <label htmlFor="edit-date">Date</label>
                <input
                  id="edit-date"
                  name="date"
                  type="date"
                  value={editFormData.date}
                  onChange={handleEditChange}
                  disabled={updating}
                  required
                />
              </div>

              <div className="expense-delete-actions">
                <button
                  type="button"
                  className="expense-delete-cancel"
                  onClick={handleEditCancel}
                  disabled={updating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="expense-save-button"
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
      {deleteTarget && (
        <div className="expense-delete-overlay" onClick={handleDeleteCancel}>
          <div
            className="expense-delete-modal"
            onClick={(event) => event.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-expense-title"
          >
            <div className="expense-delete-icon">!</div>

            <div className="expense-delete-content">
              <h2 id="delete-expense-title">Delete Expense?</h2>
              <p>
                Are you sure you want to delete this {deleteTarget.category} expense record?
              </p>
              <strong>
                ₹{Number(deleteTarget.amount).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="expense-delete-actions">
              <button
                type="button"
                className="expense-delete-cancel"
                onClick={handleDeleteCancel}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="expense-delete-confirm"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;