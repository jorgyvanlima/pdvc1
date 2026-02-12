import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

/**
 * Auth Routes
 */

router.post('/login', asyncHandler(authController.login.bind(authController)));
router.post('/register', asyncHandler(authController.register.bind(authController)));
router.post('/logout', authMiddleware, asyncHandler(authController.logout.bind(authController)));

router.post('/refresh', asyncHandler(async (req, res) => {
  // Refresh token logic
  res.json({
    success: true,
    message: 'Token refreshed',
  });
}));

export default router;
