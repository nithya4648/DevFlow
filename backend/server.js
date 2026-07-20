require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const cookieParser = require("cookie-parser");

const app = express();
const server = http.createServer(app);

// Socket.io setup (used later for real-time notifications/activity feed)
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});
app.set("io", io);

// Core middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const projectRoutes = require("./routes/project.routes");
const snippetRoutes = require("./routes/snippet.routes");
const docRoutes = require("./routes/doc.routes");
const noteRoutes = require("./routes/note.routes");
const envRoutes = require("./routes/env.routes");

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/docs", docRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/env-vars", envRoutes);

// Error handling (always last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server immediately; connectDB retries in background if DB is unreachable
server.listen(PORT, () => {
  console.log(`🚀 DevFlow API running on port ${PORT}`);
});

// Connect to MongoDB (retries automatically on failure)
connectDB();
