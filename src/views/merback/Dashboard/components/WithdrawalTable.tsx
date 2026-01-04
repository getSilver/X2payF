import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { setTableData, useAppDispatch, Withdraw } from '../store'
import { statusColor } from '../constants'
import SharedActionIcon from './SharedActionIcon'
import cloneDeep from 'lodash/cloneDeep'
import dayjs from 'dayjs'
import type { TableQueries } from '@/@types/common'
import type { OnSortParam, ColumnDef } from '@/components/shared'

type WithdrawalTableProps = {
    data: Withdraw[]
    loading?: boolean
    tableData: TableQueries
}

const WithdrawalTable = ({ data, loading, tableData }: WithdrawalTableProps) => {
    const dispatch = useAppDispatch()

    const columns: ColumnDef<Withdraw>[] = useMemo(
        () => [
            {
                header: 'Action',
                accessorKey: 'action',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center gap-2">
                            <div>
                                <SharedActionIcon type={row.actionType} />
                            </div>
                            <span className="font-semibold heading-text whitespace-nowrap">
                                {row.action}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: 'Transaction Id',
                accessorKey: 'id',
                cell: (props) => {
                    const row = props.row.original
                    return <span>TxID-{row.id}</span>
                },
            },
            {
                header: 'Date',
                accessorKey: 'date',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center">
                            {dayjs.unix(row.date).format('MM/DD/YYYY')}
                        </div>
                    )
                },
            },
            {
                header: 'SubAmount提交金',
                accessorKey: 'subAmount',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <span>
                            {row.subAmount} {row.symbol}
                        </span>
                    )
                },
            },
            {
                header: 'Amount实收金额',
                accessorKey: 'amount',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <span>
                            {row.amount} {row.symbol}
                        </span>
                    )
                },
            },
            {
                header: 'Fee汇率',
                accessorKey: 'fee',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <span>
                            {row.fee} {row.symbol}
                        </span>
                    )
                },
            },
            {
                header: 'Refund退款金额',
                accessorKey: 'refund',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <span>
                            {row.refund} {row.symbol}
                        </span>
                    )
                },
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const { status } = props.row.original
                    return (
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${statusColor[status].dotClass}`} />
                            <span className={`capitalize font-semibold ${statusColor[status].textClass}`}>
                                {statusColor[status].label}
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
