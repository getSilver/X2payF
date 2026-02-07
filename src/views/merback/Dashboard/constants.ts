// 支付状态颜色映射
export const statusColor: Record<
    number,
    {
        label: string
        dotClass: string
        textClass: string
    }
> = {
    0: {
        label: 'PENDING',
        dotClass: 'bg-gray-400',
        textClass: 'text-gray-600',
    },
    1: {
        label: 'APPROVED',
        dotClass: 'bg-blue-500',
        textClass: 'text-blue-600',
    },
    2: {
        label: 'COMPLETED',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-600',
    },
    3: {
        label: 'REJECTED',
        dotClass: 'bg-red-500',
        textClass: 'text-red-600',
    },
    4: {
        label: 'CANCELLED',
        dotClass: 'bg-orange-500',
        textClass: 'text-orange-600',
    },
    5: {
        label: 'CLOSED',
        dotClass: 'bg-gray-500',
        textClass: 'text-gray-600',
    },
    6: {
        label: 'Refund',
        dotClass: 'bg-purple-500',
        textClass: 'text-purple-600',
    },
}
