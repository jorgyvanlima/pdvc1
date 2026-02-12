import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

/**
 * User Routes
 * GET /api/v1/users
 * GET /api/v1/users/:id
 * POST /api/v1/users
 * PUT /api/v1/users/:id
 * DELETE /api/v1/users/:id
 */

router.get('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Get users endpoint' });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Get user endpoint' });
}));

router.post('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Create user endpoint' });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Update user endpoint' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Delete user endpoint' });
}));

export default router;
