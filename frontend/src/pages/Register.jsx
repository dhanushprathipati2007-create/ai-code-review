import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("error");
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
        "/auth/register",
        formData
      );

      setMessageType("success");
      setMessage(
        response.data.message ||
          "Account created successfully."
      );

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (error) {
      setMessageType("error");

      setMessage(
        error.response?.data?.message ||
          "Unable to create account. Please try again."
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
              BUILD. REVIEW. IMPROVE.
            </span>

            <h1>
              Turn every review into
              <span> better engineering.</span>
            </h1>

            <p>
              Create your developer workspace and use
              intelligent analysis to improve code quality,
              maintainability, and reliability.
            </p>

            <div className="auth-features">
              <div className="auth-feature">
                <span>✓</span>
                Find bugs and potential issues
              </div>

              <div className="auth-feature">
                <span>✓</span>
                Generate technical documentation
              </div>

              <div className="auth-feature">
                <span>✓</span>
                Track and manage review history
              </div>
            </div>
          </div>

          <p className="auth-brand-footer">
            Intelligent code analysis for modern development.
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
                GET STARTED
              </span>

              <h2>Create your account</h2>

              <p>
                Set up your workspace and start reviewing
                code with AI.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

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
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              {message && (
                <div
                  className={`auth-message ${
                    messageType === "success"
                      ? "auth-success"
                      : "auth-error"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                className="auth-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : "Create developer account"}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account?{" "}
              <Link to="/">Sign in</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Register;