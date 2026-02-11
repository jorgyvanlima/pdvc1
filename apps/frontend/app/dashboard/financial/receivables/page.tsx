'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function ReceivablesPage() {
    const [receivables, setReceivables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReceivables = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/finance/receivables`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReceivables(response.data);
        } catch (error) {
            console.error('Error fetching receivables:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReceivables();
    }, []);

    const handleReceive = async (id: number) => {
        if (!confirm('Confirmar recebimento desta conta?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/finance/receivables/${id}/receive`,
                { paymentMethod: 'CASH', bankAccountId: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchReceivables();
        } catch (error) {
            alert('Erro ao receber conta');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Contas a Receber</h1>
                <Button onClick={() => window.location.href = '/dashboard/financial/receivables/new'}>+ Nova Conta</Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Descrição</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Cliente</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Vencimento</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Valor</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-4 text-center">Carregando...</td></tr>
                                ) : receivables.length === 0 ? (
                                    <tr><td colSpan={6} className="p-4 text-center">Nenhuma conta encontrada.</td></tr>
                                ) : (
                                    receivables.map((rec) => (
                                        <tr key={rec.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle font-medium">{rec.description}</td>
                                            <td className="p-4 align-middle">{rec.customer?.name || '-'}</td>
                                            <td className="p-4 align-middle">
                                                {format(new Date(rec.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                                                {rec.virtualStatus === 'DUE_SOON' && <span className="ml-2 text-xs text-yellow-600">(Em breve)</span>}
                                            </td>
                                            <td className="p-4 align-middle font-bold text-green-600">R$ {Number(rec.amount).toFixed(2)}</td>
                                            <td className="p-4 align-middle">
                                                <StatusBadge status={rec.status} virtualStatus={rec.virtualStatus} />
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                {rec.status !== 'PAID' && (
                                                    <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleReceive(rec.id)}>Receber</Button>
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
