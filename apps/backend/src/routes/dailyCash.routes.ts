import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';
import DailyCashService from '../services/dailyCash.service';

const router = Router();

router.use(authMiddleware);

// Listar relatórios de caixa
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { status, startDate, endDate, page, limit } = req.query;

  const filters = {
    status: status as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 25,
  };

  const result = await DailyCashService.list(filters);

  res.json({
    success: true,
    message: 'Daily cash reports retrieved',
    data: result,
  });
}));

// Buscar caixa por data
router.get('/:date', asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.params;

  const report = await DailyCashService.findByDate(new Date(date));

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Cash report not found for this date',
    });
  }

  res.json({
    success: true,
    message: 'Cash report retrieved',
    data: report,
  });
}));

// Abrir caixa
router.post('/open', asyncHandler(async (req: Request, res: Response) => {
  const { date, openingBalance } = req.body;

  const report = await DailyCashService.openCash(
    new Date(date),
    Number(openingBalance)
  );

  res.status(201).json({
    success: true,
    message: 'Cash register opened',
    data: report,
  });
}));

// Registrar entrada
router.post('/income', asyncHandler(async (req: Request, res: Response) => {
  const transaction = await DailyCashService.recordIncome({
    ...req.body,
    date: new Date(req.body.date),
    userId: (req as any).user.id,
  });

  res.status(201).json({
    success: true,
    message: 'Income recorded',
    data: transaction,
  });
}));

// Registrar saída
router.post('/expense', asyncHandler(async (req: Request, res: Response) => {
  const transaction = await DailyCashService.recordExpense({
    ...req.body,
    date: new Date(req.body.date),
    userId: (req as any).user.id,
  });

  res.status(201).json({
    success: true,
    message: 'Expense recorded',
    data: transaction,
  });
}));

// Fechar caixa
router.post('/close', asyncHandler(async (req: Request, res: Response) => {
  const { date, actualBalance, notes } = req.body;
  const closedBy = (req as any).user.username;

  const report = await DailyCashService.closeCash(
    new Date(date),
    closedBy,
    Number(actualBalance),
    notes
  );

  res.json({
    success: true,
    message: 'Cash register closed',
    data: report,
  });
}));

// Resumo de período
router.get('/summary/period', asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'startDate and endDate are required',
    });
  }

  const summary = await DailyCashService.getSummary(
    new Date(startDate as string),
    new Date(endDate as string)
  );

  res.json({
    success: true,
    message: 'Summary retrieved',
    data: summary,
  });
}));

export default router;
