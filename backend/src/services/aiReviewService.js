const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const runAIReview = async (language, sourceCode) => {
  const prompt = `
You are an expert software code reviewer.

Programming Language: ${language}

SOURCE CODE:
${sourceCode}

Review the code and provide a clear, structured report using EXACTLY these sections:

1. BUG REPORTS
Identify bugs, logical errors, possible runtime errors, and edge cases.

2. OPTIMIZATION SUGGESTIONS
Suggest ways to simplify or optimize the code.

3. CODE SMELL ANALYSIS
Identify poor design patterns, duplicated logic, long functions,
deep nesting, poor naming, or maintainability problems.

4. PERFORMANCE IMPROVEMENTS
Identify inefficient operations and suggest performance improvements.

5. SECURITY RECOMMENDATIONS
Identify possible security vulnerabilities and unsafe coding practices.

6. BEST PRACTICE RECOMMENDATIONS
Suggest language-specific best practices, readability improvements,
documentation, error handling, and maintainability improvements.

Be practical and concise. If no issue exists in a section, say:
"No significant issues detected."
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  return response.text;
};

module.exports = {
  runAIReview,
};