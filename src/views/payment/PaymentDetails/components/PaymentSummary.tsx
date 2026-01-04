import Card from '@/components/ui/Card'
import { NumericFormat } from 'react-number-format'

type PaymentInfoProps = {
    label?: string
    value?: number
    isLast?: boolean
}

type PaymentSummaryProps = {
    data?: {
        subAmount: number
        Amount: number
        Fees: number
        total: number
    }
}

const PaymentInfo = ({ label, value, isLast }: PaymentInfoProps) => {
    return (
        <li
            className={`flex items-center justify-between${!isLast ? ' mb-3' : ''
                }`}
        >
            <span>{label}</span>
            <span className="font-semibold">
                <NumericFormat
                    displayType="text"
                    value={(Math.round((value as number) * 100) / 100).toFixed(
                        3
                    )}
                    prefix={'$'}
                    thousandSeparator={true}
                />
            </span>
        </li>
    )
}

const PaymentSummary = ({ data }: PaymentSummaryProps) => {
    return (
        <Card className="mb-4">
            <h5 className="mb-4">Payment Summary</h5>
            <ul>
                <PaymentInfo label="subAmount提交金额" value={data?.subAmount} />
                <PaymentInfo label="fee(6%)费用" value={data?.Fees} />
                <PaymentInfo label="Amount实收" value={data?.Amount} />
                <hr className="mb-3" />
                <PaymentInfo isLast label="Total总计" value={data?.total} />
            </ul>
        </Card>
    )
}

export default PaymentSummary
