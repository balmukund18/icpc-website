import { Router } from "express";
import * as ctrl from "../controllers/contestController";
import { isAuthenticated, isAdmin } from "../middleware/auth";
import { body } from "express-validator";

const router = Router();

router.post(
  "/",
  isAuthenticated,
  isAdmin,
  [body("title").isString().notEmpty()],
  ctrl.create
);
router.post(
  "/:id/problems",
  isAuthenticated,
  isAdmin,
  [body("name").isString().notEmpty()],
  ctrl.addProblem
);
router.get("/", ctrl.list);

// Get single contest by ID (must be before /:id/problems etc)
router.get("/:id", ctrl.getById);

// Delete contest (admin only)
router.delete("/:id", isAuthenticated, isAdmin, ctrl.deleteContest);

router.post(
  "/:id/results",
  isAuthenticated,
  isAdmin,
  [body().isArray().optional()],
  ctrl.saveResults
);
router.get("/history/me", isAuthenticated, ctrl.history);
router.post(
  "/:id/submit",
  isAuthenticated,
  [
    body("source").isString().notEmpty(),
    body("language_id").isInt(),
    body("problemIdx").isInt(),
  ],
  ctrl.submit
);

// Admin: list submissions for a contest
router.get("/:id/submissions", isAuthenticated, isAdmin, ctrl.submissions);

// Authenticated user: list own submissions for a specific contest
router.get("/:id/submissions/me", isAuthenticated, ctrl.myContestSubmissions);

// Authenticated user: list all own submissions
router.get("/submissions/me", isAuthenticated, ctrl.mySubmissions);

// Fetch a single submission (owner or admin)
router.get("/submissions/:submissionId", isAuthenticated, ctrl.getSubmission);

export default router;
