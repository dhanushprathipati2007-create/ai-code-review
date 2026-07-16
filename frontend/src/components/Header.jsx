import { useEffect, useState } from "react";

function Header() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.body.classList.toggle(
      "dark-theme",
      theme === "dark"
    );

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light"
    );
  };

  const toggleSidebar = () => {
    const sidebar = document.querySelector(".sidebar");

    if (sidebar) {
      sidebar.classList.toggle("open");
    }
  };

  return (
    <header className="header">
      <div className="header-title">
        <h1>AI Code Review Assistant</h1>

        <p>
          Improve your code with intelligent automated
          analysis
        </p>
      </div>

      <div className="header-actions">
<button
  className="mobile-menu-btn"
  type="button"
  onClick={() => {
    document
      .querySelector(".sidebar")
      ?.classList.toggle("open");
  }}
>
  ☰
</button>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle Theme"
          title={`Switch to ${
            theme === "light"
              ? "dark"
              : "light"
          } mode`}
        >
          <span className="theme-toggle-icon">
            {theme === "light" ? "☾" : "☀"}
          </span>

          <span className="theme-toggle-text">
            {theme === "light"
              ? "Dark"
              : "Light"}
          </span>
        </button>

        <div className="header-user">
          <div className="user-avatar">
            {(user.name || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="user-details">
            <strong>
              {user.name || "User"}
            </strong>

            <span>Developer</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;