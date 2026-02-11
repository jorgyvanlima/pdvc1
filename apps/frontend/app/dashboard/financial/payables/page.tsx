'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function PayablesPage() {
    const [payables, setPayables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPayables = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/finance/payables`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayables(response.data);
        } catch (error) {
            console.error('Error fetching payables:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayables();
    }, []);

    const handlePay = async (id: number) => {
        if (!confirm('Confirmar pagamento desta conta?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/finance/payables/${id}/pay`,
                { paymentMethod: 'CASH', bankAccountId: 1 }, // Defaulting for MVP
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchPayables();
        } catch (error) {
            alert('Erro ao pagar conta');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar</h1>
                <Button onClick={() => window.location.href = '/dashboard/financial/payables/new'}>+ Nova Conta</Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Descrição</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fornecedor</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Vencimento</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Valor</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-4 text-center">Carregando...</td></tr>
                                ) : payables.length === 0 ? (
                                    <tr><td colSpan={6} className="p-4 text-center">Nenhuma conta encontrada.</td></tr>
                                ) : (
                                    payables.map((payable) => (
                                        <tr key={payable.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle font-medium">{payable.description}</td>
                                            <td className="p-4 align-middle">{payable.supplier?.name || '-'}</td>
                                            <td className="p-4 align-middle">
                                                {format(new Date(payable.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                                                {payable.virtualStatus === 'DUE_SOON' && <span className="ml-2 text-xs text-yellow-600">(Em breve)</span>}
                                            </td>
                                            <td className="p-4 align-middle font-bold">R$ {Number(payable.amount).toFixed(2)}</td>
                                            <td className="p-4 align-middle">
                                                <StatusBadge status={payable.status} virtualStatus={payable.virtualStatus} />
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                {payable.status !== 'PAID' && (
                                                    <Button size="sm" variant="outline" onClick={() => handlePay(payable.id)}>Pay</Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
