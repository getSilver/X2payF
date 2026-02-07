import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import GrowShrinkTag from '@/components/shared/GrowShrinkTag'
import { NumericFormat } from 'react-number-format'
import type { Wallet } from '../store'

interface WalletCardProps {
    data?: Partial<Wallet>
    title: string
}

const WalletCard = ({ data = {}, title }: WalletCardProps) => {
    return (
        <Card>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar
                        className="bg-transparent"
                        src={data.icon}
                        shape="circle"
                    />
                    <h4 className="font-bold">{title}</h4>
                </div>
                <div className="text-right rtl:text-left">
                    <h5 className="mb-2">
                        <NumericFormat
                            displayType="text"
                            value={data.fiatValue}
                            prefix={data.symbol}
                            thousandSeparator={true}
                            decimalScale={2}
                            fixedDecimalScale
                        />
                    </h5>
                    <GrowShrinkTag value={data.growshrink} suffix="%" />
                </div>
            </div>
            <div className="my-5">
                <h5 className="font-bold">
                    <NumericFormat
                        displayType="text"
                        value={data.coinValue}
                        prefix={data.symbol}
                        thousandSeparator={true}
                        decimalScale={2}
                        fixedDecimalScale
                    />
                </h5>
            </div>
        </Card>
    )
}

export default WalletCard
