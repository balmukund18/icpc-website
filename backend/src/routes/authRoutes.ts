import { Router } from "express";
import rateLimit from "express-rate-limit";
import passport from "passport";
import * as auth from "../controllers/authController";
import * as passwordReset from "../controllers/passwordResetController";
import { isAuthenticated, isAdmin } from "../middleware/auth";
import { body } from "express-validator";

const router = Router();

// Rate limiting for auth endpoints (20 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
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


// Password reset routes
router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail()],
  passwordReset.forgotPassword
);
router.post(
  "/reset-password",
  authLimiter,
  [body("password").isLength({ min: 6 }), body("token").isString()],
  passwordReset.resetPassword
);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  auth.googleCallback
);

// Role selection for new Google OAuth users
router.post(
  "/select-role",
  isAuthenticated,
  [body("role").isIn(["STUDENT", "ALUMNI"])],
  auth.selectRole
);

// Admin user management
router.get("/users", isAuthenticated, isAdmin, auth.listUsers);

router.put(
  "/users/:id/role",
  isAuthenticated,
  isAdmin,
  [body("role").isString()],
  auth.updateRole
);
router.delete("/users/:id", isAuthenticated, isAdmin, auth.deleteUser);

export default router;

