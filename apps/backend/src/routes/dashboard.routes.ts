import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/stats', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Dashboard stats' });
}));

router.get('/analytics', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Dashboard analytics' });
}));

router.get('/today', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Today stats' });
}));

export default router;
