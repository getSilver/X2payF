import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import EditPaymentMethod from './EditPaymentMethod'
import EditAgentRateConfig from './EditAgentRateConfig'
import DeletePaymentMethod from './DeletePaymentMethod'
import {
    openDeletePaymentMethodDialog,
    openEditPaymentMethodDialog,
    getCustomer,
    updateSelectedCard,
    useAppDispatch,
    useAppSelector,
    PaymentMethod,
} from '../store'
import {
    apiManualApplicationBalanceOperation,
    type ManualApplicationBalanceOperation,
} from '@/services/api/AccountApi'
import isLastChild from '@/utils/isLastChild'
import classNames from 'classnames'
import { useMemo, useState } from 'react'
import { HiPencilSquare } from 'react-icons/hi2'
import { HiPlus } from 'react-icons/hi'
import { NumericFormat } from 'react-number-format'

type ParsedManualBalanceOperation = {
    operation: ManualApplicationBalanceOperation
    amount: number
}

const parseManualBalanceInput = (
    rawValue: string
): ParsedManualBalanceOperation => {
    const value = rawValue.trim()
    if (!value) {
        throw new Error('请输入金额')
    }

    if (value.startsWith('@@')) {
        const amountText = value.slice(2).trim()
        const amount = Number(amountText)
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error('解冻金额格式无效，请使用 @@6 这样的格式')
        }
        return {
            operation: 'UNFREEZE',
            amount: Math.round(amount * 100),
        }
    }

    if (value.startsWith('@')) {
        const amountText = value.slice(1).trim()
        const amount = Number(amountText)
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error('冻结金额格式无效，请使用 @6 这样的格式')
        }
        return {
            operation: 'FREEZE',
            amount: Math.round(amount * 100),
        }
    }

    const amount = Number(value)
    if (!Number.isFinite(amount) || amount === 0) {
        throw new Error('金额格式无效，请输入 6 或 -6')
    }

    return {
        operation: 'ADJUST',
        amount: Math.round(amount * 100),
    }
}

const PaymentMethods = () => {
    const dispatch = useAppDispatch()
    const [balanceDialogOpen, setBalanceDialogOpen] = useState(false)
    const [balanceInput, setBalanceInput] = useState('')
    const [balanceRemark, setBalanceRemark] = useState('')
    const [balanceSaving, setBalanceSaving] = useState(false)
    const [activeBalanceCard, setActiveBalanceCard] =
        useState<PaymentMethod | null>(null)

    const data = useAppSelector(
        (state) => state.crmCustomerDetails.data.paymentMethodData
    )
    const profileData = useAppSelector(
        (state) => state.crmCustomerDetails.data.profileData
    )
    const isAgentAccount = String(profileData.id || '').startsWith('agent_')
    const customerId = String(profileData.id || '').trim()

    const amountDialogTitle = useMemo(() => {
        if (!activeBalanceCard?.channelName) {
            return 'Manual Balance Operation'
        }
        return `Manual Balance Operation · ${activeBalanceCard.channelName}`
    }, [activeBalanceCard])

    const onEditPaymentMethodDialogOpen = (card: PaymentMethod) => {
        dispatch(updateSelectedCard(card))
        dispatch(openEditPaymentMethodDialog())
    }

    const onDeletePaymentMethodDialogOpen = (card: PaymentMethod) => {
        dispatch(updateSelectedCard(card))
        dispatch(openDeletePaymentMethodDialog())
    }

    const onAddNewCard = () => {
        if (isAgentAccount && data.length > 0) {
            dispatch(updateSelectedCard(data[0]))
        } else {
            dispatch(updateSelectedCard({}))
        }
        dispatch(openEditPaymentMethodDialog())
    }

    const onOpenBalanceDialog = (card: PaymentMethod) => {
        setActiveBalanceCard(card)
        setBalanceInput('')
        setBalanceRemark('')
        setBalanceDialogOpen(true)
    }

    const onCloseBalanceDialog = () => {
        if (balanceSaving) {
            return
        }
        setBalanceDialogOpen(false)
        setActiveBalanceCard(null)
        setBalanceInput('')
        setBalanceRemark('')
    }

    const onSubmitBalanceOperation = async () => {
        const appId =
            String(activeBalanceCard?.appId || activeBalanceCard?.id || '').trim()
        const currency = String(activeBalanceCard?.currency || '').trim()

        if (!appId) {
            toast.push(
                <Notification type="danger" title="Operation failed">
                    Missing application id
                </Notification>
            )
            return
        }

        if (!currency) {
            toast.push(
                <Notification type="danger" title="Operation failed">
                    Missing currency
                </Notification>
            )
            return
        }

        if (!balanceRemark.trim()) {
            toast.push(
                <Notification type="danger" title="Operation failed">
                    请输入备注
                </Notification>
            )
            return
        }

        let parsed: ParsedManualBalanceOperation
        try {
            parsed = parseManualBalanceInput(balanceInput)
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Operation failed">
                    {error instanceof Error ? error.message : '金额格式无效'}
                </Notification>
            )
            return
        }

        setBalanceSaving(true)
        try {
            await apiManualApplicationBalanceOperation(appId, {
                operation: parsed.operation,
                amount: parsed.amount,
                currency,
                remark: balanceRemark.trim(),
            })

            if (customerId) {
                await dispatch(getCustomer({ id: customerId })).unwrap()
            }

            toast.push(
                <Notification type="success" title="Operation completed">
                    应用余额已更新
                </Notification>
            )
            onCloseBalanceDialog()
        } catch (error) {
            const message =
                error instanceof Error ? error.message : '余额操作失败'
            toast.push(
                <Notification type="danger" title="Operation failed">
                    {message}
                </Notification>
            )
        } finally {
            setBalanceSaving(false)
        }
    }

    return (
        <>
            <div className="mb-8">
                {data.length > 0 && (
                    <>
                        <h6 className="mb-4">
                            {isAgentAccount
                                ? 'Agent Rate Config'
                                : 'Payment Methods通道配置'}
                        </h6>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-600">
                            {data.map((card, index) => (
                                <div
                                    key={card.id || card.number || index}
                                    className={classNames(
                                        'flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4',
                                        !isLastChild(data, index) &&
                                            'border-b border-gray-200 dark:border-gray-600'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        {!isAgentAccount &&
                                            card.cardType === 'VISA' && (
                                                <img
                                                    src="/img/others/img-8.png"
                                                    alt="visa"
                                                />
                                            )}
                                        {!isAgentAccount &&
                                            card.cardType === 'MASTER' && (
                                                <img
                                                    src="/img/others/img-9.png"
                                                    alt="master"
                                                />
                                            )}
                                        <div>
                                            <div className="flex items-center">
                                                <div className="text-gray-900 dark:text-gray-100 font-semibold">
                                                    {card.channelName}{' '}
                                                    {isAgentAccount
                                                        ? card.number
                                                        : card.channel_id}
                                                    {!isAgentAccount && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="mt-1 text-left hover:opacity-80 transition-opacity"
                                                                onClick={() =>
                                                                    onOpenBalanceDialog(
                                                                        card
                                                                    )
                                                                }
                                                            >
                                                                <span>
                                                                    <span className="mx-1">
                                                                        金额
                                                                    </span>
                                                                    <NumericFormat
                                                                        className="font-semibold text-gray-900 dark:text-gray-100"
                                                                        displayType="text"
                                                                        value={(
                                                                            (card.balance ||
                                                                                0) /
                                                                            100
                                                                        ).toFixed(2)}
                                                                        prefix={'$'}
                                                                        thousandSeparator={true}
                                                                    />
                                                                </span>
                                                                <span> | </span>
                                                                <span>
                                                                    <span className="mx-1">
                                                                        冻结
                                                                    </span>
                                                                    <NumericFormat
                                                                        className="font-semibold text-gray-900 dark:text-gray-100"
                                                                        displayType="text"
                                                                        value={(
                                                                            (card.frozen_amount ||
                                                                                0) /
                                                                            100
                                                                        ).toFixed(2)}
                                                                        prefix={'$'}
                                                                        thousandSeparator={true}
                                                                    />
                                                                </span>
                                                                <span> | </span>
                                                                <span>
                                                                    <span className="mx-1">
                                                                        余额
                                                                    </span>
                                                                    <NumericFormat
                                                                        className="font-semibold text-gray-900 dark:text-gray-100"
                                                                        displayType="text"
                                                                        value={(
                                                                            (card.available_amount ||
                                                                                0) /
                                                                            100
                                                                        ).toFixed(2)}
                                                                        prefix={'$'}
                                                                        thousandSeparator={true}
                                                                    />
                                                                </span>
                                                            </button>
                                                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                                                                点击金额区域可手动加减、冻结或解冻
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                {!isAgentAccount &&
                                                    card.primary && (
                                                        <Tag className="bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-100 rounded-md border-0 mx-2">
                                                            <span className="capitalize">
                                                                代收
                                                            </span>
                                                        </Tag>
                                                    )}
                                            </div>
                                            {isAgentAccount ? (
                                                <span>
                                                    代收费率:{' '}
                                                    {card.payIn ?? '0'}
                                                    <span> | </span>
                                                    代付费率:{' '}
                                                    {card.payOut ?? '0'}
                                                    <span> | </span>
                                                    代收单笔费:{' '}
                                                    {card.fixedFeeIn ?? '0'}
                                                    <span> | </span>
                                                    代付单笔费:{' '}
                                                    {card.fixedFeeOut ?? '0'}
                                                </span>
                                            ) : (
                                                <span>
                                                    费率: {card.in_fee_rate || '0'}/
                                                    {card.out_fee_rate || '0'}{' '}
                                                    <span> | </span>
                                                    单笔:{' '}
                                                    {card.in_fixed_fee || '0'}/
                                                    {card.out_fixed_fee || '0'}
                                                    <span> | </span>
                                                    通道ID: {card.channel_id || '-'}
                                                    <span> | </span>
                                                    时区: {card.timezone || '-'}
                                                    <span> | </span>
                                                    支付方式:{' '}
                                                    {card.payment_methods?.length
                                                        ? card.payment_methods.join(
                                                              ','
                                                          )
                                                        : '-'}
                                                    <span> | </span>
                                                    汇率加点:{' '}
                                                    {card.exchange_rate_sell || 0}/
                                                    {card.exchange_rate_buy || 0}
                                                    <span> | </span>
                                                    限额:{' '}
                                                    {card.single_txn_min || 0}/
                                                    {card.single_txn_max || 0}/
                                                    {card.daily_limit || 0}
                                                    <span> | </span>
                                                    代理:{' '}
                                                    {card.agentId || 'Unbound'}
                                                    <span> | </span>
                                                    代理状态:{' '}
                                                    {card.relationStatus || 'unbound'}
                                                    <span> | </span>
                                                    代理费率:{' '}
                                                    {card.payInPercentageProfitSharing || 0}/
                                                    {card.payOutPercentageProfitSharing || 0}
                                                    <span> | </span>
                                                    代理单笔费:{' '}
                                                    {card.payInFixedProfitSharing || 0}/
                                                    {card.payOutFixedProfitSharing || 0}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <Button
                                            className="mr-2 rtl:ml-2"
                                            variant="plain"
                                            size="sm"
                                            onClick={() =>
                                                onDeletePaymentMethodDialogOpen(
                                                    card
                                                )
                                            }
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            icon={<HiPencilSquare />}
                                            size="sm"
                                            onClick={() =>
                                                onEditPaymentMethodDialogOpen(
                                                    card
                                                )
                                            }
                                        >
                                            {card.agentId ? 'Edit / Rebind Agent' : 'Edit / Bind Agent'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                <div className={data.length > 0 ? 'mt-2' : ''}>
                    <Button
                        type="button"
                        variant="plain"
                        size="sm"
                        icon={<HiPlus className="text-lg" />}
                        onClick={onAddNewCard}
                    >
                        <span className="font-semibold">
                            {isAgentAccount ? 'Add Agent Rate Config' : 'Add new App'}
                        </span>
                    </Button>
                </div>
            </div>
            {isAgentAccount ? <EditAgentRateConfig /> : <EditPaymentMethod />}
            <DeletePaymentMethod />
            <Dialog
                isOpen={balanceDialogOpen}
                onClose={onCloseBalanceDialog}
                onRequestClose={onCloseBalanceDialog}
            >
                <h5 className="mb-4">{amountDialogTitle}</h5>
                <div className="space-y-4">
                    <div className="text-sm text-gray-500">
                        输入规则：`6` 表示加 6 元，`-6` 表示减 6 元，`@6`
                        表示冻结 6 元，`@@6` 表示解冻 6 元。
                    </div>
                    <Input
                        placeholder="6 / -6 / @6 / @@6"
                        value={balanceInput}
                        onChange={(event) => setBalanceInput(event.target.value)}
                    />
                    <Input
                        placeholder="Remark"
                        value={balanceRemark}
                        onChange={(event) => setBalanceRemark(event.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <Button onClick={onCloseBalanceDialog}>Cancel</Button>
                        <Button
                            variant="solid"
                            loading={balanceSaving}
                            onClick={onSubmitBalanceOperation}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default PaymentMethods
