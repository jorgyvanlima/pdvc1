'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function AccountsPayablePage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data for now until API is connected
    useEffect(() => {
        // In a real app, fetch from /api/v1/finance/payables
        setBills([
            { id: 1, description: 'Fornecedor A - Compra #123', amount: 1500.00, dueDate: '2023-10-25', status: 'PENDING' },
            { id: 2, description: 'Aluguel', amount: 2000.00, dueDate: '2023-10-30', status: 'PENDING' },
            { id: 3, description: 'Internet', amount: 150.00, dueDate: '2023-10-15', status: 'PAID' },
        ]);
        setLoading(false);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nova Conta
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar contas..." className="pl-8" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Contas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bills.map((bill: any) => (
                                <TableRow key={bill.id}>
                                    <TableCell>{bill.description}</TableCell>
                                    <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                                    <TableCell>R$ {bill.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={bill.status === 'PAID' ? 'default' : 'destructive'}>
                                            {bill.status === 'PAID' ? 'Pago' : 'Pendente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
