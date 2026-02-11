import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/sales', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Sales report' });
}));

router.get('/products', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Products report' });
}));

router.get('/payments', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Payments report' });
}));

router.get('/cash-flow', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Cash flow report' });
}));

export default router;
