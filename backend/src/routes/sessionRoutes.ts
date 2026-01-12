import { Router } from 'express';
import * as ctrl from '../controllers/sessionController';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { body } from 'express-validator';
import validate from '../middleware/validate';

const router = Router();

router.post(
  '/',
  isAuthenticated,
  isAdmin,
  [
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('meetLink').isString().notEmpty().withMessage('Meeting link is required'),
  ],
  validate,
  ctrl.create
);
router.put('/:id', isAuthenticated, isAdmin, ctrl.update);
router.delete('/:id', isAuthenticated, isAdmin, ctrl.remove);
router.get('/', ctrl.listAll);
router.get('/:id', ctrl.getById);
router.post('/:id/register', isAuthenticated, ctrl.register);
router.post(
  '/:id/attendance',
  isAuthenticated,
  isAdmin,
  [
    body('userId').isString().notEmpty(),
    body('present').isBoolean()
  ],
  validate,
  ctrl.attendance
);

export default router;
