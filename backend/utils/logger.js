const pino = require("pino");

const isProduction = process.env.NODE_ENV === "production";

const logger = isProduction
  ? pino({
      level: process.env.LOG_LEVEL || "info",
      base: { service: "devflow-backend" },
      timestamp: pino.stdTimeFunctions.isoTime,
    })
  : pino(
      {
        level: process.env.LOG_LEVEL || "info",
        base: { service: "devflow-backend" },
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      pino.destination(1)
    );

module.exports = logger;
