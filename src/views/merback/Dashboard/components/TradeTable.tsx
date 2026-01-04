import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { setTableData, useAppDispatch, Trade } from '../store'
import { statusColor } from '../constants'
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

type TradeTableProps = {
    data: Trade[]
    loading?: boolean
    tableData: TableQueries
}

const ActionColumn = memo(({ row }: { row: Trade }) => {
    const navigate = useNavigate()
    const { textTheme } = useThemeClass()
    const onView = () => {
        navigate(`/mer/merback/payment-details/${row.id}`)
    }

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
})

const TradeTable = ({ data, loading, tableData }: TradeTableProps) => {
    const dispatch = useAppDispatch()

    const columns: ColumnDef<Trade>[] = useMemo(
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
                    return <span>{row.id}</span>
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
                header: 'Amount原金额',
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
                header: 'Fee变更',
                accessorKey: 'price',
                cell: (props) => {
                    const row = props.row.original
                    return <span>{row.price} {row.symbol}</span>
                },
            },
            {
                header: 'Amount结算金额',
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
