'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    FileText,
    Settings,
    LogOut,
    ArrowUpCircle,
    ArrowDownCircle
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/store/auth.store';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'PDV / Vendas', href: '/dashboard/pos', icon: ShoppingCart },
    { name: 'Produtos', href: '/dashboard/products', icon: Package },
    { name: 'Clientes', href: '/dashboard/customers', icon: Users },
    { name: 'Contas a Pagar', href: '/dashboard/finance/payables', icon: ArrowUpCircle },
    { name: 'Contas a Receber', href: '/dashboard/finance/receivables', icon: ArrowDownCircle },
    { name: 'Relatórios', href: '/dashboard/reports', icon: FileText },
    { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const logout = useAuthStore((state) => state.logout);

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
            <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
                <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
                    <h1 className="text-xl font-bold text-white">PDVWeb C1</h1>
                </div>
                <div className="flex-1 flex flex-col overflow-y-auto">
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        isActive
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                    )}
                                >
                                    <item.icon
                                        className={clsx(
                                            isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                                            'mr-3 flex-shrink-0 h-6 w-6'
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex bg-gray-700 p-4">
                    <button
                        onClick={() => logout()}
                        className="flex-shrink-0 w-full group block"
                    >
                        <div className="flex items-center">
                            <LogOut className="inline-block h-9 w-9 rounded-full text-gray-400 p-1 border-2 border-gray-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white group-hover:text-gray-300">
                                    Sair
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
