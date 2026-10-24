import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRole }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (user?.role !== allowedRole) {
    const correctRoute =
      user?.role === "admin" ? "/admin" : "/dashboard";

    return (
      <Navigate
        to={correctRoute}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;