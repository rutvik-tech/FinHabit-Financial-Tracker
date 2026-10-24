import { useEffect, useState } from "react";

function ProfileEditModal({
  isOpen,
  user,
  onClose,
  onSave,
  saving = false
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || "");
    }
  }, [isOpen, user]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim() || saving) {
      return;
    }

    onSave({
      name: name.trim()
    });
  };

  return (
    <div
      className="profile-modal-overlay"
      onClick={() => {
        if (!saving) {
          onClose();
        }
      }}
    >
      <div
        className="profile-edit-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="profile-edit-header">
          <div>
            <span>ACCOUNT SETTINGS</span>

            <h2>Edit Profile</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="profile-modal-close"
            disabled={saving}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="profile-edit-field">
            <label>Full Name</label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your name"
              required
              disabled={saving}
            />
          </div>

          <div className="profile-edit-field">
            <label>Email Address</label>

            <input
              type="email"
              value={user?.email || ""}
              disabled
            />

            <small>
              Email address cannot be changed here.
            </small>
          </div>

          <div className="profile-edit-actions">
            <button
              type="button"
              className="profile-edit-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="profile-edit-save"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileEditModal;