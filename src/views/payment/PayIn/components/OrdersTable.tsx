import { useEffect, useCallback, useMemo, useRef } from 'react'
import Badge from '@/components/ui/Badge'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import Avatar from '@/components/ui/Avatar'
import {
    HiOutlineEye,
    HiOutlineArrowUp,
    HiOutlineArrowDown,
} from 'react-icons/hi2'
import { NumericFormat } from 'react-number-format'
import {
    setSelectedRows,
    addRowItem,
    removeRowItem,
    setDeleteMode,
    setSelectedRow,
    getOrders,
    setTableData,
    useAppDispatch,
    useAppSelector,
    Order,
} from '../store'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import dayjs from 'dayjs'
import type { PaymentOrder, PaymentStatus, TransactionType } from '@/@types/payment'
import type {
    DataTableResetHandle,
    OnSortParam,
    ColumnDef,
    Row,
} from '@/components/shared/DataTable'

const ActionIcon = ({ type }: { type: TransactionType }) => {
    switch (type) {
        case 'PAY_IN':
            return (
                <Avatar
                    size="sm"
                    className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100"
                    icon={
                        <HiOutlineArrowDown
                            style={{ transform: 'rotate(45deg)' }}
                        />
                    }
                />
            )
        case 'PAY_OUT':
            return (
                <Avatar
                    size="sm"
                    className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100"
                    icon={
                        <HiOutlineArrowUp
                            style={{ transform: 'rotate(45deg)' }}
                        />
                    }
                />
            )
    }
}

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

type PaymentMethod = PaymentOrder['payment_method']
const PaymentMethodImage = ({
    payment_method,
    className,
}: {
    payment_method: PaymentMethod
    className: string
}) => {
    switch (payment_method) {
        case 'visa':
            return (
                <img
                    className={className}
                src="/img/others/img-8.png"
                alt={payment_method}
                />
            )
        case 'master':
            return (
                <img
                    className={className}
                src="/img/others/img-9.png"
                alt={payment_method}
                />
            )
         case 'pix':
            return (
                <img
                    className={className}
                src="/img/others/img-12.png"
                alt={payment_method}
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
        navigate(`/app/payment/order-details/${row.payment_id}`)
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
    const dispatch = useAppDispatch()
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()

    const onDelete = () => {
        dispatch(setDeleteMode('single'))
        dispatch(setSelectedRow([row.payment_id]))
    }

    const onView = useCallback(() => {
        navigate(`/app/payment/order-details/${row.payment_id}`)
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
            <Tooltip title="Delete">
                <span
                    className="cursor-pointer p-2 hover:text-red-500"
                    onClick={onDelete}
                >
                    {/* <HiOutlineTrash /> */}
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
                header: 'Action',
                accessorKey: 'transaction_type',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center gap-2">
                            <div>
                                <ActionIcon type={row.transaction_type} />
                            </div>
                            <span className="font-semibold heading-text whitespace-nowrap">
                                {row.transaction_type}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: 'Order交易ID',
                accessorKey: 'payment_id',
                cell: (props) => <OrderColumn row={props.row.original} />,
            },
            {
                header: 'Channel渠道ID',
                accessorKey: 'channel_id',
            },
            {
                header: 'Date创建时间',
                accessorKey: 'created_at',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <span>{dayjs(row.created_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                    )
                },
            },
            {
                header: 'Customer商户ID',
                accessorKey: 'merchant_id',
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const status = props.row.original.status
                    return (
                        <div className="flex items-center">
                            <Badge
                                className={orderStatusColor[status].dotClass}
                            />
                            <span
                                className={`ml-2 rtl:mr-2 capitalize font-semibold ${orderStatusColor[status].textClass}`}
                            >
                                {orderStatusColor[status].label}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: 'Payment Method',
                accessorKey: 'payment_method',
                cell: (props) => {
                    const { payment_method, merchant_tx_id } =
                        props.row.original
                    return (
                        <span className="flex items-center">
                            <PaymentMethodImage
                                className="max-h-[20px]"
                                payment_method={payment_method}
                            />
                            <span className="ltr:ml-2 rtl:mr-2">
                                {merchant_tx_id}
                            </span>
                        </span>
                    )
                },
            },
            {
                header: 'Amount',
                accessorKey: 'amount',
                cell: (props) => {
                    const { amount } = props.row.original
                    const displayValue = amount / 100
                    return (
                        <NumericFormat
                            displayType="text"
                            value={(Math.round(displayValue * 100) / 100).toFixed(2)}
                            prefix={'$'}
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

    const onRowSelect = (checked: boolean, row: Order) => {
        if (checked) {
            dispatch(addRowItem([row.payment_id]))
        } else {
            dispatch(removeRowItem(row.payment_id))
        }
    }

    const onAllRowSelect = useCallback(
        (checked: boolean, rows: Row<Order>[]) => {
            if (checked) {
                const originalRows = rows.map((row) => row.original)
                const selectedIds: string[] = []
                originalRows.forEach((row) => {
                    selectedIds.push(row.payment_id)
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
            selectable
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
            onCheckBoxChange={onRowSelect}
            onIndeterminateCheckBoxChange={onAllRowSelect}
        />
    )
}

export default OrdersTable
