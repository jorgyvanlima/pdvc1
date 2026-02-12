import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';
import PaymentAlertService from '../services/paymentAlert.service';

const router = Router();

router.use(authMiddleware);

// Listar alertas
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { read, dismissed, priority, type, page, limit } = req.query;

  const filters = {
    read: read === 'true' ? true : read === 'false' ? false : undefined,
    dismissed: dismissed === 'true' ? true : dismissed === 'false' ? false : undefined,
    priority: priority as string,
    type: type as string,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 50,
  };

  const result = await PaymentAlertService.list(filters);

  res.json({
    success: true,
    message: 'Payment alerts retrieved',
    data: result,
  });
}));

// Gerar alertas automaticamente
router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  const result = await PaymentAlertService.generateAlertsForDueAccounts();

  res.json({
    success: true,
    message: 'Alerts generated',
    data: result,
  });
}));

// Marcar como lido
router.post('/:id/read', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const alert = await PaymentAlertService.markAsRead(Number(id));

  res.json({
    success: true,
    message: 'Alert marked as read',
    data: alert,
  });
}));

// Descartar alerta
router.post('/:id/dismiss', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const alert = await PaymentAlertService.dismiss(Number(id));

  res.json({
    success: true,
    message: 'Alert dismissed',
    data: alert,
  });
}));

// Contagem de não lidos
router.get('/count/unread', asyncHandler(async (req: Request, res: Response) => {
  const count = await PaymentAlertService.getUnreadCount();

  res.json({
    success: true,
    message: 'Unread count retrieved',
    data: { count },
  });
}));

// Alertas por prioridade
router.get('/stats/by-priority', asyncHandler(async (req: Request, res: Response) => {
  const stats = await PaymentAlertService.getAlertsByPriority();

  res.json({
    success: true,
    message: 'Alerts by priority retrieved',
    data: stats,
  });
}));

export default router;
