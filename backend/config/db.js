const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    logger.error("MONGO_URI is not defined in .env");
    process.exit(1);
  }

  const connect = async () => {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000, // 10s timeout
        socketTimeoutMS: 45000,
      });
      logger.info({ host: conn.connection.host }, "MongoDB connected");
    } catch (error) {
      logger.error({ err: error }, "MongoDB connection failed");
      logger.info("Retrying MongoDB connection in 5 seconds...");
      setTimeout(connect, 5000);
    }
  };

  await connect();
};

module.exports = connectDB;
