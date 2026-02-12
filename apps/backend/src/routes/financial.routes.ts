import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';
import { FinancialController } from '../controllers/financial.controller';

const router = Router();
const controller = new FinancialController();

router.use(authMiddleware);

// Dashboard
router.get('/stats', asyncHandler(controller.getStats.bind(controller)));

// Payables
router.get('/payables', asyncHandler(controller.listPayables.bind(controller)));
router.post('/payables', asyncHandler(controller.createPayable.bind(controller)));
router.post('/payables/:id/pay', asyncHandler(controller.payBill.bind(controller)));

// Receivables
router.get('/receivables', asyncHandler(controller.listReceivables.bind(controller)));
router.post('/receivables', asyncHandler(controller.createReceivable.bind(controller)));
router.post('/receivables/:id/receive', asyncHandler(controller.receivePayment.bind(controller)));

export default router;
