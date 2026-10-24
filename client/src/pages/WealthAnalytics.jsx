import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  getWealthSnapshots,
  addWealthSnapshot,
  updateWealthSnapshot,
  deleteWealthSnapshot
} from "../services/api";
import "../styles/wealth.css";

function WealthAnalytics() {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Create Form State
  const todayDateString = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    snapshotDate: todayDateString,
    savings: "",
    investments: "",
    otherAssets: "",
    liabilities: "",
    note: ""
  });

  // Dedicated Edit Modal State
  const [editingSnapshot, setEditingSnapshot] = useState(null);
  const [editFormData, setEditFormData] = useState({
    snapshotDate: todayDateString,
    savings: "",
    investments: "",
    otherAssets: "",
    liabilities: "",
    note: ""
  });

  // Delete Modal State
  const [snapshotToDelete, setSnapshotToDelete] = useState(null);

  const loadSnapshots = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getWealthSnapshots();
      setSnapshots(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load wealth data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSnapshots();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // Create Snapshot
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (formData.snapshotDate > todayDateString) {
      setError("Snapshot date cannot be in the future.");
      return;
    }

    const s = Number(formData.savings) || 0;
    const inv = Number(formData.investments) || 0;
    const oth = Number(formData.otherAssets) || 0;
    const lia = Number(formData.liabilities) || 0;

    if (s < 0 || inv < 0 || oth < 0 || lia < 0) {
      setError("Asset and liability amounts cannot be negative.");
      return;
    }

    try {
      setSaving(true);
      await addWealthSnapshot({
        snapshotDate: formData.snapshotDate,
        savings: s,
        investments: inv,
        otherAssets: oth,
        liabilities: lia,
        note: formData.note ? formData.note.trim() : ""
      });

      setSuccessMessage("Wealth snapshot recorded successfully.");
      setFormData({
        snapshotDate: todayDateString,
        savings: "",
        investments: "",
        otherAssets: "",
        liabilities: "",
        note: ""
      });
      await loadSnapshots();
    } catch (err) {
      setError(err.message || "Failed to save wealth snapshot.");
    } finally {
      setSaving(false);
    }
  };

  // Open Edit Modal
  const handleEdit = (snapshot) => {
    setError("");
    setSuccessMessage("");
    setEditingSnapshot(snapshot);
    setEditFormData({
      snapshotDate: new Date(snapshot.snapshotDate).toISOString().split("T")[0],
      savings: snapshot.savings,
      investments: snapshot.investments,
      otherAssets: snapshot.otherAssets,
      liabilities: snapshot.liabilities,
      note: snapshot.note || ""
    });
  };

  // Submit Edit Modal
  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingSnapshot) return;

    setError("");
    if (editFormData.snapshotDate > todayDateString) {
      setError("Snapshot date cannot be in the future.");
      return;
    }

    const s = Number(editFormData.savings) || 0;
    const inv = Number(editFormData.investments) || 0;
    const oth = Number(editFormData.otherAssets) || 0;
    const lia = Number(editFormData.liabilities) || 0;

    if (s < 0 || inv < 0 || oth < 0 || lia < 0) {
      setError("Asset and liability amounts cannot be negative.");
      return;
    }

    try {
      setSaving(true);
      await updateWealthSnapshot(editingSnapshot._id, {
        snapshotDate: editFormData.snapshotDate,
        savings: s,
        investments: inv,
        otherAssets: oth,
        liabilities: lia,
        note: editFormData.note ? editFormData.note.trim() : ""
      });

      setSuccessMessage("Wealth snapshot updated successfully.");
      setEditingSnapshot(null);
      await loadSnapshots();
    } catch (err) {
      setError(err.message || "Failed to update wealth snapshot.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Handlers
  const handleDeleteRequest = (snapshot) => {
    setError("");
    setSuccessMessage("");
    setSnapshotToDelete(snapshot);
  };

  const handleDeleteConfirm = async () => {
    if (!snapshotToDelete || deleting) return;

    try {
      setDeleting(true);
      setError("");

      await deleteWealthSnapshot(snapshotToDelete._id);
      setSuccessMessage("Wealth snapshot deleted successfully.");
      setSnapshotToDelete(null);
      await loadSnapshots();
    } catch (err) {
      setError(err.message || "Failed to delete snapshot.");
    } finally {
      setDeleting(false);
    }
  };

  const latestSnapshot = useMemo(() => {
    if (!snapshots.length) return null;
    return snapshots[snapshots.length - 1];
  }, [snapshots]);

  const chartData = useMemo(() => {
    return snapshots.map((snapshot) => ({
      date: new Date(snapshot.snapshotDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short"
      }),
      netWorth: snapshot.netWorth
    }));
  }, [snapshots]);

  const totalAssets = latestSnapshot?.totalAssets || 0;
  const netWorth = latestSnapshot?.netWorth || 0;
  const savings = latestSnapshot?.savings || 0;
  const investments = latestSnapshot?.investments || 0;
  const liabilities = latestSnapshot?.liabilities || 0;

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  return (
    <div className="wealth-page">
      <div className="wealth-header">
        <div>
          <span className="wealth-eyebrow">WEALTH MANAGEMENT</span>
          <h1>Wealth Analytics</h1>
          <p>Track your assets, liabilities and net worth over time.</p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="wealth-alert wealth-alert-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="wealth-alert-close"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="wealth-alert wealth-alert-success" role="status">
          <span>{successMessage}</span>
          <button
            type="button"
            className="wealth-alert-close"
            onClick={() => setSuccessMessage("")}
          >
            ×
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="wealth-summary-grid">
        <div className="wealth-summary-card">
          <div className="wealth-card-icon">₹</div>
          <div>
            <span>Total Assets</span>
            <strong>{formatCurrency(totalAssets)}</strong>
          </div>
        </div>

        <div className="wealth-summary-card">
          <div className="wealth-card-icon">↗</div>
          <div>
            <span>Net Worth</span>
            <strong>{formatCurrency(netWorth)}</strong>
          </div>
        </div>

        <div className="wealth-summary-card">
          <div className="wealth-card-icon">S</div>
          <div>
            <span>Savings</span>
            <strong>{formatCurrency(savings)}</strong>
          </div>
        </div>

        <div className="wealth-summary-card">
          <div className="wealth-card-icon">I</div>
          <div>
            <span>Investments</span>
            <strong>{formatCurrency(investments)}</strong>
          </div>
        </div>

        <div className="wealth-summary-card">
          <div className="wealth-card-icon">L</div>
          <div>
            <span>Liabilities</span>
            <strong>{formatCurrency(liabilities)}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Create Form */}
      <div className="wealth-main-grid">
        <section className="wealth-chart-card">
          <div className="wealth-section-header">
            <h2>Net Worth Growth</h2>
            <p>Your recorded net worth progression over time</p>
          </div>

          {chartData.length > 0 ? (
            <div className="wealth-chart">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
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
            <div className="wealth-empty-chart">
              <h3>No wealth history yet</h3>
              <p>Add your first wealth snapshot to start tracking your net worth.</p>
            </div>
          )}
        </section>

        <section className="wealth-form-card">
          <div className="wealth-section-header">
            <span className="panel-label">NEW SNAPSHOT</span>
            <h2>Add Snapshot</h2>
            <p>Record your current financial balance sheet.</p>
          </div>

          <form className="wealth-form" onSubmit={handleSubmit}>
            <div className="wealth-form-group">
              <label>Snapshot Date</label>
              <input
                type="date"
                name="snapshotDate"
                value={formData.snapshotDate}
                max={todayDateString}
                onChange={handleChange}
                required
              />
            </div>

            <div className="wealth-form-row">
              <div className="wealth-form-group">
                <label>Savings (₹)</label>
                <input
                  type="number"
                  name="savings"
                  value={formData.savings}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="wealth-form-group">
                <label>Investments (₹)</label>
                <input
                  type="number"
                  name="investments"
                  value={formData.investments}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="wealth-form-row">
              <div className="wealth-form-group">
                <label>Other Assets (₹)</label>
                <input
                  type="number"
                  name="otherAssets"
                  value={formData.otherAssets}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="wealth-form-group">
                <label>Liabilities (₹)</label>
                <input
                  type="number"
                  name="liabilities"
                  value={formData.liabilities}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="wealth-calculation">
              <div>
                <span>Total Assets</span>
                <strong>
                  {formatCurrency(
                    Number(formData.savings || 0) +
                    Number(formData.investments || 0) +
                    Number(formData.otherAssets || 0)
                  )}
                </strong>
              </div>

              <div>
                <span>Estimated Net Worth</span>
                <strong>
                  {formatCurrency(
                    Number(formData.savings || 0) +
                    Number(formData.investments || 0) +
                    Number(formData.otherAssets || 0) -
                    Number(formData.liabilities || 0)
                  )}
                </strong>
              </div>
            </div>

            <div className="wealth-form-group">
              <label>Note</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Optional note (e.g. Q4 portfolio rebalance)..."
                rows="3"
              />
            </div>

            <div className="wealth-form-actions">
              <button
                type="submit"
                className="wealth-submit-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Snapshot"}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* History Table */}
      <section className="wealth-history-card">
        <div className="wealth-section-header">
          <h2>Wealth History</h2>
          <p>Review and manage your recorded financial snapshots.</p>
        </div>

        {loading ? (
          <div className="wealth-loading">Loading wealth data...</div>
        ) : snapshots.length === 0 ? (
          <div className="wealth-empty-history">
            <h3>No snapshots recorded</h3>
            <p>Add your first snapshot to start building your wealth history.</p>
          </div>
        ) : (
          <div className="wealth-table-wrapper">
            <table className="wealth-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Assets</th>
                  <th>Liabilities</th>
                  <th>Net Worth</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...snapshots]
                  .reverse()
                  .map((snapshot) => (
                    <tr key={snapshot._id}>
                      <td>
                        {new Date(snapshot.snapshotDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td>{formatCurrency(snapshot.totalAssets)}</td>
                      <td>{formatCurrency(snapshot.liabilities)}</td>
                      <td
                        className={
                          snapshot.netWorth >= 0
                            ? "wealth-positive"
                            : "wealth-negative"
                        }
                      >
                        {formatCurrency(snapshot.netWorth)}
                      </td>
                      <td>
                        <div className="wealth-table-actions">
                          <button
                            type="button"
                            className="wealth-edit-btn"
                            onClick={() => handleEdit(snapshot)}
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
                            className="wealth-delete-btn"
                            onClick={() => handleDeleteRequest(snapshot)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Edit Snapshot Modal */}
      {editingSnapshot && (
        <div
          className="wealth-modal-overlay"
          onClick={() => setEditingSnapshot(null)}
        >
          <div
            className="wealth-edit-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="wealth-modal-header">
              <span className="panel-label">UPDATE RECORD</span>
              <h2>Edit Wealth Snapshot</h2>
            </div>

            <form className="wealth-form" onSubmit={handleEditSubmit}>
              <div className="wealth-form-group">
                <label>Snapshot Date</label>
                <input
                  type="date"
                  name="snapshotDate"
                  value={editFormData.snapshotDate}
                  max={todayDateString}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="wealth-form-row">
                <div className="wealth-form-group">
                  <label>Savings (₹)</label>
                  <input
                    type="number"
                    name="savings"
                    value={editFormData.savings}
                    onChange={handleEditChange}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="wealth-form-group">
                  <label>Investments (₹)</label>
                  <input
                    type="number"
                    name="investments"
                    value={editFormData.investments}
                    onChange={handleEditChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="wealth-form-row">
                <div className="wealth-form-group">
                  <label>Other Assets (₹)</label>
                  <input
                    type="number"
                    name="otherAssets"
                    value={editFormData.otherAssets}
                    onChange={handleEditChange}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="wealth-form-group">
                  <label>Liabilities (₹)</label>
                  <input
                    type="number"
                    name="liabilities"
                    value={editFormData.liabilities}
                    onChange={handleEditChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="wealth-calculation">
                <div>
                  <span>Calculated Assets</span>
                  <strong>
                    {formatCurrency(
                      Number(editFormData.savings || 0) +
                      Number(editFormData.investments || 0) +
                      Number(editFormData.otherAssets || 0)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Calculated Net Worth</span>
                  <strong>
                    {formatCurrency(
                      Number(editFormData.savings || 0) +
                      Number(editFormData.investments || 0) +
                      Number(editFormData.otherAssets || 0) -
                      Number(editFormData.liabilities || 0)
                    )}
                  </strong>
                </div>
              </div>

              <div className="wealth-form-group">
                <label>Note</label>
                <textarea
                  name="note"
                  value={editFormData.note}
                  onChange={handleEditChange}
                  rows="3"
                />
              </div>

              <div className="wealth-form-actions">
                <button
                  type="button"
                  className="wealth-cancel-button"
                  onClick={() => setEditingSnapshot(null)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="wealth-submit-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Update Snapshot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {snapshotToDelete && (
        <div
          className="wealth-modal-overlay"
          onClick={() => setSnapshotToDelete(null)}
        >
          <div
            className="wealth-delete-modal"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
          >
            <div className="wealth-delete-icon">!</div>

            <div className="wealth-delete-content">
              <h2>Delete Wealth Snapshot?</h2>
              <p>
                Are you sure you want to delete the snapshot from{" "}
                {new Date(snapshotToDelete.snapshotDate).toLocaleDateString("en-IN")}?
              </p>
              <strong>Net Worth: {formatCurrency(snapshotToDelete.netWorth)}</strong>
            </div>

            <div className="wealth-delete-actions">
              <button
                type="button"
                className="wealth-cancel-button"
                onClick={() => setSnapshotToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="wealth-delete-confirm-btn"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Snapshot"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WealthAnalytics;