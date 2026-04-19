type RefundEligibilityInput = {
    transaction_type?: string
    status?: string
}

export const isRefundAllowed = ({
    transaction_type,
    status,
}: RefundEligibilityInput) =>
    transaction_type === 'PAY_IN' && status === 'SUCCESS'
