import { Link, useLocation, useNavigate } from "react-router-dom";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: "◈" },
  { to: "/complaints", label: "Complaints", icon: "◎" },
  { to: "/ai-analysis", label: "AI Intelligence", icon: "✦" },
];

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

  if (!token) return null;

  return (
    <nav className="navbar pro-nav">
      <div className="nav-inner">
        <Link to="/dashboard" className="nav-brand">
          <span className="brand-logo">SC</span>
          <span className="brand-text">
            Smart<span>Complaint</span>
            <small>AI Civic Platform</small>
          </span>
        </Link>

        <div className="nav-links">
          {LINKS.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={location.pathname === to ? "active" : ""}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </Link>
          ))}
        </div>

        <div className="nav-user">
          <div className="user-avatar">{(user?.name || "U")[0].toUpperCase()}</div>
          <div className="user-meta">
            <span className="user-name">{user?.name || "User"}</span>
            <span className="user-email">{user?.email || ""}</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
