const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Team = require("../models/Team.model");

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
  } catch (err) {
    const error = new Error("Not authorized, token invalid or expired");
    error.statusCode = 401;
    return next(error);
  }
};

const requireTeamAdmin = async (req, res, next) => {
  try {
    const Project = require("../models/Project.model");
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!project.teamId) {
      // Private project - only owner can access
      if (project.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      return next();
    }

    const team = await Team.findById(project.teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Associated team not found" });
    }

    const isOwner = team.owner.toString() === req.user._id.toString();
    const member = team.members.find(m => m.user.toString() === req.user._id.toString());
    const isAdmin = member && member.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Only team owners or admins can modify/delete this project" });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect, requireTeamAdmin };

