import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as auth from "../controllers/authController";
import { isAuthenticated, isAdmin } from "../middleware/auth";
import { body } from "express-validator";

const router = Router();

// Stricter rate limiting for auth endpoints (5 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/register",
  authLimiter,
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  auth.register
);
router.post(
  "/login",
  authLimiter,
  [body("email").isEmail(), body("password").exists()],
  auth.login
);
router.post("/approve/:id", isAuthenticated, isAdmin, auth.approve);

// Admin user management
router.get("/users", isAuthenticated, isAdmin, auth.listUsers);
router.get("/users/pending", isAuthenticated, isAdmin, auth.listPendingUsers);
router.put(
  "/users/:id/role",
  isAuthenticated,
  isAdmin,
  [body("role").isString()],
  auth.updateRole
);
router.delete("/users/:id", isAuthenticated, isAdmin, auth.deleteUser);

export default router;
