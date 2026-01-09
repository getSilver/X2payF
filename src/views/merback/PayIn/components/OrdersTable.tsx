import { useEffect, useCallback, useMemo, useRef } from 'react'
import Badge from '@/components/ui/Badge'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import Avatar from '@/components/ui/Avatar'
import {    HiOutlineArrowsRightLeft,
    HiOutlineArrowUp,
    HiOutlineArrowDown,
    HiOutlineEye,
    HiOutlineNoSymbol } from 'react-icons/hi2'
import { NumericFormat } from 'react-number-format'
import {
    setSelectedRows,
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
import type {
    DataTableResetHandle,
    OnSortParam,
    ColumnDef,
    
} from '@/components/shared/DataTable'



const ActionIcon = ({ type }: { type: number }) => {
    switch (type) {
        case 0:
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
        case 1:
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
        case 2:
            return (
                <Avatar
                    size="sm"
                    className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100"
                    icon={<HiOutlineNoSymbol />}
                />
            )
        default:
            return <Avatar />
    }
}

const orderStatusColor: Record<
    number,
    {
        label: string
        dotClass: string
        textClass: string
    }
> = {
    0: {
        label: 'Paid',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-500',
    },
    1: {
        label: 'Pending',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-500',
    },
    2: {
        label: 'Unpaid',
        dotClass: 'bg-green-500',
        textClass: 'text-green-500'
    },
    //退款
    3: {
        label: 'Refund',
        dotClass: 'bg-red-500',
        textClass: 'text-red-500'
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
                <img
                    className={className}
                src="/img/others/img-8.png"
                alt={paymentMethod}
                />
            )
        case 'master':
            return (
                <img
                    className={className}
                src="/img/others/img-9.png"
                alt={paymentMethod}
                />
            )
        case 'paypal':
            return (
                <img
                    className={className}
                src="/img/others/img-10.png"
                alt={paymentMethod}
                />
            )
        case 'pix':
            return (
                <img
                    className={className}
                src="/img/others/img-12.png"
                alt={paymentMethod}
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
        navigate(`/mer/merback/payment-details/${row.id}`)
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
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()
   
    const onView = useCallback(() => {
        navigate(`/mer/merback/payment-details/${row.id}`)
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
                header: 'Action info',
                accessorKey: 'action',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center gap-2">
                            <div>
                                <ActionIcon type={row.actionType} />
                            </div>
                            <span className="font-semibold heading-text whitespace-nowrap">
                                {row.action}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: 'PaymentID',
                accessorKey: 'id',
                cell: (props) => <OrderColumn row={props.row.original} />,
            },

            {
                header: 'Date创建时间',
                accessorKey: 'date',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <span>{dayjs.unix(row.date).format('DD/MM/YYYY THH:mm:sssZ[Z]')}</span>
                    )

                },
            },
            {
                header: 'Customer商户',
                accessorKey: 'customer',
            },
            {
                header: 'Status状态',
                accessorKey: 'status',
                cell: (props) => {
                    const { status } = props.row.original
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
                accessorKey: 'paymentMethod',
                cell: (props) => {
                    const { paymentMethod, paymentIdentifier } =
                        props.row.original
                    return (
                        <span className="flex items-center">
                            <PaymentMethodImage
                                className="max-h-[20px]"
                                paymentMethod={paymentMethod}
                            />
                            <span className="ltr:ml-2 rtl:mr-2">
                                {paymentIdentifier}
                            </span>
                        </span>
                    )
                },
            },
            {
                header: 'Amount',
                accessorKey: 'Amount',
                cell: (props) => {
                    const { amount } = props.row.original
                    return (
                        <NumericFormat
                            displayType="text"
                            value={(
                                Math.round(amount * 100) / 100
                            ).toFixed(2)}
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
