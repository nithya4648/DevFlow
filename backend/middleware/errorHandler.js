const { ZodError } = require("zod");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  const code = err.code || "INTERNAL_ERROR";

  // Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.reduce((acc, error) => {
      const path = error.path.join(".");
      acc[path] = error.message;
      return acc;
    }, {});

    logger.warn({ errors: formattedErrors }, "Validation failed");

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
      code: "VALIDATION_ERROR",
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    logger.warn({ field }, "Duplicate key error");

    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
      code: "DUPLICATE_KEY",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    logger.warn("Invalid JWT");
    return res.status(403).json({
      success: false,
      message: "Invalid token",
      code: "JWT_INVALID",
    });
  }

  if (err.name === "TokenExpiredError") {
    logger.info("Token expired");
    return res.status(401).json({
      success: false,
      message: "Token expired",
      code: "TOKEN_EXPIRED",
    });
  }

  // Generic error
  logger.error({ statusCode, message, code, url: req.url }, "API error");

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
