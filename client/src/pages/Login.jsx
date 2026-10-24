import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeactivatedModalOpen, setIsDeactivatedModalOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email,
        password
      });

      if (!data?.user || !data?.token) {
        throw new Error("Invalid login response from the server.");
      }

      login(data.user, data.token);

      const destination =
        data.user.role === "admin" ? "/admin" : "/dashboard";

      const requestedPath = location.state?.from;

      navigate(
        requestedPath === destination ? requestedPath : destination,
        { replace: true }
      );
    } catch (error) {
      const msg = error.message || "Failed to log in.";
      if (msg.toLowerCase().includes("deactivated")) {
        setIsDeactivatedModalOpen(true);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Link to="/" className="login-logo">
            <span className="login-logo-mark">F</span>
            <span>FinHabit</span>
          </Link>

          <h1>Welcome back</h1>

          <p className="login-subtitle">
            Continue building better financial habits.
          </p>
        </div>

        <div className="login-card">
          {errorMessage && (
            <div className="login-error-alert" role="alert">
              <span>{errorMessage}</span>
              <button
                type="button"
                className="login-alert-close"
                onClick={() => setErrorMessage("")}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    setErrorMessage("Password reset will be available soon.")
                  }
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="login-divider">
            <span>New to FinHabit?</span>
          </div>

          <Link to="/register" className="register-link">
            Create an account
          </Link>
        </div>

        <Link to="/" className="back-home">
          ← Back to home
        </Link>
      </div>

      {/* Themed Deactivation Modal Popup */}
      {isDeactivatedModalOpen && (
        <div
          className="login-modal-overlay"
          onClick={() => setIsDeactivatedModalOpen(false)}
        >
          <div
            className="login-deactivated-modal"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="deactivated-title"
          >
            <div className="login-deactivated-icon">!</div>

            <div className="login-deactivated-content">
              <h2 id="deactivated-title">Account Deactivated</h2>
              <p>
                Your account has been deactivated. Please contact the administrator.
              </p>
            </div>

            <div className="login-modal-actions">
              <button
                type="button"
                className="login-modal-close-btn"
                onClick={() => setIsDeactivatedModalOpen(false)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;