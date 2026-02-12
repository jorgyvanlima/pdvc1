import React from 'react';
import { Badge } from "./Badge";
import { cn } from "../../lib/utils";

interface StatusBadgeProps {
    status: string;
    virtualStatus?: string; // For calculated statuses like OVERDUE
}

export function StatusBadge({ status, virtualStatus }: StatusBadgeProps) {
    const displayStatus = virtualStatus || status;

    let label = displayStatus;
    let className = "bg-gray-500";

    switch (displayStatus) {
        case "PAID":
            label = "PAGO";
            className = "bg-green-600 hover:bg-green-700";
            break;
        case "PENDING":
            label = "PENDENTE";
            className = "bg-gray-500 hover:bg-gray-600";
            break;
        case "OVERDUE":
            label = "VENCIDO";
            className = "bg-red-600 hover:bg-red-700";
            break;
        case "DUE_TODAY":
            label = "VENCE HOJE";
            className = "bg-yellow-500 hover:bg-yellow-600 text-black";
            break;
        case "DUE_SOON":
            label = "VENCE EM BREVE";
            className = "bg-blue-500 hover:bg-blue-600";
            break;
        case "CANCELLED":
            label = "CANCELADO";
            className = "bg-gray-300 text-gray-700 hover:bg-gray-400";
            break;
    }

    return <Badge className={cn("text-white border-0", className)}>{label}</Badge>;
}
