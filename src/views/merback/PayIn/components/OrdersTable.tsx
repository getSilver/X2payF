import { useEffect, useCallback, useMemo, useRef } from 'react'
import Badge from '@/components/ui/Badge'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import Avatar from '@/components/ui/Avatar'
import {
    HiOutlineArrowUp,
    HiOutlineArrowDown,
    HiOutlineEye,
    HiOutlineNoSymbol
} from 'react-icons/hi2'
import { NumericFormat } from 'react-number-format'
import {
    setSelectedRows,
    getOrders,
    setTableData,
    useAppDispatch,
    useAppSelector,
    Order,
} from '../store'
import { getCurrencySymbol } from '@/utils/currencySymbols'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import dayjs from 'dayjs'
import type { PaymentStatus } from '@/@types/payment'
import type {
    DataTableResetHandle,
    OnSortParam,
    ColumnDef,
} from '@/components/shared/DataTable'

const orderStatusColor: Record<
    PaymentStatus,
    {
        label: string
        dotClass: string
        textClass: string
    }
> = {
    SUCCESS: {
        label: 'Paid',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-500',
    },
    PENDING: {
        label: 'Pending',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-500',
    },
    PROCESSING: {
        label: 'Processing',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-500',
    },
    FAILED: {
        label: 'Failed',
        dotClass: 'bg-red-500',
        textClass: 'text-red-500',
    },
    CANCELLED: {
        label: 'Cancelled',
        dotClass: 'bg-gray-500',
        textClass: 'text-gray-500',
    },
    CLOSED: {
        label: 'Closed',
        dotClass: 'bg-gray-500',
        textClass: 'text-gray-500',
    },
    REFUNDED: {
        label: 'Refund',
        dotClass: 'bg-red-500',
        textClass: 'text-red-500',
    },
}

const PaymentMethodImage = ({
    paymentMethod,
    className,
}: {
    paymentMethod: string
    className: string
}) => {
    switch (paymentMethod) {
        case 'visa':
            return (
                <img className={className} src="/img/others/img-8.png" alt={paymentMethod} />
            )
        case 'master':
            return (
                <img className={className} src="/img/others/img-9.png" alt={paymentMethod} />
            )
        case 'paypal':
            return (
                <img className={className} src="/img/others/img-10.png" alt={paymentMethod} />
            )
        case 'pix':
            return (
                <img className={className} src="/img/others/img-12.png" alt={paymentMethod} />
            )
        default:
            return <></>
    }
}

const OrderColumn = ({ row }: { row: Order }) => {
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()

    const onView = useCallback(() => {
        navigate(`/mer/merback/payment-details/${row.payment_id}`)
    }, [navigate, row])

    return (
        <span
            className={`cursor-pointer select-none font-semibold hover:${textTheme}`}
            onClick={onView}
        >
            #{row.payment_id}
        </span>
    )
}

const ActionColumn = ({ row }: { row: Order }) => {
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()

    const onView = useCallback(() => {
        navigate(`/mer/merback/payment-details/${row.payment_id}`)
    }, [navigate, row])

    return (
        <div className="flex justify-end text-lg">
            <Tooltip title="View">
                <span
                    className={`cursor-pointer p-2 hover:${textTheme}`}
                    onClick={onView}
                >
                    <HiOutlineEye />
                </span>
            </Tooltip>
        </div>
    )
}

const OrdersTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const dispatch = useAppDispatch()

    const { pageIndex, pageSize, sort, query, total } = useAppSelector(
        (state) => state.salesOrderList.data.tableData
    )
    const loading = useAppSelector((state) => state.salesOrderList.data.loading)
    const data = useAppSelector((state) => state.salesOrderList.data.orderList)

    const fetchData = useCallback(() => {
        dispatch(getOrders({ pageIndex, pageSize, sort, query }))
    }, [dispatch, pageIndex, pageSize, sort, query])

    useEffect(() => {
        dispatch(setSelectedRows([]))
        fetchData()
    }, [dispatch, fetchData, pageIndex, pageSize, sort])

    useEffect(() => {
        if (tableRef) {
            tableRef.current?.resetSelected()
        }
    }, [data])

    const tableData = useMemo(
        () => ({ pageIndex, pageSize, sort, query, total }),
        [pageIndex, pageSize, sort, query, total]
    )

    const columns: ColumnDef<Order>[] = useMemo(
        () => [
            {
                header: 'Transaction Type',
                accessorKey: 'transaction_type',
                cell: (props) => {
                    const row = props.row.original
                    const isPay_In = row.transaction_type === 'PAY_IN'
                    return (
                        <div className="flex items-center gap-2">
                            <Avatar
                                size="sm"
                                className={isPay_In
                                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100"
                                    : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100"
                                }
                                icon={isPay_In
                                    ? <HiOutlineArrowDown style={{ transform: 'rotate(45deg)' }} />
                                    : <HiOutlineArrowUp style={{ transform: 'rotate(45deg)' }} />
                                }
                            />
                            <span className="font-semibold heading-text whitespace-nowrap">
                                {row.transaction_type === 'PAY_IN' ? 'Pay In' : 'Pay Out'}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: 'Payment ID',
                accessorKey: 'payment_id',
                cell: (props) => <OrderColumn row={props.row.original} />,
            },
            {
                header: 'Date',
                accessorKey: 'created_at',
                cell: (props) => {
                    const row = props.row.original
                    return <span>{dayjs(row.created_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                },
            },
            {
                header: 'Merchant TX ID',
                accessorKey: 'merchant_tx_id',
                cell: (props) => {
                    const { merchant_tx_id } = props.row.original
                    return <span className="text-sm">{merchant_tx_id}</span>
                },
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const { status } = props.row.original
                    const statusInfo = orderStatusColor[status] || orderStatusColor.PENDING
                    return (
                        <div className="flex items-center">
                            <Badge className={statusInfo.dotClass} />
                            <span className={`ml-2 rtl:mr-2 capitalize font-semibold ${statusInfo.textClass}`}>
                                {statusInfo.label}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: 'Payment Method',
                accessorKey: 'payment_method',
                cell: (props) => {
                    const { payment_method, end_to_end } = props.row.original
                    return (
                        <span className="flex items-center">
                            <PaymentMethodImage
                                className="max-h-[20px]"
                                paymentMethod={payment_method?.toLowerCase() || ''}
                            />
                            <span className="ltr:ml-2 rtl:mr-2">
                                {end_to_end || payment_method}
                            </span>
                        </span>
                    )
                },
            },
            {
                header: 'Amount',
                accessorKey: 'amount',
                cell: (props) => {
                    const { amount, currency } = props.row.original
                    return (
                        <NumericFormat
                            displayType="text"
                            value={(Math.round(amount * 100) / 100).toFixed(2)}
                            prefix={getCurrencySymbol(currency, '$')}
                            thousandSeparator={true}
                        />
                    )
                },
            },
            {
                header: '',
                id: 'actionMenu',
                cell: (props) => <ActionColumn row={props.row.original} />,
            },
        ],
        []
    )

    const onPaginationChange = (page: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageIndex = page
        dispatch(setTableData(newTableData))
    }

    const onSelectChange = (value: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageSize = Number(value)
        newTableData.pageIndex = 1
        dispatch(setTableData(newTableData))
    }

    const onSort = (sort: OnSortParam) => {
        const newTableData = cloneDeep(tableData)
        newTableData.sort = sort
        dispatch(setTableData(newTableData))
    }

    return (
        <DataTable
            ref={tableRef}
            columns={columns}
            data={data}
            loading={loading}
            pagingData={{
                total: tableData.total as number,
                pageIndex: tableData.pageIndex as number,
                pageSize: tableData.pageSize as number,
            }}
            onPaginationChange={onPaginationChange}
            onSelectChange={onSelectChange}
            onSort={onSort}
        />
    )
}

export default OrdersTable
