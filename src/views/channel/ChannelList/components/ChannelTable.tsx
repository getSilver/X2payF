import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/shared/DataTable'
import Tooltip from '@/components/ui/Tooltip'
import Spinner from '@/components/ui/Spinner'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { HiOutlinePencil, HiOutlineTrash, HiSun, HiMoon, HiWrench } from 'react-icons/hi2'
import {
    getChannels,
    setTableData,
    setSelectedChannel,
    toggleDeleteConfirmation,
    useAppDispatch,
    useAppSelector,
} from '../store'
import useThemeClass from '@/utils/hooks/useThemeClass'
import ChannelDeleteConfirmation from './ChannelDeleteConfirmation'
import { useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import { apiUpdateChannelStatus } from '@/services/api/ChannelApi'
import type {
    DataTableResetHandle,
    OnSortParam,
    ColumnDef,
} from '@/components/shared/DataTable'
import type { Channel, ChannelStatus, PaymentMethod } from '@/@types/channel'

/**
 * 渠道状态配置
 */
const channelStatusConfig: Record<
    ChannelStatus,
    {
        label: string
        dotClass: string
        textClass: string
    }
> = {
    enabled: {
        label: '启用',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-500',
    },
    disabled: {
        label: '禁用',
        dotClass: 'bg-red-500',
        textClass: 'text-red-500',
    },
    maintenance: {
        label: '维护中',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-500',
    },
    test: {
        label: '测试',
        dotClass: 'bg-blue-500',
        textClass: 'text-blue-500',
    },
}

/**
 * 操作列
 */
const ActionColumn = ({ row, onStatusChange }: { row: Channel; onStatusChange: () => void }) => {
    const dispatch = useAppDispatch()
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()
    const [statusLoading, setStatusLoading] = useState(false)

    // 状态切换顺序: enabled -> maintenance -> disabled -> enabled
    const getNextStatus = (currentStatus: ChannelStatus): ChannelStatus => {
        switch (currentStatus) {
            case 'enabled':
                return 'maintenance'
            case 'maintenance':
                return 'disabled'
            case 'disabled':
            case 'test':
            default:
                return 'enabled'
        }
    }

    // 获取状态对应的图标
    const getStatusIcon = (status: ChannelStatus) => {
        switch (status) {
            case 'enabled':
                return <HiSun className="text-emerald-500" />
            case 'maintenance':
                return <HiWrench className="text-amber-500" />
            case 'disabled':
            case 'test':
            default:
                return <HiMoon className="text-gray-500" />
        }
    }

    const handleStatusToggle = async () => {
        const nextStatus = getNextStatus(row.status)
        setStatusLoading(true)
        try {
            await apiUpdateChannelStatus(row.id, {
                status: nextStatus,
                reason: `管理员手动切换状态从 ${row.status} 到 ${nextStatus}`,
            })
            
            toast.push(
                <Notification title="状态更新成功" type="success" duration={2500}>
                    渠道状态已更新为 {channelStatusConfig[nextStatus].label}
                </Notification>,
                { placement: 'top-center' }
            )
            
            onStatusChange()
        } catch (error) {
            console.error('更新渠道状态失败:', error)
            toast.push(
                <Notification title="状态更新失败" type="danger" duration={2500}>
                    渠道状态更新失败，请重试
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setStatusLoading(false)
        }
    }

    const onEdit = () => {
        navigate(`/app/channel/channel-edit/${row.id}`)
    }

    const onDelete = () => {
        dispatch(toggleDeleteConfirmation(true))
        dispatch(setSelectedChannel(row.id))
    }

    const nextStatus = getNextStatus(row.status)
    const nextConfig = channelStatusConfig[nextStatus]

    return (
        <div className="flex justify-end text-lg">
            <Tooltip title={`切换到${nextConfig.label}`}>
                <span
                    className={`cursor-pointer p-2 hover:${textTheme}`}
                    onClick={handleStatusToggle}
                >
                    {statusLoading ? (
                        <Spinner size={18} />
                    ) : (
                        getStatusIcon(row.status)
                    )}
                </span>
            </Tooltip>
            <span
                className={`cursor-pointer p-2 hover:${textTheme}`}
                title="编辑"
                onClick={onEdit}
            >
                <HiOutlinePencil />
            </span>
            <span
                className="cursor-pointer p-2 hover:text-red-500"
                title="删除"
                onClick={onDelete}
            >
                <HiOutlineTrash />
            </span>
        </div>
    )
}

/**
 * 渠道名称列
 */
const ChannelNameColumn = ({ row }: { row: Channel }) => {
    return (
        <div className="flex flex-col">
            <span className="font-semibold">{row.display_name}</span>
            <span className="text-xs text-gray-500">{row.code}</span>
        </div>
    )
}

/**
 * 支持的币种列
 */
const CurrenciesColumn = ({ currencies }: { currencies: string[] }) => {
    if (!currencies || currencies.length === 0) {
        return <span className="text-gray-400">-</span>
    }
    return (
        <span>
            {currencies.slice(0, 3).join(', ')}
            {currencies.length > 3 && ` +${currencies.length - 3}`}
        </span>
    )
}

/**
 * 交易类型列
 * 注意：类型值为大写，与后端 TransactionType 定义一致
 */
const TransactionTypesColumn = ({ types }: { types: string[] }) => {
    if (!types || types.length === 0) {
        return <span className="text-gray-400">-</span>
    }
    
    const typeLabels: Record<string, string> = {
        PAY_IN: '代收',
        PAY_OUT: '代付',
    }
    
    return (
        <span>
            {types.map((type) => typeLabels[type] || type).join(', ')}
        </span>
    )
}

/**
 * 支付方式列
 */
const PaymentMethodsColumn = ({ methods }: { methods: PaymentMethod[] }) => {
    if (!methods || methods.length === 0) {
        return <span className="text-gray-400">-</span>
    }
    
    const methodLabels: Record<PaymentMethod, string> = {
        qr_code: '二维码',
        h5: 'H5',
        pix: 'PIX',
        bank_transfer: '银行转账',
        credit_card: '信用卡',
        e_wallet: '电子钱包',
        crypto: '加密货币',
    }
    
    return (
        <span>
            {methods.slice(0, 2).map((method) => methodLabels[method] || method).join(', ')}
            {methods.length > 2 && ` +${methods.length - 2}`}
        </span>
    )
}

/**
 * 渠道指标列
 */
const MetricsColumn = () => {
    // TODO: 从 API 获取指标数据
    return (
        <div className="flex flex-col text-sm">
            <span className="text-gray-500">今日交易: <span className="font-semibold text-gray-900 dark:text-gray-100">-</span></span>
            <span className="text-gray-500">成功率: <span className="font-semibold text-emerald-600">-</span></span>
        </div>
    )
}

/**
 * 渠道表格组件
 */
const ChannelTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const dispatch = useAppDispatch()

    const { pageIndex, pageSize, sort, query, total } = useAppSelector(
        (state) => state.channelList.data.tableData
    )

    const filterData = useAppSelector(
        (state) => state.channelList.data.filterData
    )

    const loading = useAppSelector((state) => state.channelList.data.loading)

    const data = useAppSelector((state) => state.channelList.data.channelList)

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

    const fetchData = useCallback(() => {
        // 构建查询参数
        // 管理后台默认显示所有状态的渠道
        const params: Record<string, string> = {
            include_inactive: 'true',
        }
        if (filterData.status && filterData.status.length > 0) {
            params.status = filterData.status[0]
        }
        if (filterData.currency) {
            params.currency = filterData.currency
        }
        dispatch(getChannels(params))
    }, [dispatch, filterData])

    const columns: ColumnDef<Channel>[] = useMemo(
        () => [
            {
                header: '渠道名称',
                accessorKey: 'display_name',
                cell: (props) => {
                    const row = props.row.original
                    return <ChannelNameColumn row={row} />
                },
            },
            {
                header: '交易类型',
                accessorKey: 'supported_transaction_types',
                cell: (props) => {
                    const { supported_transaction_types } = props.row.original
                    return <TransactionTypesColumn types={supported_transaction_types} />
                },
            },
            {
                header: '支付方式',
                accessorKey: 'supported_payment_methods',
                cell: (props) => {
                    const { supported_payment_methods } = props.row.original
                    return <PaymentMethodsColumn methods={supported_payment_methods} />
                },
            },
            {
                header: '支持币种',
                accessorKey: 'supported_currencies',
                cell: (props) => {
                    const { supported_currencies } = props.row.original
                    return <CurrenciesColumn currencies={supported_currencies} />
                },
            },
            {
                header: '渠道指标',
                accessorKey: 'metrics',
                cell: () => {
                    return <MetricsColumn />
                },
            },
            {
                header: '状态',
                accessorKey: 'status',
                sortable: true,
                cell: (props) => {
                    const { status } = props.row.original
                    const config = channelStatusConfig[status] || channelStatusConfig.disabled
                    return (
                        <div className="flex items-center gap-2">
                            <Badge className={config.dotClass} />
                            <span className={`capitalize font-semibold ${config.textClass}`}>
                                {config.label}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: '',
                id: 'action',
                cell: (props) => <ActionColumn row={props.row.original} onStatusChange={fetchData} />,
            },
        ],
        [fetchData]
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
            <ChannelDeleteConfirmation />
        </>
    )
}

export default ChannelTable
