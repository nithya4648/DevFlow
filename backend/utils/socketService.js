// backend/utils/socketService.js
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const logger = require("./logger");

/**
 * Configure socket.io to authenticate connections using the JWT token
 * and join the user to a dedicated room for targeted events.
 */
const configureSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      // For WebSocket, standard cookies are sometimes tricky cross-origin if not setup perfectly,
      // but since we are on the same domain or have CORS configured with credentials: true,
      // we can parse the cookie header.
      const cookieHeader = socket.request.headers.cookie;
      if (!cookieHeader) {
        return next(new Error("Authentication error: No cookies"));
      }

      // Simple cookie parser for devflow_token
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {});

      const token = cookies.devflow_token;
      if (!token) {
        return next(new Error("Authentication error: No token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    // Join a room named user_<userId> for targeted notifications
    const roomName = `user_${socket.user._id}`;
    socket.join(roomName);

    // Join team rooms
    try {
      const Team = require("../models/Team.model");
      const userTeams = await Team.find({ "members.user": socket.user._id }).select("_id").lean();
      userTeams.forEach((t) => {
        socket.join(`team_${t._id}`);
      });
    } catch (err) {
      logger.error({ err }, "Socket team rooms join error");
    }
    
    // console.log(`Socket ${socket.id} connected for user ${socket.user.name}`);

    socket.on("disconnect", () => {
      // console.log(`Socket ${socket.id} disconnected`);
    });
  });
};

/**
 * Helper to emit a notification to a specific user
 */
const emitNotificationToUser = (req, userId, notificationObj) => {
  const io = req && req.app ? req.app.get("io") : global.io;
  if (io) {
    io.to(`user_${userId}`).emit("notification:new", notificationObj);
  }
};

module.exports = { configureSocket, emitNotificationToUser };
