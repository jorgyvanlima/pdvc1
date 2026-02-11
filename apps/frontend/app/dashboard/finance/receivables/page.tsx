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

export default function AccountsReceivablePage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data
    useEffect(() => {
        setInvoices([
            { id: 1, description: 'Cliente X - Venda #500', amount: 350.00, dueDate: '2023-10-20', status: 'PENDING' },
            { id: 2, description: 'Cliente Y - Venda #501', amount: 120.00, dueDate: '2023-10-22', status: 'PAID' },
        ]);
        setLoading(false);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Contas a Receber</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Novo Lançamento
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar lançamentos..." className="pl-8" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lançamentos</CardTitle>
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
                            {invoices.map((inv: any) => (
                                <TableRow key={inv.id}>
                                    <TableCell>{inv.description}</TableCell>
                                    <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                                    <TableCell>R$ {inv.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={inv.status === 'PAID' ? 'default' : 'outline'}>
                                            {inv.status === 'PAID' ? 'Recebido' : 'Pendente'}
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
