import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { FinancialStats } from '@/components/dashboard/financial-stats';

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user);
    const [financialData, setFinancialData] = useState({
        payables: { pending: 3500.00, paidThisMonth: 1200.00 },
        receivables: { pending: 5800.50, receivedThisMonth: 2100.00 }
    });

    return (
        <div>
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Bem vindo, {user?.firstName || 'Usuário'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Visão geral do seu negócio e finanças.
                    </p>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Financeiro
                </h3>
                <FinancialStats data={financialData} />
            </div>

            <div className="mt-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Atividades Recentes
                    </h3>
                    <div className="border-t border-gray-200 py-4">
                        <p className="text-gray-500 text-sm">Nenhuma atividade recente encontrada.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
