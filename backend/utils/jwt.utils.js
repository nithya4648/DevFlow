const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds (matching JWT_EXPIRES_IN default)
  };

  res.cookie("devflow_token", token, cookieOptions);
};

const clearTokenCookie = (res) => {
  res.cookie("devflow_token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: true,
    sameSite: "none",
  });
};

module.exports = {
  generateAccessToken,
  setTokenCookie,
  clearTokenCookie,
};
