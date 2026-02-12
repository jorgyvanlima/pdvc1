import { Request, Response } from 'express';
import { FinancialService } from '../services/financial.service';

const financialService = new FinancialService();

export class FinancialController {

    // Payables
    async listPayables(req: Request, res: Response) {
        const result = await financialService.listPayables(req.query);
        res.json(result);
    }

    async createPayable(req: Request, res: Response) {
        const result = await financialService.createPayable(req.body);
        res.status(201).json(result);
    }

    async payBill(req: Request, res: Response) {
        const { id } = req.params;
        const { paymentMethod } = req.body;
        const result = await financialService.payBill(Number(id), paymentMethod);
        res.json(result);
    }

    // Receivables
    async listReceivables(req: Request, res: Response) {
        const result = await financialService.listReceivables(req.query);
        res.json(result);
    }

    async createReceivable(req: Request, res: Response) {
        const result = await financialService.createReceivable(req.body);
        res.status(201).json(result);
    }

    async receivePayment(req: Request, res: Response) {
        const { id } = req.params;
        const { paymentMethod } = req.body;
        const result = await financialService.receivePayment(Number(id), paymentMethod);
        res.json(result);
    }

    // Dashboard
    async getStats(req: Request, res: Response) {
        const result = await financialService.getFinancialStats();
        res.json(result);
    }
}
