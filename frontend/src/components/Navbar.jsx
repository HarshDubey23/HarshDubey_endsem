import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => (location.pathname === path ? "active" : "");

  if (!token) return null;

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/dashboard" className="nav-brand">
          <span className="brand-icon">⚡</span>
          <span>
            Smart<span className="brand-highlight">Complaint</span> AI
          </span>
        </Link>

        <div className="nav-links">
          <Link to="/dashboard" className={isActive("/dashboard")}>
            Dashboard
          </Link>
          <Link to="/complaints" className={isActive("/complaints")}>
            Complaints
          </Link>
          <Link to="/ai-analysis" className={isActive("/ai-analysis")}>
            AI Analysis
          </Link>
        </div>

        <div className="nav-user">
          <span className="user-pill">{user?.name || "User"}</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
