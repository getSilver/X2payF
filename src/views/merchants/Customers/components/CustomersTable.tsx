import { useEffect, useCallback, useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/shared/DataTable'
import {
    getCustomers,
    setTableData,
    setSelectedCustomer,
    setDrawerOpen,
    useAppDispatch,
    useAppSelector,
} from '../store'
import useThemeClass from '@/utils/hooks/useThemeClass'
import CustomerEditDialog from './CustomerEditDialog'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import cloneDeep from 'lodash/cloneDeep'
import type { OnSortParam, ColumnDef } from '@/components/shared/DataTable'
import type { AccountStatus } from '@/@types/account'
import type { UnifiedAccount } from '@/services/api/AccountApi'

// 状态颜色映射（后端状态）
const statusColor: Record<AccountStatus, string> = {
    Normal: 'bg-emerald-500',
    Locked: 'bg-orange-500',
    Frozen: 'bg-blue-500',
    Suspended: 'bg-yellow-500',
    Disabled: 'bg-red-500',
    Deleted: 'bg-gray-500',
}

// 状态中文显示
const statusLabel: Record<AccountStatus, string> = {
    Normal: '正常',
    Locked: '锁定',
    Frozen: '冻结',
    Suspended: '暂停',
    Disabled: '禁用',
    Deleted: '已删除',
}

// 账户类型中文显示
const accountTypeLabel: Record<string, string> = {
    MERCHANT: '商户',
    AGENT: '代理商',
    CHANNEL_PARTNER: '渠道合作商',
}

const ActionColumn = ({ row }: { row: UnifiedAccount }) => {
    const { textTheme } = useThemeClass()
    const dispatch = useAppDispatch()

    const onEdit = () => {
        dispatch(setDrawerOpen())
        dispatch(setSelectedCustomer(row))
    }

    return (
        <div
            className={`${textTheme} cursor-pointer select-none font-semibold`}
            onClick={onEdit}
        >
            编辑
        </div>
    )
}

const NameColumn = ({ row }: { row: UnifiedAccount }) => {
    const { textTheme } = useThemeClass()

    return (
        <div className="flex items-center">
            <Avatar size={28} shape="circle" />
            <Link
                className={`hover:${textTheme} ml-2 rtl:mr-2 font-semibold`}
                to={`/app/merchants/mer-details?id=${row.id}`}
            >
                {row.name}
            </Link>
        </div>
    )
}

const Customers = () => {
    const dispatch = useAppDispatch()
    const data = useAppSelector((state) => state.crmCustomers.data.customerList)
    const loading = useAppSelector((state) => state.crmCustomers.data.loading)
    const filterData = useAppSelector(
        (state) => state.crmCustomers.data.filterData
    )

    const { pageIndex, pageSize, sort, query, total } = useAppSelector(
        (state) => state.crmCustomers.data.tableData
    )

    const fetchData = useCallback(() => {
        dispatch(getCustomers({ pageIndex, pageSize, sort, query, filterData }))
    }, [pageIndex, pageSize, sort, query, filterData, dispatch])

    useEffect(() => {
        fetchData()
    }, [fetchData, pageIndex, pageSize, sort, filterData])

    const tableData = useMemo(
        () => ({ pageIndex, pageSize, sort, query, total }),
        [pageIndex, pageSize, sort, query, total]
    )

    const columns: ColumnDef<UnifiedAccount>[] = useMemo(
        () => [
            {
                header: '名称',
                accessorKey: 'name',
                cell: (props) => {
                    const row = props.row.original
                    return <NameColumn row={row} />
                },
            },
            {
                header: '账户ID',
                accessorKey: 'id',
            },
            {
                header: '类型',
                accessorKey: 'account_type',
                cell: (props) => {
                    const row = props.row.original
                    return accountTypeLabel[row.account_type] || row.account_type
                },
            },
            {
                header: '邮箱',
                accessorKey: 'contact_email',
            },
            {
                header: '状态',
                accessorKey: 'status',
                cell: (props) => {
                    const row = props.row.original
                    const status = row.status as AccountStatus
                    return (
                        <div className="flex items-center">
                            <Badge className={statusColor[status] || 'bg-gray-500'} />
                            <span className="ml-2 rtl:mr-2">
                                {statusLabel[status] || status}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: '创建时间',
                accessorKey: 'created_at',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center">
                            {dayjs(row.created_at).format('YYYY-MM-DD HH:mm')}
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
                columns={columns}
                data={data}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ width: 28, height: 28 }}
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
            <CustomerEditDialog />
        </>
    )
}

export default Customers
