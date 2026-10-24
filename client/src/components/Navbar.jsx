import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = (event) => {
    event.preventDefault();

    if (location.pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } else {
      navigate("/");

      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }, 50);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link
          to="/"
          className="logo-link"
          onClick={handleLogoClick}
        >
          <span className="logo-mark">
            F
          </span>

          <span className="logo-name">
            FinHabit
          </span>
        </Link>
      </div>

      <div className="navbar-links">
        <a href="/#features">
          Features
        </a>

        <a href="/#how-it-works">
          How It Works
        </a>

        <a href="/#benefits">
          Benefits
        </a>

        <Link
          to="/login"
          className="nav-login"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="nav-button"
        >
          Get Started
          <span>→</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;