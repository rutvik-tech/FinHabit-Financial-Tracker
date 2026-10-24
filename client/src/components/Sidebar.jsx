import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const isAdmin = user?.role === "admin";

  return (
    <aside
      className={`dashboard-sidebar ${
        isCollapsed ? "sidebar-closed" : ""
      }`}
    >
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

      <nav className="dashboard-navigation">
        {isAdmin ? (
          <>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">A</span>
              <span className="nav-label">Admin Dashboard</span>
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">U</span>
              <span className="nav-label">User Management</span>
            </NavLink>

            <NavLink
              to="/admin/activity"
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
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">D</span>
              <span className="nav-label">Dashboard</span>
            </NavLink>

            <NavLink
              to="/income"
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">I</span>
              <span className="nav-label">Income</span>
            </NavLink>

            <NavLink
              to="/expenses"
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">E</span>
              <span className="nav-label">Expenses</span>
            </NavLink>

            <NavLink
              to="/budgets"
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">B</span>
              <span className="nav-label">Budgets</span>
            </NavLink>

            <NavLink
              to="/cash-flow"
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">C</span>
              <span className="nav-label">Cash Flow</span>
            </NavLink>

            <NavLink
              to="/habits"
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">H</span>
              <span className="nav-label">Habits</span>
            </NavLink>

            <NavLink
              to="/goals"
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">G</span>
              <span className="nav-label">Savings Goals</span>
            </NavLink>

            <NavLink
              to="/wealth"
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">W</span>
              <span className="nav-label">Wealth</span>
            </NavLink>

            <NavLink
              to="/profile"
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
          <span className="nav-icon">↪</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;