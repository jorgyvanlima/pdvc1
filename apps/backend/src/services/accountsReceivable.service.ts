import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AccountsReceivableService {
  // Criar conta a receber
  async create(data: {
    description: string;
    customerId?: number;
    saleId?: number;
    categoryId?: number;
    amount: number;
    dueDate: Date;
    paymentMethod?: string;
    documentNumber?: string;
    note?: string;
    attachments?: string[];
    totalInstallments?: number;
  }) {
    const account = await prisma.accountsReceivable.create({
      data: {
        ...data,
        attachments: data.attachments ? JSON.stringify(data.attachments) : undefined,
        totalInstallments: data.totalInstallments || 1,
      },
      include: {
        customer: true,
        sale: true,
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
          accountsReceivableId: account.id,
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

  // Criar contas a receber de uma venda a prazo
  async createFromSale(saleId: number, totalInstallments: number = 1) {
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { customer: true },
    });

    if (!sale) throw new Error('Sale not found');

    const account = await this.create({
      description: `Venda #${sale.id} - ${sale.customerName}`,
      customerId: sale.customerId,
      saleId: sale.id,
      amount: Number(sale.grandTotal),
      dueDate: new Date(),
      totalInstallments,
    });

    return account;
  }

  // Listar contas a receber
  async list(filters: {
    status?: string;
    customerId?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { status, customerId, startDate, endDate, page = 1, limit = 25 } = filters;

    const where: any = {};

    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = startDate;
      if (endDate) where.dueDate.lte = endDate;
    }

    const [accounts, total] = await Promise.all([
      prisma.accountsReceivable.findMany({
        where,
        include: {
          customer: true,
          sale: true,
          category: true,
          installments: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dueDate: 'asc' },
      }),
      prisma.accountsReceivable.count({ where }),
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
    return await prisma.accountsReceivable.findUnique({
      where: { id },
      include: {
        customer: true,
        sale: true,
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
    
    return await prisma.accountsReceivable.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        sale: true,
        category: true,
        installments: true,
      },
    });
  }

  // Marcar como recebida
  async markAsPaid(id: number, receivedDate: Date, paymentMethod: string) {
    return await prisma.accountsReceivable.update({
      where: { id },
      data: {
        status: 'PAID',
        receivedDate,
        paymentMethod,
      },
    });
  }

  // Deletar conta
  async delete(id: number) {
    return await prisma.accountsReceivable.delete({
      where: { id },
    });
  }

  // Obter contas vencidas
  async getOverdue() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.accountsReceivable.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: today,
        },
      },
      include: {
        customer: true,
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

    return await prisma.accountsReceivable.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: today,
          lte: futureDate,
        },
      },
      include: {
        customer: true,
        installments: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  // Dashboard: total a receber
  async getTotalReceivable(filters?: { startDate?: Date; endDate?: Date }) {
    const where: any = { status: 'PENDING' };

    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {};
      if (filters.startDate) where.dueDate.gte = filters.startDate;
      if (filters.endDate) where.dueDate.lte = filters.endDate;
    }

    const result = await prisma.accountsReceivable.aggregate({
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

export default new AccountsReceivableService();
