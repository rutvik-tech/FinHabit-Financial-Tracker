import { useEffect, useState } from "react";
import {
  getHabits,
  addHabit,
  updateHabit,
  completeHabit,
  deleteHabit
} from "../services/api";
import "../styles/habits.css";

function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    frequency: "daily"
  });

  // Edit State
  const [editingHabit, setEditingHabit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    frequency: "daily"
  });
  const [updating, setUpdating] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Notifications
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadHabits = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await getHabits();
      setHabits(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load habits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleEditChange = (event) => {
    setEditFormData({
      ...editFormData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Please enter a habit name.");
      return;
    }

    try {
      await addHabit(formData);
      setSuccessMessage("Habit created successfully.");
      setFormData({
        name: "",
        description: "",
        frequency: "daily"
      });
      setShowForm(false);
      await loadHabits();
    } catch (err) {
      setErrorMessage(err.message || "Failed to create habit.");
    }
  };

  // Toggle Completion
  const handleComplete = async (id) => {
    try {
      setErrorMessage("");
      const updated = await completeHabit(id);
      setHabits((current) =>
        current.map((habit) => (habit._id === id ? updated : habit))
      );
    } catch (err) {
      setErrorMessage(err.message || "Failed to update habit status.");
    }
  };

  // Edit Handlers
  const handleEditClick = (habit) => {
    setErrorMessage("");
    setSuccessMessage("");
    setEditingHabit(habit);
    setEditFormData({
      name: habit.name || "",
      description: habit.description || "",
      frequency: habit.frequency || "daily"
    });
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingHabit || updating) return;

    if (!editFormData.name.trim()) {
      setErrorMessage("Habit name cannot be empty.");
      return;
    }

    try {
      setUpdating(true);
      const updated = await updateHabit(editingHabit._id, editFormData);
      setHabits((current) =>
        current.map((h) => (h._id === editingHabit._id ? updated : h))
      );
      setSuccessMessage("Habit updated successfully.");
      setEditingHabit(null);
    } catch (err) {
      setErrorMessage(err.message || "Failed to update habit.");
    } finally {
      setUpdating(false);
    }
  };

  // Delete Handlers
  const handleDeleteClick = (habit) => {
    setErrorMessage("");
    setSuccessMessage("");
    setDeleteTarget(habit);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || deleting) return;

    try {
      setDeleting(true);
      await deleteHabit(deleteTarget._id);
      setHabits((current) =>
        current.filter((h) => h._id !== deleteTarget._id)
      );
      setSuccessMessage("Habit deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      setErrorMessage(err.message || "Failed to delete habit.");
    } finally {
      setDeleting(false);
    }
  };

  const isCompletedToday = (habit) => {
    if (!habit.completedDates?.length) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return habit.completedDates.some((date) => {
      const completedDate = new Date(date);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });
  };

  const completedToday = habits.filter(isCompletedToday).length;

  return (
    <div className="habits-page">
      <section className="habits-header">
        <div>
          <span className="habits-eyebrow">DAILY ROUTINE</span>
          <h1>Financial Habits</h1>
          <p>Build consistent habits and improve your financial discipline.</p>
        </div>

        <button
          type="button"
          className="habit-add-button"
          onClick={() => {
            setShowForm(!showForm);
            setErrorMessage("");
          }}
        >
          {showForm ? "Close Form" : "+ Add Habit"}
        </button>
      </section>

      {/* Notification Alerts */}
      {errorMessage && (
        <div className="habit-alert habit-alert-error" role="alert">
          <span>{errorMessage}</span>
          <button
            type="button"
            className="habit-alert-close"
            onClick={() => setErrorMessage("")}
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="habit-alert habit-alert-success" role="status">
          <span>{successMessage}</span>
          <button
            type="button"
            className="habit-alert-close"
            onClick={() => setSuccessMessage("")}
          >
            ×
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <section className="habit-overview">
        <div className="habit-overview-card">
          <span>Total Habits</span>
          <strong>{habits.length}</strong>
        </div>

        <div className="habit-overview-card">
          <span>Completed Today</span>
          <strong>{completedToday}</strong>
        </div>

        <div className="habit-overview-card">
          <span>Remaining Today</span>
          <strong>{Math.max(habits.length - completedToday, 0)}</strong>
        </div>
      </section>

      {/* Add Habit Form */}
      {showForm && (
        <section className="habit-form-card">
          <div className="habit-form-header">
            <span className="panel-label">NEW HABIT</span>
            <h2>Create a Financial Habit</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="habit-form-group">
              <label htmlFor="name">Habit Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Save ₹100 every day"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="habit-form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Add a short description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="habit-form-group">
              <label htmlFor="frequency">Frequency</label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="habit-form-actions">
              <button
                type="button"
                className="habit-cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button type="submit" className="habit-save-button">
                Create Habit
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Habit Cards Grid */}
      <section className="habits-list-section">
        <div className="habits-list-header">
          <span className="panel-label">YOUR HABITS</span>
          <h2>Today's Routine</h2>
        </div>

        {loading ? (
          <div className="habits-empty-state">Loading habits...</div>
        ) : habits.length === 0 ? (
          <div className="habits-empty-state">
            <div className="empty-habit-icon">H</div>
            <h3>No habits yet</h3>
            <p>
              Create your first financial habit and start building consistency.
            </p>
            <button
              type="button"
              className="habit-add-button"
              onClick={() => setShowForm(true)}
            >
              + Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="habits-grid">
            {habits.map((habit) => {
              const completed = isCompletedToday(habit);

              return (
                <div
                  className={`habit-card ${completed ? "completed" : ""}`}
                  key={habit._id}
                >
                  <div className="habit-card-top">
                    <div
                      className={`habit-status ${
                        completed ? "completed" : ""
                      }`}
                    >
                      {completed ? "✓" : "H"}
                    </div>

                    <div className="habit-card-actions">
                      <button
                        type="button"
                        className="habit-edit-button"
                        onClick={() => handleEditClick(habit)}
                        title="Edit Habit"
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
                        className="habit-delete-button"
                        onClick={() => handleDeleteClick(habit)}
                        title="Delete Habit"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <h3>{habit.name}</h3>

                  {habit.description && <p>{habit.description}</p>}

                  <div className="habit-card-meta">
                    <span style={{ textTransform: "capitalize" }}>
                      {habit.frequency}
                    </span>
                    <span className="habit-card-streak">
                      {habit.streak || 0} day streak
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`habit-complete-button ${
                      completed ? "completed" : ""
                    }`}
                    onClick={() => handleComplete(habit._id)}
                  >
                    {completed ? "✓ Completed (Click to Undo)" : "Mark as Complete"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit Modal */}
      {editingHabit && (
        <div
          className="habit-modal-overlay"
          onClick={() => setEditingHabit(null)}
        >
          <div className="habit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="habit-modal-header">
              <span className="panel-label">UPDATE HABIT</span>
              <h2>Edit Habit</h2>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="habit-form-group">
                <label htmlFor="edit-habit-name">Habit Name</label>
                <input
                  id="edit-habit-name"
                  name="name"
                  type="text"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  disabled={updating}
                  required
                />
              </div>

              <div className="habit-form-group">
                <label htmlFor="edit-habit-description">Description</label>
                <textarea
                  id="edit-habit-description"
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  disabled={updating}
                  rows="3"
                />
              </div>

              <div className="habit-form-group">
                <label htmlFor="edit-habit-frequency">Frequency</label>
                <select
                  id="edit-habit-frequency"
                  name="frequency"
                  value={editFormData.frequency}
                  onChange={handleEditChange}
                  disabled={updating}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="habit-modal-actions">
                <button
                  type="button"
                  className="habit-cancel-button"
                  onClick={() => setEditingHabit(null)}
                  disabled={updating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="habit-save-button"
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
        <div
          className="habit-modal-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="habit-modal habit-delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="habit-delete-icon">!</div>

            <div className="habit-delete-content">
              <h2>Delete Habit?</h2>
              <p>
                Are you sure you want to delete this habit? Your previous streak
                will no longer be tracked.
              </p>
              <strong>{deleteTarget.name}</strong>
            </div>

            <div
              className="habit-modal-actions"
              style={{ justifyContent: "center" }}
            >
              <button
                type="button"
                className="habit-cancel-button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="habit-delete-confirm-btn"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Habit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Habits;