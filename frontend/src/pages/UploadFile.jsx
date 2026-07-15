import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function UploadFile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 500 * 1024;

  const [projectName, setProjectName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allowedExtensions = [
    "js",
    "jsx",
    "ts",
    "tsx",
    "py",
    "java",
    "c",
    "cpp",
  ];

  const languageMap = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
  };

  const validateFile = (file) => {
    if (!file) return;

    setError("");

    const extension = file.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setSelectedFile(null);
      setError(
        "Unsupported file type. Please select a valid source-code file."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setError(
        "File is too large. Maximum allowed size is 500 KB."
      );
      return;
    }

    setSelectedFile(file);

    if (!projectName.trim()) {
      setProjectName(
        file.name.replace(/\.[^/.]+$/, "")
      );
    }
  };

  const handleFileChange = (event) => {
    validateFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    if (loading) return;

    validateFile(event.dataTransfer.files[0]);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setError("");

    if (!projectName.trim()) {
      setError("Please enter a project name.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a source-code file.");
      return;
    }

    try {
      setLoading(true);

      const extension = selectedFile.name
        .split(".")
        .pop()
        .toLowerCase();

      const language = languageMap[extension];

      const sourceCode =
        await selectedFile.text();

      if (!sourceCode.trim()) {
        setError("The selected file is empty.");
        return;
      }

      const response = await API.post(
        "/reviews",
        {
          projectName: projectName.trim(),
          sourceCode,
          language,
        }
      );

      navigate(
        `/reviews/${response.data.reviewId}`
      );
    } catch (error) {
      console.error(
        "File review failed:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to analyze the uploaded file."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="professional-upload-page">
      <div className="professional-page-header">
        <div>
          <span className="page-eyebrow">
            SOURCE ANALYSIS
          </span>

          <h1>Upload Source File</h1>

          <p>
            Upload a source-code file and receive
            automated static analysis, complexity
            insights, documentation, and AI-powered
            recommendations.
          </p>
        </div>

        <button
          type="button"
          className="secondary-action-button"
          onClick={() =>
            navigate("/review/new")
          }
        >
          Paste Code Instead
        </button>
      </div>

      <form
        className="professional-upload-card"
        onSubmit={handleUpload}
      >
        <div className="upload-project-section">
          <div className="review-input-group">
            <label>Project Name</label>

            <input
              type="text"
              value={projectName}
              onChange={(event) =>
                setProjectName(
                  event.target.value
                )
              }
              placeholder="Example: Authentication Service"
              disabled={loading}
            />
          </div>
        </div>

        <div className="upload-content-section">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden-file-input"
            accept=".js,.jsx,.ts,.tsx,.py,.java,.c,.cpp"
            onChange={handleFileChange}
            disabled={loading}
          />

          {!selectedFile ? (
            <div
              className="professional-drop-zone"
              onClick={() =>
                fileInputRef.current?.click()
              }
              onDragOver={(event) =>
                event.preventDefault()
              }
              onDrop={handleDrop}
            >
              <div className="upload-icon">
                ↑
              </div>

              <h3>Drop your source file here</h3>

              <p>
                Drag and drop a file, or click
                to browse your computer.
              </p>

              <button
                type="button"
                className="browse-file-button"
              >
                Browse Files
              </button>

              <span className="upload-file-types">
                JS, JSX, TS, TSX, Python,
                Java, C and C++ · Max 500 KB
              </span>
            </div>
          ) : (
            <div className="professional-selected-file">
              <div className="selected-file-icon">
                {"</>"}
              </div>

              <div className="selected-file-details">
                <strong>
                  {selectedFile.name}
                </strong>

                <span>
                  {formatFileSize(
                    selectedFile.size
                  )}
                </span>
              </div>

              <div className="file-ready-status">
                Ready for analysis
              </div>

              <button
                type="button"
                className="remove-file-button"
                onClick={handleRemoveFile}
                disabled={loading}
              >
                Remove
              </button>
            </div>
          )}

          {error && (
            <div className="review-error-message">
              <strong>Upload Error</strong>
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="upload-analysis-info">
          <div>
            <strong>What will be analyzed?</strong>

            <p>
              Bugs · Code Quality · Complexity ·
              Code Smells · AI Recommendations ·
              Documentation
            </p>
          </div>
        </div>

        <div className="professional-review-footer">
          <div className="analysis-features">
            Your source code is analyzed securely
            through the review engine.
          </div>

          <div className="professional-review-actions">
            <button
              type="button"
              className="secondary-action-button"
              onClick={() =>
                navigate("/dashboard")
              }
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-action-button"
              disabled={
                loading || !selectedFile
              }
            >
              {loading
                ? "Analyzing File..."
                : "Upload & Run Analysis →"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default UploadFile;