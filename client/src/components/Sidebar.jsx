import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Sidebar({ isMobileNavOpen, closeMobileNav }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    if (closeMobileNav) closeMobileNav();
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleNavLinkClick = () => {
    // Automatically close the menu on mobile after clicking a link
    if (closeMobileNav) {
      closeMobileNav();
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <aside
      className={`dashboard-sidebar ${
        isCollapsed ? "sidebar-closed" : ""
      } ${isMobileNavOpen ? "mobile-open" : "mobile-closed"}`}
    >
      <div className="sidebar-header-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <button
          type="button"
          className="dashboard-sidebar-logo"
          onClick={toggleSidebar}
          aria-label={
            isCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          <span className="dashboard-logo-mark">F</span>
          <span className="dashboard-logo-name">FinHabit</span>
        </button>

        {/* Mobile close button */}
        <button
          type="button"
          className="mobile-sidebar-close-btn"
          onClick={closeMobileNav}
          aria-label="Close menu"
          style={{
            background: "transparent",
            border: "none",
            fontSize: "1.25rem",
            cursor: "pointer",
            padding: "8px",
            color: "inherit"
          }}
        >
          ✕
        </button>
      </div>

      <nav className="dashboard-navigation">
        {isAdmin ? (
          <>
            <NavLink
              to="/admin"
              end
              onClick={handleNavLinkClick}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">A</span>
              <span className="nav-label">Admin Dashboard</span>
            </NavLink>

            <NavLink
              to="/admin/users"
              onClick={handleNavLinkClick}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">U</span>
              <span className="nav-label">User Management</span>
            </NavLink>

            <NavLink
              to="/admin/activity"
              onClick={handleNavLinkClick}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">M</span>
              <span className="nav-label">Activity Monitoring</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/dashboard"
              onClick={handleNavLinkClick}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">D</span>
              <span className="nav-label">Dashboard</span>
            </NavLink>

            <NavLink
              to="/income"
              onClick={handleNavLinkClick}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">I</span>
              <span className="nav-label">Income</span>
            </NavLink>

            <NavLink
              to="/expenses"
              onClick={handleNavLinkClick}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">E</span>
              <span className="nav-label">Expenses</span>
            </NavLink>

            <NavLink
              to="/budgets"
              onClick={handleNavLinkClick}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">B</span>
              <span className="nav-label">Budgets</span>
            </NavLink>

            <NavLink
              to="/cash-flow"
              onClick={handleNavLinkClick}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">C</span>
              <span className="nav-label">Cash Flow</span>
            </NavLink>

            <NavLink
              to="/habits"
              onClick={handleNavLinkClick}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">H</span>
              <span className="nav-label">Habits</span>
            </NavLink>

            <NavLink
              to="/goals"
              onClick={handleNavLinkClick}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">G</span>
              <span className="nav-label">Savings Goals</span>
            </NavLink>

            <NavLink
              to="/wealth"
              onClick={handleNavLinkClick}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">W</span>
              <span className="nav-label">Wealth</span>
            </NavLink>

            <NavLink
              to="/profile"
              onClick={handleNavLinkClick}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">P</span>
              <span className="nav-label">Profile</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-bottom">
        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <span className="nav-icon">L</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;