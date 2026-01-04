import TradeForm, { FormModel } from '@/views/merback/TradeForm'

interface TradeFormStepProps {
    amount: number
    symbol: string
    onBuy: (values: FormModel, setSubmitting: (isSubmitting: boolean) => void) => void
    onSell: (values: FormModel, setSubmitting: (isSubmitting: boolean) => void) => void
}

const TradeFormStep = ({ amount, symbol, onBuy, onSell }: TradeFormStepProps) => {
    return (
        <TradeForm
            amount={amount}
            symbol={symbol}
            onBuy={onBuy}
            onSell={onSell}
        />
    )
}

export default TradeFormStep
