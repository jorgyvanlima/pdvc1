import { PrismaClient } from '@prisma/client';
import AccountsPayableService from './accountsPayable.service';
import AccountsReceivableService from './accountsReceivable.service';
import DailyCashService from './dailyCash.service';
import PaymentAlertService from './paymentAlert.service';

const prisma = new PrismaClient();

export class FinancialDashboardService {
  // Dashboard principal - visão geral
  async getDashboardOverview(startDate?: Date, endDate?: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const dateRange = {
      startDate: startDate || startOfMonth,
      endDate: endDate || endOfMonth,
    };

    // Contas a pagar
    const [totalPayable, overduePayable, dueSoonPayable] = await Promise.all([
      AccountsPayableService.getTotalPayable(dateRange),
      AccountsPayableService.getOverdue(),
      AccountsPayableService.getDueSoon(7),
    ]);

    // Contas a receber
    const [totalReceivable, overdueReceivable, dueSoonReceivable] = await Promise.all([
      AccountsReceivableService.getTotalReceivable(dateRange),
      AccountsReceivableService.getOverdue(),
      AccountsReceivableService.getDueSoon(7),
    ]);

    // Fluxo de caixa
    const cashFlow = await DailyCashService.getSummary(dateRange.startDate, dateRange.endDate);

    // Alertas
    const [unreadAlerts, alertsByPriority] = await Promise.all([
      PaymentAlertService.getUnreadCount(),
      PaymentAlertService.getAlertsByPriority(),
    ]);

    // Saldo projetado
    const projectedBalance = Number(totalReceivable.total) - Number(totalPayable.total);

    return {
      accountsPayable: {
        total: totalPayable.total,
        count: totalPayable.count,
        overdue: {
          total: overduePayable.reduce((sum, acc) => sum + Number(acc.amount), 0),
          count: overduePayable.length,
        },
        dueSoon: {
          total: dueSoonPayable.reduce((sum, acc) => sum + Number(acc.amount), 0),
          count: dueSoonPayable.length,
        },
      },
      accountsReceivable: {
        total: totalReceivable.total,
        count: totalReceivable.count,
        overdue: {
          total: overdueReceivable.reduce((sum, acc) => sum + Number(acc.amount), 0),
          count: overdueReceivable.length,
        },
        dueSoon: {
          total: dueSoonReceivable.reduce((sum, acc) => sum + Number(acc.amount), 0),
          count: dueSoonReceivable.length,
        },
      },
      cashFlow: {
        totalIncome: cashFlow.totalIncome,
        totalExpense: cashFlow.totalExpense,
        netFlow: cashFlow.netFlow,
        byMethod: {
          cash: {
            income: cashFlow.cashIncome,
            expense: cashFlow.cashExpense,
          },
          card: {
            income: cashFlow.cardIncome,
            expense: cashFlow.cardExpense,
          },
          pix: {
            income: cashFlow.pixIncome,
            expense: cashFlow.pixExpense,
          },
        },
      },
      projectedBalance,
      alerts: {
        unread: unreadAlerts,
        byPriority: alertsByPriority,
      },
      period: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    };
  }

  // Fluxo de caixa projetado (próximos 30 dias)
  async getProjectedCashFlow(days: number = 30) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);

    // Contas a receber projetadas
    const receivables = await prisma.accountsReceivable.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: today,
          lte: endDate,
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Contas a pagar projetadas
    const payables = await prisma.accountsPayable.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: today,
          lte: endDate,
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Agrupar por data
    const projection: any = {};

    for (let i = 0; i <= days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];

      projection[dateKey] = {
        date: dateKey,
        income: 0,
        expense: 0,
        balance: 0,
      };
    }

    // Adicionar receitas
    for (const receivable of receivables) {
      const dateKey = receivable.dueDate.toISOString().split('T')[0];
      if (projection[dateKey]) {
        projection[dateKey].income += Number(receivable.amount);
      }
    }

    // Adicionar despesas
    for (const payable of payables) {
      const dateKey = payable.dueDate.toISOString().split('T')[0];
      if (projection[dateKey]) {
        projection[dateKey].expense += Number(payable.amount);
      }
    }

    // Calcular balanço acumulado
    let cumulativeBalance = 0;
    const projectionArray = Object.values(projection);

    for (const day of projectionArray as any[]) {
      const dayBalance = day.income - day.expense;
      cumulativeBalance += dayBalance;
      day.balance = cumulativeBalance;
      day.netFlow = dayBalance;
    }

    return projectionArray;
  }

  // Análise por categoria
  async getCategoryAnalysis(startDate: Date, endDate: Date) {
    // Contas a pagar por categoria
    const payablesByCategory = await prisma.accountsPayable.groupBy({
      by: ['categoryId'],
      where: {
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Contas a receber por categoria
    const receivablesByCategory = await prisma.accountsReceivable.groupBy({
      by: ['categoryId'],
      where: {
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Buscar nomes das categorias
    const categoryIds = [
      ...payablesByCategory.map((p) => p.categoryId).filter(Boolean),
      ...receivablesByCategory.map((r) => r.categoryId).filter(Boolean),
    ];

    const categories = await prisma.financialCategory.findMany({
      where: {
        id: {
          in: categoryIds as number[],
        },
      },
    });

    const categoryMap = categories.reduce((acc: any, cat: any) => {
      acc[cat.id] = cat;
      return acc;
    }, {});

    return {
      expenses: payablesByCategory.map((item: any) => ({
        category: categoryMap[item.categoryId] || { name: 'Sem categoria', type: 'EXPENSE' },
        total: item._sum.amount || 0,
        count: item._count,
      })),
      income: receivablesByCategory.map((item: any) => ({
        category: categoryMap[item.categoryId] || { name: 'Sem categoria', type: 'INCOME' },
        total: item._sum.amount || 0,
        count: item._count,
      })),
    };
  }

  // Top fornecedores (maiores despesas)
  async getTopSuppliers(limit: number = 10, startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = startDate;
      if (endDate) where.dueDate.lte = endDate;
    }

    const suppliers = await prisma.accountsPayable.groupBy({
      by: ['supplierId'],
      where: {
        ...where,
        supplierId: {
          not: null,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: limit,
    });

    const supplierIds = suppliers.map((s) => s.supplierId).filter(Boolean) as number[];
    const supplierData = await prisma.supplier.findMany({
      where: {
        id: {
          in: supplierIds,
        },
      },
    });

    const supplierMap = supplierData.reduce((acc: any, sup: any) => {
      acc[sup.id] = sup;
      return acc;
    }, {});

    return suppliers.map((item: any) => ({
      supplier: supplierMap[item.supplierId],
      totalAmount: item._sum.amount || 0,
      accountsCount: item._count,
    }));
  }

  // Top clientes (maiores recebimentos)
  async getTopCustomers(limit: number = 10, startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = startDate;
      if (endDate) where.dueDate.lte = endDate;
    }

    const customers = await prisma.accountsReceivable.groupBy({
      by: ['customerId'],
      where: {
        ...where,
        customerId: {
          not: null,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: limit,
    });

    const customerIds = customers.map((c) => c.customerId).filter(Boolean) as number[];
    const customerData = await prisma.customer.findMany({
      where: {
        id: {
          in: customerIds,
        },
      },
    });

    const customerMap = customerData.reduce((acc: any, cust: any) => {
      acc[cust.id] = cust;
      return acc;
    }, {});

    return customers.map((item: any) => ({
      customer: customerMap[item.customerId],
      totalAmount: item._sum.amount || 0,
      accountsCount: item._count,
    }));
  }
}

export default new FinancialDashboardService();
