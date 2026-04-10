import { useState, lazy, Suspense } from 'react'
import Dialog from '@/components/ui/Dialog'
import {
    toggleTradeDialog,
    setSelectedRow,
    setSelectedTab,
    useAppDispatch,
    useAppSelector,
} from '../store'
import { FormModel } from '@/views/merback/TradeForm'
import { useLocation, useNavigate } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import { CreateWithdrawalRequest } from '@/services/MerchantService'
import {
    getTradeWithdrawProvider,
    resolveProviderTypeByPath,
} from '@/services/tradeWithdrawProvider'
import createUID from '@/components/ui/utils/createUid'


// 懒加载步骤组件 - 从trade模块导入
const TradeFormStep = lazy(() => import('./trade').then(mod => ({ default: mod.TradeFormStep })))
const TradeConfirmationStep = lazy(() => import('./trade').then(mod => ({ default: mod.TradeConfirmationStep })))

const TradeDialog = () => {
    const dispatch = useAppDispatch()

    const navigate = useNavigate()
    const location = useLocation()
    const provider = getTradeWithdrawProvider(
        resolveProviderTypeByPath(location.pathname)
    )

    const tradeDialogOpen = useAppSelector(
        (state) => state.appWallets.data.tradeDialogOpen
    )
    const selectedRow = useAppSelector(
        (state) => state.appWallets.data.selectedRow
    )

    const [showProceed, setShowProceed] = useState<Record<string, unknown>>({})
    const [confirmLoading, setConfirmLoading] = useState(false)
    const [status, setStatus] = useState<'SUCCESS' | 'FAILED' | ''>('')

    const onDialogClose = () => {
        dispatch(toggleTradeDialog(false))
        setTimeout(() => {
            dispatch(setSelectedRow({}))
            setShowProceed({})
            setConfirmLoading(false)
            setStatus('')
        }, 500)
    }

    const handleTrade = (
        values: FormModel,
        setSubmitting: (isSubmitting: boolean) => void,
        trade: 'BUY' | 'SELL'
    ) => {
        setSubmitting(true)
        setTimeout(() => {
            setShowProceed({ ...values, type: trade })
            setConfirmLoading(false)
            setStatus('')
        }, 500)
    }

    const handleConfirm = async () => {
        setConfirmLoading(true)
        
        const tradeType = showProceed.type as string
        const isAppCurrency = showProceed.isAppCurrency as boolean
        
        // 如果是应用币种的 SELL 操作，调用提款 API
        if (tradeType === 'SELL' && isAppCurrency) {
            try {
                const appId = showProceed.appId as string
                const currency = (showProceed.currency as string || '').toUpperCase()
                const price = showProceed.price as number
                const usdAmount = showProceed.amount as number
                const rate = showProceed.rate as number
                
                // 参数验证
                if (!appId) {
                    console.error('提款失败: appId 为空')
                    setStatus('FAILED')
                    setConfirmLoading(false)
                    return
                }
                if (!currency || currency.length !== 3) {
                    console.error('提款失败: currency 无效', currency)
                    setStatus('FAILED')
                    setConfirmLoading(false)
                    return
                }
                if (!price || price <= 0) {
                    console.error('提款失败: price 无效', price)
                    setStatus('FAILED')
                    setConfirmLoading(false)
                    return
                }
                if (!usdAmount || usdAmount <= 0) {
                    console.error('提款失败: amount 无效', usdAmount)
                    setStatus('FAILED')
                    setConfirmLoading(false)
                    return
                }
                if (!rate || rate <= 0) {
                    console.error('提款失败: rate 无效', rate)
                    setStatus('FAILED')
                    setConfirmLoading(false)
                    return
                }
                
                // 金额转换为分（后端使用分为单位）
                const amountInCents = Math.round(price * 100)
                
                const request: CreateWithdrawalRequest = {
                    request_id: createUID(16),
                    amount: amountInCents,
                    currency: currency,
                    note: `SELL ${price.toFixed(2)} ${currency} -> ${usdAmount.toFixed(2)} USD @ ${rate.toFixed(4)} ${currency}/USD`,
                }

                if (appId) {
                    request.app_id = appId
                }
                
                console.log('提款请求:', request)
                
                await provider.createWithdrawal(request)
                setStatus('SUCCESS')
            } catch (error: unknown) {
                console.error('提款申请失败:', error)
                // 打印详细错误信息
                if (
                    typeof error === 'object' &&
                    error !== null &&
                    'response' in error
                ) {
                    const response = (
                        error as {
                            response?: { data?: unknown; status?: unknown }
                        }
                    ).response
                    console.error('错误响应:', response?.data)
                    console.error('错误状态:', response?.status)
                }
                setStatus('FAILED')
            }
        } else {
            // 非应用币种交易，模拟成功
            setTimeout(() => {
                setStatus('SUCCESS')
            }, 1000)
        }
        
        setConfirmLoading(false)
    }

    const handleDone = (shouldRedirect?: boolean) => {
        onDialogClose()
        if (shouldRedirect) {
            dispatch(setSelectedTab('withdrawal'))
            navigate(provider.dashboardPath)
        }
    }

    return (
        <Dialog
            isOpen={tradeDialogOpen}
            closable={!status}
            width={400}
            onRequestClose={onDialogClose}
            onClose={onDialogClose}
        >
            <h5 className="mb-4">Trade</h5>
            <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
                {isEmpty(showProceed) ? (
                    <TradeFormStep
                        amount={selectedRow.price as number}
                        symbol={selectedRow.symbol as string}
                        onBuy={(values, setSubmitting) =>
                            handleTrade(values, setSubmitting, 'BUY')
                        }
                        onSell={(values, setSubmitting) =>
                            handleTrade(values, setSubmitting, 'SELL')
                        }
                    />
                ) : (
                    <TradeConfirmationStep
                        loading={confirmLoading}
                        status={status as 'SUCCESS' | 'FAILED' | ''}
                        onConfirm={handleConfirm}
                        onDone={handleDone}
                        {...showProceed}
                    />
                )}
            </Suspense>
        </Dialog>
    )
}

export default TradeDialog
