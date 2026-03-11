import Card from '@/components/ui/Card'
import { NumericFormat } from 'react-number-format'
import { getCurrencySymbol } from '@/utils/currencySymbols'

type PaymentInfoProps = {
    label?: string
    value?: number | null
    isLast?: boolean
    currency?: string
}

type PaymentSummaryProps = {
    data?: {
        amount?: number | null
        settlement_amount?: number | null
        merchant_fee?: number | null
        status?: string
        currency?: string
    }
}

const PaymentInfo = ({ label, value, isLast, currency }: PaymentInfoProps) => {
    const hasValue = typeof value === 'number' && Number.isFinite(value)
    const displayValue = hasValue ? value / 100 : 0
    const currencySymbol = getCurrencySymbol(currency, '$')
    
    return (
        <li
            className={`flex items-center justify-between${!isLast ? ' mb-3' : ''
                }`}
        >
            <span>{label}</span>
            <span className="font-semibold">
                {hasValue ? (
                    <NumericFormat
                        displayType="text"
                        value={(Math.round(displayValue * 100) / 100).toFixed(3)}
                        prefix={currencySymbol}
                        thousandSeparator={true}
                    />
                ) : (
                    '-'
                )}
            </span>
        </li>
    )
}

const PaymentSummary = ({ data }: PaymentSummaryProps) => {
    const settlementValue =
        data?.status === 'SUCCESS' ? data?.settlement_amount ?? null : null

    return (
        <Card className="mb-4">
            <h5 className="mb-4">Payment Summary</h5>
            <ul>
                <PaymentInfo label="Amount" value={data?.amount} currency={data?.currency} />
                <PaymentInfo label="Fee" value={data?.merchant_fee} currency={data?.currency} />
                <hr className="mb-3" />
                <PaymentInfo isLast label="Settlement " value={settlementValue} currency={data?.currency} />
            </ul>
        </Card>
    )
}

export default PaymentSummary
