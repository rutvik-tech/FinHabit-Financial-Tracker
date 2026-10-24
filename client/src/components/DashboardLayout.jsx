import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

function DashboardLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State to control mobile sidebar visibility
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const userName = user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const toggleMobileNav = () => {
    setIsMobileNavOpen((prev) => !prev);
  };

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Dark overlay backdrop on mobile */}
      {isMobileNavOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeMobileNav}
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 998
          }}
        />
      )}

      {/* Sidebar with mobile state passed as props */}
      <Sidebar
        isMobileNavOpen={isMobileNavOpen}
        closeMobileNav={closeMobileNav}
      />

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            {/* Hamburger button visible on mobile devices */}
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={toggleMobileNav}
              aria-label="Toggle navigation menu"
              style={{
                background: "transparent",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ☰
            </button>
          </div>

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
              onClick={() => {
                closeMobileNav();
                navigate("/profile");
              }}
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