import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import API from "../services/api";

function ReviewResults() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/reviews/${id}`);

        setReview(response.data.review);
        setFindings(response.data.findings || []);
      } catch (error) {
        console.error("Failed to load review:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load the analysis report."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  if (loading) {
    return (
      <div className="report-state-card">
        <div className="report-loader"></div>
        <h3>Loading analysis report</h3>
        <p>Retrieving your code quality results...</p>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="report-state-card">
        <div className="report-state-icon">!</div>
        <h3>Unable to load report</h3>
        <p>{error || "Review not found."}</p>

        <button
          className="report-primary-button"
          onClick={() => navigate("/history")}
        >
          Back to Review History
        </button>
      </div>
    );
  }

  const errors = findings.filter(
    (finding) =>
      finding.severity?.toLowerCase() === "error"
  ).length;

  const warnings = findings.filter(
    (finding) =>
      finding.severity?.toLowerCase() === "warning"
  ).length;

  const info = findings.filter(
    (finding) =>
      finding.severity?.toLowerCase() === "info"
  ).length;

  const codeSmells = Array.isArray(review.code_smells)
    ? review.code_smells
    : [];

  const functionComplexity = Array.isArray(
    review.function_complexity
  )
    ? review.function_complexity
    : [];

  const functionDocumentation = Array.isArray(
    review.function_documentation
  )
    ? review.function_documentation
    : [];

  const classDocumentation = Array.isArray(
    review.class_documentation
  )
    ? review.class_documentation
    : [];

  const apiDocumentation = Array.isArray(
    review.api_documentation
  )
    ? review.api_documentation
    : [];

  return (
    <div className="professional-results-page">
      {/* Report Header */}
      <div className="report-header">
        <div>
          <button
            className="report-back-button"
            onClick={() => navigate("/history")}
          >
            ← Back to Review History
          </button>

          <span className="page-eyebrow">
            AI CODE ANALYSIS REPORT
          </span>

          <h1>{review.project_name}</h1>

          <div className="report-header-meta">
            <span className="report-language-badge">
              {review.language}
            </span>

            <span
              className={`review-status ${
                review.status || "completed"
              }`}
            >
              {review.status || "completed"}
            </span>

            {review.created_at && (
              <span>
                {new Date(
                  review.created_at
                ).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="report-score-panel">
          <span>Issues Detected</span>
          <strong>{findings.length}</strong>
          <small>
            {errors === 0
              ? "No critical errors"
              : `${errors} error${
                  errors === 1 ? "" : "s"
                } require attention`}
          </small>
        </div>
      </div>

      {/* Issue Overview */}
      <section className="report-section">
        <div className="report-section-heading">
          <div>
            <span className="section-eyebrow">
              OVERVIEW
            </span>
            <h2>Analysis Overview</h2>
          </div>
        </div>

        <div className="professional-summary-grid">
          <div className="professional-summary-card total">
            <div className="summary-icon">Σ</div>
            <div>
              <span>Total Issues</span>
              <strong>{findings.length}</strong>
            </div>
          </div>

          <div className="professional-summary-card error">
            <div className="summary-icon">!</div>
            <div>
              <span>Errors</span>
              <strong>{errors}</strong>
            </div>
          </div>

          <div className="professional-summary-card warning">
            <div className="summary-icon">△</div>
            <div>
              <span>Warnings</span>
              <strong>{warnings}</strong>
            </div>
          </div>

          <div className="professional-summary-card info">
            <div className="summary-icon">i</div>
            <div>
              <span>Information</span>
              <strong>{info}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Summary */}
      <section className="report-section">
        <div className="report-content-card report-summary-card">
          <div className="report-card-heading">
            <div className="report-card-icon">◎</div>

            <div>
              <span className="section-eyebrow">
                EXECUTIVE SUMMARY
              </span>
              <h2>Analysis Summary</h2>
            </div>
          </div>

          <p>
            {review.summary ||
              "No analysis summary is available."}
          </p>
        </div>
      </section>

      {/* AI Review */}
      {review.ai_review && (
        <section className="report-section">
          <div className="report-section-heading">
            <div>
              <span className="section-eyebrow">
                AI INSIGHTS
              </span>
              <h2>AI Analysis Report</h2>
            </div>
          </div>

          <div className="professional-ai-review">
            <div className="ai-review-banner">
              <div className="ai-review-icon">AI</div>

              <div>
                <strong>
                  Intelligent Code Analysis
                </strong>
                <p>
Powered by Google Gemini 2.5 Flash • Security • Performance • Maintainability • Best Practices
                </p>
              </div>
            </div>

            <div className="ai-review-content">
              <ReactMarkdown>
                {review.ai_review}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      )}

      {/* Complexity */}
      <section className="report-section">
        <div className="report-section-heading">
          <div>
            <span className="section-eyebrow">
              CODE METRICS
            </span>
            <h2>Complexity Analysis</h2>
          </div>
        </div>

        <div className="professional-complexity-grid">
          <MetricCard
            label="Cyclomatic Complexity"
            value={
              review.cyclomatic_complexity ?? 1
            }
          />

          <MetricCard
            label="File Complexity"
            value={
              review.file_complexity || "Low"
            }
          />

          <MetricCard
            label="Functions"
            value={
              review.number_of_functions ?? 0
            }
          />

          <MetricCard
            label="Classes"
            value={
              review.number_of_classes ?? 0
            }
          />

          <MetricCard
            label="Lines of Code"
            value={review.lines_of_code ?? 0}
          />

          <MetricCard
            label="Code Smells"
            value={codeSmells.length}
          />
        </div>
      </section>

      {/* Function Complexity */}
      <section className="report-section">
        <div className="report-section-heading">
          <div>
            <span className="section-eyebrow">
              FUNCTION METRICS
            </span>
            <h2>Function Complexity</h2>
          </div>
        </div>

        {functionComplexity.length === 0 ? (
          <EmptyState message="No functions detected." />
        ) : (
          <div className="function-metrics-list">
            {functionComplexity.map(
              (func, index) => (
                <div
                  className="professional-function-card"
                  key={index}
                >
                  <div>
                    <span className="function-number">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <strong>
                      {func.functionName ||
                        `Function ${index + 1}`}
                    </strong>
                  </div>

                  <span className="complexity-value">
                    Complexity{" "}
                    <strong>
                      {func.complexity ?? 1}
                    </strong>
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* Code Findings */}
      <section className="report-section">
        <div className="report-section-heading">
          <div>
            <span className="section-eyebrow">
              STATIC ANALYSIS
            </span>
            <h2>Static Analysis Findings</h2>
          </div>

          <span className="section-count">
            {findings.length} findings
          </span>
        </div>

        {findings.length === 0 ? (
          <div className="success-empty-state">
            <div className="success-state-icon">
              ✓
            </div>

            <div>
              <h3>No static analysis issues found</h3>
              <p>
                Your code passed the configured static
                analysis checks.
              </p>
            </div>
          </div>
        ) : (
          <div className="professional-findings-list">
            {findings.map(
              (finding, index) => (
                <div
                  className={`professional-finding-card ${
                    finding.severity || "info"
                  }`}
                  key={finding.id || index}
                >
                  <div className="finding-severity-bar"></div>

                  <div className="finding-card-content">
                    <div className="finding-top">
                      <span
                        className={`severity ${
                          finding.severity ||
                          "info"
                        }`}
                      >
                        {finding.severity ||
                          "info"}
                      </span>

                      <span className="line-number">
                        {finding.file_name ||
                          "Source Code"}

                        {finding.line_number
                          ? ` • Line ${finding.line_number}`
                          : ""}
                      </span>
                    </div>

                    <h3>{finding.issue}</h3>

                    <p>
                      {finding.explanation}
                    </p>

                    {finding.suggested_fix && (
                      <div className="professional-suggested-fix">
                        <span>
                          SUGGESTED FIX
                        </span>

                        <p>
                          {
                            finding.suggested_fix
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* Code Smells */}
      <section className="report-section">
        <div className="report-section-heading">
          <div>
            <span className="section-eyebrow">
              MAINTAINABILITY
            </span>
            <h2>Code Smells</h2>
          </div>

          <span className="section-count">
            {codeSmells.length} detected
          </span>
        </div>

        {codeSmells.length === 0 ? (
          <EmptyState message="No code smells detected." />
        ) : (
          <div className="professional-smells-grid">
            {codeSmells.map(
              (smell, index) => (
                <div
                  className="professional-smell-card"
                  key={index}
                >
                  <div className="smell-card-header">
                    <span
                      className={`severity ${
                        smell.severity || "info"
                      }`}
                    >
                      {smell.severity ||
                        "info"}
                    </span>
                  </div>

                  <h3>
                    {smell.type ||
                      "Code Smell"}
                  </h3>

                  <p>{smell.description}</p>

                  {smell.suggestion && (
                    <div className="professional-suggested-fix">
                      <span>
                        RECOMMENDATION
                      </span>

                      <p>
                        {smell.suggestion}
                      </p>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* Documentation */}
      <section className="report-section">
        <div className="report-section-heading">
          <div>
            <span className="section-eyebrow">
              AUTO-GENERATED
            </span>
            <h2>AI Generated Documentation</h2>
          </div>
        </div>

        <DocumentationGroup
          title="Functions"
          items={functionDocumentation}
          emptyMessage="No functions documented."
          renderItem={(func) => (
            <>
              <h3>{func.name}</h3>
              <p>{func.description}</p>

              <div className="documentation-meta">
                <strong>Parameters</strong>
                <span>
                  {func.parameters?.length
                    ? func.parameters.join(", ")
                    : "No parameters"}
                </span>
              </div>
            </>
          )}
        />

        <DocumentationGroup
          title="Classes"
          items={classDocumentation}
          emptyMessage="No classes documented."
          renderItem={(classDoc) => (
            <>
              <h3>{classDoc.name}</h3>
              <p>{classDoc.description}</p>
            </>
          )}
        />

        <DocumentationGroup
          title="API Endpoints"
          items={apiDocumentation}
          emptyMessage="No API endpoints detected."
          renderItem={(api) => (
            <>
              <div className="api-heading">
                <span className="api-method">
                  {api.method}
                </span>

                <strong>
                  {api.endpoint}
                </strong>
              </div>

              <p>{api.description}</p>
            </>
          )}
        />
      </section>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="professional-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="professional-empty-state">
      <span>✓</span>
      <p>{message}</p>
    </div>
  );
}

function DocumentationGroup({
  title,
  items,
  emptyMessage,
  renderItem,
}) {
  return (
    <div className="documentation-group">
      <div className="documentation-group-header">
        <h3>{title}</h3>

        <span>{items.length}</span>
      </div>

      {items.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="professional-documentation-grid">
          {items.map((item, index) => (
            <div
              className="professional-documentation-card"
              key={index}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewResults;