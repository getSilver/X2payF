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
                    {data.metaType === 'amount' && (
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-300">
                            {data.metaLabel || 'Frozen'}:{' '}
                            <NumericFormat
                                displayType="text"
                                value={data.metaValue ?? 0}
                                prefix={data.symbol}
                                thousandSeparator={true}
                                decimalScale={2}
                                fixedDecimalScale
                            />
                        </div>
                    )}
                    {data.metaType === 'percent' && (
                        <GrowShrinkTag value={data.growshrink} suffix="%" />
                    )}
                </div>
            </div>
            <div className="my-5">
                    <h5 className="font-bold">
                        <NumericFormat
                            displayType="text"
                            value={data.coinValue}
                            prefix={data.secondaryType === 'count' ? undefined : data.symbol}
                            suffix={data.secondaryType === 'count' ? (data.secondarySuffix || '') : undefined}
                            thousandSeparator={true}
                            decimalScale={data.secondaryType === 'count' ? 0 : 2}
                            fixedDecimalScale={data.secondaryType !== 'count'}
                        />
                    </h5>
            </div>
        </Card>
    )
}

export default WalletCard
