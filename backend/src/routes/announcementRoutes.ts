import { Router } from 'express';
import * as ctrl from '../controllers/announcementController';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = Router();

// Public
router.get('/', ctrl.listAll);

// Admin only
router.post('/', isAuthenticated, isAdmin, ctrl.create);
router.put('/:id', isAuthenticated, isAdmin, ctrl.update);
router.delete('/:id', isAuthenticated, isAdmin, ctrl.remove);

export default router;
