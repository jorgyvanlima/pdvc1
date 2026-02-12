import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Get payments' });
}));

router.post('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Create payment' });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Get payment' });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Update payment' });
}));

export default router;
