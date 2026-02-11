import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class FinancialService {

    // ============ CATEGORIES ============
    async getCategories(type?: 'EXPENSE' | 'INCOME') {
        return prisma.financialCategory.findMany({
            where: type ? { type, active: true } : { active: true },
            orderBy: { name: 'asc' }
        });
    }

    async createCategory(data: { name: string, type: string, description?: string }) {
        return prisma.financialCategory.create({ data });
    }

    // ============ BANK ACCOUNTS ============
    async getBankAccounts() {
        return prisma.bankAccount.findMany({
            where: { active: true },
            orderBy: { name: 'asc' }
        });
    }

    async createBankAccount(data: any) {
        return prisma.bankAccount.create({ data });
    }

    // ============ ACCOUNTS PAYABLE ============

    async listPayables(filters: any) {
        const { status, startDate, endDate, supplierId } = filters;
        const where: any = {};

        if (status) where.status = status;
        if (supplierId) where.supplierId = Number(supplierId);
        if (startDate && endDate) {
            where.dueDate = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const payables = await prisma.accountsPayable.findMany({
            where,
            include: {
                supplier: true,
                category: true,
                attachments: true
            },
            orderBy: { dueDate: 'asc' },
        });

        // Add virtual status for UI (Overdue calculations)
        return payables.map(p => {
            const today = new Date();
            const dueDate = new Date(p.dueDate);
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let virtualStatus = p.status;
            if (p.status === 'PENDING') {
                if (diffDays < 0) virtualStatus = 'OVERDUE';
                else if (diffDays === 0) virtualStatus = 'DUE_TODAY';
                else if (diffDays <= 10) virtualStatus = 'DUE_SOON';
            }

            return { ...p, virtualStatus, daysUntilDue: diffDays };
        });
    }

    async createPayable(data: any, userId: number, files?: Express.Multer.File[]) {
        const { description, amount, dueDate, supplierId, categoryId, note } = data;

        return prisma.$transaction(async (tx) => {
            const payable = await tx.accountsPayable.create({
                data: {
                    description,
                    amount: new Prisma.Decimal(amount),
                    dueDate: new Date(dueDate),
                    supplierId: supplierId ? Number(supplierId) : null,
                    categoryId: categoryId ? Number(categoryId) : null,
                    note,
                    status: 'PENDING',
                },
            });

            // Handle Attachments
            if (files && files.length > 0) {
                await Promise.all(files.map(file =>
                    tx.attachment.create({
                        data: {
                            filename: file.filename,
                            originalName: file.originalname,
                            mimeType: file.mimetype,
                            size: file.size,
                            path: file.path,
                            accountsPayableId: payable.id,
                            uploadedBy: userId
                        }
                    })
                ));
            }

            // Audit Log
            await tx.auditLog.create({
                data: {
                    userId,
                    tableName: 'fin_accounts_payable',
                    operation: 'CREATE',
                    newValues: payable as any,
                }
            });

            return payable;
        });
    }

    async payBill(id: number, data: { paymentMethod: string, bankAccountId?: number, amount?: number, paidDate?: Date }, userId: number) {
        return prisma.$transaction(async (tx) => {
            const bill = await tx.accountsPayable.findUnique({ where: { id } });
            if (!bill) throw new AppError(404, 'Bill not found');
            if (bill.status === 'PAID') throw new AppError(400, 'Bill already paid');

            const amountToPay = data.amount || Number(bill.amount);

            const updatedBill = await tx.accountsPayable.update({
                where: { id },
                data: {
                    status: 'PAID',
                    paidDate: data.paidDate || new Date(),
                    paymentMethod: data.paymentMethod,
                },
            });

            // Create Financial Transaction (Cash Flow)
            await tx.financialTransaction.create({
                data: {
                    description: `Pagamento Conta #${bill.id} - ${bill.description}`,
                    type: 'EXPENSE',
                    amount: new Prisma.Decimal(amountToPay),
                    date: new Date(),
                    categoryId: bill.categoryId,
                    bankAccountId: data.bankAccountId ? Number(data.bankAccountId) : null,
                    paymentMethod: data.paymentMethod,
                    accountsPayableId: bill.id,
                    userId: userId,
                }
            });

            // Update Bank Balance
            if (data.bankAccountId) {
                await tx.bankAccount.update({
                    where: { id: Number(data.bankAccountId) },
                    data: {
                        currentBalance: { decrement: amountToPay }
                    }
                });
            }

            // Audit Log
            await tx.auditLog.create({
                data: {
                    userId,
                    tableName: 'fin_accounts_payable',
                    operation: 'UPDATE',
                    oldValues: bill as any,
                    newValues: updatedBill as any,
                }
            });

            return updatedBill;
        });
    }

    // ============ ACCOUNTS RECEIVABLE ============

    async listReceivables(filters: any) {
        const { status, startDate, endDate, customerId } = filters;
        const where: any = {};

        if (status) where.status = status;
        if (customerId) where.customerId = Number(customerId);
        if (startDate && endDate) {
            where.dueDate = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const receivables = await prisma.accountsReceivable.findMany({
            where,
            include: {
                customer: true,
                sale: true,
                category: true,
                attachments: true
            },
            orderBy: { dueDate: 'asc' },
        });

        return receivables.map(r => {
            const today = new Date();
            const dueDate = new Date(r.dueDate);
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let virtualStatus = r.status;
            if (r.status === 'PENDING') {
                if (diffDays < 0) virtualStatus = 'OVERDUE';
                else if (diffDays === 0) virtualStatus = 'DUE_TODAY';
            }

            return { ...r, virtualStatus, daysUntilDue: diffDays };
        });
    }

    async createReceivable(data: any, userId: number, files?: Express.Multer.File[]) {
        const { description, amount, dueDate, customerId, categoryId, note, saleId } = data;

        return prisma.$transaction(async (tx) => {
            const receivable = await tx.accountsReceivable.create({
                data: {
                    description,
                    amount: new Prisma.Decimal(amount),
                    dueDate: new Date(dueDate),
                    customerId: customerId ? Number(customerId) : null,
                    categoryId: categoryId ? Number(categoryId) : null,
                    saleId: saleId ? Number(saleId) : null,
                    note,
                    status: 'PENDING',
                },
            });

            if (files && files.length > 0) {
                await Promise.all(files.map(file =>
                    tx.attachment.create({
                        data: {
                            filename: file.filename,
                            originalName: file.originalname,
                            mimeType: file.mimetype,
                            size: file.size,
                            path: file.path,
                            accountsReceivableId: receivable.id,
                            uploadedBy: userId
                        }
                    })
                ));
            }

            // Audit Log
            await tx.auditLog.create({
                data: {
                    userId,
                    tableName: 'fin_accounts_receivable',
                    operation: 'CREATE',
                    newValues: receivable as any,
                }
            });

            return receivable;
        });
    }

    async receivePayment(id: number, data: { paymentMethod: string, bankAccountId?: number, amount?: number, receivedDate?: Date }, userId: number) {
        return prisma.$transaction(async (tx) => {
            const invoice = await tx.accountsReceivable.findUnique({ where: { id } });
            if (!invoice) throw new AppError(404, 'Receivable not found');
            if (invoice.status === 'PAID') throw new AppError(400, 'Receivable already paid');

            const amountReceived = data.amount || Number(invoice.amount);

            const updatedReceivable = await tx.accountsReceivable.update({
                where: { id },
                data: {
                    status: 'PAID',
                    receivedDate: data.receivedDate || new Date(),
                    paymentMethod: data.paymentMethod,
                },
            });

            // Create Transaction
            await tx.financialTransaction.create({
                data: {
                    description: `Recebimento #${invoice.id} - ${invoice.description}`,
                    type: 'INCOME',
                    amount: new Prisma.Decimal(amountReceived),
                    date: new Date(),
                    categoryId: invoice.categoryId,
                    bankAccountId: data.bankAccountId ? Number(data.bankAccountId) : null,
                    paymentMethod: data.paymentMethod,
                    accountsReceivableId: invoice.id,
                    userId: userId,
                }
            });

            // Update Bank Balance
            if (data.bankAccountId) {
                await tx.bankAccount.update({
                    where: { id: Number(data.bankAccountId) },
                    data: {
                        currentBalance: { increment: amountReceived } // Increment for income
                    }
                });
            }

            // Audit Log
            await tx.auditLog.create({
                data: {
                    userId,
                    tableName: 'fin_accounts_receivable',
                    operation: 'UPDATE',
                    oldValues: invoice as any,
                    newValues: updatedReceivable as any,
                }
            });

            return updatedReceivable;
        });
    }

    // ============ TRANSACTIONS & DASHBOARD ============

    async listTransactions(filters: any) {
        const { startDate, endDate, bankAccountId } = filters;
        const where: any = {};

        if (bankAccountId) where.bankAccountId = Number(bankAccountId);
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        return prisma.financialTransaction.findMany({
            where,
            include: { category: true, bankAccount: true, user: true },
            orderBy: { date: 'desc' }
        });
    }

    async getFinancialStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const [
            totalPayablePending,
            totalReceivablePending,
            totalPaidMonth,
            totalReceivedMonth,
            bankAccounts
        ] = await Promise.all([
            // Pending Payables
            prisma.accountsPayable.aggregate({
                _sum: { amount: true },
                where: { status: 'PENDING' },
            }),
            // Pending Receivables
            prisma.accountsReceivable.aggregate({
                _sum: { amount: true },
                where: { status: 'PENDING' },
            }),
            // Expenses this month
            prisma.financialTransaction.aggregate({
                _sum: { amount: true },
                where: {
                    type: 'EXPENSE',
                    date: { gte: startOfMonth, lte: endOfMonth }
                }
            }),
            // Income this month
            prisma.financialTransaction.aggregate({
                _sum: { amount: true },
                where: {
                    type: 'INCOME',
                    date: { gte: startOfMonth, lte: endOfMonth }
                }
            }),
            // Bank Balances
            prisma.bankAccount.findMany({ select: { name: true, currentBalance: true } })
        ]);

        return {
            payables: {
                pending: totalPayablePending._sum.amount || 0,
            },
            receivables: {
                pending: totalReceivablePending._sum.amount || 0,
            },
            cashFlow: {
                incomeMonth: totalReceivedMonth._sum.amount || 0,
                expenseMonth: totalPaidMonth._sum.amount || 0,
            },
            accounts: bankAccounts
        };
    }
}
