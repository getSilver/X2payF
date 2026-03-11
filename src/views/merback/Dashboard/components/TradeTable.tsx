import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { setTableData, useAppDispatch, Trade } from '../store'
import SharedActionIcon from './SharedActionIcon'
import cloneDeep from 'lodash/cloneDeep'
import dayjs from 'dayjs'
import type { TableQueries } from '@/@types/common'
import type { OnSortParam, ColumnDef } from '@/components/shared'
import { useNavigate } from 'react-router-dom'
import { memo } from 'react'
import Tooltip from '@/components/ui/Tooltip'
import { HiOutlineEye } from 'react-icons/hi2'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { PAYMENT_STATUS_META, type PaymentStatus } from '@/@types/payment'
import { formatCurrencyAmount } from '@/utils/currencySymbols'

type TradeTableProps = {
    data: Trade[]
    loading?: boolean
    tableData: TableQueries
}

// 兼容历史数字状态码
const statusCodeToStatus: Record<number, PaymentStatus> = {
    0: 'PENDING',
    1: 'PROCESSING',
    2: 'SUCCESS',
    3: 'FAILED',
    4: 'CANCELLED',
    5: 'CLOSED',
    6: 'REFUNDED',
}

// 交易类型映射
const transactionTypeMap: Record<string, number> = {
    PAY_IN: 0,
    PAY_OUT: 1,
}

const ActionColumn = memo(({ row }: { row: Trade }) => {
    const navigate = useNavigate()
    const { textTheme } = useThemeClass()
    const onView = () => {
        // 优先使用 payment_id，回退到 id
        const paymentId = row.payment_id || row.id
        navigate(`/mer/merback/payment-details/${paymentId}`)
    }

    return (
        <div className="flex justify-end text-lg">
            <Tooltip title="Detail">
                <span
                    className={`cursor-pointer p-2 hover:${textTheme}`}
                    onClick={onView}
                >
                    <HiOutlineEye />
                </span>
            </Tooltip>
        </div>
    )
})

ActionColumn.displayName = 'ActionColumn'

const TradeTable = ({ data, loading, tableData }: TradeTableProps) => {
    const dispatch = useAppDispatch()
    const DEBUG_TRADE = import.meta.env.VITE_API_DEBUG === 'true'

    if (DEBUG_TRADE) {
        console.debug('[MerchantDashboard][TradeTableRender]', {
            loading,
            dataLength: Array.isArray(data) ? data.length : 0,
            firstRow: Array.isArray(data) && data.length > 0 ? data[0] : null,
            pageIndex: tableData.pageIndex,
            pageSize: tableData.pageSize,
            total: tableData.total,
        })
    }

    const columns: ColumnDef<Trade>[] = useMemo(
        () => [
            {
                header: 'Action',
                accessorKey: 'action',
                cell: (props) => {
                    const row = props.row.original
                    // 使用后端字段或前端字段
                    const actionType = row.actionType ?? transactionTypeMap[row.transaction_type || ''] ?? 1
                    // const action = row.action || row.transaction_type || 'PAY_IN'
                    
                    return (
                        <div className="flex items-center gap-2">
                            
                                <SharedActionIcon type={actionType} />
                            
                            {/* <span className="font-semibold heading-text whitespace-nowrap">
                                {action}
                            </span> */}
                        </div>
                    )
                },
            },
            {
                header: 'ID',
                accessorKey: 'id',
                cell: (props) => {
                    const row = props.row.original
                    // 优先显示 payment_id，回退到 id
                    const displayId = row.payment_id || row.id
                    return (
                        <div className="max-w-[200px]">
                            <div className="truncate" title={displayId}>
                                {displayId}
                            </div>
                            {row.merchant_tx_id && (
                                <div className="text-xs text-gray-500 truncate" title={row.merchant_tx_id}>
                                    {row.merchant_tx_id}
                                </div>
                            )}
                        </div>
                    )
                },
            },
            {
                header: 'Date',
                accessorKey: 'date',
                cell: (props) => {
                    const row = props.row.original
                    // 优先使用 created_at，回退到 date
                    const dateValue = row.created_at 
                        ? dayjs(row.created_at).format('MM/DD/YYYY HH:mm')
                        : row.date 
                        ? dayjs.unix(row.date).format('MM/DD/YYYY')
                        : '-'
                    
                    return (
                        <div className="flex items-center whitespace-nowrap">
                            {dateValue}
                        </div>
                    )
                },
            },
            {
                header: 'Amount',
                accessorKey: 'amount',
                cell: (props) => {
                    const row = props.row.original
                    const currencyCode = row.currency || row.symbol
                    // 后端返回的金额单位是"分"，转换为"元"显示
                    const amountInYuan = row.amount / 100
                    return (
                        <span className="font-semibold">
                            {formatCurrencyAmount(amountInYuan, currencyCode)}
                        </span>
                    )
                },
            },
            {
                header: 'Fee',
                accessorKey: 'fee',
                cell: (props) => {
                    const row = props.row.original
                    const currencyCode = row.currency || row.symbol
                    // 后端返回的金额单位是"分"，转换为"元"显示
                    const feeInYuan = (row.fee ?? 0) / 100
                    return <span>{formatCurrencyAmount(feeInYuan, currencyCode)}</span>
                },
            },
            {
                header: 'Settlement',
                accessorKey: 'settlement',
                cell: (props) => {
                    const row = props.row.original
                    const currencyCode = row.currency || row.symbol
                    // 后端返回的金额单位是"分"，转换为"元"显示
                    const amountInYuan = row.amount / 100
                    const feeInYuan = (row.fee ?? 0) / 100
                    const settlementInYuan = row.settlement ? row.settlement / 100 : (amountInYuan - feeInYuan)
                    return (
                        <span className="font-semibold">
                            {formatCurrencyAmount(settlementInYuan, currencyCode)}
                        </span>
                    )
                },
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const row = props.row.original
                    let status: PaymentStatus = 'PENDING'
                    if (typeof row.status === 'string') {
                        status = (row.status as PaymentStatus) || 'PENDING'
                    } else if (typeof row.status === 'number') {
                        status = statusCodeToStatus[row.status] || 'PENDING'
                    }

                    const statusInfo = PAYMENT_STATUS_META[status] || PAYMENT_STATUS_META.PENDING
                    
                    return (
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
                            <span className={`capitalize font-semibold ${statusInfo.textClass}`}>
                                {statusInfo.label}
                            </span>
                        </div>
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
            columns={columns}
            data={data}
            skeletonAvatarColumns={[0]}
            skeletonAvatarProps={{ className: 'rounded-md' }}
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

export default TradeTable
