import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function NewReview() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectName: "",
    language: "javascript",
    sourceCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.projectName.trim()) {
      setError("Please enter a project name.");
      return;
    }

    if (!formData.sourceCode.trim()) {
      setError("Please paste source code to analyze.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await API.post(
        "/reviews",
        formData
      );

      navigate(
        `/reviews/${response.data.reviewId}`
      );
    } catch (error) {
      console.error(
        "Failed to analyze code:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to analyze code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const lineCount =
    formData.sourceCode.length === 0
      ? 0
      : formData.sourceCode.split("\n").length;

  return (
    <div className="new-review-page">
      <div className="review-page-heading">
        <div>
          <span className="page-eyebrow">
            AI CODE ANALYSIS
          </span>

          <h2>Analyze your source code</h2>

          <p>
            Paste your code below to detect bugs,
            code smells, complexity issues, and
            optimization opportunities.
          </p>
        </div>
      </div>

      <form
        className="professional-review-form"
        onSubmit={handleSubmit}
      >
        <div className="review-config-section">
          <div className="review-field">
            <label>Project Name</label>

            <input
              type="text"
              name="projectName"
              placeholder="e.g. Authentication Service"
              value={formData.projectName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="review-field">
            <label>Programming Language</label>

            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="javascript">
                JavaScript
              </option>

              <option value="typescript">
                TypeScript
              </option>

              <option value="python">
                Python
              </option>

              <option value="java">
                Java
              </option>

              <option value="cpp">
                C++
              </option>

              <option value="c">
                C
              </option>
            </select>
          </div>
        </div>

        <div className="code-workspace">
          <div className="code-workspace-header">
            <div className="editor-file-info">
              <span className="editor-status-dot"></span>

              <span>
                {formData.projectName.trim() ||
                  "untitled"}
              </span>
            </div>

            <div className="editor-meta">
              <span>
                {formData.language}
              </span>

              <span>
                {lineCount}{" "}
                {lineCount === 1
                  ? "line"
                  : "lines"}
              </span>
            </div>
          </div>

          <textarea
            className="professional-code-editor"
            name="sourceCode"
            placeholder={`// Paste your source code here...

function example() {
  console.log("Ready for AI analysis");
}`}
            value={formData.sourceCode}
            onChange={handleChange}
            spellCheck="false"
            disabled={loading}
          />

          <div className="code-workspace-footer">
            <span>
              AI-powered static analysis
            </span>

            <span>
              Maximum recommended size: 500 KB
            </span>
          </div>
        </div>

        {error && (
          <div className="review-error-message">
            <span>!</span>
            {error}
          </div>
        )}

        <div className="professional-review-actions">
          <button
            type="button"
            className="secondary-review-button"
            onClick={() =>
              navigate("/dashboard")
            }
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="analyze-code-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Analyzing Code...
              </>
            ) : (
              <>
                <span>✦</span>
                Run AI Analysis
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewReview;