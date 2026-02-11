import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Get purchases' });
}));

router.post('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Create purchase' });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Get purchase' });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Update purchase' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Delete purchase' });
}));

export default router;
