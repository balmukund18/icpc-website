import { Router } from 'express';
import * as ctrl from '../controllers/alumniController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// Public - register as alumni (requires admin approval)
router.post('/register', ctrl.register);

// Authenticated - list all approved alumni (directory for all users)
router.get('/', isAuthenticated, ctrl.list);

export default router;
