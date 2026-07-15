const errorHandler = (
  error,
  req,
  res,
  next
) => {
  console.error(
    `[${new Date().toISOString()}]`,
    req.method,
    req.originalUrl,
    error
  );

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.status || 500).json({
    success: false,
    message:
      error.status === 500
        ? "Internal server error"
        : error.message,
  });
};

module.exports = errorHandler;