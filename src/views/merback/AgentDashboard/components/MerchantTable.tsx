import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { setTableData, useAppDispatch, AgentMerchantAppRow } from '../store'
import cloneDeep from 'lodash/cloneDeep'
import dayjs from 'dayjs'
import type { TableQueries } from '@/@types/common'
import type { OnSortParam, ColumnDef } from '@/components/shared'
import { formatCurrencyAmount } from '@/utils/currencySymbols'

type MerchantTableProps = {
    data: AgentMerchantAppRow[]
    loading?: boolean
    tableData: TableQueries
}

const MerchantTable = ({ data, loading, tableData }: MerchantTableProps) => {
    const dispatch = useAppDispatch()

    const columns: ColumnDef<AgentMerchantAppRow>[] = useMemo(
        () => [
            {
                header: 'Merchant',
                accessorKey: 'merchant_name',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="max-w-[220px]">
                            <div className="truncate font-semibold" title={row.merchant_name || ''}>
                                {row.merchant_name || '-'}
                            </div>
                            <div className="text-xs text-gray-500 truncate" title={row.merchant_id}>
                                {row.merchant_id}
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'App',
                accessorKey: 'app_name',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="max-w-[220px]">
                            <div className="truncate font-semibold" title={row.app_name || ''}>
                                {row.app_name || '-'}
                            </div>
                            <div className="text-xs text-gray-500 truncate" title={row.app_id || ''}>
                                {row.app_id || '-'}
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'Status',
                accessorKey: 'app_status',
                cell: (props) => {
                    const row = props.row.original
                    if (!row.app_id) {
                        return <span>-</span>
                    }
                    const status = row.app_status || '-'
                    return (
                        <span className="capitalize font-semibold text-gray-700">
                            {status}
                        </span>
                    )
                },
            },
            {
                header: 'Currency',
                accessorKey: 'currency',
                cell: (props) => {
                    const row = props.row.original
                    if (!row.app_id) {
                        return <span>-</span>
                    }
                    return <span>{row.currency || '-'}</span>
                },
            },
            {
                header: 'Available',
                accessorKey: 'available_amount',
                cell: (props) => {
                    const row = props.row.original
                    if (!row.app_id) {
                        return <span>-</span>
                    }
                    const amount = (row.available_amount ?? 0) / 100
                    return (
                        <span className="font-semibold">
                            {formatCurrencyAmount(amount, row.currency)}
                        </span>
                    )
                },
            },
            {
                header: 'Balance',
                accessorKey: 'balance',
                cell: (props) => {
                    const row = props.row.original
                    if (!row.app_id) {
                        return <span>-</span>
                    }
                    const amount = (row.balance ?? 0) / 100
                    return (
                        <span className="font-semibold">
                            {formatCurrencyAmount(amount, row.currency)}
                        </span>
                    )
                },
            },
            {
                header: 'Created',
                accessorKey: 'created_at',
                cell: (props) => {
                    const row = props.row.original
                    if (!row.app_id) {
                        return <span>-</span>
                    }
                    const value = row.created_at
                        ? dayjs(row.created_at).format('MM/DD/YYYY')
                        : '-'
                    return <span className="whitespace-nowrap">{value}</span>
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

export default MerchantTable
