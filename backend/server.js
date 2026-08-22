require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Set default NODE_ENV if not provided
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

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
const { checkEmailConfig } = require("./utils/email.utils");

// Run startup verification for email environment variables
checkEmailConfig();

const app = express();
const server = http.createServer(app);

const { configureSocket } = require("./utils/socketService");

// Socket.io setup (real-time notifications/activity feed)
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});
app.set("io", io);
global.io = io;
configureSocket(io);

// Core middleware
const helmet = require("helmet");
const compression = require("compression");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

app.use(helmet());
app.use(compression());
app.use(passport.initialize());
app.use(pinoHttp({ logger }));

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  logger.error("FATAL: JWT_SECRET is not defined. Cannot start server.");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  logger.error("FATAL: MONGO_URI is not defined. Cannot start server.");
  process.exit(1);
}

if (!process.env.CLIENT_URL) {
  logger.error("FATAL: CLIENT_URL is not defined. Cannot start server.");
  process.exit(1);
}

if (!process.env.ENCRYPTION_KEY) {
  logger.error("FATAL: ENCRYPTION_KEY is not defined. Cannot start server.");
  process.exit(1);
}

// Global rate limiting
const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : isDev ? 1000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.user?._id?.toString() || ipKeyGenerator(req.ip),
  message: "Too many requests from this IP, please try again after 15 minutes",
});
if (!isTest) {
  app.use("/api", globalLimiter);
}

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : isDev ? 500 : 100,
  message: "Too many authentication attempts, please try again after 15 minutes",
});

const defaultOrigins = [
  "https://dev-flow-zeta-ashy.vercel.app",
  "https://devflow-1-ilfg.onrender.com",
  "https://devflow-vfnd.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:3000",
];

const envOrigins = [process.env.CLIENT_URL, process.env.CORS_ORIGIN]
  .filter(Boolean)
  .flatMap((url) => url.split(",").map((s) => s.trim()));

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl) or whitelisted origins or dev localhost
    if (!origin || allowedOrigins.includes(origin) || (isDev && origin.includes("localhost"))) {
      callback(null, true);
    } else {
      logger.warn({ origin }, "CORS blocked request from origin");
      callback(new Error(`Not allowed by CORS: ${origin}`), false);
    }
  },
  credentials: true,
}));
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
const commentRoutes = require("./routes/comment.routes");
const searchRoutes = require("./routes/search.routes");
const userRoutes = require("./routes/user.routes");
const apiKeyRoutes = require("./routes/api-key.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const apiVaultRoutes = require("./routes/apiVault.route");


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
app.use("/api/comments", commentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/api-vault", apiVaultRoutes);


// Root health-check — must exist so Render's health pings and browsers don't get a 404
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "DevFlow API is running" });
});

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
