import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { setTableData, useAppDispatch, Withdraw } from '../store'
import { statusColor } from '../constants'
import SharedActionIcon from './SharedActionIcon'
import cloneDeep from 'lodash/cloneDeep'
import dayjs from 'dayjs'
import type { TableQueries } from '@/@types/common'
import type { OnSortParam, ColumnDef } from '@/components/shared'
import { formatCurrencyAmount } from '@/utils/currencySymbols'

type WithdrawalTableProps = {
    data: Withdraw[]
    loading?: boolean
    tableData: TableQueries
}

// 提款状态类型定义
type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | 'CLOSED'

// 状态映射：后端状态 -> 前端状态码
const statusMap: Record<WithdrawalStatus, number> = {
    PENDING: 0,      // 待审核
    APPROVED: 1,     // 已批准
    COMPLETED: 2,    // 已完成
    REJECTED: 3,     // 已拒绝
    CANCELLED: 4,    // 已取消
    CLOSED: 5,       // 已关闭
}

const WithdrawalTable = ({ data, loading, tableData }: WithdrawalTableProps) => {
    const dispatch = useAppDispatch()

    const columns: ColumnDef<Withdraw>[] = useMemo(
        () => [
            {
                header: '',
                accessorKey: 'action',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center gap-2">
                            <div>
                                <SharedActionIcon type={row.actionType ?? 2} />
                            </div>
                            {/* <span className="font-semibold heading-text whitespace-nowrap">
                                {row.action || '提款'}
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
                    const displayId = row.withdrawal_id || row.id
                    return (
                        <div className="max-w-[200px]">
                            <div className="truncate" title={displayId}>
                                {displayId}
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'Date',
                accessorKey: 'date',
                cell: (props) => {
                    const row = props.row.original
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
                header: 'USDT',
                accessorKey: 'bank_account',
                cell: (props) => {
                    const row = props.row.original
                    // 从 extra 字段解析提款收款地址
                    let withdrawalAddress = ''
                    if (row.extra) {
                        try {
                            const extraData = typeof row.extra === 'string' ? JSON.parse(row.extra) : row.extra
                            withdrawalAddress = extraData.withdrawal_address || ''
                        } catch {
                            // 解析失败，忽略
                        }
                    }
                    const displayValue = withdrawalAddress || row.bank_account || '-'
                    return (
                        <div className="max-w-[150px]">
                            <div className="truncate" title={displayValue}>
                                {displayValue}
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'Note',
                accessorKey: 'note',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="max-w-[150px]">
                            <div className="truncate" title={row.note || ''}>
                                {row.note || '-'}
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const row = props.row.original
                    // 如果有后端状态字符串，转换为状态码
                    let statusCode: number = 0
                    if (typeof row.status === 'string') {
                        statusCode = statusMap[row.status as WithdrawalStatus] ?? 0
                    } else if (typeof row.status === 'number') {
                        statusCode = row.status
                    }
                    
                    const statusInfo = statusColor[statusCode] || statusColor[0]
                    
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

export default WithdrawalTable
