import {
  NavLink,
  useNavigate,
} from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-icon">
          {"</>"}
        </div>

        <div>
          <h2>CodeLens AI</h2>
          <span>AI Code Intelligence</span>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-label">
          WORKSPACE
        </p>

        <nav className="nav-menu">
          <NavLink to="/dashboard">
            <span className="nav-icon">⌂</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/review/new">
            <span className="nav-icon">✦</span>
            <span>New Review</span>
          </NavLink>

          <NavLink to="/upload">
            <span className="nav-icon">⇧</span>
            <span>Upload File</span>
          </NavLink>

          <NavLink to="/history">
            <span className="nav-icon">◷</span>
            <span>Review History</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="ai-status">
          <span className="status-dot"></span>

          <div>
            <strong>AI Engine</strong>
            <p>Systems operational</p>
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          <span>↪</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;