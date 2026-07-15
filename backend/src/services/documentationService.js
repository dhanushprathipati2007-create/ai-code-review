const generateDocumentation = (code) => {
  const functionDocumentation = [];
  const classDocumentation = [];
  const apiDocumentation = [];

  // Detect normal functions
  const functionRegex =
    /function\s+([a-zA-Z_$][\w$]*)\s*\(([^)]*)\)/g;

  let match;

  while ((match = functionRegex.exec(code)) !== null) {
    functionDocumentation.push({
      name: match[1],
      parameters: match[2]
        .split(",")
        .map((param) => param.trim())
        .filter(Boolean),
      description: `Function ${match[1]} performs a specific operation in the code.`,
    });
  }

  // Detect arrow functions
  const arrowFunctionRegex =
    /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g;

  while ((match = arrowFunctionRegex.exec(code)) !== null) {
    functionDocumentation.push({
      name: match[1],
      parameters: match[2]
        .split(",")
        .map((param) => param.trim())
        .filter(Boolean),
      description: `Arrow function ${match[1]} performs a specific operation in the code.`,
    });
  }

  // Detect classes
  const classRegex =
    /class\s+([a-zA-Z_$][\w$]*)/g;

  while ((match = classRegex.exec(code)) !== null) {
    classDocumentation.push({
      name: match[1],
      description: `Class ${match[1]} defines related properties and methods.`,
    });
  }

  // Detect Express API routes
  const apiRegex =
    /(?:router|app)\.(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)["'`]/gi;

  while ((match = apiRegex.exec(code)) !== null) {
    apiDocumentation.push({
      method: match[1].toUpperCase(),
      endpoint: match[2],
      description: `${match[1].toUpperCase()} API endpoint for ${match[2]}.`,
    });
  }

  return {
    functionDocumentation,
    classDocumentation,
    apiDocumentation,
  };
};

module.exports = {
  generateDocumentation,
};