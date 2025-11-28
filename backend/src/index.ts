import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { reqLogger, logger } from "./utils/logger";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import taskRoutes from "./routes/taskRoutes";
import aiRoutes from "./routes/aiRoutes";
import blogRoutes from "./routes/blogRoutes";
import announcementRoutes from "./routes/announcementRoutes";
import contestRoutes from "./routes/contestRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import alumniRoutes from "./routes/alumniRoutes";
import gamificationRoutes from "./routes/gamificationRoutes";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";
import judgeRoutes from "./routes/judgeRoutes";
import { errorHandler } from "./utils/errorHandler";
import { startJobs } from "./jobs/cron";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// request logging
app.use(reqLogger as any);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

app.get("/", (req, res) =>
  res.json({ message: "Welcome to ICPC Website API" })
);
app.get("/api/health", (req, res) =>
  res.json({ status: "OK", timestamp: new Date().toISOString() })
);

// Readiness endpoint used by orchestrators (checks DB connectivity)
import prisma from "./models/prismaClient";
app.get("/api/ready", async (req, res) => {
  try {
    // simple query to verify DB connection
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ ready: true });
  } catch (err) {
    return res.status(503).json({ ready: false, error: "db_unavailable" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/gamification", gamificationRoutes);

app.use("/api/judge", judgeRoutes);

// Serve a simple Swagger/OpenAPI JSON at /api/docs
app.get("/api/docs", (req, res) => {
  const p = path.resolve(__dirname, "..", "..", "swagger.json");
  res.sendFile(p);
});

// Swagger UI
app.use("/api/docs/ui", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorHandler as any);

startJobs();

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server is running");
});
