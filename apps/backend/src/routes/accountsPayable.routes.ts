import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';
import AccountsPayableService from '../services/accountsPayable.service';

const router = Router();

// Require auth for all routes
router.use(authMiddleware);

// Listar contas a pagar
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { status, supplierId, startDate, endDate, page, limit } = req.query;

  const filters = {
    status: status as string,
    supplierId: supplierId ? Number(supplierId) : undefined,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 25,
  };

  const result = await AccountsPayableService.list(filters);

  res.json({
    success: true,
    message: 'Accounts payable retrieved',
    data: result,
  });
}));

// Buscar conta específica
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const account = await AccountsPayableService.findById(Number(id));

  if (!account) {
    return res.status(404).json({
      success: false,
      message: 'Account payable not found',
    });
  }

  res.json({
    success: true,
    message: 'Account retrieved',
    data: account,
  });
}));

// Criar nova conta a pagar
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const account = await AccountsPayableService.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Account payable created',
    data: account,
  });
}));

// Atualizar conta
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const account = await AccountsPayableService.update(Number(id), req.body);

  res.json({
    success: true,
    message: 'Account updated',
    data: account,
  });
}));

// Marcar como paga
router.post('/:id/pay', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { paidDate, paymentMethod } = req.body;

  const account = await AccountsPayableService.markAsPaid(
    Number(id),
    new Date(paidDate),
    paymentMethod
  );

  res.json({
    success: true,
    message: 'Account marked as paid',
    data: account,
  });
}));

// Adicionar anexo
router.post('/:id/attachment', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { attachmentUrl } = req.body;

  const account = await AccountsPayableService.addAttachment(Number(id), attachmentUrl);

  res.json({
    success: true,
    message: 'Attachment added',
    data: account,
  });
}));

// Deletar conta
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await AccountsPayableService.delete(Number(id));

  res.json({
    success: true,
    message: 'Account deleted',
  });
}));

// Contas vencidas
router.get('/reports/overdue', asyncHandler(async (req: Request, res: Response) => {
  const accounts = await AccountsPayableService.getOverdue();

  res.json({
    success: true,
    message: 'Overdue accounts retrieved',
    data: accounts,
  });
}));

// Contas vencendo em breve
router.get('/reports/due-soon', asyncHandler(async (req: Request, res: Response) => {
  const { days } = req.query;

  const accounts = await AccountsPayableService.getDueSoon(days ? Number(days) : 7);

  res.json({
    success: true,
    message: 'Due soon accounts retrieved',
    data: accounts,
  });
}));

export default router;
