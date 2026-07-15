import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (message) {
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await API.post(
        "/auth/login",
        formData
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-brand">
        <div className="auth-brand-content">
          <div className="auth-product-logo">
            <span className="auth-product-icon">
              {"</>"}
            </span>

            <span>AI Code Reviewer</span>
          </div>

          <div className="auth-hero-content">
            <span className="auth-badge">
              AI-POWERED CODE INTELLIGENCE
            </span>

            <h1>
              Ship better code
              <span> with confidence.</span>
            </h1>

            <p>
              Detect bugs, analyze complexity, identify
              code smells, and receive intelligent
              recommendations before your code reaches
              production.
            </p>

            <div className="auth-features">
              <div className="auth-feature">
                <span>✓</span>
                Automated static code analysis
              </div>

              <div className="auth-feature">
                <span>✓</span>
                AI-powered improvement suggestions
              </div>

              <div className="auth-feature">
                <span>✓</span>
                Complexity and code quality insights
              </div>
            </div>
          </div>

          <p className="auth-brand-footer">
            Built for developers who care about code quality.
          </p>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-wrapper">
          <div className="auth-mobile-logo">
            <span>{"</>"}</span>
            AI Code Reviewer
          </div>

          <div className="auth-card">
            <div className="auth-card-header">
              <span className="auth-card-label">
                WELCOME BACK
              </span>

              <h2>Sign in to your account</h2>

              <p>
                Continue to your AI-powered code review
                workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="developer@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>

              {message && (
                <div className="auth-message auth-error">
                  {message}
                </div>
              )}

              <button
                className="auth-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Sign in to workspace"}
              </button>
            </form>

            <p className="auth-footer">
              New to AI Code Reviewer?{" "}
              <Link to="/register">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;