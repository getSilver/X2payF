import { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import AdaptableCard from '@/components/shared/AdaptableCard'
import DataTable from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import DatePicker from '@/components/ui/DatePicker'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    apiGetSettlementProfitSharingRecords,
    apiGetSettlementProfitSharingStatistics,
    type SettlementProfitSharingRecord,
    type SettlementProfitSharingStatistics,
} from '@/services/FinanceService'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { ReactNode } from 'react'
import {
    components,
    type ControlProps,
    type OptionProps,
    type SingleValue,
} from 'react-select'
import {
    HiCheck,
    HiOutlineChartBar,
    HiOutlineCurrencyDollar,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineExclamationCircle,
} from 'react-icons/hi'

type Filters = {
    appId: string
    recipientId: string
    status: string
    startTime: string
    endTime: string
}

const dateFormat = 'MMM DD, YYYY'
const { DatePickerRange } = DatePicker
const { Control } = components

type StatusOption = {
    value: string
    label: string
    color: string
}

const statusOptions: StatusOption[] = [
    { value: '', label: 'All Status', color: 'bg-gray-500' },
    { value: 'PENDING', label: 'PENDING', color: 'bg-amber-500' },
    { value: 'PROCESSING', label: 'PROCESSING', color: 'bg-blue-500' },
    { value: 'COMPLETED', label: 'COMPLETED', color: 'bg-emerald-500' },
    { value: 'FAILED', label: 'FAILED', color: 'bg-red-500' },
    { value: 'CANCELLED', label: 'CANCELLED', color: 'bg-gray-500' },
]

const defaultStats: SettlementProfitSharingStatistics = {
    total_records: 0,
    total_amount: 0,
    completed_amount: 0,
    pending_amount: 0,
    failed_amount: 0,
}

const statusColorMap: Record<
    string,
    {
        dotClass: string
        textClass: string
    }
> = {
    PENDING: { dotClass: 'bg-amber-500', textClass: 'text-amber-500' },
    PROCESSING: { dotClass: 'bg-blue-500', textClass: 'text-blue-500' },
    COMPLETED: { dotClass: 'bg-emerald-500', textClass: 'text-emerald-500' },
    FAILED: { dotClass: 'bg-red-500', textClass: 'text-red-500' },
    CANCELLED: { dotClass: 'bg-gray-500', textClass: 'text-gray-500' },
}

const toRFC3339 = (value: string) => {
    if (!value) {
        return undefined
    }
    const d = dayjs(value)
    return d.isValid() ? d.toISOString() : undefined
}

const formatDateTime = (value?: string) =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'

const formatAmount = (amount?: number) =>
    new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
    }).format(Number(amount || 0))

const defaultStartTime = dayjs().startOf('day').format('YYYY-MM-DDTHH:mm:ss')
const defaultEndTime = dayjs().endOf('day').format('YYYY-MM-DDTHH:mm:ss')

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message
    if (error && typeof error === 'object') {
        const candidate = (error as { message?: unknown }).message
        if (typeof candidate === 'string') return candidate
    }
    return 'Request failed'
}

const renderStatus = (status?: string) => {
    if (!status) return <span>-</span>
    const style = statusColorMap[status] ?? {
        dotClass: 'bg-gray-400',
        textClass: 'text-gray-500',
    }
    return (
        <div className="flex items-center">
            <Badge className={style.dotClass} />
            <span className={`ml-2 font-semibold ${style.textClass}`}>{status}</span>
        </div>
    )
}

const CustomStatusOption = ({
    innerProps,
    label,
    data,
    isSelected,
}: OptionProps<StatusOption>) => (
    <div
        className={`flex items-center justify-between p-2 cursor-pointer ${
            isSelected
                ? 'bg-gray-100 dark:bg-gray-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-600'
        }`}
        {...innerProps}
    >
        <div className="flex items-center gap-2">
            <Badge innerClass={data.color} />
            <span>{label}</span>
        </div>
        {isSelected && <HiCheck className="text-emerald-500 text-xl" />}
    </div>
)

const CustomStatusControl = ({
    children,
    ...props
}: ControlProps<StatusOption>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <Badge
                    className="ltr:ml-4 rtl:mr-4"
                    innerClass={selected.color}
                />
            )}
            {children}
        </Control>
    )
}

type StatisticCardProps = {
    icon: ReactNode
    avatarClass: string
    label: string
    value: string | number
}

const StatisticCard = ({ icon, avatarClass, label, value }: StatisticCardProps) => (
    <Card bordered>
        <div className="flex items-center gap-4">
            <Avatar className={avatarClass} icon={icon} size={48} />
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <h3>{value}</h3>
            </div>
        </div>
    </Card>
)

const ProfitSharing = () => {
    const [filters, setFilters] = useState<Filters>({
        appId: '',
        recipientId: '',
        status: '',
        startTime: defaultStartTime,
        endTime: defaultEndTime,
    })

    const [stats, setStats] = useState<SettlementProfitSharingStatistics>(defaultStats)
    const [records, setRecords] = useState<SettlementProfitSharingRecord[]>([])

    const [loadingStats, setLoadingStats] = useState(false)
    const [loadingRecords, setLoadingRecords] = useState(false)

    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const handleDateRangeChange = (value: [Date | null, Date | null]) => {
        const [start, end] = value
        setFilters((prev) => ({
            ...prev,
            startTime: start ? dayjs(start).startOf('day').format('YYYY-MM-DDTHH:mm:ss') : '',
            endTime: end ? dayjs(end).endOf('day').format('YYYY-MM-DDTHH:mm:ss') : '',
        }))
    }

    const loadStats = useCallback(async () => {
        setLoadingStats(true)
        try {
            const result = await apiGetSettlementProfitSharingStatistics({
                app_id: filters.appId || undefined,
                recipient_id: filters.recipientId || undefined,
                start_time: toRFC3339(filters.startTime),
                end_time: toRFC3339(filters.endTime),
            })
            setStats(result)
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Load failed">
                    {getErrorMessage(error)}
                </Notification>
            )
        } finally {
            setLoadingStats(false)
        }
    }, [filters])

    const loadRecords = useCallback(async () => {
        setLoadingRecords(true)
        try {
            const result = await apiGetSettlementProfitSharingRecords({
                app_id: filters.appId || undefined,
                recipient_id: filters.recipientId || undefined,
                status: (filters.status || undefined) as
                    | 'PENDING'
                    | 'PROCESSING'
                    | 'COMPLETED'
                    | 'FAILED'
                    | 'CANCELLED'
                    | undefined,
                start_time: toRFC3339(filters.startTime),
                end_time: toRFC3339(filters.endTime),
                page: pageIndex,
                page_size: pageSize,
            })
            setRecords(result.list)
            setTotal(result.total)
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Load failed">
                    {getErrorMessage(error)}
                </Notification>
            )
        } finally {
            setLoadingRecords(false)
        }
    }, [filters, pageIndex, pageSize])

    useEffect(() => {
        loadStats()
    }, [loadStats])

    useEffect(() => {
        loadRecords()
    }, [loadRecords])

    const onSearch = async () => {
        setPageIndex(1)
        await Promise.all([loadStats(), loadRecords()])
    }

    const onStatusFilterChange = (selected: SingleValue<StatusOption>) => {
        setFilters((prev) => ({
            ...prev,
            status: selected?.value || '',
        }))
    }

    const columns: ColumnDef<SettlementProfitSharingRecord>[] = useMemo(
        () => [
            {
                header: 'ID',
                accessorKey: 'id',
                cell: (props) => (
                    <span className="font-semibold">{props.row.original.id}</span>
                ),
            },
            {
                header: 'App ID',
                accessorKey: 'app_id',
            },
            {
                header: 'Recipient',
                accessorKey: 'recipient_id',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div>
                            <div className="font-semibold">{row.recipient_id}</div>
                            <div className="text-xs text-gray-500">{row.recipient_type}</div>
                        </div>
                    )
                },
            },
            {
                header: 'Amount',
                accessorKey: 'amount',
                cell: (props) => formatAmount(props.row.original.amount),
            },
            {
                header: 'Rate %',
                accessorKey: 'percentage',
                cell: (props) => `${props.row.original.percentage ?? 0}`,
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => renderStatus(props.row.original.status),
            },
            {
                header: 'Created At',
                accessorKey: 'created_at',
                cell: (props) => formatDateTime(props.row.original.created_at),
            },
            {
                header: 'Completed At',
                accessorKey: 'completed_at',
                cell: (props) => formatDateTime(props.row.original.completed_at),
            },
        ],
        []
    )

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="flex flex-col gap-4">
                <div className="lg:flex items-center justify-between mb-4 gap-3">
                    <div>
                        <h3>Profit Sharing</h3>
                        <p className="text-sm text-gray-500">Settlement profit-sharing records and statistics</p>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        <DatePickerRange
                            dropdownPlacement="bottom-end"
                            value={[
                                filters.startTime ? dayjs(filters.startTime).toDate() : null,
                                filters.endTime ? dayjs(filters.endTime).toDate() : null,
                            ]}
                            inputFormat={dateFormat}
                            size="sm"
                            onChange={handleDateRangeChange}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                    <StatisticCard
                        icon={<HiOutlineChartBar />}
                        avatarClass="!bg-indigo-600"
                        label="Total Records"
                        value={stats.total_records}
                    />
                    <StatisticCard
                        icon={<HiOutlineCurrencyDollar />}
                        avatarClass="!bg-blue-500"
                        label="Total Amount"
                        value={formatAmount(stats.total_amount)}
                    />
                    <StatisticCard
                        icon={<HiOutlineCheckCircle />}
                        avatarClass="!bg-emerald-500"
                        label="Completed Amount"
                        value={formatAmount(stats.completed_amount)}
                    />
                    <StatisticCard
                        icon={<HiOutlineClock />}
                        avatarClass="!bg-amber-500"
                        label="Pending Amount"
                        value={formatAmount(stats.pending_amount)}
                    />
                    <StatisticCard
                        icon={<HiOutlineExclamationCircle />}
                        avatarClass="!bg-red-500"
                        label="Failed Amount"
                        value={formatAmount(stats.failed_amount)}
                    />
                </div>

                <Card>
                    <div className="mb-4 md:flex items-center justify-between">
                        <div className="md:flex items-center gap-3">
                            <Input
                                className="mb-4"
                                placeholder="App ID"
                                value={filters.appId}
                                onChange={(event) =>
                                    setFilters((prev) => ({ ...prev, appId: event.target.value }))
                                }
                            />
                            <Input
                                className="mb-4"
                                placeholder="Recipient ID"
                                value={filters.recipientId}
                                onChange={(event) =>
                                    setFilters((prev) => ({ ...prev, recipientId: event.target.value }))
                                }
                            />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="min-w-[140px]">
                                <Select<StatusOption>
                                    options={statusOptions}
                                    size="sm"
                                    components={{
                                        Option: CustomStatusOption,
                                        Control: CustomStatusControl,
                                    }}
                                    value={statusOptions.filter((option) => option.value === filters.status)}
                                    onChange={onStatusFilterChange}
                                />
                            </div>
                            <Button
                                size="sm"
                                variant="solid"
                                loading={loadingStats || loadingRecords}
                                onClick={onSearch}
                            >
                                Search
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    setFilters({
                                        appId: '',
                                        recipientId: '',
                                        status: '',
                                        startTime: defaultStartTime,
                                        endTime: defaultEndTime,
                                    })
                                    setPageIndex(1)
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={records}
                        loading={loadingRecords || loadingStats}
                        pagingData={{
                            total,
                            pageIndex,
                            pageSize,
                        }}
                        onPaginationChange={(page) => setPageIndex(page)}
                        onSelectChange={(size) => {
                            setPageSize(Number(size))
                            setPageIndex(1)
                        }}
                    />
                </Card>
            </div>
        </AdaptableCard>
    )
}

export default ProfitSharing
