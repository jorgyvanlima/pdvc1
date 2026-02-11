import { Request, Response } from 'express';
import { FinancialService } from '../services/financial.service';

const financialService = new FinancialService();

export class FinancialController {

    // ============ CATEGORIES ============
    async listCategories(req: Request, res: Response) {
        const { type } = req.query;
        const result = await financialService.getCategories(type as 'EXPENSE' | 'INCOME');
        res.json(result);
    }

    async createCategory(req: Request, res: Response) {
        const result = await financialService.createCategory(req.body);
        res.status(201).json(result);
    }

    // ============ BANK ACCOUNTS ============
    async listBankAccounts(req: Request, res: Response) {
        const result = await financialService.getBankAccounts();
        res.json(result);
    }

    async createBankAccount(req: Request, res: Response) {
        const result = await financialService.createBankAccount(req.body);
        res.status(201).json(result);
    }

    // ============ PAYABLES ============
    async listPayables(req: Request, res: Response) {
        const result = await financialService.listPayables(req.query);
        res.json(result);
    }

    async createPayable(req: Request, res: Response) {
        const userId = (req as any).user?.userId || 1; // Fallback for dev if auth fails
        const files = req.files as Express.Multer.File[];

        // Parse body if it comes as form-data string
        // Depending on how frontend sends it, numbers might be strings
        const data = { ...req.body };

        const result = await financialService.createPayable(data, userId, files);
        res.status(201).json(result);
    }

    async payBill(req: Request, res: Response) {
        const { id } = req.params;
        const userId = (req as any).user?.userId || 1;
        const result = await financialService.payBill(Number(id), req.body, userId);
        res.json(result);
    }

    // ============ RECEIVABLES ============
    async listReceivables(req: Request, res: Response) {
        const result = await financialService.listReceivables(req.query);
        res.json(result);
    }

    async createReceivable(req: Request, res: Response) {
        const userId = (req as any).user?.userId || 1;
        const files = req.files as Express.Multer.File[];
        const data = { ...req.body };

        const result = await financialService.createReceivable(data, userId, files);
        res.status(201).json(result);
    }

    async receivePayment(req: Request, res: Response) {
        const { id } = req.params;
        const userId = (req as any).user?.userId || 1;
        const result = await financialService.receivePayment(Number(id), req.body, userId);
        res.json(result);
    }

    // ============ DASHBOARD & TRANSACTIONS ============
    async listTransactions(req: Request, res: Response) {
        const result = await financialService.listTransactions(req.query);
        res.json(result);
    }

    async getStats(req: Request, res: Response) {
        const result = await financialService.getFinancialStats();
        res.json(result);
    }
}
