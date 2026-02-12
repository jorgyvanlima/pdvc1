import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Get products' });
}));

router.post('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Create product' });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Get product' });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Update product' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Delete product' });
}));

router.get('/search/:query', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Search products' });
}));

export default router;
