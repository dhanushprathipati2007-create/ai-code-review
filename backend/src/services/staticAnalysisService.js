const { ESLint } = require("eslint");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const tempDirectory = path.join(__dirname, "../../temp");

if (!fs.existsSync(tempDirectory)) {
  fs.mkdirSync(tempDirectory, { recursive: true });
}

const analyzeJavaScript = async (sourceCode) => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ["**/*.js"],
        languageOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
        },
        rules: {
          "no-unused-vars": "warn",
          "no-undef": "error",
          "no-unreachable": "error",
          "no-constant-condition": "warn",
          "eqeqeq": "warn",
        },
      },
    ],
  });

  const results = await eslint.lintText(sourceCode, {
    filePath: "code.js",
  });

  return results[0].messages.map((message) => ({
    severity: message.severity === 2 ? "error" : "warning",
    issue: message.ruleId || "JavaScript issue",
    explanation: message.message,
    suggestedFix: message.fix
      ? "ESLint can automatically fix this issue."
      : "Review and update the highlighted code.",
    fileName: "code.js",
    lineNumber: message.line || null,
  }));
};

const analyzePython = async (sourceCode) => {
  const fileName = `${crypto.randomUUID()}.py`;
  const filePath = path.join(tempDirectory, fileName);

  fs.writeFileSync(filePath, sourceCode);

  try {
    return await new Promise((resolve, reject) => {
      const process = spawn(
        "python",
        [
          "-m",
          "pylint",
          filePath,
          "--output-format=json",
        ],
        {
          windowsHide: true,
        }
      );

      let stdout = "";
      let stderr = "";

      process.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      process.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      process.on("error", reject);

      process.on("close", () => {
        try {
          const results = stdout ? JSON.parse(stdout) : [];

          const findings = results.map((item) => ({
            severity:
              item.type === "error" || item.type === "fatal"
                ? "error"
                : item.type === "warning"
                ? "warning"
                : "info",

            issue: item.symbol || item["message-id"],
            explanation: item.message,
            suggestedFix:
              "Review the Pylint recommendation and update the code.",
            fileName: "code.py",
            lineNumber: item.line || null,
          }));

          resolve(findings);
        } catch (error) {
          reject(
            new Error(
              stderr || "Failed to parse Pylint results"
            )
          );
        }
      });
    });
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

const analyzeTypeScript = async (sourceCode) => {
  const findings = [];

  if (sourceCode.includes("any")) {
    findings.push({
      severity: "warning",
      issue: "Avoid using any",
      explanation: "Using 'any' removes TypeScript type safety.",
      suggestedFix: "Use proper interfaces or types.",
      fileName: "code.ts",
      lineNumber: null,
    });
  }

  return findings;
};

const analyzeJava = async (sourceCode) => {
  const findings = [];

  if (sourceCode.includes("System.out.println")) {
    findings.push({
      severity: "warning",
      issue: "Console Logging",
      explanation:
        "Avoid using System.out.println in production code.",
      suggestedFix: "Use a logging framework like SLF4J.",
      fileName: "code.java",
      lineNumber: null,
    });
  }

  if (sourceCode.includes("catch(Exception")) {
    findings.push({
      severity: "warning",
      issue: "Generic Exception",
      explanation:
        "Catching generic Exception hides specific errors.",
      suggestedFix:
        "Catch specific exception types.",
      fileName: "code.java",
      lineNumber: null,
    });
  }

  return findings;
};

const analyzeC = async (sourceCode) => {
  const findings = [];

  if (sourceCode.includes("gets(")) {
    findings.push({
      severity: "error",
      issue: "Unsafe Function",
      explanation:
        "gets() may cause buffer overflow.",
      suggestedFix: "Use fgets() instead.",
      fileName: "code.c",
      lineNumber: null,
    });
  }

  if (sourceCode.includes("strcpy(")) {
    findings.push({
      severity: "warning",
      issue: "Unsafe Copy",
      explanation:
        "strcpy() may overflow destination buffer.",
      suggestedFix: "Use strncpy().",
      fileName: "code.c",
      lineNumber: null,
    });
  }

  return findings;
};

const analyzeCpp = async (sourceCode) => {
  const findings = [];

  if (sourceCode.includes("new ")) {
    findings.push({
      severity: "warning",
      issue: "Manual Memory Allocation",
      explanation:
        "Raw pointers can cause memory leaks.",
      suggestedFix:
        "Use std::unique_ptr or std::shared_ptr.",
      fileName: "code.cpp",
      lineNumber: null,
    });
  }

  if (sourceCode.includes("using namespace std")) {
    findings.push({
      severity: "info",
      issue: "Namespace Pollution",
      explanation:
        "Avoid using namespace std in headers or large projects.",
      suggestedFix:
        "Use std:: prefix instead.",
      fileName: "code.cpp",
      lineNumber: null,
    });
  }

  return findings;
};

const runStaticAnalysis = async (language, sourceCode) => {
  const normalizedLanguage = language.toLowerCase();

  switch (normalizedLanguage) {
    case "javascript":
    case "js":
      return analyzeJavaScript(sourceCode);

    case "typescript":
    case "ts":
      return analyzeTypeScript(sourceCode);

    case "python":
    case "py":
      return analyzePython(sourceCode);

    case "java":
      return analyzeJava(sourceCode);

    case "c":
      return analyzeC(sourceCode);

    case "cpp":
    case "c++":
      return analyzeCpp(sourceCode);

    default:
      return [];
  }
};

module.exports = {
  runStaticAnalysis,
};