import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ReviewHistory() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [status, setStatus] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/reviews", {
        params: {
          search,
          language,
          status,
        },
      });

      setReviews(response.data);
    } catch (error) {
      console.error("Failed to load reviews:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load review history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, language, status]);

  const handleDelete = async (
    reviewId,
    projectName
  ) => {
    const confirmed = window.confirm(
      `Delete the review for "${projectName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/reviews/${reviewId}`);

      setReviews((currentReviews) =>
        currentReviews.filter(
          (review) => review.id !== reviewId
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete review:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete review."
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setLanguage("");
    setStatus("");
  };

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  return (
    <div className="professional-history-page">

      {/* PAGE HEADER */}
      <div className="review-history-page-header">
        <div className="review-history-heading">
          <span className="page-eyebrow">
            REVIEW MANAGEMENT
          </span>

          <h1>Review History</h1>

          <p>
            Search, filter, view, and manage your
            previous AI-powered code reviews.
          </p>
        </div>

        <div className="review-history-header-action">
          <button
            type="button"
            className="review-history-new-button"
            onClick={() =>
              navigate("/review/new")
            }
          >
            <span className="new-review-plus">
              +
            </span>

            <span>New Review</span>
          </button>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="history-toolbar">
        <div className="history-search-box">
          <span className="history-search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search by project name..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={language}
          onChange={(event) =>
            setLanguage(event.target.value)
          }
        >
          <option value="">
            All Languages
          </option>

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

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >
          <option value="">
            All Statuses
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="analyzing">
            Analyzing
          </option>
        </select>

        <button
          type="button"
          className="history-clear-button"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* RESULTS COUNT */}
      <div className="history-results-header">
        <span>
          {loading
            ? "Loading reviews..."
            : `${reviews.length} review${
                reviews.length === 1
                  ? ""
                  : "s"
              } found`}
        </span>
      </div>

      {/* ERROR STATE */}
      {error ? (
        <div className="history-state-card history-error-state">
          <div className="history-state-icon">
            !
          </div>

          <h3>Unable to load reviews</h3>

          <p>{error}</p>

          <button
            type="button"
            className="review-history-new-button"
            onClick={fetchReviews}
          >
            Try Again
          </button>
        </div>
      ) : loading ? (

        /* LOADING STATE */
        <div className="history-state-card">
          <div className="history-loader"></div>

          <h3>Loading review history</h3>

          <p>
            Retrieving your previous code
            analysis reports.
          </p>
        </div>
      ) : reviews.length === 0 ? (

        /* EMPTY STATE */
        <div className="history-state-card">
          <div className="history-state-icon">
            {"</>"}
          </div>

          <h3>No reviews found</h3>

          <p>
            Create a new code review or adjust
            your search filters.
          </p>

          <button
            type="button"
            className="review-history-new-button"
            onClick={() =>
              navigate("/review/new")
            }
          >
            + Create New Review
          </button>
        </div>
      ) : (

        /* REVIEW LIST */
        <div className="professional-history-list">
          {reviews.map((review) => (
            <div
              className="professional-history-card"
              key={review.id}
            >
              <div className="history-card-main">
                <div className="history-project-icon">
                  {"</>"}
                </div>

                <div className="history-project-content">
                  <div className="history-project-title-row">
                    <h3>
                      {review.project_name}
                    </h3>

                    <span
                      className={`review-status ${
                        review.status || ""
                      }`}
                    >
                      {review.status ||
                        "Unknown"}
                    </span>
                  </div>

                  <div className="history-metadata">
                    <span className="history-language-badge">
                      {review.language ||
                        "Unknown"}
                    </span>

                    <span>
                      {formatDate(
                        review.created_at
                      )}
                    </span>
                  </div>

                  <p className="history-review-summary">
                    {review.summary ||
                      "No analysis summary available."}
                  </p>
                </div>
              </div>

              <div className="history-card-actions">
                <button
                  type="button"
                  className="history-view-button"
                  onClick={() =>
                    navigate(
                      `/reviews/${review.id}`
                    )
                  }
                >
                  View Report →
                </button>

                <button
                  type="button"
                  className="history-delete-button"
                  onClick={() =>
                    handleDelete(
                      review.id,
                      review.project_name
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewHistory;