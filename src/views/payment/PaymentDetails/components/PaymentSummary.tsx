import Card from '@/components/ui/Card'
import { NumericFormat } from 'react-number-format'

type PaymentInfoProps = {
    label?: string
    value?: number | null
    isLast?: boolean
}

type PaymentSummaryProps = {
    data?: {
        amount?: number | null
        settlement?: number | null
        fee?: number | null
    }
}

const PaymentInfo = ({ label, value, isLast }: PaymentInfoProps) => {
    const hasValue = typeof value === 'number' && Number.isFinite(value)
    const displayValue = hasValue ? value / 100 : undefined
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
                        prefix={'$'}
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
    return (
        <Card className="mb-4">
            <h5 className="mb-4">Payment Summary</h5>
            <ul>
                <PaymentInfo label="Amount" value={data?.amount} />
                <PaymentInfo label="fee(6%)费用" value={data?.fee} />
                <hr className="mb-3" />
                <PaymentInfo isLast label="Settlement " value={data?.settlement } />
            </ul>
        </Card>
    )
}

export default PaymentSummary
