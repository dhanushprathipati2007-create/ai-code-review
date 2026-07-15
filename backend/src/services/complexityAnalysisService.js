const analyzeComplexity = (language, sourceCode) => {
  const lines = sourceCode.split("\n");

  const nonEmptyLines = lines.filter(
    (line) => line.trim() !== ""
  );

  const linesOfCode = nonEmptyLines.length;

  // Cyclomatic complexity starts at 1
  let cyclomaticComplexity = 1;

  const decisionPatterns = [
    /\bif\b/g,
    /\belse\s+if\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /&&/g,
    /\|\|/g,
  ];

  decisionPatterns.forEach((pattern) => {
    const matches = sourceCode.match(pattern);

    if (matches) {
      cyclomaticComplexity += matches.length;
    }
  });

  // Detect functions
  let functionMatches = [];

  if (
    language.toLowerCase() === "python" ||
    language.toLowerCase() === "py"
  ) {
    functionMatches = [
      ...sourceCode.matchAll(
        /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*:/g
      ),
    ];
  } else {
    const normalFunctions = [
      ...sourceCode.matchAll(
        /function\s+([a-zA-Z_$][\w$]*)\s*\([^)]*\)/g
      ),
    ];

    const arrowFunctions = [
      ...sourceCode.matchAll(
        /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g
      ),
    ];

    functionMatches = [
      ...normalFunctions,
      ...arrowFunctions,
    ];
  }

  const numberOfFunctions = functionMatches.length;

  // Detect classes
  const classMatches = [
    ...sourceCode.matchAll(
      /\bclass\s+([a-zA-Z_$][\w$]*)/g
    ),
  ];

  const numberOfClasses = classMatches.length;

  // Approximate function complexity
  const functionComplexity = functionMatches.map(
    (match, index) => ({
      functionName:
        match[1] || `Function ${index + 1}`,
      complexity: 1,
    })
  );

  // Distribute detected decision points approximately
  if (functionComplexity.length > 0) {
    const additionalComplexity =
      cyclomaticComplexity - 1;

    functionComplexity[0].complexity +=
      additionalComplexity;
  }

  let fileComplexity = "Low";

  if (cyclomaticComplexity > 10) {
    fileComplexity = "Medium";
  }

  if (cyclomaticComplexity > 20) {
    fileComplexity = "High";
  }

  const codeSmells = [];

  // Long file
  if (linesOfCode > 100) {
    codeSmells.push({
      type: "Long File",
      severity: "warning",
      description:
        `The file contains ${linesOfCode} lines of code.`,
      suggestion:
        "Consider splitting the code into smaller modules.",
    });
  }

  // Long lines
  lines.forEach((line, index) => {
    if (line.length > 100) {
      codeSmells.push({
        type: "Long Line",
        severity: "info",
        description:
          `Line ${index + 1} contains more than 100 characters.`,
        suggestion:
          "Break the line into smaller readable statements.",
      });
    }
  });

  // Too many parameters
  const parameterPatterns = [
    /function\s+\w+\s*\(([^)]*)\)/g,
    /def\s+\w+\s*\(([^)]*)\)/g,
  ];

  parameterPatterns.forEach((pattern) => {
    let match;

    while (
      (match = pattern.exec(sourceCode)) !== null
    ) {
      const parameters = match[1]
        .split(",")
        .map((parameter) => parameter.trim())
        .filter(Boolean);

      if (parameters.length > 4) {
        codeSmells.push({
          type: "Too Many Parameters",
          severity: "warning",
          description:
            `A function contains ${parameters.length} parameters.`,
          suggestion:
            "Reduce parameters or group related values into an object.",
        });
      }
    }
  });

  // Deep nesting
  let currentDepth = 0;
  let maximumDepth = 0;

  for (const character of sourceCode) {
    if (character === "{") {
      currentDepth++;

      maximumDepth = Math.max(
        maximumDepth,
        currentDepth
      );
    }

    if (character === "}") {
      currentDepth = Math.max(
        0,
        currentDepth - 1
      );
    }
  }

  if (maximumDepth > 4) {
    codeSmells.push({
      type: "Deep Nesting",
      severity: "warning",
      description:
        `The code reaches approximately ${maximumDepth} levels of nesting.`,
      suggestion:
        "Use early returns or extract nested logic into smaller functions.",
    });
  }

  return {
    cyclomaticComplexity,
    functionComplexity,
    fileComplexity,
    numberOfFunctions,
    numberOfClasses,
    linesOfCode,
    codeSmells,
  };
};

module.exports = {
  analyzeComplexity,
};