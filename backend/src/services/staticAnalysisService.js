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

const runStaticAnalysis = async (language, sourceCode) => {
  const normalizedLanguage = language.toLowerCase();

  if (
    normalizedLanguage === "javascript" ||
    normalizedLanguage === "js"
  ) {
    return analyzeJavaScript(sourceCode);
  }

  if (
    normalizedLanguage === "python" ||
    normalizedLanguage === "py"
  ) {
    return analyzePython(sourceCode);
  }

  throw new Error(
    `Static analysis is not supported for ${language}`
  );
};

module.exports = {
  runStaticAnalysis,
};