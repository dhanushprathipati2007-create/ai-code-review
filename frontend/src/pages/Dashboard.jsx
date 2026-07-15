import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [stats, setStats] = useState({
    total_reviews: 0,
    issues_found: 0,
    critical_issues: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/reviews/stats/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats(response.data);
      } catch (error) {
        console.error(
          "Failed to load dashboard stats:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">
            DEVELOPER WORKSPACE
          </span>

          <h2>
            Welcome back,{" "}
            {user.name || "Developer"}
          </h2>

          <p>
            Analyze code quality, discover issues,
            and improve your software with
            AI-powered insights.
          </p>
        </div>

        <button
          className="dashboard-primary-button"
          onClick={() => navigate("/review/new")}
        >
          <span>＋</span>
          Start New Review
        </button>
      </section>

      <section className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-icon blue">
              {"</>"}
            </span>

            <span className="dashboard-stat-label">
              ALL TIME
            </span>
          </div>

          <div className="dashboard-stat-value">
            {loading ? "..." : stats.total_reviews}
          </div>

          <h3>Total Reviews</h3>

          <p>
            Code analyses completed in your workspace.
          </p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-icon amber">
              !
            </span>

            <span className="dashboard-stat-label">
              DETECTED
            </span>
          </div>

          <div className="dashboard-stat-value">
            {loading ? "..." : stats.issues_found}
          </div>

          <h3>Issues Found</h3>

          <p>
            Potential bugs and quality issues identified.
          </p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-icon red">
              ×
            </span>

            <span className="dashboard-stat-label">
              HIGH PRIORITY
            </span>
          </div>

          <div className="dashboard-stat-value">
            {loading ? "..." : stats.critical_issues}
          </div>

          <h3>Critical Issues</h3>

          <p>
            Critical findings requiring attention.
          </p>
        </div>
      </section>

      <div className="dashboard-content-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-section-label">
                QUICK ACTIONS
              </span>

              <h3>Start analyzing code</h3>
            </div>
          </div>

          <div className="dashboard-actions-grid">
            <button
              className="dashboard-action-card"
              onClick={() =>
                navigate("/review/new")
              }
            >
              <span className="action-card-icon">
                {"</>"}
              </span>

              <div>
                <strong>Paste Source Code</strong>

                <p>
                  Paste a code snippet directly into
                  the editor for instant analysis.
                </p>
              </div>

              <span className="action-arrow">→</span>
            </button>

            <button
              className="dashboard-action-card"
              onClick={() => navigate("/upload")}
            >
              <span className="action-card-icon">
                ↑
              </span>

              <div>
                <strong>Upload Source File</strong>

                <p>
                  Upload JavaScript, Python, Java,
                  C, C++, or TypeScript files.
                </p>
              </div>

              <span className="action-arrow">→</span>
            </button>
          </div>
        </section>

        <aside className="dashboard-panel dashboard-insight-panel">
          <span className="dashboard-section-label">
            AI CODE INTELLIGENCE
          </span>

          <h3>What gets analyzed?</h3>

          <div className="analysis-capability">
            <span>01</span>
            <div>
              <strong>Static Analysis</strong>
              <p>
                Detect potential bugs and code issues.
              </p>
            </div>
          </div>

          <div className="analysis-capability">
            <span>02</span>
            <div>
              <strong>AI Review</strong>
              <p>
                Receive intelligent improvement suggestions.
              </p>
            </div>
          </div>

          <div className="analysis-capability">
            <span>03</span>
            <div>
              <strong>Complexity Analysis</strong>
              <p>
                Measure functions, classes, and code smells.
              </p>
            </div>
          </div>

          <button
            className="view-history-link"
            onClick={() => navigate("/history")}
          >
            View review history →
          </button>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;