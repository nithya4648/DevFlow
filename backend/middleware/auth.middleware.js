const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

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
    return next(error);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and attach to request (exclude password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      const error = new Error("Not authorized, user not found");
      error.statusCode = 401;
      return next(error);
    }

    req.user = user;
    next();
  } catch {
    const error = new Error("Not authorized, token invalid or expired");
    error.statusCode = 401;
    return next(error);
  }
};

module.exports = { protect };
