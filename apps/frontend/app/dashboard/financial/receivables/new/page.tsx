'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Simple Input Component
const Input = ({ label, error, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>
        <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...props} />
        {error && <p className="text-sm font-medium text-destructive text-red-500">{error.message}</p>}
    </div>
);

// Simple Select Component
const Select = ({ label, options, error, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-sm font-medium leading-none">{label}</label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...props}>
            <option value="">Selecione...</option>
            {options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        {error && <p className="text-sm font-medium text-destructive text-red-500">{error.message}</p>}
    </div>
);


export default function NewReceivablePage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Fetch customers and categories
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const [custRes, catRes] = await Promise.all([
                    axios.get(`${API_URL}/customers`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/finance/categories?type=INCOME`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setCustomers(custRes.data.map((c: any) => ({ value: c.id, label: c.name })));
                setCategories(catRes.data.map((c: any) => ({ value: c.id, label: c.name })));
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');

            const formData = new FormData();
            formData.append('description', data.description);
            formData.append('amount', data.amount);
            formData.append('dueDate', data.dueDate);
            if (data.customerId) formData.append('customerId', data.customerId);
            if (data.categoryId) formData.append('categoryId', data.categoryId);
            if (data.note) formData.append('note', data.note);

            if (data.files && data.files.length > 0) {
                for (let i = 0; i < data.files.length; i++) {
                    formData.append('files', data.files[i]);
                }
            }

            await axios.post(`${API_URL}/finance/receivables`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            router.push('/dashboard/financial/receivables');
        } catch (error) {
            alert('Erro ao criar conta a receber');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Nova Conta a Receber</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalhes da Conta</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Descrição"
                            placeholder="Ex: Venda Serviço"
                            {...register('description', { required: 'Descrição é obrigatória' })}
                            error={errors.description}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Valor (R$)"
                                type="number"
                                step="0.01"
                                {...register('amount', { required: 'Valor é obrigatório' })}
                                error={errors.amount}
                            />
                            <Input
                                label="Data de Vencimento"
                                type="date"
                                {...register('dueDate', { required: 'Data é obrigatória' })}
                                error={errors.dueDate}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Cliente"
                                options={customers}
                                {...register('customerId')}
                            />
                            <Select
                                label="Categoria"
                                options={categories}
                                {...register('categoryId')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Anexos (Comprovantes)</label>
                            <input
                                type="file"
                                multiple
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                {...register('files')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Observações</label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...register('note')}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Recebimento'}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
