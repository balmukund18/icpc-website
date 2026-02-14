import { Router } from 'express';
import * as ctrl from '../controllers/taskController';
import { isAuthenticated, isAdmin, optionalAuth } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

// Public/Auth routes - optionalAuth allows both authenticated and unauthenticated access
router.get('/', optionalAuth, ctrl.getAll);

// Auth required routes
router.get('/my-submissions', isAuthenticated, ctrl.mySubmissions);
router.get('/my-points', isAuthenticated, ctrl.myPoints);
router.get('/:id', isAuthenticated, ctrl.getOne);
router.post('/:taskId/submit', isAuthenticated, [
  body('link').isURL().withMessage('Valid URL is required'),
], ctrl.submit);
router.post('/:taskId/verify-leetcode', isAuthenticated, ctrl.verifyLeetCode);

// Admin routes
router.post('/', isAuthenticated, isAdmin, [
  body('title').isString().notEmpty().withMessage('Title is required'),
], ctrl.create);
router.put('/:id', isAuthenticated, isAdmin, ctrl.update);
router.delete('/:id', isAuthenticated, isAdmin, ctrl.remove);
router.post('/:taskId/assign', isAuthenticated, isAdmin, ctrl.assign);
router.get('/:id/submissions', isAuthenticated, isAdmin, ctrl.getSubmissions);

// Submission management (Admin)
router.post('/submissions/:subId/verify', isAuthenticated, isAdmin, ctrl.verify);
router.post('/submissions/:subId/reject', isAuthenticated, isAdmin, ctrl.reject);

export default router;
