import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AccountsPayableService {
  // Criar conta a pagar
  async create(data: {
    description: string;
    supplierId?: number;
    categoryId?: number;
    amount: number;
    dueDate: Date;
    paymentMethod?: string;
    documentNumber?: string;
    barcodeNumber?: string;
    note?: string;
    attachments?: string[];
    totalInstallments?: number;
  }) {
    const account = await prisma.accountsPayable.create({
      data: {
        ...data,
        attachments: data.attachments ? JSON.stringify(data.attachments) : undefined,
        totalInstallments: data.totalInstallments || 1,
      },
      include: {
        supplier: true,
        category: true,
      },
    });

    // Criar parcelas se houver
    if (data.totalInstallments && data.totalInstallments > 1) {
      const installmentAmount = data.amount / data.totalInstallments;
      const installments = [];

      for (let i = 1; i <= data.totalInstallments; i++) {
        const installmentDueDate = new Date(data.dueDate);
        installmentDueDate.setMonth(installmentDueDate.getMonth() + (i - 1));

        installments.push({
          accountsPayableId: account.id,
          number: i,
          amount: installmentAmount,
          dueDate: installmentDueDate,
          status: 'PENDING',
        });
      }

      await prisma.installment.createMany({
        data: installments,
      });
    }

    return account;
  }

  // Listar contas a pagar
  async list(filters: {
    status?: string;
    supplierId?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { status, supplierId, startDate, endDate, page = 1, limit = 25 } = filters;

    const where: any = {};

    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = startDate;
      if (endDate) where.dueDate.lte = endDate;
    }

    const [accounts, total] = await Promise.all([
      prisma.accountsPayable.findMany({
        where,
        include: {
          supplier: true,
          category: true,
          installments: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dueDate: 'asc' },
      }),
      prisma.accountsPayable.count({ where }),
    ]);

    return {
      accounts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Buscar por ID
  async findById(id: number) {
    return await prisma.accountsPayable.findUnique({
      where: { id },
      include: {
        supplier: true,
        category: true,
        installments: true,
        transactions: true,
        alerts: true,
      },
    });
  }

  // Atualizar conta
  async update(id: number, data: any) {
    const updateData: any = { ...data };
    if (data.attachments) {
      updateData.attachments = JSON.stringify(data.attachments);
    }
    
    return await prisma.accountsPayable.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        category: true,
        installments: true,
      },
    });
  }

  // Marcar como paga
  async markAsPaid(id: number, paidDate: Date, paymentMethod: string) {
    return await prisma.accountsPayable.update({
      where: { id },
      data: {
        status: 'PAID',
        paidDate,
        paymentMethod,
      },
    });
  }

  // Adicionar anexo
  async addAttachment(id: number, attachmentUrl: string) {
    const account = await this.findById(id);
    if (!account) throw new Error('Account not found');

    const attachments = account.attachments 
      ? (typeof account.attachments === 'string' ? JSON.parse(account.attachments) : account.attachments as any[])
      : [];
    
    attachments.push(attachmentUrl);

    return await this.update(id, { attachments });
  }

  // Deletar conta
  async delete(id: number) {
    return await prisma.accountsPayable.delete({
      where: { id },
    });
  }

  // Obter contas vencidas
  async getOverdue() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.accountsPayable.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: today,
        },
      },
      include: {
        supplier: true,
        installments: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  // Obter contas vencendo nos próximos N dias
  async getDueSoon(days: number = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    return await prisma.accountsPayable.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: today,
          lte: futureDate,
        },
      },
      include: {
        supplier: true,
        installments: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  // Dashboard: total a pagar
  async getTotalPayable(filters?: { startDate?: Date; endDate?: Date }) {
    const where: any = { status: 'PENDING' };

    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {};
      if (filters.startDate) where.dueDate.gte = filters.startDate;
      if (filters.endDate) where.dueDate.lte = filters.endDate;
    }

    const result = await prisma.accountsPayable.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
    });

    return {
      total: result._sum.amount || 0,
      count: result._count || 0,
    };
  }
}

export default new AccountsPayableService();
