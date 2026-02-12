import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DailyCashService {
  // Abrir caixa do dia
  async openCash(date: Date, openingBalance: number) {
    const existing = await prisma.dailyCashReport.findUnique({
      where: { date },
    });

    if (existing) {
      throw new Error('Cash register already opened for this date');
    }

    return await prisma.dailyCashReport.create({
      data: {
        date,
        openingBalance,
        expectedBalance: openingBalance,
        closingBalance: openingBalance,
        status: 'OPEN',
      },
    });
  }

  // Buscar caixa do dia
  async findByDate(date: Date) {
    return await prisma.dailyCashReport.findUnique({
      where: { date },
      include: {
        transactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  // Registrar transação de entrada
  async recordIncome(data: {
    date: Date;
    description: string;
    amount: number;
    paymentMethod: string;
    userId: number;
    accountsReceivableId?: number;
    reference?: string;
    documentNumber?: string;
    note?: string;
  }) {
    // Buscar ou criar caixa do dia
    const existingReport = await this.findByDate(data.date);
    const cashReport = existingReport || await this.openCash(data.date, 0);

    // Registrar transação
    const transaction = await prisma.financialTransaction.create({
      data: {
        description: data.description,
        type: 'INCOME',
        amount: data.amount,
        date: data.date,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        documentNumber: data.documentNumber,
        note: data.note,
        userId: data.userId,
        accountsReceivableId: data.accountsReceivableId,
        dailyCashReportId: cashReport.id,
      },
    });

    // Atualizar totais do caixa
    await this.updateCashTotals(cashReport.id);

    return transaction;
  }

  // Registrar transação de saída
  async recordExpense(data: {
    date: Date;
    description: string;
    amount: number;
    paymentMethod: string;
    userId: number;
    accountsPayableId?: number;
    reference?: string;
    documentNumber?: string;
    note?: string;
  }) {
    // Buscar ou criar caixa do dia
    const existingReport = await this.findByDate(data.date);
    const cashReport = existingReport || await this.openCash(data.date, 0);

    // Registrar transação
    const transaction = await prisma.financialTransaction.create({
      data: {
        description: data.description,
        type: 'EXPENSE',
        amount: data.amount,
        date: data.date,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        documentNumber: data.documentNumber,
        note: data.note,
        userId: data.userId,
        accountsPayableId: data.accountsPayableId,
        dailyCashReportId: cashReport.id,
      },
    });

    // Atualizar totais do caixa
    await this.updateCashTotals(cashReport.id);

    return transaction;
  }

  // Atualizar totais do caixa
  private async updateCashTotals(cashReportId: number) {
    const cashReport = await prisma.dailyCashReport.findUnique({
      where: { id: cashReportId },
      include: { transactions: true },
    });

    if (!cashReport) return;

    let cashIncome = 0, cardIncome = 0, pixIncome = 0, otherIncome = 0;
    let cashExpense = 0, cardExpense = 0, pixExpense = 0, otherExpense = 0;

    for (const transaction of cashReport.transactions) {
      const amount = Number(transaction.amount);
      
      if (transaction.type === 'INCOME') {
        switch (transaction.paymentMethod) {
          case 'CASH':
            cashIncome += amount;
            break;
          case 'CREDIT_CARD':
          case 'DEBIT_CARD':
            cardIncome += amount;
            break;
          case 'PIX':
            pixIncome += amount;
            break;
          default:
            otherIncome += amount;
        }
      } else {
        switch (transaction.paymentMethod) {
          case 'CASH':
            cashExpense += amount;
            break;
          case 'CREDIT_CARD':
          case 'DEBIT_CARD':
            cardExpense += amount;
            break;
          case 'PIX':
            pixExpense += amount;
            break;
          default:
            otherExpense += amount;
        }
      }
    }

    const totalIncome = cashIncome + cardIncome + pixIncome + otherIncome;
    const totalExpense = cashExpense + cardExpense + pixExpense + otherExpense;
    const closingBalance = Number(cashReport.openingBalance) + totalIncome - totalExpense;

    await prisma.dailyCashReport.update({
      where: { id: cashReportId },
      data: {
        cashIncome,
        cardIncome,
        pixIncome,
        otherIncome,
        totalIncome,
        cashExpense,
        cardExpense,
        pixExpense,
        otherExpense,
        totalExpense,
        closingBalance,
        expectedBalance: closingBalance,
      },
    });
  }

  // Fechar caixa
  async closeCash(date: Date, closedBy: string, actualBalance: number, notes?: string) {
    const cashReport = await this.findByDate(date);

    if (!cashReport) {
      throw new Error('Cash register not found for this date');
    }

    if (cashReport.status === 'CLOSED') {
      throw new Error('Cash register already closed');
    }

    const difference = actualBalance - Number(cashReport.expectedBalance);

    return await prisma.dailyCashReport.update({
      where: { id: cashReport.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy,
        closingBalance: actualBalance,
        difference,
        notes,
      },
    });
  }

  // Listar caixas
  async list(filters: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { status, startDate, endDate, page = 1, limit = 25 } = filters;

    const where: any = {};

    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [reports, total] = await Promise.all([
      prisma.dailyCashReport.findMany({
        where,
        include: {
          transactions: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.dailyCashReport.count({ where }),
    ]);

    return {
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Relatório resumido de período
  async getSummary(startDate: Date, endDate: Date) {
    const reports = await prisma.dailyCashReport.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      cashIncome: 0,
      cardIncome: 0,
      pixIncome: 0,
      cashExpense: 0,
      cardExpense: 0,
      pixExpense: 0,
      netFlow: 0,
      daysCount: reports.length,
    };

    for (const report of reports) {
      summary.totalIncome += Number(report.totalIncome);
      summary.totalExpense += Number(report.totalExpense);
      summary.cashIncome += Number(report.cashIncome);
      summary.cardIncome += Number(report.cardIncome);
      summary.pixIncome += Number(report.pixIncome);
      summary.cashExpense += Number(report.cashExpense);
      summary.cardExpense += Number(report.cardExpense);
      summary.pixExpense += Number(report.pixExpense);
    }

    summary.netFlow = summary.totalIncome - summary.totalExpense;

    return summary;
  }
}

export default new DailyCashService();
