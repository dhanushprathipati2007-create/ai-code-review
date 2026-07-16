import {
  NavLink,
  useNavigate,
} from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const closeSidebar = () => {
    if (window.innerWidth <= 900) {
      document
        .querySelector(".sidebar")
        ?.classList.remove("open");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    closeSidebar();

    navigate("/");
  };

  return (
    <>
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
            <NavLink
              to="/dashboard"
              onClick={closeSidebar}
            >
              <span className="nav-icon">⌂</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/review/new"
              onClick={closeSidebar}
            >
              <span className="nav-icon">✦</span>
              <span>New Review</span>
            </NavLink>

            <NavLink
              to="/upload"
              onClick={closeSidebar}
            >
              <span className="nav-icon">⇧</span>
              <span>Upload File</span>
            </NavLink>

            <NavLink
              to="/history"
              onClick={closeSidebar}
            >
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

      <div
        className="sidebar-overlay"
        onClick={closeSidebar}
      ></div>
    </>
  );
}

export default Sidebar;