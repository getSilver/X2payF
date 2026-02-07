import Button from '@/components/ui/Button'
import { NumericFormat } from 'react-number-format'
import Success from './Success'
import Failed from './Failed'
import InfoItem from './InfoItem'

export type ProceedSellProps = {
    price?: number           // 卖出的币种金额
    cryptoSymbol?: string    // 币种符号
    payWith?: string
    amount?: number          // 获得的 USD 金额
    status?: 'SUCCESS' | 'FAILED' | ''
    loading?: boolean
    onConfirm: () => void
    onDone: (done?: boolean) => void
    // 提款扩展字段
    rate?: number            // 实际汇率（已加点）
    fee?: number             // 手续费（从后台获取）
    feeRate?: number         // 手续费率（从后台获取）
    isAppCurrency?: boolean  // 是否为应用币种
    currency?: string        // 实际币种代码
    baseRate?: number        // 平台基础汇率
    markupPercent?: number   // 加点百分比
}

const ProceedSell = (props: ProceedSellProps) => {
    const {
        price = 0,
        cryptoSymbol,
        amount = 0,
        status,
        loading,
        onConfirm,
        rate = 1,
        fee = 0,
        feeRate = 0,
        isAppCurrency = false,
        currency,
        baseRate = 1,
        markupPercent = 0,
    } = props

    // 计算实际到账金额
    const actualAmount = amount - fee

    // 获取显示的币种符号
    const displaySymbol = isAppCurrency && currency ? currency : cryptoSymbol

    // 显示汇率：使用传入的 rate
    const displayRate = rate

    return (
        <div className="mt-4">
            {status === 'SUCCESS' && <Success {...props} />}
            {status === 'FAILED' && <Failed {...props} />}
            {!status && (
                <>
                    <div className="text-center my-8">
                        <p className="mb-2">You will get</p>
                        <h3 className="font-bold">
                            <NumericFormat
                                value={actualAmount}
                                displayType="text"
                                suffix=" USDT"
                                thousandSeparator={true}
                                allowNegative={false}
                                decimalScale={2}
                                fixedDecimalScale={true}
                            />
                        </h3>
                    </div>
                    <InfoItem
                        label="You Sell"
                        value={
                            <NumericFormat
                                value={price}
                                displayType="text"
                                suffix={` ${displaySymbol}`}
                                thousandSeparator={true}
                                allowNegative={false}
                                decimalScale={2}
                                fixedDecimalScale={true}
                            />
                        }
                    />
                    <InfoItem
                        label="Exchange Rate"
                        value={
                            <span>
                                1 {displaySymbol} = {displayRate.toFixed(4)} USD
                                {/* {isAppCurrency && markupPercent > 0 && (
                                    <span className="text-xs text-gray-400 ml-1">
                                        (Base: {baseRate.toFixed(4)} + {markupPercent.toFixed(2)}%)
                                    </span>
                                )} */}
                            </span>
                        }
                    />
                    <InfoItem
                        label="Subtotal"
                        value={
                            <NumericFormat
                                value={amount}
                                displayType="text"
                                suffix=" USD"
                                thousandSeparator={true}
                                allowNegative={false}
                                decimalScale={2}
                                fixedDecimalScale={true}
                            />
                        }
                    />
                    <InfoItem
                        label={`Transaction Fee${feeRate > 0 ? ` (${(feeRate * 100).toFixed(2)}%)` : ''}`}
                        value={
                            <NumericFormat
                                value={fee}
                                displayType="text"
                                prefix="-"
                                suffix=" USDT"
                                thousandSeparator={true}
                                allowNegative={false}
                                decimalScale={2}
                                fixedDecimalScale={true}
                            />
                        }
                    />
                    <Button
                        block
                        className="mt-6"
                        variant="solid"
                        loading={loading}
                        onClick={onConfirm}
                    >
                        Confirm
                    </Button>
                </>
            )}
        </div>
    )
}

export default ProceedSell
