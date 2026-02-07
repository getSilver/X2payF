import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { apiMerchantBackendCreateRefund } from '@/services/api/RefundApi'
import type { CreateRefundRequest } from '@/@types/refund'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'

type RefundDialogProps = {
    isOpen: boolean
    onClose: () => void
    paymentId: string
    paymentAmount: number
    currency: string
    onSuccess?: () => void
}

const validationSchema = Yup.object().shape({
    refund_amount: Yup.number()
        .required('退款金额不能为空')
        .positive('退款金额必须大于 0')
        .test('max-amount', '退款金额不能超过订单金额', function(value) {
            const { paymentAmount } = this.options.context as { paymentAmount: number }
            return value ? value <= paymentAmount / 100 : false
        }),
    reason: Yup.string().max(200, '退款原因不能超过 200 个字符'),
})

const RefundDialog = ({
    isOpen,
    onClose,
    paymentId,
    paymentAmount,
    currency,
    onSuccess,
}: RefundDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (values: { refund_amount: number; reason: string }) => {
        setIsSubmitting(true)
        try {
            // 生成唯一的退款请求 ID
            const merchantRefundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            const refundData: CreateRefundRequest = {
                payment_id: paymentId,
                merchant_refund_id: merchantRefundId,
                request_id: requestId,
                refund_amount: Math.round(values.refund_amount * 100), // 转换为分
                reason: values.reason || undefined,
            }

            const response = await apiMerchantBackendCreateRefund(refundData)
            
            if (response) {
                toast.push(
                    <Notification title="退款成功" type="success">
                        退款申请已提交，退款 ID: {(response.data as any)?.data?.refund_id || '-'}
                    </Notification>
                )
                onClose()
                if (onSuccess) {
                    onSuccess()
                }
            }
        } catch (error: any) {
            console.error('退款失败:', error)
            toast.push(
                <Notification title="退款失败" type="danger">
                    {error?.response?.data?.message || '退款申请失败，请稍后重试'}
                </Notification>
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose}>
            <h5 className="mb-4">退款申请</h5>
            <Formik
                initialValues={{
                    refund_amount: paymentAmount / 100,
                    reason: '',
                }}
                validationSchema={validationSchema}
                context={{ paymentAmount }}
                onSubmit={handleSubmit}
            >
                {({ errors, touched }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                label="订单金额"
                                invalid={false}
                            >
                                <div className="text-gray-700 dark:text-gray-300">
                                    {(paymentAmount / 100).toFixed(2)} {currency}
                                </div>
                            </FormItem>

                            <FormItem
                                label="退款金额"
                                invalid={Boolean(errors.refund_amount && touched.refund_amount)}
                                errorMessage={errors.refund_amount}
                            >
                                <Field
                                    type="number"
                                    name="refund_amount"
                                    placeholder="请输入退款金额"
                                    component={Input}
                                    step="0.01"
                                    min="0.01"
                                    max={paymentAmount / 100}
                                />
                            </FormItem>

                            <FormItem
                                label="退款原因（可选）"
                                invalid={Boolean(errors.reason && touched.reason)}
                                errorMessage={errors.reason}
                            >
                                <Field
                                    name="reason"
                                    placeholder="请输入退款原因"
                                    component={Input}
                                    textArea
                                    rows={3}
                                />
                            </FormItem>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                >
                                    取消
                                </Button>
                                <Button
                                    type="submit"
                                    variant="solid"
                                    loading={isSubmitting}
                                    disabled={isSubmitting}
                                >
                                    确认退款
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </Dialog>
    )
}

export default RefundDialog
