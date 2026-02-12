import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Get registers' });
}));

router.post('/open', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Open register' });
}));

router.post('/close', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Close register' });
}));

router.post('/:id/reconcile', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Reconcile register' });
}));

export default router;

