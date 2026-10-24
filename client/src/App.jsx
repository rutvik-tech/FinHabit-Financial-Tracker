import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Habits from "./pages/Habits";
import SavingsGoals from "./pages/SavingsGoals";
import WealthAnalytics from "./pages/WealthAnalytics";
import Profile from "./pages/Profile";
import Budgets from "./pages/Budgets";
import CashFlow from "./pages/CashFlow";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminActivity from "./pages/admin/AdminActivity";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

import { AuthProvider, useAuth } from "./context/AuthContext";

function RoleBasedHome() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Home />;
  }

  return (
    <Navigate
      to={user?.role === "admin" ? "/admin" : "/dashboard"}
      replace
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleBasedHome />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* Regular user routes */}
      <Route element={<ProtectedRoute allowedRole="user" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path="/expenses"  element={<Expenses />}/>
          <Route path="/income"    element={<Income />}/>
          <Route path="/habits"    element={<Habits />}/>
          <Route path="/goals"     element={<SavingsGoals />} />
          <Route path="/wealth"    element={<WealthAnalytics />}/>
          <Route path="/profile"   element={<Profile />} />
          <Route path="/budgets"   element={<Budgets />} />
          <Route path="/cash-flow" element={<CashFlow />} />
        </Route>
      </Route>

      {/* Administrator routes */}
      <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/activity" element={<AdminActivity />} />
        </Route>
      </Route>

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;