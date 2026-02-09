import { useMemo, useState } from 'react'
import classNames from 'classnames'
import Table from '@/components/ui/Table'
import Checkbox from '@/components/ui/Checkbox'
import Loading from './Loading'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
    ColumnSort,
    Row,
    SortingState,
} from '@tanstack/react-table'
import type { SkeletonProps } from '@/components/ui/Skeleton'

export type OnSortParam = { order: 'asc' | 'desc' | ''; key: string | number }

type VirtualizedDataTableProps<T> = {
    columns: ColumnDef<T>[]
    data?: unknown[]
    loading?: boolean
    onCheckBoxChange?: (checked: boolean, row: T) => void
    onIndeterminateCheckBoxChange?: (checked: boolean, rows: Row<T>[]) => void
    onSort?: (sort: OnSortParam) => void
    selectable?: boolean
    skeletonAvatarColumns?: number[]
    skeletonAvatarProps?: SkeletonProps
    // 虚拟化相关配置
    enableVirtualization?: boolean
    virtualHeight?: number // 虚拟容器高度
    rowHeight?: number // 每行高度
}

const { Tr, Th, Td, THead, TBody } = Table

function VirtualizedDataTable<T>(props: VirtualizedDataTableProps<T>) {
    const {
        skeletonAvatarColumns,
        columns: columnsProp = [],
        data = [],
        loading = false,
        onCheckBoxChange,
        onIndeterminateCheckBoxChange,
        onSort,
        selectable = false,
        enableVirtualization = false,
        virtualHeight = 400,
        rowHeight = 48,
    } = props

    const [sorting, setSorting] = useState<SortingState>([])

    const handleCheckBoxChange = (checked: boolean, row: T) => {
        if (!loading) {
            onCheckBoxChange?.(checked, row)
        }
    }

    const handleIndeterminateCheckBoxChange = (
        checked: boolean,
        rows: Row<T>[]
    ) => {
        if (!loading) {
            onIndeterminateCheckBoxChange?.(checked, rows)
        }
    }

    const handleSortingChange = (updater: SortingState | ((old: SortingState) => SortingState)) => {
        const newSorting = typeof updater === 'function' ? updater(sorting) : updater
        setSorting(newSorting)
        if (onSort && newSorting.length > 0) {
            const sort = newSorting[0]
            onSort({
                order: sort.desc ? 'desc' : 'asc',
                key: sort.id,
            })
        }
    }

    const finalColumns = useMemo(() => {
        if (selectable) {
            return [
                {
                    id: 'select',
                    header: ({ table }: { table: any }) => (
                        <Checkbox
                            checked={table.getIsAllRowsSelected()}
                            onChange={(checked) =>
                                handleIndeterminateCheckBoxChange(
                                    checked,
                                    table.getFilteredSelectedRowModel().rows
                                )
                            }
                        />
                    ),
                    cell: ({ row }: { row: any }) => (
                        <Checkbox
                            checked={row.getIsSelected()}
                            disabled={!row.getCanSelect()}
                            onChange={(checked) =>
                                handleCheckBoxChange(
                                    checked,
                                    row.original
                                )
                            }
                        />
                    ),
                },
                ...columnsProp,
            ]
        }
        return columnsProp
    }, [columnsProp, selectable])

    const table = useReactTable({
        data,
        columns: finalColumns as ColumnDef<unknown | object | any[], any>[],
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualSorting: true,
        onSortingChange: handleSortingChange,
        state: {
            sorting,
        },
    })

    // 临时禁用虚拟化功能，直接使用普通表格
    return (
        <Loading loading={loading && data.length !== 0} type="cover">
            <Table>
                <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <Th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={classNames(
                                                    header.column.getCanSort() &&
                                                        'cursor-pointer select-none point',
                                                    loading &&
                                                        'pointer-events-none'
                                                )}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext()
                                                )}
                                            </div>
                                        )}
                                    </Th>
                                )
                            })}
                        </Tr>
                    ))}
                </THead>
                <TBody>
                    {table.getRowModel().rows.map((row) => {
                        return (
                            <Tr key={row.id}>
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <Td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef
                                                    .cell,
                                                cell.getContext()
                                            )}
                                        </Td>
                                    )
                                })}
                            </Tr>
                        )
                    })}
                </TBody>
            </Table>
        </Loading>
    )
}

export default VirtualizedDataTable
