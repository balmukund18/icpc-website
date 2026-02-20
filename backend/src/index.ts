import "dotenv/config";
import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
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
import dashboardRoutes from "./routes/dashboardRoutes";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";
import { errorHandler } from "./utils/errorHandler";
import { startJobs } from "./jobs/cron";
import passport from "./config/passport";

const app = express();
const PORT = process.env.PORT || 5000;

// Trust first proxy (Render/Cloudflare) so rate limiter uses real client IP
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  })
);
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session configuration for Passport
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || process.env.JWT_SECRET || "session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// request logging
app.use(reqLogger as any);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 500 : 1000,
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
app.use("/api/dashboard", dashboardRoutes);


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
