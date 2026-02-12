import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Get categories' });
}));

router.post('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Create category' });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Update category' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Delete category' });
}));

export default router;
