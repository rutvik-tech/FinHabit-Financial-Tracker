import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword } from "../services/api";
import ProfileEditModal from "../components/ProfileEditModal";
import "../styles/profile.css";

function Profile() {
  const { user, login, token, logout } = useAuth();

  const [editOpen, setEditOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordModalError, setPasswordModalError] = useState("");

  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      setSaving(true);
      setProfileMessage("");
      setProfileError("");

      const response = await updateProfile(updatedData);
      const updatedUser = response.user;

      login(updatedUser, token);

      setEditOpen(false);
      setProfileMessage(
        response.message || "Profile updated successfully."
      );
    } catch (error) {
      setProfileError(
        error.message || "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChangeSubmit = async (event) => {
    event.preventDefault();
    setPasswordModalError("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordModalError("All password fields are required.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordModalError("New password must be at least 6 characters long.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordModalError("New passwords do not match.");
      return;
    }

    try {
      setPasswordSaving(true);
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordModalOpen(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setProfileMessage(response.message || "Password changed successfully.");
    } catch (err) {
      setPasswordModalError(err.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <span className="profile-page-eyebrow">ACCOUNT</span>
        <h1>My Profile</h1>
        <p>Manage your FinHabit account information.</p>
      </div>

      {profileMessage && (
        <div className="profile-success-message">
          <span>{profileMessage}</span>
          <button
            type="button"
            className="profile-alert-close"
            onClick={() => setProfileMessage("")}
            aria-label="Dismiss alert"
          >
            ×
          </button>
        </div>
      )}

      {profileError && (
        <div className="profile-error-message">
          <span>{profileError}</span>
          <button
            type="button"
            className="profile-alert-close"
            onClick={() => setProfileError("")}
            aria-label="Dismiss alert"
          >
            ×
          </button>
        </div>
      )}

      <div className="profile-grid">
        <section className="profile-card profile-overview-card">
          <div className="profile-avatarr">{getInitials()}</div>
          <h2>{user?.name || "User"}</h2>
          <p>{user?.email || "No email available"}</p>

          <div className="profile-account-status">
            <span className="profile-status-dot" />
            Active Account
          </div>

          <button
            type="button"
            className="profile-edit-button"
            onClick={() => {
              setProfileMessage("");
              setProfileError("");
              setEditOpen(true);
            }}
            disabled={saving}
          >
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Edit Profile
          </button>
        </section>

        <section className="profile-card">
          <div className="profile-card-header">
            <div>
              <h2>Personal Information</h2>
              <p>Your registered account details.</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-detail-item">
              <span>Full Name</span>
              <strong>{user?.name || "Not available"}</strong>
            </div>

            <div className="profile-detail-item">
              <span>Email Address</span>
              <strong>{user?.email || "Not available"}</strong>
            </div>

            <div className="profile-detail-item">
              <span>Account Type</span>
              <strong style={{ textTransform: "capitalize" }}>
                {user?.role || "User"}
              </strong>
            </div>

            <div className="profile-detail-item">
              <span>Account Status</span>
              <strong className="profile-active">Active</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="profile-card profile-security-card">
        <div className="profile-card-header">
          <div>
            <h2>Account Security</h2>
            <p>Keep your account secure and protected.</p>
          </div>
        </div>

        <div className="profile-security-row">
          <div>
            <strong>Password</strong>
            <p>Change your password to keep your account safe.</p>
          </div>

          <button
            type="button"
            className="profile-change-pwd-btn"
            onClick={() => {
              setPasswordModalError("");
              setPasswordModalOpen(true);
            }}
          >
            Change Password
          </button>
        </div>
      </section>

      <section className="profile-card profile-danger-card">
        <div>
          <h2>Sign Out</h2>
          <p>Sign out of your FinHabit account on this device.</p>
        </div>

        <button
          type="button"
          className="profile-logout-button"
          onClick={logout}
        >
          Logout
        </button>
      </section>

      {/* Edit Profile Name Modal */}
      <ProfileEditModal
        isOpen={editOpen}
        user={user}
        onClose={() => {
          if (!saving) {
            setEditOpen(false);
          }
        }}
        onSave={handleSaveProfile}
        saving={saving}
      />

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div
          className="profile-modal-overlay"
          onClick={() => {
            if (!passwordSaving) setPasswordModalOpen(false);
          }}
        >
          <div
            className="profile-edit-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="profile-edit-header">
              <div>
                <span>SECURITY</span>
                <h2>Change Password</h2>
              </div>
              <button
                type="button"
                className="profile-modal-close"
                onClick={() => {
                  if (!passwordSaving) setPasswordModalOpen(false);
                }}
                disabled={passwordSaving}
              >
                ×
              </button>
            </div>

            {passwordModalError && (
              <div
                className="profile-error-message"
                style={{ marginBottom: "16px" }}
              >
                <span>{passwordModalError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit}>
              <div className="profile-edit-field">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value
                    })
                  }
                  disabled={passwordSaving}
                  required
                />
              </div>

              <div className="profile-edit-field">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="At least 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value
                    })
                  }
                  disabled={passwordSaving}
                  required
                />
              </div>

              <div className="profile-edit-field">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value
                    })
                  }
                  disabled={passwordSaving}
                  required
                />
              </div>

              <div className="profile-edit-actions">
                <button
                  type="button"
                  className="profile-edit-cancel"
                  onClick={() => setPasswordModalOpen(false)}
                  disabled={passwordSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-edit-save"
                  disabled={passwordSaving}
                >
                  {passwordSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;