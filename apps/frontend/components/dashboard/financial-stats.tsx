import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";

interface FinancialStatsProps {
    data: {
        payables: {
            pending: number;
            paidThisMonth: number;
        };
        receivables: {
            pending: number;
            receivedThisMonth: number;
        };
    };
}

export function FinancialStats({ data }: FinancialStatsProps) {
    const cashFlow = (data?.receivables?.receivedThisMonth || 0) - (data?.payables?.paidThisMonth || 0);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Contas a Receber (Pendente)</CardTitle>
                    <ArrowDownCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        R$ {Number(data?.receivables?.pending || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total em aberto</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Contas a Pagar (Pendente)</CardTitle>
                    <ArrowUpCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                        R$ {Number(data?.payables?.pending || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total a vencer</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recebido (Mês)</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        R$ {Number(data?.receivables?.receivedThisMonth || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">Entradas este mês</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fluxo de Caixa (Mês)</CardTitle>
                    <Wallet className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {cashFlow.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">Entradas - Saídas</p>
                </CardContent>
            </Card>
        </div>
    );
}
