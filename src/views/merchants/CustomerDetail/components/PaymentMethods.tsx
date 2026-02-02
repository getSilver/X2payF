import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import EditPaymentMethod from './EditPaymentMethod'
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

    const onEditPaymentMethodDialogOpen = (card: PaymentMethod) => {
        dispatch(updateSelectedCard(card))
        dispatch(openEditPaymentMethodDialog())
    }

    const onDeletePaymentMethodDialogOpen = (card: PaymentMethod) => {
        dispatch(updateSelectedCard(card))
        dispatch(openDeletePaymentMethodDialog())
    }

    const onAddNewCard = () => {
        dispatch(updateSelectedCard({}))
        dispatch(openEditPaymentMethodDialog())
    }

    return (
        <>
            <div className="mb-8">
                {data.length > 0 && (
                    <>
                        <h6 className="mb-4">Payment Methods通道配置</h6>
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
                                        {card.cardType === 'VISA' && (
                                            <img
                                                src="/img/others/img-8.png"
                                                alt="visa"
                                            />
                                        )}
                                        {card.cardType === 'MASTER' && (
                                            <img
                                                src="/img/others/img-9.png"
                                                alt="master"
                                            />
                                        )}
                                        <div>
                                            <div className="flex items-center">
                                                <div className="text-gray-900 dark:text-gray-100 font-semibold">
                                                    {card.channelName} {' '}
                                                    {card.number}
                                                    <div>
                                                        <span>
                                                            <span className="mx-1">金额</span>
                                                            <NumericFormat
                                                                className="font-semibold text-gray-900 dark:text-gray-100"
                                                                displayType="text"
                                                                value={(Math.round((card.balanceAmount || 0) * 100) / 100).toFixed(3)}
                                                                prefix={'$'}
                                                                thousandSeparator={true}
                                                            />
                                                        </span>
                                                        <span> | </span>
                                                        <span>
                                                            <span className="mx-1">冻结</span>
                                                            <NumericFormat
                                                                className="font-semibold text-gray-900 dark:text-gray-100"
                                                                displayType="text"
                                                                value={(Math.round((card.frozenAmount || 0) * 100) / 100).toFixed(3)}
                                                                prefix={'$'}
                                                                thousandSeparator={true}
                                                            />
                                                        </span>
                                                        <span>
                                                            <span className="mx-1">余额</span>
                                                            <NumericFormat
                                                                className="font-semibold text-gray-900 dark:text-gray-100"
                                                                displayType="text"
                                                                value={(Math.round((card.availableAmount || 0) * 100) / 100).toFixed(3)}
                                                                prefix={'$'}
                                                                thousandSeparator={true}
                                                            />
                                                        </span>
                                                    </div>
                                                </div>
                                                {card.primary && (
                                                    <Tag className="bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-100 rounded-md border-0 mx-2">
                                                        <span className="capitalize">
                                                            {' '}
                                                            代收{' '}
                                                        </span>
                                                    </Tag>
                                                )}
                                            </div>
                                            <span>
                                                费率:{' '}{card.payIn || '0'}/{card.payOut || '0'}{' '}<span> | </span>单笔:{' '}{card.fixedFeeIn || '0'}/{card.fixedFeeOut || '0'}<span> | </span>汇率:{' '}{"12"}/{'6'}
                                            </span>
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
                                                onEditPaymentMethodDialogOpen(card)
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
                <div className={data.length > 0 ? "mt-2" : ""}>
                    <Button
                        type="button"
                        variant="plain"
                        size="sm"
                        icon={<HiPlus className="text-lg" />}
                        onClick={onAddNewCard}
                    >
                        <span className="font-semibold">
                            Add new App
                        </span>
                    </Button>
                </div>
            </div>
            <EditPaymentMethod />
            <DeletePaymentMethod />
        </>
    )
}

export default PaymentMethods
