import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FormItem from '@/components/ui/Form/FormItem'
import FormContainer from '@/components/ui/Form/FormContainer'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { HiOutlineRefresh } from 'react-icons/hi'
import { apiAdminCreateRefund } from '@/services/api/RefundApi'
import type { CreateRefundRequest } from '@/@types/refund'

interface RefundDialogProps {
    isOpen: boolean
    onClose: () => void
    paymentId: string
    paymentAmount: number
    currency: string
    onSuccess?: () => void
}

// 生成商户退款单号
const generateMerchantRefundId = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `refund_${timestamp}_${random}`
}

const RefundDialog = ({
    isOpen,
    onClose,
    paymentId,
    paymentAmount,
    currency,
    onSuccess,
}: RefundDialogProps) => {
    const [loading, setLoading] = useState(false)
    const [refundAmount, setRefundAmount] = useState('')
    const [merchantRefundId, setMerchantRefundId] = useState(() => generateMerchantRefundId())
    const [reason, setReason] = useState('')

    const handleGenerateRefundId = () => {
        setMerchantRefundId(generateMerchantRefundId())
    }

    const handleSubmit = async () => {
        // 验证输入
        if (!refundAmount || parseFloat(refundAmount) <= 0) {
            toast.push(
                <Notification title="验证失败" type="warning">
                    请输入有效的退款金额
                </Notification>,
                { placement: 'top-center' }
            )
            return
        }

        const amountInCents = Math.round(parseFloat(refundAmount) * 100)
        if (amountInCents > paymentAmount) {
            toast.push(
                <Notification title="验证失败" type="warning">
                    退款金额不能超过支付金额
                </Notification>,
                { placement: 'top-center' }
            )
            return
        }

        if (!merchantRefundId.trim()) {
            toast.push(
                <Notification title="验证失败" type="warning">
                    请输入商户退款单号
                </Notification>,
                { placement: 'top-center' }
            )
            return
        }

        setLoading(true)
        try {
            const requestData: CreateRefundRequest = {
                payment_id: paymentId,
                merchant_refund_id: merchantRefundId.trim(),
                request_id: `refund_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                refund_amount: amountInCents,
                reason: reason.trim() || '管理员发起退款',
            }

            const response = await apiAdminCreateRefund(requestData)
            
            toast.push(
                <Notification title="退款申请成功" type="success">
                    退款订单已创建，退款ID: {response.data.refund_id}
                </Notification>,
                { placement: 'top-center' }
            )

            // 重置表单
            setRefundAmount('')
            setMerchantRefundId(generateMerchantRefundId())
            setReason('')
            
            onClose()
            onSuccess?.()
        } catch (error: any) {
            console.error('创建退款失败:', error)
            const errorMessage = error?.response?.data?.message || '退款申请失败，请重试'
            toast.push(
                <Notification title="退款失败" type="danger">
                    {errorMessage}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (!loading) {
            setRefundAmount('')
            setMerchantRefundId(generateMerchantRefundId())
            setReason('')
            onClose()
        }
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <h5 className="mb-4">创建退款</h5>
            <FormContainer>
                <FormItem label="支付订单ID">
                    <Input value={paymentId} disabled />
                </FormItem>
                <FormItem label="原支付金额">
                    <Input 
                        value={`${(paymentAmount / 100).toFixed(2)} ${currency}`} 
                        disabled 
                    />
                </FormItem>
                <FormItem 
                    label="退款金额" 
                    asterisk
                >
                    <Input
                        type="number"
                        placeholder="请输入退款金额"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        disabled={loading}
                        step="0.01"
                        min="0.01"
                        max={(paymentAmount / 100).toString()}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        最大可退款金额: {(paymentAmount / 100).toFixed(2)} {currency}
                    </p>
                </FormItem>
                <FormItem 
                    label="商户退款单号" 
                    asterisk
                >
                    <div className="flex gap-2">
                        <Input
                            placeholder="请输入商户退款单号（唯一标识）"
                            value={merchantRefundId}
                            onChange={(e) => setMerchantRefundId(e.target.value)}
                            disabled={loading}
                            className="flex-1"
                        />
                        <Button
                            size="sm"
                            variant="twoTone"
                            icon={<HiOutlineRefresh />}
                            onClick={handleGenerateRefundId}
                            disabled={loading}
                            title="重新生成"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        用于防止重复提交，同一退款单号只能创建一次退款
                    </p>
                </FormItem>
                <FormItem label="退款原因">
                    <Input
                        textArea
                        placeholder="请输入退款原因（可选）"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={loading}
                    />
                </FormItem>
            </FormContainer>
            <div className="text-right mt-6">
                <Button
                    className="ltr:mr-2 rtl:ml-2"
                    variant="plain"
                    onClick={handleClose}
                    disabled={loading}
                >
                    取消
                </Button>
                <Button
                    variant="solid"
                    onClick={handleSubmit}
                    loading={loading}
                >
                    确认退款
                </Button>
            </div>
        </Dialog>
    )
}

export default RefundDialog
