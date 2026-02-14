import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import EditPaymentMethod from './EditPaymentMethod'
import EditAgentRateConfig from './EditAgentRateConfig'
import DeletePaymentMethod from './DeletePaymentMethod'
import {
    openDeletePaymentMethodDialog,
    openEditPaymentMethodDialog,
    updateSelectedCard,
    useAppDispatch,
    useAppSelector,
    PaymentMethod,
} from '../store'
import isLastChild from '@/utils/isLastChild'
import classNames from 'classnames'
import { HiPencilSquare } from 'react-icons/hi2'
import { HiPlus } from 'react-icons/hi'
import { NumericFormat } from 'react-number-format'

const PaymentMethods = () => {
    const dispatch = useAppDispatch()

    const data = useAppSelector(
        (state) => state.crmCustomerDetails.data.paymentMethodData
    )
    const profileData = useAppSelector(
        (state) => state.crmCustomerDetails.data.profileData
    )
    const isAgentAccount = String(profileData.id || '').startsWith('agent_')

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
                                                        <div>
                                                            <span>
                                                                <span className="mx-1">
                                                                    金额
                                                                </span>
                                                                <NumericFormat
                                                                    className="font-semibold text-gray-900 dark:text-gray-100"
                                                                    displayType="text"
                                                                    value={(
                                                                        Math.round(
                                                                            (card.balance ||
                                                                                0) *
                                                                                100
                                                                        ) / 100
                                                                    ).toFixed(3)}
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
                                                                        Math.round(
                                                                            (card.frozen_amount ||
                                                                                0) *
                                                                                100
                                                                        ) / 100
                                                                    ).toFixed(3)}
                                                                    prefix={'$'}
                                                                    thousandSeparator={true}
                                                                />
                                                            </span>
                                                            <span>
                                                                <span className="mx-1">
                                                                    余额
                                                                </span>
                                                                <NumericFormat
                                                                    className="font-semibold text-gray-900 dark:text-gray-100"
                                                                    displayType="text"
                                                                    value={(
                                                                        Math.round(
                                                                            (card.available_amount ||
                                                                                0) *
                                                                                100
                                                                        ) / 100
                                                                    ).toFixed(3)}
                                                                    prefix={'$'}
                                                                    thousandSeparator={true}
                                                                />
                                                            </span>
                                                        </div>
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
                                                    限额:{' '}
                                                    {card.single_txn_min || 0}/
                                                    {card.single_txn_max || 0}/
                                                    {card.daily_limit || 0}
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
                                            Edit
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
        </>
    )
}

export default PaymentMethods
