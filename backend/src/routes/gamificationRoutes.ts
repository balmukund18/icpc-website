import { Router } from 'express';
import * as ctrl from '../controllers/gamificationController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

router.get('/leaderboard', ctrl.leaderboard);
router.get('/badges', ctrl.badges);
router.get('/my-badges', isAuthenticated, ctrl.userBadges);
router.get('/streak', isAuthenticated, ctrl.streak);
router.get('/heatmap', isAuthenticated, ctrl.heatmap);
router.get('/achievements', isAuthenticated, ctrl.achievements);
router.get('/achievement-defs', ctrl.achievementDefs);

export default router;
