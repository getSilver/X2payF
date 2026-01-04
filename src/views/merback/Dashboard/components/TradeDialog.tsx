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
import { useNavigate } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'

// 懒加载步骤组件 - 从trade模块导入
const TradeFormStep = lazy(() => import('./trade').then(mod => ({ default: mod.TradeFormStep })))
const TradeConfirmationStep = lazy(() => import('./trade').then(mod => ({ default: mod.TradeConfirmationStep })))

const TradeDialog = () => {
    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const tradeDialogOpen = useAppSelector(
        (state) => state.cryptoWallets.data.tradeDialogOpen
    )
    const selectedRow = useAppSelector(
        (state) => state.cryptoWallets.data.selectedRow
    )

    const [showProceed, setShowProceed] = useState({})
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

    const hadleConfirm = () => {
        setConfirmLoading(true)
        setTimeout(() => {
            setStatus('SUCCESS')
        }, 1000)
    }

    const handleDone = (shouldRedirect?: boolean) => {
        onDialogClose()
        if (shouldRedirect) {
            dispatch(setSelectedTab('withdrawal'))
            navigate('/mer/dashboard')
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
                        onConfirm={hadleConfirm}
                        onDone={handleDone}
                        {...showProceed}
                    />
                )}
            </Suspense>
        </Dialog>
    )
}

export default TradeDialog
