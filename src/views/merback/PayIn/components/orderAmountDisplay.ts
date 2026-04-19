import { getCurrencySymbol } from '@/utils/currencySymbols'

type OrderAmountDisplayInput = {
    amount: number
    currency?: string
    transaction_type?: string
}

export const getOrderAmountDisplay = ({
    amount,
    currency,
    transaction_type,
}: OrderAmountDisplayInput) => {
    const isIncome = transaction_type === 'PAY_IN'
    const amountInYuan = amount / 100

    return {
        className: isIncome
            ? 'text-emerald-600 font-semibold'
            : 'text-red-600 font-semibold',
        prefix: getCurrencySymbol(currency, '$'),
        sign: isIncome ? '+' : '-',
        value: (Math.trunc(amountInYuan * 100) / 100).toFixed(2),
    }
}
