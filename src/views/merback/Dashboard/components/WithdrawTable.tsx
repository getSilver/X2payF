import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/shared/DataTable'
import { setTableData, useAppDispatch, Withdraw } from '../store'
import { statusColor } from '../constants'
import {
    HiOutlineArrowsRightLeft,
    HiOutlineArrowUp,
    HiOutlineArrowDown,
} from 'react-icons/hi2'
import cloneDeep from 'lodash/cloneDeep'
import dayjs from 'dayjs'
import type { TableQueries } from '@/@types/common'
import type { OnSortParam, ColumnDef } from '@/components/shared'

type WithdrawTableProps = {
    data: Withdraw[]
    loading?: boolean
    tableData: TableQueries
}

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
                    icon={<HiOutlineArrowsRightLeft />}
                />
            )
        default:
            return <Avatar />
    }
}

const WithdrawTable = ({ data, loading, tableData }: WithdrawTableProps) => {
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
                header: 'SubAmount提交金额',
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
                            <Badge className={statusColor[status].dotClass} />
                            <span
                                className={`capitalize font-semibold ${statusColor[status].textClass}`}
                            >
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

export default WithdrawTable
