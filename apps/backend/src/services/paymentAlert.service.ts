import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PaymentAlertService {
  // Criar alertas automaticamente para contas vencendo
  async generateAlertsForDueAccounts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Datas de alerta
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const in3Days = new Date(today);
    in3Days.setDate(in3Days.getDate() + 3);

    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    // Contas a pagar vencendo hoje
    await this.createAlertsForPayables(today, 'DUE_TODAY', 'URGENT');

    // Contas a pagar vencendo amanhã
    await this.createAlertsForPayables(tomorrow, 'DUE_TOMORROW', 'HIGH');

    // Contas a pagar vencendo em 3 dias
    await this.createAlertsForPayables(in3Days, 'DUE_IN_3_DAYS', 'MEDIUM');

    // Contas a pagar vencendo em 7 dias
    await this.createAlertsForPayables(in7Days, 'DUE_IN_7_DAYS', 'LOW');

    // Contas a pagar vencidas
    await this.createOverdueAlerts();

    // Mesmo para contas a receber
    await this.createAlertsForReceivables(today, 'DUE_TODAY', 'URGENT');
    await this.createAlertsForReceivables(tomorrow, 'DUE_TOMORROW', 'HIGH');
    await this.createAlertsForReceivables(in3Days, 'DUE_IN_3_DAYS', 'MEDIUM');
    await this.createAlertsForReceivables(in7Days, 'DUE_IN_7_DAYS', 'LOW');
    await this.createOverdueReceivablesAlerts();

    return { success: true, message: 'Alerts generated' };
  }

  // Criar alertas para contas a pagar
  private async createAlertsForPayables(dueDate: Date, type: string, priority: string) {
    const accounts = await prisma.accountsPayable.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: dueDate,
          lt: new Date(dueDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    for (const account of accounts) {
      // Verificar se já existe alerta
      const existingAlert = await prisma.paymentAlert.findFirst({
        where: {
          accountsPayableId: account.id,
          type,
          alertDate: {
            gte: new Date(),
          },
        },
      });

      if (!existingAlert) {
        await prisma.paymentAlert.create({
          data: {
            accountsPayableId: account.id,
            alertDate: new Date(),
            dueDate: account.dueDate,
            amount: account.amount,
            type,
            priority,
          },
        });
      }
    }
  }

  // Criar alertas para contas vencidas
  private async createOverdueAlerts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const accounts = await prisma.accountsPayable.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: today,
        },
      },
    });

    for (const account of accounts) {
      const existingAlert = await prisma.paymentAlert.findFirst({
        where: {
          accountsPayableId: account.id,
          type: 'OVERDUE',
          alertDate: {
            gte: today,
          },
        },
      });

      if (!existingAlert) {
        await prisma.paymentAlert.create({
          data: {
            accountsPayableId: account.id,
            alertDate: new Date(),
            dueDate: account.dueDate,
            amount: account.amount,
            type: 'OVERDUE',
            priority: 'URGENT',
          },
        });
      }
    }
  }

  // Criar alertas para contas a receber
  private async createAlertsForReceivables(dueDate: Date, type: string, priority: string) {
    const accounts = await prisma.accountsReceivable.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: dueDate,
          lt: new Date(dueDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    for (const account of accounts) {
      const existingAlert = await prisma.paymentAlert.findFirst({
        where: {
          accountsReceivableId: account.id,
          type,
          alertDate: {
            gte: new Date(),
          },
        },
      });

      if (!existingAlert) {
        await prisma.paymentAlert.create({
          data: {
            accountsReceivableId: account.id,
            alertDate: new Date(),
            dueDate: account.dueDate,
            amount: account.amount,
            type,
            priority,
          },
        });
      }
    }
  }

  // Criar alertas para contas a receber vencidas
  private async createOverdueReceivablesAlerts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const accounts = await prisma.accountsReceivable.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: today,
        },
      },
    });

    for (const account of accounts) {
      const existingAlert = await prisma.paymentAlert.findFirst({
        where: {
          accountsReceivableId: account.id,
          type: 'OVERDUE',
          alertDate: {
            gte: today,
          },
        },
      });

      if (!existingAlert) {
        await prisma.paymentAlert.create({
          data: {
            accountsReceivableId: account.id,
            alertDate: new Date(),
            dueDate: account.dueDate,
            amount: account.amount,
            type: 'OVERDUE',
            priority: 'URGENT',
          },
        });
      }
    }
  }

  // Listar alertas  
  async list(filters: {
    read?: boolean;
    dismissed?: boolean;
    priority?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const { read, dismissed, priority, type, page = 1, limit = 50 } = filters;

    const where: any = {};

    if (read !== undefined) where.read = read;
    if (dismissed !== undefined) where.dismissed = dismissed;
    if (priority) where.priority = priority;
    if (type) where.type = type;

    const [alerts, total] = await Promise.all([
      prisma.paymentAlert.findMany({
        where,
        include: {
          accountsPayable: {
            include: {
              supplier: true,
            },
          },
          accountsReceivable: {
            include: {
              customer: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { alertDate: 'desc' },
        ],
      }),
      prisma.paymentAlert.count({ where }),
    ]);

    return {
      alerts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Marcar alerta como lido
  async markAsRead(id: number) {
    return await prisma.paymentAlert.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  // Descartar alerta
  async dismiss(id: number) {
    return await prisma.paymentAlert.update({
      where: { id },
      data: {
        dismissed: true,
      },
    });
  }

  // Obter contagem de alertas não lidos
  async getUnreadCount() {
    return await prisma.paymentAlert.count({
      where: {
        read: false,
        dismissed: false,
      },
    });
  }

  // Dashboard: alertas por prioridade
  async getAlertsByPriority() {
    const alerts = await prisma.paymentAlert.groupBy({
      by: ['priority'],
      where: {
        read: false,
        dismissed: false,
      },
      _count: true,
    });

    return alerts.reduce((acc: any, item: any) => {
      acc[item.priority] = item._count;
      return acc;
    }, {});
  }
}

export default new PaymentAlertService();
