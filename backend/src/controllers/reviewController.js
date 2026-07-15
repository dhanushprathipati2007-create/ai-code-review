const pool = require("../config/db");

const {
  runStaticAnalysis,
} = require("../services/staticAnalysisService");

const {
  runAIReview,
} = require("../services/aiReviewService");

const {
  analyzeComplexity,
} = require("../services/complexityAnalysisService");

const {
  generateDocumentation,
} = require("../services/documentationService");

// CREATE NEW CODE REVIEW
exports.createReview = async (req, res) => {
  const client = await pool.connect();

  try {
    const { projectName, sourceCode, language } = req.body;
    const userId = req.user.id;

const supportedLanguages = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
];

if (
  !projectName?.trim() ||
  !sourceCode?.trim() ||
  !language?.trim()
) {
  return res.status(400).json({
    message:
      "Project name, source code, and language are required",
  });
}

if (projectName.trim().length > 100) {
  return res.status(400).json({
    message:
      "Project name must not exceed 100 characters",
  });
}

if (!supportedLanguages.includes(language.toLowerCase())) {
  return res.status(400).json({
    message: "Unsupported programming language",
  });
}

if (sourceCode.length > 500000) {
  return res.status(400).json({
    message:
      "Source code is too large. Maximum size is 500 KB.",
  });
}

    await client.query("BEGIN");

    // Create project
    const projectResult = await client.query(
      `INSERT INTO projects (user_id, project_name)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, projectName]
    );

    const project = projectResult.rows[0];

    // Create review
    const reviewResult = await client.query(
      `INSERT INTO reviews
       (
         project_id,
         review_type,
         source_code,
         language,
         status
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        project.id,
        "static_analysis",
        sourceCode,
        language,
        "analyzing",
      ]
    );

    const review = reviewResult.rows[0];

    // Run static analysis
    const findings = await runStaticAnalysis(
      language,
      sourceCode
    );

    // Run complexity analysis
    const complexityResult = analyzeComplexity(
      language,
      sourceCode
    );

    // Generate documentation
    const documentationResult = generateDocumentation(
      sourceCode
    );

    const {
      functionDocumentation,
      classDocumentation,
      apiDocumentation,
    } = documentationResult;

    // Run AI review
    let aiReview;

    try {
      aiReview = await runAIReview(
        language,
        sourceCode
      );
    } catch (error) {
      console.error(
        "AI Review Error:",
        error.message
      );

      aiReview =
        "AI review is temporarily unavailable. Static analysis completed successfully.";
    }

    // Save findings
    for (const finding of findings) {
      await client.query(
        `INSERT INTO review_findings
        (
          review_id,
          severity,
          issue,
          explanation,
          suggested_fix,
          file_name,
          line_number
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          review.id,
          finding.severity,
          finding.issue,
          finding.explanation,
          finding.suggestedFix,
          finding.fileName,
          finding.lineNumber,
        ]
      );
    }

    // Update review with all analysis results
    await client.query(
      `UPDATE reviews
       SET status = $1,
           summary = $2,
           ai_review = $3,
           cyclomatic_complexity = $4,
           function_complexity = $5,
           file_complexity = $6,
           number_of_functions = $7,
           number_of_classes = $8,
           lines_of_code = $9,
           code_smells = $10,
           function_documentation = $11,
           class_documentation = $12,
           api_documentation = $13
       WHERE id = $14`,
      [
        "completed",
        `Code analysis completed with ${findings.length} static finding(s) and ${complexityResult.codeSmells.length} code smell(s).`,
        aiReview,
        complexityResult.cyclomaticComplexity,
        JSON.stringify(
          complexityResult.functionComplexity
        ),
        complexityResult.fileComplexity,
        complexityResult.numberOfFunctions,
        complexityResult.numberOfClasses,
        complexityResult.linesOfCode,
        JSON.stringify(
          complexityResult.codeSmells
        ),
        JSON.stringify(functionDocumentation),
        JSON.stringify(classDocumentation),
        JSON.stringify(apiDocumentation),
        review.id,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message:
        "Code review completed successfully",
      reviewId: review.id,
      findingsCount: findings.length,
      findings,
      aiReview,
      complexity: complexityResult,
      documentation: documentationResult,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Code Review Error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Code analysis failed",
    });
  } finally {
    client.release();
  }
};

// GET ALL REVIEWS
exports.getReviews = async (req, res) => {
  try {
    const {
      search = "",
      language = "",
      status = "",
    } = req.query;

    const result = await pool.query(
      `SELECT
         r.id,
         r.review_type,
         r.language,
         r.status,
         r.overall_score,
         r.summary,
         r.created_at,
         p.project_name
       FROM reviews r
       JOIN projects p
         ON r.project_id = p.id
       WHERE p.user_id = $1
         AND (
           $2 = ''
           OR p.project_name ILIKE '%' || $2 || '%'
         )
         AND (
           $3 = ''
           OR LOWER(r.language) = LOWER($3)
         )
         AND (
           $4 = ''
           OR LOWER(r.status) = LOWER($4)
         )
       ORDER BY r.created_at DESC`,
      [
        req.user.id,
        search,
        language,
        status,
      ]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Get Reviews Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET SINGLE REVIEW
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const reviewResult = await pool.query(
      `SELECT
         r.id,
         r.review_type,
         r.language,
         r.status,
         r.overall_score,
         r.summary,
         r.ai_review,
         r.cyclomatic_complexity,
         r.function_complexity,
         r.file_complexity,
         r.number_of_functions,
         r.number_of_classes,
         r.lines_of_code,
         r.code_smells,
         r.function_documentation,
         r.class_documentation,
         r.api_documentation,
         r.created_at,
         p.project_name
       FROM reviews r
       JOIN projects p
         ON r.project_id = p.id
       WHERE r.id = $1
         AND p.user_id = $2`,
      [id, req.user.id]
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    const findingsResult = await pool.query(
      `SELECT
         id,
         severity,
         issue,
         explanation,
         suggested_fix,
         file_name,
         line_number
       FROM review_findings
       WHERE review_id = $1
       ORDER BY
         CASE
           WHEN severity = 'error' THEN 1
           WHEN severity = 'warning' THEN 2
           ELSE 3
         END,
         line_number ASC`,
      [id]
    );

    res.json({
      review: reviewResult.rows[0],
      findings: findingsResult.rows,
    });
  } catch (error) {
    console.error(
      "Get Review Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.deleteReview = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    await client.query("BEGIN");

    const reviewResult = await client.query(
      `SELECT
         r.id,
         r.project_id
       FROM reviews r
       JOIN projects p
         ON r.project_id = p.id
       WHERE r.id = $1
         AND p.user_id = $2`,
      [id, userId]
    );

    if (reviewResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Review not found",
      });
    }

    const projectId =
      reviewResult.rows[0].project_id;

    // Delete findings first
    await client.query(
      `DELETE FROM review_findings
       WHERE review_id = $1`,
      [id]
    );

    // Delete review
    await client.query(
      `DELETE FROM reviews
       WHERE id = $1`,
      [id]
    );

    // Delete project if it has no remaining reviews
    await client.query(
      `DELETE FROM projects
       WHERE id = $1
         AND user_id = $2
         AND NOT EXISTS (
           SELECT 1
           FROM reviews
           WHERE project_id = $1
         )`,
      [projectId, userId]
    );

    await client.query("COMMIT");

    res.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Delete Review Error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete review",
    });
  } finally {
    client.release();
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
        COUNT(DISTINCT r.id)::int AS total_reviews,

        COUNT(rf.id)::int AS issues_found,

        COUNT(
          CASE
            WHEN LOWER(rf.severity) = 'error'
            THEN 1
          END
        )::int AS critical_issues

       FROM projects p

       LEFT JOIN reviews r
         ON r.project_id = p.id

       LEFT JOIN review_findings rf
         ON rf.review_id = r.id

       WHERE p.user_id = $1`,
      [userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(
      "Dashboard Stats Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load dashboard statistics",
    });
  }
};