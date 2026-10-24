import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

function DashboardLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userName = user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-right">
            <button
              className="notification-button"
              type="button"
              aria-label="Notifications"
            >
              <span className="notification-dot"></span>
              N
            </button>

            <button
              type="button"
              className="profile-mini"
              onClick={() => navigate("/profile")}
            >
              <div className="profile-avatar">
                {userInitial}
              </div>

              <div className="profile-mini-info">
                <strong>{userName}</strong>
                <span>Personal Account</span>
              </div>
            </button>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;