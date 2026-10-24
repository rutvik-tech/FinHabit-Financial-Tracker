import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  addIncome,
  getIncome,
  updateIncome,
  deleteIncome
} from "../services/api";
import { exportToCSV } from "../utils/csvExport";
import "../styles/income.css";

const INCOME_SOURCES = [
  "Salary",
  "Freelance",
  "Business",
  "Allowance",
  "Bonus",
  "Interest",
  "Other"
];

function Income() {
  const { user } = useAuth();

  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Edit State
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    amount: "",
    source: "Salary",
    note: "",
    date: ""
  });
  const [updating, setUpdating] = useState(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState("All");

  // Notifications
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    amount: "",
    source: "Salary",
    note: "",
    date: new Date().toISOString().split("T")[0]
  });

  const userName = user?.name || "User";

  const totalIncome = useMemo(() => {
    return income.reduce(
      (total, item) => total + Number(item.amount || 0),
      0
    );
  }, [income]);

  const loadIncome = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await getIncome();
      setIncome(data.income || []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load income.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncome();
  }, []);

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

    if (!formData.source) {
      setErrorMessage("Please select an income source.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await addIncome({
        amount: numericAmount,
        source: formData.source,
        note: formData.note.trim(),
        date: formData.date
      });

      setIncome((current) => [data.income, ...current]);
      setSuccessMessage("Income recorded successfully.");

      setFormData({
        amount: "",
        source: "Salary",
        note: "",
        date: new Date().toISOString().split("T")[0]
      });
    } catch (error) {
      setErrorMessage(error.message || "Failed to add income.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (item) => {
    setErrorMessage("");
    setSuccessMessage("");
    setEditingItem(item);
    setEditFormData({
      amount: item.amount,
      source: item.source || "Salary",
      note: item.note || "",
      date: item.date ? new Date(item.date).toISOString().split("T")[0] : ""
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
      const res = await updateIncome(editingItem._id, {
        amount: numericAmount,
        source: editFormData.source,
        note: editFormData.note.trim(),
        date: editFormData.date
      });

      setIncome((current) =>
        current.map((item) =>
          item._id === editingItem._id ? res.income : item
        )
      );

      setSuccessMessage("Income updated successfully.");
      setEditingItem(null);
    } catch (error) {
      setErrorMessage(error.message || "Failed to update income.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = (item) => {
    setErrorMessage("");
    setSuccessMessage("");
    setDeleteTarget(item);
  };

  const handleDeleteCancel = () => {
    if (!deleting) {
      setDeleteTarget(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || deleting) {
      return;
    }

    try {
      setDeleting(true);
      setErrorMessage("");

      await deleteIncome(deleteTarget._id);

      setIncome((current) =>
        current.filter((item) => item._id !== deleteTarget._id)
      );

      setSuccessMessage("Income entry deleted.");
      setDeleteTarget(null);
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete income.");
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

  const filteredIncome = useMemo(() => {
    return income.filter((item) => {
      const matchesSource =
        filterSource === "All" || item.source === filterSource;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.source && item.source.toLowerCase().includes(q)) ||
        (item.note && item.note.toLowerCase().includes(q));

      return matchesSource && matchesSearch;
    });
  }, [income, filterSource, searchQuery]);

  // Export to CSV Handler
  const handleExportCSV = () => {
    try {
      setErrorMessage("");
      const recordsToExport = filteredIncome.length > 0 ? filteredIncome : income;

      if (recordsToExport.length === 0) {
        setErrorMessage("No income records available to export.");
        return;
      }

      const columns = [
        { key: "date", label: "Date" },
        { key: "source", label: "Source" },
        { key: "note", label: "Note" },
        { key: "amount", label: "Amount (INR)" }
      ];

      exportToCSV(recordsToExport, columns, "FinHabit_Income");
      setSuccessMessage("Income records exported successfully.");
    } catch (err) {
      setErrorMessage(err.message || "Failed to export CSV.");
    }
  };

  return (
    <div className="income-page">
      <div className="income-main">
        <section className="income-header">
          <div>
            <span className="income-eyebrow">INCOME TRACKER</span>
            <h1>Income</h1>
            <p>Track the money coming in, {userName}.</p>
          </div>

          <div className="income-total-card">
            <span>Total Income</span>
            <strong>₹{totalIncome.toLocaleString("en-IN")}</strong>
          </div>
        </section>

        {errorMessage && (
          <div className="income-alert income-alert-error" role="alert">
            <span>{errorMessage}</span>
            <button
              type="button"
              className="income-alert-close"
              onClick={() => setErrorMessage("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="income-alert income-alert-success" role="status">
            <span>{successMessage}</span>
            <button
              type="button"
              className="income-alert-close"
              onClick={() => setSuccessMessage("")}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        )}

        <section className="income-grid">
          {/* Add Income Card */}
          <div className="income-form-card">
            <div className="section-heading">
              <span>NEW INCOME</span>
              <h2>Add Income</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="income-form-group">
                <label htmlFor="income-amount">Amount (₹)</label>
                <input
                  id="income-amount"
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

              <div className="income-form-group">
                <label htmlFor="income-source">Source</label>
                <select
                  id="income-source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                >
                  {INCOME_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              <div className="income-form-group">
                <label htmlFor="income-note">Note</label>
                <input
                  id="income-note"
                  name="note"
                  type="text"
                  placeholder="Add a note (e.g. Monthly stipend)"
                  value={formData.note}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              <div className="income-form-group">
                <label htmlFor="income-date">Date</label>
                <input
                  id="income-date"
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
                className="income-submit-button"
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add Income"}
                {!submitting && <span>→</span>}
              </button>
            </form>
          </div>

          {/* Income History Card */}
          <div className="income-list-card">
            <div className="income-list-heading">
              <div className="section-heading" style={{ marginBottom: 0 }}>
                <span>RECENT ACTIVITY</span>
                <h2>Income History</h2>
              </div>

              <span className="income-count">
                {filteredIncome.length} of {income.length}{" "}
                {income.length === 1 ? "entry" : "entries"}
              </span>
            </div>

            <div className="income-toolbar">
              <input
                type="search"
                className="income-search-input"
                placeholder="Search by source or note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search income"
              />
              <select
                className="income-filter-select"
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                aria-label="Filter income by source"
              >
                <option value="All">All Sources</option>
                {INCOME_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="income-export-btn"
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
              <div className="income-empty">
                <strong>Loading income...</strong>
              </div>
            ) : filteredIncome.length === 0 ? (
              <div className="income-empty">
                <strong>
                  {income.length === 0
                    ? "No income yet"
                    : "No matching income records"}
                </strong>
                <span>
                  {income.length === 0
                    ? "Add your first income entry to start tracking."
                    : "Try adjusting your search query or source filter."}
                </span>
              </div>
            ) : (
              <div className="income-list">
                {filteredIncome.map((item) => (
                  <div className="income-item" key={item._id}>
                    <div className="income-source-icon">
                      {(item.source || "S").charAt(0).toUpperCase()}
                    </div>

                    <div className="income-info">
                      <strong>{item.source}</strong>
                      <span>{item.note || "No note"}</span>
                      <small>{formatDate(item.date)}</small>
                    </div>

                    <div className="income-item-right">
                      <span className="income-item-amount">
                        +₹{Number(item.amount).toLocaleString("en-IN")}
                      </span>

                      <div className="income-actions">
                        <button
                          type="button"
                          className="income-edit-button"
                          onClick={() => handleEditClick(item)}
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
                          className="income-delete-button"
                          onClick={() => handleDeleteClick(item)}
                          disabled={deleting || updating}
                          aria-label={`Delete ${item.source} income`}
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

      {/* Edit Income Modal */}
      {editingItem && (
        <div className="income-delete-overlay" onClick={handleEditCancel}>
          <div
            className="income-delete-modal income-edit-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-income-title"
          >
            <div className="income-modal-header">
              <span className="income-eyebrow">UPDATE RECORD</span>
              <h2 id="edit-income-title">Edit Income</h2>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="income-form-group">
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

              <div className="income-form-group">
                <label htmlFor="edit-source">Source</label>
                <select
                  id="edit-source"
                  name="source"
                  value={editFormData.source}
                  onChange={handleEditChange}
                  disabled={updating}
                  required
                >
                  {INCOME_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              <div className="income-form-group">
                <label htmlFor="edit-note">Note</label>
                <input
                  id="edit-note"
                  name="note"
                  type="text"
                  value={editFormData.note}
                  onChange={handleEditChange}
                  disabled={updating}
                />
              </div>

              <div className="income-form-group">
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

              <div className="income-delete-actions">
                <button
                  type="button"
                  className="income-delete-cancel"
                  onClick={handleEditCancel}
                  disabled={updating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="income-save-button"
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
        <div className="income-delete-overlay" onClick={handleDeleteCancel}>
          <div
            className="income-delete-modal"
            onClick={(event) => event.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-income-title"
          >
            <div className="income-delete-icon">!</div>

            <div className="income-delete-content">
              <h2 id="delete-income-title">Delete Income?</h2>
              <p>
                Are you sure you want to delete this {deleteTarget.source} income
                record?
              </p>
              <strong>
                ₹{Number(deleteTarget.amount).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="income-delete-actions">
              <button
                type="button"
                className="income-delete-cancel"
                onClick={handleDeleteCancel}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="income-delete-confirm"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Income"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Income;