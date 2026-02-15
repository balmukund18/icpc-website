import { Router } from 'express';
import * as ctrl from '../controllers/profileController';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

router.post(
	'/',
	isAuthenticated,
	[body('name').isString().optional(), body('branch').isString().optional(), body('year').isInt().optional(), body('contact').isString().optional()],
	ctrl.upsert
);
router.get('/', isAuthenticated, ctrl.get);

// Admin-only: update any user's CP handles
router.put('/users/:id/handles', isAuthenticated, isAdmin, ctrl.adminUpdateHandles);

export default router;
