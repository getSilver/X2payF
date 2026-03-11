import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { setTableData, useAppDispatch, Withdraw } from '../store'
import SharedActionIcon from '@/views/merback/Dashboard/components/SharedActionIcon'
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

type WithdrawalStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'COMPLETED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'CLOSED'

const statusMap: Record<WithdrawalStatus, number> = {
    PENDING: 0,
    APPROVED: 1,
    COMPLETED: 2,
    REJECTED: 3,
    CANCELLED: 4,
    CLOSED: 5,
}

const withdrawalStatusColor: Record<
    number,
    {
        label: string
        dotClass: string
        textClass: string
    }
> = {
    0: {
        label: 'PENDING',
        dotClass: 'bg-gray-400',
        textClass: 'text-gray-600',
    },
    1: {
        label: 'APPROVED',
        dotClass: 'bg-blue-500',
        textClass: 'text-blue-600',
    },
    2: {
        label: 'COMPLETED',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-600',
    },
    3: {
        label: 'REJECTED',
        dotClass: 'bg-red-500',
        textClass: 'text-red-600',
    },
    4: {
        label: 'CANCELLED',
        dotClass: 'bg-orange-500',
        textClass: 'text-orange-600',
    },
    5: {
        label: 'CLOSED',
        dotClass: 'bg-gray-500',
        textClass: 'text-gray-600',
    },
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
                    const feeInYuan = (row.fee ?? 0) / 100
                    return <span>{formatCurrencyAmount(feeInYuan, currencyCode)}</span>
                },
            },
            {
                header: 'USDT',
                accessorKey: 'bank_account',
                cell: (props) => {
                    const row = props.row.original
                    let withdrawalAddress = ''
                    if (row.extra) {
                        try {
                            const extraData =
                                typeof row.extra === 'string'
                                    ? JSON.parse(row.extra)
                                    : row.extra
                            withdrawalAddress = extraData.withdrawal_address || ''
                        } catch {
                            // ignore parse errors
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
                    let statusCode: number = 0
                    if (typeof row.status === 'string') {
                        statusCode = statusMap[row.status as WithdrawalStatus] ?? 0
                    } else if (typeof row.status === 'number') {
                        statusCode = row.status
                    }

                    const statusInfo = withdrawalStatusColor[statusCode] || withdrawalStatusColor[0]

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
