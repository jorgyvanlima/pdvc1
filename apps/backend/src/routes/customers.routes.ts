import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Get customers' });
}));

router.post('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Create customer' });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Get customer' });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Update customer' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Delete customer' });
}));

export default router;
