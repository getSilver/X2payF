import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { setTableData, useAppDispatch, TransactionDetails } from '../store'
import SharedActionIcon from './SharedActionIcon'
import cloneDeep from 'lodash/cloneDeep'
import dayjs from 'dayjs'
import type { TableQueries } from '@/@types/common'
import type { OnSortParam, ColumnDef } from '@/components/shared'
import { formatCurrencyAmount } from '@/utils/currencySymbols'

type DepositTableProps = {
    data: TransactionDetails[]
    loading?: boolean
    tableData: TableQueries
}

const DepositTable = ({ data, loading, tableData }: DepositTableProps) => {
    const dispatch = useAppDispatch()

    const columns: ColumnDef<TransactionDetails>[] = useMemo(
        () => [
            {
                header: '',
                accessorKey: 'action',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center gap-2">
                            
                                <SharedActionIcon type={row.actionType ?? 2} />
                            
                            {/* <span className="font-semibold heading-text whitespace-nowrap">
                                {row.action || '日报'}
                            </span> */}
                        </div>
                    )
                },
            },
            {
                header: 'Date',
                accessorKey: 'date',
                cell: (props) => {
                    const row = props.row.original
                    // 后端返回的 date 是字符串格式 (如 "2024-01-15")
                    // 兼容旧的 Unix 时间戳格式
                    const dateValue = typeof row.date === 'string' 
                        ? dayjs(row.date).format('MM/DD/YYYY')
                        : dayjs.unix(row.date).format('MM/DD/YYYY')
                    return (
                        <div className="flex items-center">
                            {dateValue}
                        </div>
                    )
                },
            },
            {
                header: 'Total',
                accessorKey: 'total_amount',
                cell: (props) => {
                    const row = props.row.original
                    // 后端返回的金额单位是"分"，转换为"元"显示
                    const amount = (row.total_amount ?? row.amount ?? 0) / 100
                    const count = row.total_count ?? row.unitTotal ?? 0
                    const currencyCode = row.symbol
                    return (
                        <span className="font-semibold">
                            {formatCurrencyAmount(amount, currencyCode)} / {count}
                        </span>
                    )
                },
            },
            {
                header: 'Success',
                accessorKey: 'success_amount',
                cell: (props) => {
                    const row = props.row.original
                    // 后端返回的金额单位是"分"，转换为"元"显示
                    const amount = (row.success_amount ?? 0) / 100
                    const count = row.success_count ?? 0
                    const currencyCode = row.symbol
                    return (
                        <span className="text-emerald-600 font-semibold">
                            {formatCurrencyAmount(amount, currencyCode)} / {count}
                        </span>
                    )
                },
            },
            {
                header: 'Failed',
                accessorKey: 'failed_amount',
                cell: (props) => {
                    const row = props.row.original
                    // 后端返回的金额单位是"分"，转换为"元"显示
                    const amount = (row.failed_amount ?? 0) / 100
                    const count = row.failed_count ?? 0
                    const currencyCode = row.symbol
                    return (
                        <span className="text-red-600 font-semibold">
                            {formatCurrencyAmount(amount, currencyCode)} / {count}
                        </span>
                    )
                },
            },
            {
                header: 'Pending',
                accessorKey: 'pending_amount',
                cell: (props) => {
                    const row = props.row.original
                    // 后端返回的金额单位是"分"，转换为"元"显示
                    const amount = (row.pending_amount ?? 0) / 100
                    const count = row.pending_count ?? 0
                    const currencyCode = row.symbol
                    return (
                        <span className="text-amber-600 font-semibold">
                            {formatCurrencyAmount(amount, currencyCode)} / {count}
                        </span>
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

export default DepositTable
