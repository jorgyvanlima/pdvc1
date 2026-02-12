import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';
import AccountsReceivableService from '../services/accountsReceivable.service';

const router = Router();

router.use(authMiddleware);

// Listar contas a receber
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { status, customerId, startDate, endDate, page, limit } = req.query;

  const filters = {
    status: status as string,
    customerId: customerId ? Number(customerId) : undefined,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 25,
  };

  const result = await AccountsReceivableService.list(filters);

  res.json({
    success: true,
    message: 'Accounts receivable retrieved',
    data: result,
  });
}));

// Buscar conta específica
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const account = await AccountsReceivableService.findById(Number(id));

  if (!account) {
    return res.status(404).json({
      success: false,
      message: 'Account receivable not found',
    });
  }

  res.json({
    success: true,
    message: 'Account retrieved',
    data: account,
  });
}));

// Criar nova conta a receber
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const account = await AccountsReceivableService.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Account receivable created',
    data: account,
  });
}));

// Criar de uma venda a prazo
router.post('/from-sale/:saleId', asyncHandler(async (req: Request, res: Response) => {
  const { saleId } = req.params;
  const { totalInstallments } = req.body;

  const account = await AccountsReceivableService.createFromSale(
    Number(saleId),
    totalInstallments || 1
  );

  res.status(201).json({
    success: true,
    message: 'Account created from sale',
    data: account,
  });
}));

// Atualizar conta
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const account = await AccountsReceivableService.update(Number(id), req.body);

  res.json({
    success: true,
    message: 'Account updated',
    data: account,
  });
}));

// Marcar como recebida
router.post('/:id/receive', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { receivedDate, paymentMethod } = req.body;

  const account = await AccountsReceivableService.markAsPaid(
    Number(id),
    new Date(receivedDate),
    paymentMethod
  );

  res.json({
    success: true,
    message: 'Account marked as received',
    data: account,
  });
}));

// Deletar conta
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await AccountsReceivableService.delete(Number(id));

  res.json({
    success: true,
    message: 'Account deleted',
  });
}));

// Contas vencidas
router.get('/reports/overdue', asyncHandler(async (req: Request, res: Response) => {
  const accounts = await AccountsReceivableService.getOverdue();

  res.json({
    success: true,
    message: 'Overdue accounts retrieved',
    data: accounts,
  });
}));

// Contas vencendo em breve
router.get('/reports/due-soon', asyncHandler(async (req: Request, res: Response) => {
  const { days } = req.query;

  const accounts = await AccountsReceivableService.getDueSoon(days ? Number(days) : 7);

  res.json({
    success: true,
    message: 'Due soon accounts retrieved',
    data: accounts,
  });
}));

export default router;
