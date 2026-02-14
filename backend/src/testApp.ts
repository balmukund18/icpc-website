import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import taskRoutes from "./routes/taskRoutes";
import aiRoutes from "./routes/aiRoutes";
import blogRoutes from "./routes/blogRoutes";
import announcementRoutes from "./routes/announcementRoutes";
import contestRoutes from "./routes/contestRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import alumniRoutes from "./routes/alumniRoutes";
import { errorHandler } from "./utils/errorHandler";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/alumni", alumniRoutes);


app.use(errorHandler as any);

export default app;
