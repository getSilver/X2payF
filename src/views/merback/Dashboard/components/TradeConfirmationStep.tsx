import ProceedTrade from '@/views/merback/ProceedTrade'

interface TradeConfirmationStepProps {
    loading: boolean
    status: 'SUCCESS' | 'FAILED' | ''
    onConfirm: () => void
    onDone: (shouldRedirect?: boolean) => void
    [key: string]: any
}

const TradeConfirmationStep = ({
    loading,
    status,
    onConfirm,
    onDone,
    ...props
}: TradeConfirmationStepProps) => {
    return (
        <ProceedTrade
            loading={loading}
            status={status}
            onConfirm={onConfirm}
            onDone={onDone}
            {...props}
        />
    )
}

export default TradeConfirmationStep
