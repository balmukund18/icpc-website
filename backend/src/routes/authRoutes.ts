import { Router } from "express";
import * as auth from "../controllers/authController";
import { isAuthenticated, isAdmin } from "../middleware/auth";
import { body } from "express-validator";

const router = Router();

router.post(
  "/register",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  auth.register
);
router.post(
  "/login",
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

export default router;
