import { useEffect, useCallback, useMemo, useRef } from 'react'
import Badge from '@/components/ui/Badge'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import Avatar from '@/components/ui/Avatar'
import { HiOutlineArrowUp, HiOutlineArrowDown, HiOutlineEye } from 'react-icons/hi2'
import { NumericFormat } from 'react-number-format'
import {
    setSelectedRows,
    addRowItem,
    removeRowItem,
    // setDeleteMode,
    // setSelectedRow,
    getOrders,
    setTableData,
    useAppDispatch,
    useAppSelector,
} from '../store'
import { getCurrencySymbol } from '@/utils/currencySymbols'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import dayjs from 'dayjs'
import {
    PAYMENT_STATUS_META,
    type PaymentStatus,
    type TransactionType,
} from '@/@types/payment'
import type {
    DataTableResetHandle,
    OnSortParam,
    ColumnDef,
    Row,
} from '@/components/shared/DataTable'

type Order = {
    id: string      //交易ID
    // mid: string     //商户ID
    // cid: string     //渠道ID
    transaction_type: TransactionType
    currency?: string
    date: number    //创建时间
    sdate: number    //成功时间Successful time
    status: PaymentStatus
    paymentMetthod: string
    paymentIdendifier: string
    totalAmount: number           //结算金额
    subAmount: number      //提交金额
    fee: number         //手续费
    amount: number    //实际收金额
    channel: string     //通道名
    customer: string
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
                <img
                    className={className}
                // src="/img/others/img-8.png"
                // alt={paymentMehod}
                />
            )
        case 'master':
            return (
                <img
                    className={className}
                // src="/img/others/img-9.png"
                // alt={paymentMehod}
                />
            )
        case 'paypal':
            return (
                <img
                    className={className}
                // src="/img/others/img-10.png"
                // alt={paymentMehod}
                />
            )
        default:
            return <></>
    }
}

const OrderColumn = ({ row }: { row: Order }) => {
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()

    const onView = useCallback(() => {
        navigate(`/app/payment/order-details/${row.id}`)
    }, [navigate, row])

    return (
        <span
            className={`cursor-pointer select-none font-semibold hover:${textTheme}`}
            onClick={onView}
        >
            #{row.id}
        </span>
    )
}

const ActionColumn = ({ row }: { row: Order }) => {
    // const dispatch = useAppDispatch()
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()

    // const onDelete = () => {
    //     dispatch(setDeleteMode('single'))
    //     dispatch(setSelectedRow([row.id]))
    // }

    const onView = useCallback(() => {
        navigate(`/app/payment/order-details/${row.id}`)
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
            {/* <Tooltip title="Delete">
                <span
                    className="cursor-pointer p-2 hover:text-red-500"
                    onClick={onDelete}
                >
                    <HiOutlineTrash />
                </span>
            </Tooltip> */}
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
        console.log('{ pageIndex, pageSize, sort, query }', {
            pageIndex,
            pageSize,
            sort,
            query,
        })
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
                header: 'Transaction',
                accessorKey: 'transaction_type',
                cell: (props) => {
                    const row = props.row.original
                    const isPayIn = row.transaction_type === 'PAY_IN'
                    return (
                        <div className="flex items-center gap-2">
                            <Avatar
                                size="sm"
                                className={isPayIn
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100'
                                    : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100'
                                }
                                icon={isPayIn
                                    ? <HiOutlineArrowDown style={{ transform: 'rotate(45deg)' }} />
                                    : <HiOutlineArrowUp style={{ transform: 'rotate(45deg)' }} />
                                }
                            />
                            <span className="font-semibold heading-text whitespace-nowrap">
                                {isPayIn ? 'Pay In' : 'Pay Out'}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: 'OrderID',
                accessorKey: 'id',
                cell: (props) => <OrderColumn row={props.row.original} />,
            },
            {
                header: 'Date',
                accessorKey: 'date',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <span>{dayjs.unix(row.date).format('DD/MM/YYYYTHH:mm:sssZ')}</span>
                    )

                },
            },
            {
                header: 'Customer',
                accessorKey: 'customer',
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const { status } = props.row.original
                    const statusInfo = PAYMENT_STATUS_META[status] || PAYMENT_STATUS_META.PENDING
                    return (
                        <div className="flex items-center">
                            <Badge className={statusInfo.dotClass} />
                            <span
                                className={`ml-2 rtl:mr-2 capitalize font-semibold ${statusInfo.textClass}`}
                            >
                                {statusInfo.label}
                            </span>
                        </div>
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
                            value={(
                                Math.round(amount * 100) / 100
                            ).toFixed(3)}
                            prefix={getCurrencySymbol(currency, '')}
                            thousandSeparator={true}
                        />
                    )
                },
            },
            {
                header: 'Fee',
                accessorKey: 'fee',
                cell: (props) => {
                    const { fee, currency } = props.row.original
                    return (
                        <NumericFormat
                            displayType="text"
                            value={(
                                Math.round(fee * 100) / 100
                            ).toFixed(3)}
                            prefix={getCurrencySymbol(currency, '')}
                            thousandSeparator={true}
                        />
                    )
                },
            },
            {
                header: 'Settlement',
                accessorKey: 'totalAmount',
                cell: (props) => {
                    const { totalAmount, currency } = props.row.original
                    return (
                        <NumericFormat
                            displayType="text"
                            value={(
                                Math.round(totalAmount * 100) / 100
                            ).toFixed(3)}
                            prefix={getCurrencySymbol(currency, '')}
                            thousandSeparator={true}
                        />
                    )
                },
            },
            {
                header: '',
                id: 'action',
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

    // const onSelectChange = (value: number) => {
    //     const newTableData = cloneDeep(tableData)
    //     newTableData.pageSize = Number(value)
    //     newTableData.pageIndex = 1
    //     dispatch(setTableData(newTableData))
    // }

    const onSort = (sort: OnSortParam) => {
        const newTableData = cloneDeep(tableData)
        newTableData.sort = sort
        dispatch(setTableData(newTableData))
    }

    const onRowSelect = (checked: boolean, row: Order) => {
        if (checked) {
            dispatch(addRowItem([row.id]))
        } else {
            dispatch(removeRowItem(row.id))
        }
    }

    const onAllRowSelect = useCallback(
        (checked: boolean, rows: Row<Order>[]) => {
            if (checked) {
                const originalRows = rows.map((row) => row.original)
                const selectedIds: string[] = []
                originalRows.forEach((row) => {
                    selectedIds.push(row.id)
                })
                dispatch(setSelectedRows(selectedIds))
            } else {
                dispatch(setSelectedRows([]))
            }
        },
        [dispatch]
    )

    return (
        <DataTable
            ref={tableRef}
            // selectable
            columns={columns}
            data={data}
            loading={loading}
            pagingData={{
                total: tableData.total as number,
                pageIndex: tableData.pageIndex as number,
                pageSize: tableData.pageSize as number,
            }}
            onPaginationChange={onPaginationChange}
            // onSelectChange={onSelectChange}
            onSort={onSort}
            onCheckBoxChange={onRowSelect}
            onIndeterminateCheckBoxChange={onAllRowSelect}
        />
    )
}

export default OrdersTable
