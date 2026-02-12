import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';
import FinancialDashboardService from '../services/financialDashboard.service';

const router = Router();

router.use(authMiddleware);

// Dashboard principal - visão geral
router.get('/overview', asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  const overview = await FinancialDashboardService.getDashboardOverview(
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );

  res.json({
    success: true,
    message: 'Dashboard overview retrieved',
    data: overview,
  });
}));

// Fluxo de caixa projetado
router.get('/cash-flow/projected', asyncHandler(async (req: Request, res: Response) => {
  const { days } = req.query;

  const projection = await FinancialDashboardService.getProjectedCashFlow(
    days ? Number(days) : 30
  );

  res.json({
    success: true,
    message: 'Cash flow projection retrieved',
    data: projection,
  });
}));

// Análise por categoria
router.get('/analysis/category', asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'startDate and endDate are required',
    });
  }

  const analysis = await FinancialDashboardService.getCategoryAnalysis(
    new Date(startDate as string),
    new Date(endDate as string)
  );

  res.json({
    success: true,
    message: 'Category analysis retrieved',
    data: analysis,
  });
}));

// Top fornecedores
router.get('/top/suppliers', asyncHandler(async (req: Request, res: Response) => {
  const { limit, startDate, endDate } = req.query;

  const top = await FinancialDashboardService.getTopSuppliers(
    limit ? Number(limit) : 10,
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );

  res.json({
    success: true,
    message: 'Top suppliers retrieved',
    data: top,
  });
}));

// Top clientes
router.get('/top/customers', asyncHandler(async (req: Request, res: Response) => {
  const { limit, startDate, endDate } = req.query;

  const top = await FinancialDashboardService.getTopCustomers(
    limit ? Number(limit) : 10,
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );

  res.json({
    success: true,
    message: 'Top customers retrieved',
    data: top,
  });
}));

export default router;
