import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { NumericFormat } from 'react-number-format'
import RefundDialog from './RefundDialog'

type PaymentInfoProps = {
    data?: {
        payment_id?: string
        subject?: string
        amount?: number
        currency?: string
        status?: string
        app_id?: string
        orderLogo?: string
    }
    onRefresh?: () => void
}

const PaymentInfo = ({ data, onRefresh }: PaymentInfoProps) => {
    const [refundDialogOpen, setRefundDialogOpen] = useState(false)

    // 只有支付成功的订单才能退款
    const canRefund = data?.status === 'SUCCESS'

    const handleRefundClick = () => {
        if (canRefund) {
            setRefundDialogOpen(true)
        }
    }

    return (
        <>
            <Card className="mb-4">
                <h5 className="mb-4">{data?.subject}</h5>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Avatar size={60} src={data?.orderLogo} />
                        <div className="ltr:ml-2 rtl:mr-2">
                            <span>
                                {data?.subject}
                            </span>
                        </div>
                    </div>
                    <span className="font-semibold">
                        <NumericFormat
                            displayType="text"
                            value={(
                                Math.round((data?.amount || 0) * 100) / 100
                            ).toFixed(3)}
                            prefix={'$'}
                            thousandSeparator={true}
                        />
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <Button className="w-full" variant="twoTone" color="yellow-500">
                        回调
                    </Button>
                    <Button 
                        className="w-full" 
                        variant="twoTone" 
                        color="blue-600"
                        onClick={handleRefundClick}
                        disabled={!canRefund}
                    >
                        退款
                    </Button>
                    <Button className="w-full" variant="twoTone" color="red-600">
                        手动成功
                    </Button>
                </div>
            </Card>

            {data?.payment_id && (
                <RefundDialog
                    isOpen={refundDialogOpen}
                    onClose={() => setRefundDialogOpen(false)}
                    paymentId={data.payment_id}
                    paymentAmount={data.amount || 0}
                    currency={data.currency || 'USD'}
                    onSuccess={onRefresh}
                />
            )}
        </>
    )
}

export default PaymentInfo
