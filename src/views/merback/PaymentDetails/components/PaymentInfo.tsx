import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { NumericFormat } from 'react-number-format'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import RefundDialog from './RefundDialog'
import { apiResendPaymentNotification } from '@/services/PaymentService'
import { getCurrencySymbol } from '@/utils/currencySymbols'

type PaymentInfoProps = {
    data?: {
        payment_id?: string
        subject?: string
        amount?: number | null
        currency?: string
        status?: string
        orderLogo?: string
    }
    onRefresh?: () => void
}

const PaymentInfo = ({ data, onRefresh }: PaymentInfoProps) => {
    const [isNotifying, setIsNotifying] = useState(false)
    const [refundDialogOpen, setRefundDialogOpen] = useState(false)

    // 只有支付成功的订单才能退款
    const canRefund = data?.status === 'SUCCESS'

    const handleRefundClick = () => {
        if (canRefund && data?.payment_id) {
            setRefundDialogOpen(true)
        }
    }

    const handleNotifyClick = async () => {
        if (!data?.payment_id) return
        
        setIsNotifying(true)
        try {
            // 调用回调 API
            await apiResendPaymentNotification(data.payment_id)
            
            // 显示成功通知
            toast.push(
                <Notification
                    title="回调成功"
                    type="success"
                >
                    通知已重新发送到商户回调地址
                </Notification>,
                {
                    placement: 'top-center',
                }
            )
            
            // 刷新数据
            if (onRefresh) {
                onRefresh()
            }
        } catch (error: any) {
            // 显示错误通知
            const errorMessage = error?.response?.data?.message || error?.message || '回调失败'
            toast.push(
                <Notification
                    title="回调失败"
                    type="danger"
                >
                    {errorMessage}
                </Notification>,
                {
                    placement: 'top-center',
                }
            )
        } finally {
            setIsNotifying(false)
        }
    }

    const hasAmount = typeof data?.amount === 'number' && Number.isFinite(data.amount) && data.amount !== null
    const displayAmount = hasAmount && data?.amount ? data.amount / 100 : 0
    const currencySymbol = getCurrencySymbol(data?.currency, '$')

    return (
        <>
            <Card className="mb-4">
                <h5 className="mb-4">{data?.subject || '订单信息'}</h5>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Avatar size={60} src={data?.orderLogo} />
                        <div className="ltr:ml-2 rtl:mr-2">
                            <span>
                                {data?.subject || '-'}
                            </span>
                        </div>
                    </div>
                    <span className="font-semibold">
                        {hasAmount ? (
                            <NumericFormat
                                displayType="text"
                                value={(Math.round(displayAmount * 100) / 100).toFixed(3)}
                                prefix={currencySymbol}
                                thousandSeparator={true}
                            />
                        ) : (
                            '-'
                        )}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button 
                        className="w-full" 
                        variant="twoTone" 
                        color="yellow-500"
                        onClick={handleNotifyClick}
                        loading={isNotifying}
                        disabled={isNotifying}
                    >
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
                </div>
            </Card>

            {data?.payment_id && data?.amount && (
                <RefundDialog
                    isOpen={refundDialogOpen}
                    onClose={() => setRefundDialogOpen(false)}
                    paymentId={data.payment_id}
                    paymentAmount={data.amount}
                    currency={data.currency || 'USD'}
                    onSuccess={onRefresh}
                />
            )}
        </>
    )
}

export default PaymentInfo
