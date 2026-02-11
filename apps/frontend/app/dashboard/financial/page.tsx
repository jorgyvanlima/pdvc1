'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowUpIcon, ArrowDownIcon, DollarSign, Wallet, FileText, PieChart } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function FinancialDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`${API_URL}/finance/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8">Carregando dados financeiros...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
                <div className="flex gap-2">
                    <Button onClick={() => window.location.href = '/dashboard/financial/payables/new'}>+ Conta a Pagar</Button>
                    <Button onClick={() => window.location.href = '/dashboard/financial/receivables/new'} variant="secondary">+ Conta a Receber</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">A Pagar (Pendente)</CardTitle>
                        <ArrowDownIcon className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {Number(stats?.payables?.pending || 0).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Total em aberto</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">A Receber (Pendente)</CardTitle>
                        <ArrowUpIcon className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {Number(stats?.receivables?.pending || 0).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Total em aberto</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Entradas (Mês)</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {Number(stats?.cashFlow?.incomeMonth || 0).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Recebido este mês</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saídas (Mês)</CardTitle>
                        <DollarSign className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {Number(stats?.cashFlow?.expenseMonth || 0).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Pago este mês</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Contas Bancárias</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.accounts?.length > 0 ? stats.accounts.map((acc: any) => (
                                <div key={acc.name} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div className="flex items-center space-x-4">
                                        <Wallet className="h-6 w-6 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium leading-none">{acc.name}</p>
                                            <p className="text-sm text-muted-foreground">{acc.bankName || 'Caixa'}</p>
                                        </div>
                                    </div>
                                    <div className="font-bold text-green-600">R$ {Number(acc.currentBalance).toFixed(2)}</div>
                                </div>
                            )) : <p className="text-muted-foreground">Nenhuma conta cadastrada.</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Acesso Rápido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/dashboard/financial/payables'}>
                                <FileText className="mr-2 h-4 w-4" /> Ver Contas a Pagar
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/dashboard/financial/receivables'}>
                                <FileText className="mr-2 h-4 w-4" /> Ver Contas a Receber
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/dashboard/reports'}>
                                <PieChart className="mr-2 h-4 w-4" /> Relatórios
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
