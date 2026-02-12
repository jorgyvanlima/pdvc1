import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class FinancialService {
    // ============ ACCOUNTS PAYABLE ============

    async listPayables(filters: any) {
        const { status, startDate, endDate } = filters;
        const where: any = {};

        if (status) where.status = status;
        if (startDate && endDate) {
            where.dueDate = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        return prisma.accountsPayable.findMany({
            where,
            include: { supplier: true },
            orderBy: { dueDate: 'asc' },
        });
    }

    async createPayable(data: any) {
        return prisma.accountsPayable.create({
            data: {
                description: data.description,
                amount: data.amount,
                dueDate: new Date(data.dueDate),
                supplierId: data.supplierId,
                note: data.note,
                status: 'PENDING',
            },
        });
    }

    async payBill(id: number, paymentMethod: string) {
        const bill = await prisma.accountsPayable.findUnique({ where: { id } });
        if (!bill) throw new AppError(404, 'Bill not found');

        if (bill.status === 'PAID') throw new AppError(400, 'Bill already paid');

        return prisma.accountsPayable.update({
            where: { id },
            data: {
                status: 'PAID',
                paidDate: new Date(),
                paymentMethod,
            },
        });
    }

    // ============ ACCOUNTS RECEIVABLE ============

    async listReceivables(filters: any) {
        const { status, startDate, endDate } = filters;
        const where: any = {};

        if (status) where.status = status;
        if (startDate && endDate) {
            where.dueDate = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        return prisma.accountsReceivable.findMany({
            where,
            include: { customer: true, sale: true },
            orderBy: { dueDate: 'asc' },
        });
    }

    async createReceivable(data: any) {
        return prisma.accountsReceivable.create({
            data: {
                description: data.description,
                amount: data.amount,
                dueDate: new Date(data.dueDate),
                customerId: data.customerId,
                saleId: data.saleId,
                note: data.note,
                status: 'PENDING',
            },
        });
    }

    async receivePayment(id: number, paymentMethod: string) {
        const invoice = await prisma.accountsReceivable.findUnique({ where: { id } });
        if (!invoice) throw new AppError(404, 'Invoice not found');

        if (invoice.status === 'PAID') throw new AppError(400, 'Invoice already paid');

        return prisma.accountsReceivable.update({
            where: { id },
            data: {
                status: 'PAID',
                receivedDate: new Date(),
                paymentMethod,
            },
        });
    }

    // ============ DASHBOARD STATS ============

    async getFinancialStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const [
            totalPayablePending,
            totalReceivablePending,
            totalPaidMonth,
            totalReceivedMonth
        ] = await Promise.all([
            // Pending Payables (All time or just this month? Let's do all time for liabilities)
            prisma.accountsPayable.aggregate({
                _sum: { amount: true },
                where: { status: 'PENDING' },
            }),
            // Pending Receivables
            prisma.accountsReceivable.aggregate({
                _sum: { amount: true },
                where: { status: 'PENDING' },
            }),
            // Paid this month
            prisma.accountsPayable.aggregate({
                _sum: { amount: true },
                where: {
                    status: 'PAID',
                    paidDate: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                },
            }),
            // Received this month
            prisma.accountsReceivable.aggregate({
                _sum: { amount: true },
                where: {
                    status: 'PAID',
                    receivedDate: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                },
            })
        ]);

        return {
            payables: {
                pending: totalPayablePending._sum.amount || 0,
                paidThisMonth: totalPaidMonth._sum.amount || 0,
            },
            receivables: {
                pending: totalReceivablePending._sum.amount || 0,
                receivedThisMonth: totalReceivedMonth._sum.amount || 0,
            }
        };
    }
}
