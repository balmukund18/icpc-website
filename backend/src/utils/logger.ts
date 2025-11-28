const pino: any = require("pino");
const pinoHttp: any = require("pino-http");
const path = require("path");

let logger: any;
try {
  if (process.env.LOG_TO_FILE === "true") {
    const rfs = require("rotating-file-stream");
    const logsPath = path.resolve(process.cwd(), "logs");
    const stream = rfs.createStream("app.log", {
      interval: "1d",
      path: logsPath,
    });
    logger = pino({}, stream);
  } else {
    logger = pino({ level: process.env.LOG_LEVEL || "info" });
  }
} catch (err) {
  // Fallback to console logger if rotating-file-stream not available
  logger = pino({ level: process.env.LOG_LEVEL || "info" });
}

const reqLogger = pinoHttp({ logger });

export { logger, reqLogger };
