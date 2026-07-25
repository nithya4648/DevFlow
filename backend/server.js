require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const pinoHttp = require("pino-http");

const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const logger = require("./utils/logger");

const app = express();
const server = http.createServer(app);

const { configureSocket } = require("./utils/socketService");

// Socket.io setup (real-time notifications/activity feed)
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});
app.set("io", io);
configureSocket(io);

// Core middleware
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

app.use(helmet());
app.use(compression());
app.use(passport.initialize());
app.use(pinoHttp({ logger }));

// Global rate limiting
const isDev = process.env.NODE_ENV === "development";
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", globalLimiter);

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 500 : 20,
  message: "Too many authentication attempts, please try again after 15 minutes",
});

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const projectRoutes = require("./routes/project.routes");
const snippetRoutes = require("./routes/snippet.routes");
const docRoutes = require("./routes/doc.routes");
const noteRoutes = require("./routes/note.routes");
const envRoutes = require("./routes/env.routes");
const bookmarkRoutes = require("./routes/bookmark.routes");
const notificationRoutes = require("./routes/notification.routes");
const teamRoutes = require("./routes/team.routes");
const commentRoutes = require("./routes/comment.routes");
const searchRoutes = require("./routes/search.routes");
const userRoutes = require("./routes/user.routes");
const apiKeyRoutes = require("./routes/api-key.routes");
const analyticsRoutes = require("./routes/analytics.routes");

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/api-keys", apiKeyRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/docs", docRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/env-vars", envRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/search", searchRoutes);

// Error handling (always last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  server.listen(PORT, () => {
    logger.info({ port: PORT }, "DevFlow API running");
  });

  connectDB();
}

module.exports = { app, server, connectDB };
