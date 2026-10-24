import { useEffect, useState } from "react";
import {
  getGoals,
  addGoal,
  updateGoal,
  addMoneyToGoal,
  deleteGoal
} from "../services/api";
import "../styles/savings-goals.css";

function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    description: ""
  });

  // Edit State
  const [editingGoal, setEditingGoal] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    description: ""
  });
  const [updating, setUpdating] = useState(false);

  // Delete State
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [moneyInputs, setMoneyInputs] = useState({});

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getGoals();
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load savings goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const target = Number(formData.targetAmount);
    if (!formData.name.trim()) {
      setError("Please enter a goal name.");
      return;
    }

    if (isNaN(target) || target <= 0) {
      setError("Target amount must be a positive number.");
      return;
    }

    if (!formData.targetDate) {
      setError("Please select a target date.");
      return;
    }

    try {
      const newGoal = await addGoal({
        ...formData,
        targetAmount: target,
        currentAmount: Number(formData.currentAmount) || 0
      });

      setGoals((previous) => [newGoal, ...previous]);
      setSuccessMessage("Savings goal created successfully.");

      setFormData({
        name: "",
        targetAmount: "",
        currentAmount: "",
        targetDate: "",
        description: ""
      });

      setShowForm(false);
    } catch (err) {
      setError(err.message || "Failed to create savings goal.");
    }
  };

  const handleMoneyChange = (goalId, value) => {
    setMoneyInputs((previous) => ({
      ...previous,
      [goalId]: value
    }));
  };

  const handleAddMoney = async (goalId) => {
    const amount = Number(moneyInputs[goalId]);

    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      const updatedGoal = await addMoneyToGoal(goalId, amount);

      setGoals((previous) =>
        previous.map((goal) =>
          goal._id === updatedGoal._id ? updatedGoal : goal
        )
      );

      setMoneyInputs((previous) => ({
        ...previous,
        [goalId]: ""
      }));

      setSuccessMessage(`Added ₹${amount.toLocaleString("en-IN")} to "${updatedGoal.name}".`);
    } catch (err) {
      setError(err.message || "Failed to add money to goal.");
    }
  };

  // Edit Handlers
  const handleEditClick = (goal) => {
    setError("");
    setSuccessMessage("");
    setEditingGoal(goal);
    setEditFormData({
      name: goal.name || "",
      targetAmount: goal.targetAmount || "",
      currentAmount: goal.currentAmount || 0,
      targetDate: goal.targetDate
        ? new Date(goal.targetDate).toISOString().split("T")[0]
        : "",
      description: goal.description || ""
    });
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingGoal || updating) return;

    setError("");
    const target = Number(editFormData.targetAmount);
    const current = Number(editFormData.currentAmount);

    if (!editFormData.name.trim()) {
      setError("Goal name cannot be empty.");
      return;
    }

    if (isNaN(target) || target <= 0) {
      setError("Target amount must be a positive number.");
      return;
    }

    if (isNaN(current) || current < 0) {
      setError("Current amount cannot be negative.");
      return;
    }

    try {
      setUpdating(true);
      const updated = await updateGoal(editingGoal._id, {
        name: editFormData.name.trim(),
        targetAmount: target,
        currentAmount: current,
        targetDate: editFormData.targetDate,
        description: editFormData.description.trim()
      });

      setGoals((previous) =>
        previous.map((g) => (g._id === editingGoal._id ? updated : g))
      );

      setSuccessMessage("Savings goal updated successfully.");
      setEditingGoal(null);
    } catch (err) {
      setError(err.message || "Failed to update savings goal.");
    } finally {
      setUpdating(false);
    }
  };

  // Delete Handlers
  const handleDeleteRequest = (goal) => {
    setError("");
    setSuccessMessage("");
    setGoalToDelete(goal);
  };

  const handleDeleteConfirm = async () => {
    if (!goalToDelete || deleting) return;

    try {
      setDeleting(true);
      setError("");

      await deleteGoal(goalToDelete._id);

      setGoals((previous) =>
        previous.filter((goal) => goal._id !== goalToDelete._id)
      );

      setSuccessMessage("Savings goal deleted successfully.");
      setGoalToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to delete savings goal.");
    } finally {
      setDeleting(false);
    }
  };

  const calculateProgress = (currentAmount, targetAmount) => {
    if (!targetAmount || targetAmount <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((Number(currentAmount || 0) / Number(targetAmount)) * 100)
    );
  };

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const totalTarget = goals.reduce(
    (total, goal) => total + Number(goal.targetAmount || 0),
    0
  );

  const totalSaved = goals.reduce(
    (total, goal) => total + Number(goal.currentAmount || 0),
    0
  );

  const completedGoals = goals.filter(
    (goal) => Number(goal.currentAmount) >= Number(goal.targetAmount)
  ).length;

  const overallProgress =
    totalTarget > 0
      ? Math.min(100, Math.round((totalSaved / totalTarget) * 100))
      : 0;

  return (
    <div className="savings-goals-page">
      <div className="savings-goals-header">
        <div>
          <span className="goals-eyebrow">FINANCIAL GOALS</span>
          <h1>Savings Goals</h1>
          <p>
            Set targets, track your savings, and stay consistent with your goals.
          </p>
        </div>

        <button
          className="goal-add-button"
          onClick={() => {
            setShowForm((previous) => !previous);
            setError("");
          }}
        >
          {showForm ? "Close Form" : "+ Add Goal"}
        </button>
      </div>

      {error && (
        <div className="goal-alert goal-alert-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="goal-alert-close"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="goal-alert goal-alert-success" role="status">
          <span>{successMessage}</span>
          <button
            type="button"
            className="goal-alert-close"
            onClick={() => setSuccessMessage("")}
          >
            ×
          </button>
        </div>
      )}

      <div className="goal-overview">
        <div className="goal-overview-card">
          <span>Total Target</span>
          <strong>{formatAmount(totalTarget)}</strong>
        </div>

        <div className="goal-overview-card">
          <span>Total Saved</span>
          <strong>{formatAmount(totalSaved)}</strong>
        </div>

        <div className="goal-overview-card">
          <span>Overall Progress</span>
          <strong>{overallProgress}%</strong>
        </div>

        <div className="goal-overview-card">
          <span>Completed Goals</span>
          <strong>{completedGoals}</strong>
        </div>
      </div>

      {showForm && (
        <section className="goal-form-card">
          <div className="goal-form-header">
            <span className="panel-label">CREATE GOAL</span>
            <h2>Create a Savings Goal</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="goal-form-grid">
              <div className="goal-form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. New Laptop"
                  required
                />
              </div>

              <div className="goal-form-group">
                <label>Target Amount (₹)</label>
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  placeholder="50000"
                  min="1"
                  step="0.01"
                  required
                />
              </div>

              <div className="goal-form-group">
                <label>Already Saved (₹)</label>
                <input
                  type="number"
                  name="currentAmount"
                  value={formData.currentAmount}
                  onChange={handleChange}
                  placeholder="5000"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="goal-form-group">
                <label>Target Date</label>
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="goal-form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Why are you saving for this goal?"
                rows="3"
              />
            </div>

            <div className="goal-form-actions">
              <button
                type="button"
                className="goal-cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button type="submit" className="goal-save-button">
                Create Goal
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="goals-list-section">
        <div className="goals-list-header">
          <span className="panel-label">YOUR GOALS</span>
          <h2>Track Your Savings</h2>
        </div>

        {loading ? (
          <div className="goals-empty-state">
            Loading your savings goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="goals-empty-state">
            <div className="empty-goal-icon">₹</div>
            <h3>No savings goals yet</h3>
            <p>
              Create your first savings goal and start tracking your progress.
            </p>

            <button
              className="goal-add-button"
              onClick={() => setShowForm(true)}
            >
              + Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="goals-grid">
            {goals.map((goal) => {
              const progress = calculateProgress(
                goal.currentAmount,
                goal.targetAmount
              );

              const isCompleted = progress >= 100;

              return (
                <div
                  className={`goal-card ${isCompleted ? "completed" : ""}`}
                  key={goal._id}
                >
                  <div className="goal-card-top">
                    <div className="goal-icon">
                      {isCompleted ? "✓" : "₹"}
                    </div>

                    <div className="goal-card-actions">
                      <button
                        type="button"
                        className="goal-edit-button"
                        onClick={() => handleEditClick(goal)}
                        title="Edit Goal"
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
                        className="goal-delete-button"
                        onClick={() => handleDeleteRequest(goal)}
                        title="Delete Goal"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <h3>{goal.name}</h3>

                  {goal.description && (
                    <p className="goal-description">{goal.description}</p>
                  )}

                  <div className="goal-amounts">
                    <div>
                      <span>Saved</span>
                      <strong>{formatAmount(goal.currentAmount)}</strong>
                    </div>

                    <div>
                      <span>Target</span>
                      <strong>{formatAmount(goal.targetAmount)}</strong>
                    </div>
                  </div>

                  <div className="goal-progress-section">
                    <div className="goal-progress-header">
                      <span>Progress</span>
                      <strong>{progress}%</strong>
                    </div>

                    <div className="goal-progress-bar">
                      <div
                        className="goal-progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="goal-card-meta">
                    <span>Target Date</span>
                    <strong>{formatDate(goal.targetDate)}</strong>
                  </div>

                  {!isCompleted && (
                    <div className="goal-add-money">
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="Amount (₹)"
                        value={moneyInputs[goal._id] || ""}
                        onChange={(event) =>
                          handleMoneyChange(goal._id, event.target.value)
                        }
                      />

                      <button
                        type="button"
                        onClick={() => handleAddMoney(goal._id)}
                      >
                        Add Money
                      </button>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="goal-completed-message">
                      ✓ Goal Completed!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div
          className="goal-modal-overlay"
          onClick={() => setEditingGoal(null)}
        >
          <div className="goal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="goal-modal-header">
              <span className="panel-label">UPDATE GOAL</span>
              <h2>Edit Savings Goal</h2>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="goal-form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  disabled={updating}
                  required
                />
              </div>

              <div className="goal-form-grid">
                <div className="goal-form-group">
                  <label>Target Amount (₹)</label>
                  <input
                    type="number"
                    name="targetAmount"
                    value={editFormData.targetAmount}
                    onChange={handleEditChange}
                    min="1"
                    step="0.01"
                    disabled={updating}
                    required
                  />
                </div>

                <div className="goal-form-group">
                  <label>Current Saved (₹)</label>
                  <input
                    type="number"
                    name="currentAmount"
                    value={editFormData.currentAmount}
                    onChange={handleEditChange}
                    min="0"
                    step="0.01"
                    disabled={updating}
                    required
                  />
                </div>
              </div>

              <div className="goal-form-group">
                <label>Target Date</label>
                <input
                  type="date"
                  name="targetDate"
                  value={editFormData.targetDate}
                  onChange={handleEditChange}
                  disabled={updating}
                  required
                />
              </div>

              <div className="goal-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  disabled={updating}
                  rows="3"
                />
              </div>

              <div className="goal-modal-actions">
                <button
                  type="button"
                  className="goal-cancel-button"
                  onClick={() => setEditingGoal(null)}
                  disabled={updating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="goal-save-button"
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
      {goalToDelete && (
        <div
          className="goal-modal-overlay"
          onClick={() => setGoalToDelete(null)}
        >
          <div
            className="goal-modal goal-delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="goal-delete-icon">!</div>

            <div className="goal-delete-content">
              <h2>Delete Savings Goal?</h2>
              <p>
                Are you sure you want to delete this goal? All tracked progress for this goal will be removed.
              </p>
              <strong>{goalToDelete.name}</strong>
            </div>

            <div
              className="goal-modal-actions"
              style={{ justifyContent: "center" }}
            >
              <button
                type="button"
                className="goal-cancel-button"
                onClick={() => setGoalToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="goal-delete-confirm-btn"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Goal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavingsGoals;