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
      let token = null;

      // Try 1: Get from cookies
      const cookieHeader = socket.request.headers.cookie;
      if (cookieHeader) {
        const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
          const [name, value] = cookie.trim().split("=");
          acc[name] = value;
          return acc;
        }, {});
        token = cookies.devflow_token;
      }

      // Try 2: Fallback to Bearer token from auth header or query
      if (!token && socket.handshake.auth && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      }

      // Try 3: Fallback to query param
      if (!token && socket.handshake.query && socket.handshake.query.token) {
        token = socket.handshake.query.token;
      }

      if (!token) {
        return next(new Error("Authentication error: No token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

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
