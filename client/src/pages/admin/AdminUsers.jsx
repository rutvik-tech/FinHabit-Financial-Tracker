import { useCallback, useEffect, useState } from "react";
import {
  getAdminUsers,
  getAdminUserDetails,
  updateAdminUserStatus
} from "../../services/adminApi";
import "./AdminUsers.css";

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

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmationUser, setConfirmationUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminUsers(search, page, 10);

      setUsers(response.users || []);
      setPagination(
        response.pagination || {
          currentPage: page,
          totalPages: 1,
          totalUsers: 0,
          limit: 10
        }
      );
    } catch (err) {
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadUsers]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
    setSuccess("");
    setError("");
  };

  const handleViewDetails = async (userId) => {
    try {
      setDetailsLoading(true);
      setError("");
      setSelectedUser(null);

      const response = await getAdminUserDetails(userId);

      setSelectedUser(response.user);
    } catch (err) {
      setError(err.message || "Unable to load user details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const openStatusConfirmation = (user) => {
    setError("");
    setSuccess("");
    setConfirmationUser(user);
  };

  const closeStatusConfirmation = () => {
    if (updatingUserId) return;

    setConfirmationUser(null);
  };

  const handleStatusChange = async () => {
    if (!confirmationUser || updatingUserId) return;

    const user = confirmationUser;
    const nextStatus = user.isActive === false;

    try {
      setUpdatingUserId(user._id);
      setError("");
      setSuccess("");

      const response = await updateAdminUserStatus(
        user._id,
        nextStatus
      );

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser._id === user._id
            ? { ...currentUser, isActive: nextStatus }
            : currentUser
        )
      );

      if (selectedUser?._id === user._id) {
        setSelectedUser((currentUser) => ({
          ...currentUser,
          isActive: nextStatus
        }));
      }

      setConfirmationUser(null);

      setSuccess(
        response.message ||
          `User account ${nextStatus ? "activated" : "deactivated"} successfully.`
      );
    } catch (err) {
      setError(
        err.message || "Unable to update the user's account status."
      );
      setConfirmationUser(null);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const confirmationIsActivation =
    confirmationUser?.isActive === false;

  return (
    <div className="admin-users-page">
      <header className="admin-users-header">
        <div>
          <span className="admin-users-eyebrow">
            ADMINISTRATION
          </span>
          <h1>User Management</h1>
          <p>
            View registered accounts and manage their access.
          </p>
        </div>

        <button
          className="admin-users-refresh"
          type="button"
          onClick={loadUsers}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Users"}
        </button>
      </header>

      <section className="admin-users-summary">
        <div className="admin-users-summary-card">
          <span>Total Registered Users</span>
          <strong>
            {Number(
              pagination.totalUsers || 0
            ).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="admin-users-summary-card">
          <span>Active on This Page</span>
          <strong>
            {
              users.filter(
                (user) => user.isActive !== false
              ).length
            }
          </strong>
        </div>

        <div className="admin-users-summary-card">
          <span>Inactive on This Page</span>
          <strong>
            {
              users.filter(
                (user) => user.isActive === false
              ).length
            }
          </strong>
        </div>
      </section>

      <section className="admin-users-content">
        <div className="admin-users-toolbar">
          <div>
            <h2>Registered Users</h2>
            <p>
              Search accounts and manage their status.
            </p>
          </div>

          <input
            className="admin-users-search"
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearchChange}
            aria-label="Search users by name or email"
          />
        </div>

        {error && (
          <div
            className="admin-users-message error"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="admin-users-message success"
            role="status"
          >
            <span className="admin-users-success-icon">
              ✓
            </span>
            {success}
          </div>
        )}

        {loading ? (
          <div className="admin-users-state">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="admin-users-state">
            {search
              ? "No users match your search."
              : "No registered users found."}
          </div>
        ) : (
          <div className="admin-users-table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const isActive = user.isActive !== false;
                  const isUpdating =
                    updatingUserId === user._id;

                  return (
                    <tr key={user._id}>
                      <td>
                        <div className="admin-users-user-cell">
                          <span className="admin-users-avatar">
                            {(user.name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </span>

                          <div>
                            <strong>
                              {user.name || "Unnamed User"}
                            </strong>
                            <small>
                              ID: {String(user._id).slice(-8)}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <span
                          className={`admin-users-status ${
                            isActive ? "active" : "inactive"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>{formatDate(user.createdAt)}</td>

                      <td>
                        <div className="admin-users-actions">
                          <button
                            className="admin-users-view"
                            type="button"
                            onClick={() =>
                              handleViewDetails(user._id)
                            }
                          >
                            View
                          </button>

                          <button
                            className={`admin-users-toggle ${
                              isActive
                                ? "deactivate"
                                : "activate"
                            }`}
                            type="button"
                            onClick={() =>
                              openStatusConfirmation(user)
                            }
                            disabled={Boolean(updatingUserId)}
                          >
                            {isUpdating
                              ? "Updating..."
                              : isActive
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-users-pagination">
          <span>
            Page {pagination.currentPage || 1} of{" "}
            {Math.max(1, pagination.totalPages || 1)}
          </span>

          <div>
            <button
              type="button"
              onClick={() =>
                setPage((currentPage) => currentPage - 1)
              }
              disabled={loading || page <= 1}
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() =>
                setPage((currentPage) => currentPage + 1)
              }
              disabled={
                loading ||
                page >=
                  Math.max(1, pagination.totalPages || 1)
              }
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {(detailsLoading || selectedUser) && (
        <div
          className="admin-users-modal-backdrop"
          onClick={() => {
            setSelectedUser(null);
            setDetailsLoading(false);
          }}
        >
          <section
            className="admin-users-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-users-modal-header">
              <h2 id="admin-user-details-title">
                User Details
              </h2>

              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setDetailsLoading(false);
                }}
                aria-label="Close user details"
              >
                ×
              </button>
            </div>

            {detailsLoading ? (
              <div className="admin-users-state">
                Loading user details...
              </div>
            ) : (
              selectedUser && (
                <div className="admin-users-details">
                  <div className="admin-users-details-avatar">
                    {(selectedUser.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <h3>
                    {selectedUser.name || "Unnamed User"}
                  </h3>
                  <p>{selectedUser.email}</p>

                  <div className="admin-users-detail-row">
                    <span>Account Role</span>
                    <strong>
                      {selectedUser.role || "user"}
                    </strong>
                  </div>

                  <div className="admin-users-detail-row">
                    <span>Account Status</span>
                    <strong>
                      {selectedUser.isActive === false
                        ? "Inactive"
                        : "Active"}
                    </strong>
                  </div>

                  <div className="admin-users-detail-row">
                    <span>Registered On</span>
                    <strong>
                      {formatDate(selectedUser.createdAt)}
                    </strong>
                  </div>

                  <div className="admin-users-detail-row">
                    <span>Last Updated</span>
                    <strong>
                      {formatDate(selectedUser.updatedAt)}
                    </strong>
                  </div>
                </div>
              )
            )}
          </section>
        </div>
      )}

      {confirmationUser && (
        <div
          className="admin-users-confirm-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !updatingUserId
            ) {
              closeStatusConfirmation();
            }
          }}
        >
          <section
            className={`admin-users-confirm-modal ${
              confirmationIsActivation
                ? "activation"
                : "deactivation"
            }`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-users-confirm-title"
            aria-describedby="admin-users-confirm-description"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="admin-users-confirm-close"
              type="button"
              onClick={closeStatusConfirmation}
              disabled={Boolean(updatingUserId)}
              aria-label="Close confirmation"
            >
              ×
            </button>

            <div className="admin-users-confirm-icon">
              {confirmationIsActivation ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12.5L9.5 17L19 7.5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 8V13"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="16.5"
                    r="0.8"
                    fill="currentColor"
                  />
                  <path
                    d="M10.3 4.5L2.7 18A1.7 1.7 0 004.2 20.5H19.8A1.7 1.7 0 0021.3 18L13.7 4.5A2 2 0 0010.3 4.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>

            <span className="admin-users-confirm-eyebrow">
              ACCOUNT MANAGEMENT
            </span>

            <h2 id="admin-users-confirm-title">
              {confirmationIsActivation
                ? "Activate this account?"
                : "Deactivate this account?"}
            </h2>

            <p
              id="admin-users-confirm-description"
              className="admin-users-confirm-description"
            >
              {confirmationIsActivation
                ? "This will restore the user's access to FinHabit."
                : "This user will no longer be able to log in or access protected features."}
            </p>

            <div className="admin-users-confirm-user">
              <span className="admin-users-confirm-avatar">
                {(confirmationUser.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </span>

              <div className="admin-users-confirm-user-info">
                <strong>
                  {confirmationUser.name || "Unnamed User"}
                </strong>
                <span>{confirmationUser.email}</span>
              </div>

              <span
                className={`admin-users-status ${
                  confirmationUser.isActive === false
                    ? "inactive"
                    : "active"
                }`}
              >
                {confirmationUser.isActive === false
                  ? "Inactive"
                  : "Active"}
              </span>
            </div>

            <div className="admin-users-confirm-actions">
              <button
                className="admin-users-confirm-cancel"
                type="button"
                onClick={closeStatusConfirmation}
                disabled={Boolean(updatingUserId)}
              >
                Cancel
              </button>

              <button
                className={`admin-users-confirm-submit ${
                  confirmationIsActivation
                    ? "activate"
                    : "deactivate"
                }`}
                type="button"
                onClick={handleStatusChange}
                disabled={Boolean(updatingUserId)}
              >
                {updatingUserId ? (
                  <>
                    <span className="admin-users-button-spinner" />
                    Processing...
                  </>
                ) : confirmationIsActivation ? (
                  "Activate Account"
                ) : (
                  "Deactivate Account"
                )}
              </button>
            </div>

            <div className="admin-users-confirm-footer">
              <span className="admin-users-confirm-lock">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M8 10V7A4 4 0 0116 7V10"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              Your action will be applied to this account.
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;