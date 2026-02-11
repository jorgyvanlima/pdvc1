import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Get sales' });
}));

router.post('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Create sale' });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Get sale' });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Update sale' });
}));

router.post('/:id/payment', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Add payment' });
}));

export default router;
