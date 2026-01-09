import { useEffect, useMemo, useRef } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/shared/DataTable'
import { HiOutlinePencil, HiOutlineTrash, HiSun } from 'react-icons/hi2'
import { FiPackage } from 'react-icons/fi'
import {
    getProducts,
    setTableData,
    setSelectedChannel,
    toggleChannelStatus,
    toggleDeleteConfirmation,
    useAppDispatch,
    useAppSelector,
} from '../store'
import useThemeClass from '@/utils/hooks/useThemeClass'
import ProductDeleteConfirmation from './ChannelDeleteConfirmation'
import { useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import type {
    DataTableResetHandle,
    OnSortParam,
    ColumnDef,
} from '@/components/shared/DataTable'

type Channel = {
    id: string
    name: string
    productCode: string
    img: string
    category: string
    price: number
    stock: number
    status: number
    tags: string
}

const inventoryStatusColor: Record<
    number,
    {
        label: string
        dotClass: string
        textClass: string
    }
> = {
    0: {
        label: 'Active',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-500',
    },
    1: {
        label: 'Disabled',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-500',
    },
    // 2: {
    //     label: 'Out of Stock',
    //     dotClass: 'bg-red-500',
    //     textClass: 'text-red-500',
    // },
}

const ActionColumn = ({ row }: { row: Channel }) => {
    const dispatch = useAppDispatch()
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()
    
    const status = () => {
        dispatch(toggleChannelStatus({ id: row.id, status: row.status }))
        dispatch(setSelectedChannel(row.id))
    }

    const onEdit = () => {
        navigate(`/app/channel/channel-edit/${row.id}`)
    }

    const onDelete = () => {
        dispatch(toggleDeleteConfirmation(true))
        dispatch(setSelectedChannel(row.id))
    }

    return (
        <div className="flex justify-end text-lg">
            <span
                className={`cursor-pointer p-2 hover:${textTheme}`}
                onClick={status}
            >
                <HiSun />
            </span>
            <span
                className={`cursor-pointer p-2 hover:${textTheme}`}
                onClick={onEdit}
            >
                <HiOutlinePencil />
            </span>
            <span
                className="cursor-pointer p-2 hover:text-red-500"
                onClick={onDelete}
            >
                <HiOutlineTrash />
            </span>
        </div>
    )
}

const ChannelColumn = ({ row }: { row: Channel }) => {
    const avatar = row.img ? (
        <Avatar src={row.img} />
    ) : (
        <Avatar icon={<FiPackage />} />
    )

    return (
        <div className="flex items-center">
            {avatar}
            <span className={`ml-2 rtl:mr-2 font-semibold`}>{row.name}</span>
        </div>
    )
}

const ChannelTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)

    const dispatch = useAppDispatch()

    const { pageIndex, pageSize, sort, query, total } = useAppSelector(
        (state) => state.salesChannelList.data.tableData
    )

    const filterData = useAppSelector(
        (state) => state.salesChannelList.data.filterData
    )

    const loading = useAppSelector(
        (state) => state.salesChannelList.data.loading
    )

    const data = useAppSelector(
        (state) => state.salesChannelList.data.channelList
    )

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageIndex, pageSize, sort])

    useEffect(() => {
        if (tableRef) {
            tableRef.current?.resetSorting()
        }
    }, [filterData])

    const tableData = useMemo(
        () => ({ pageIndex, pageSize, sort, query, total }),
        [pageIndex, pageSize, sort, query, total]
    )

    const fetchData = () => {
        dispatch(getProducts({ pageIndex, pageSize, sort, query, filterData }))
    }

    const columns: ColumnDef<Channel>[] = useMemo(
        () => [
            {
                header: 'Name通道',
                accessorKey: 'name',
                cell: (props) => {
                    const row = props.row.original
                    return <ChannelColumn row={row} />
                },
            },
            {
                header: '代收付',
                accessorKey: 'tags',
                cell: (props) => {
                    const { tags } = props.row.original
                    return <span className="capitalize">{tags}</span>
                },
            },
            {
                header: 'Category地区',
                accessorKey: 'category',
                cell: (props) => {
                    const row = props.row.original
                    return <span className="capitalize">{row.category}</span>
                },
            },
            {
                header: 'Quantit量',
                accessorKey: 'stock',
            },
            {
                header: 'Price金额',
                accessorKey: 'price',
                cell: (props) => {
                    const { price } = props.row.original
                    return <span>${price}</span>
                },
            },
            {
                header: 'Status',
                accessorKey: 'status',
                sortable: true,
                cell: (props) => {
                    const { status } = props.row.original
                    return (
                        <div className="flex items-center gap-2">
                            <Badge
                                className={
                                    inventoryStatusColor[status].dotClass
                                }
                            />
                            <span
                                className={`capitalize font-semibold ${inventoryStatusColor[status].textClass}`}
                            >
                                {inventoryStatusColor[status].label}
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
        <>
            <DataTable
                ref={tableRef}
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
            <ProductDeleteConfirmation />
        </>
    )
}

export default ChannelTable


