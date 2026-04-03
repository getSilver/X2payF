import { useEffect, useCallback, useMemo, useRef } from 'react'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/shared/DataTable'
import Avatar from '@/components/ui/Avatar'
import {
    HiOutlineArrowUp,
    HiOutlineArrowDown,
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
import { PAYMENT_STATUS_META, type PaymentStatus } from '@/@types/payment'
import type {
    DataTableResetHandle,
    OnSortParam,
    ColumnDef,
} from '@/components/shared/DataTable'

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
                header: 'type',
                accessorKey: 'transaction_type',
                cell: (props) => {
                    const row = props.row.original
                    const isPayIn = row.transaction_type === 'PAY_IN'
                    return (
                        <div className="flex items-center gap-2">
                            <Avatar
                                size="sm"
                                className={isPayIn
                                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100"
                                    : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100"
                                }
                                icon={isPayIn
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
                header: 'date',
                accessorKey: 'created_at',
                cell: (props) => {
                    const row = props.row.original
                    return <span>{dayjs(row.created_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                },
            },
            {
                header: 'amount',
                accessorKey: 'amount',
                cell: (props) => {
                    const { amount, currency, transaction_type } = props.row.original
                    const isIncome = transaction_type === 'PAY_IN'
                    const amountInYuan = amount / 100
                    const value = (Math.trunc(amountInYuan * 100) / 100).toFixed(2)
                    const prefix = `${isIncome ? '+' : '-'}${getCurrencySymbol(currency, '$')}`
                    return (
                        <span className={isIncome ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                            <NumericFormat
                                displayType="text"
                                value={value}
                                prefix={prefix}
                                thousandSeparator={true}
                            />
                        </span>
                    )
                },
            },
            {
                header: 'balance after',
                accessorKey: 'balance_after',
                cell: (props) => {
                    const { balance_before, balance_after, currency } = props.row.original
                    if (typeof balance_before !== 'number' || typeof balance_after !== 'number') {
                        return <span>-- / --</span>
                    }
                    const before = (Math.trunc((balance_before / 100) * 100) / 100).toFixed(2)
                    const after = (Math.trunc((balance_after / 100) * 100) / 100).toFixed(2)
                    const prefix = getCurrencySymbol(currency, '$')
                    return (
                        <span>{`${prefix}${before} / ${prefix}${after}`}</span>
                    )
                },
            },
            {
                header: 'Payment Id',
                accessorKey: 'payment_id',
                cell: (props) => <OrderColumn row={props.row.original} />,
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
                header: 'status',
                accessorKey: 'status',
                cell: (props) => {
                    const { status } = props.row.original
                    const statusInfo = PAYMENT_STATUS_META[status as PaymentStatus] || PAYMENT_STATUS_META.PENDING
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
