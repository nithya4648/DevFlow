const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const logger = require("../utils/logger");

const protect = async (req, res, next) => {
  let token;

  // 1. Check token in cookies
  if (req.cookies && req.cookies.devflow_token) {
    token = req.cookies.devflow_token;
  }
  // 2. Check token in Authorization header (bearer token fallback)
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    const error = new Error("Not authorized, no token provided");
    error.statusCode = 401;
    error.code = "NO_TOKEN";
    return next(error);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and attach to request (exclude password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      const error = new Error("User account deleted or not found");
      error.statusCode = 401;
      error.code = "USER_NOT_FOUND";
      logger.warn({ userId: decoded.id }, "User not found in DB but token valid");
      return next(error);
    }

    req.user = user;
    logger.debug({ userId: user._id }, "User authenticated");
    next();
  } catch (err) {
    let error;

    if (err.name === "TokenExpiredError") {
      error = new Error("Session expired. Please login again.");
      error.statusCode = 401;
      error.code = "TOKEN_EXPIRED";
      logger.info("Token expired");
    } else if (err.name === "JsonWebTokenError") {
      error = new Error("Invalid or tampered authentication token");
      error.statusCode = 403;
      error.code = "TOKEN_INVALID";
      logger.warn({ token: token.substring(0, 20) + "..." }, "Invalid token signature");
    } else {
      error = new Error("Authentication failed");
      error.statusCode = 401;
      error.code = "AUTH_UNKNOWN";
      logger.error({ err: err.message }, "Auth error");
    }

    return next(error);
  }
};

module.exports = { protect };
