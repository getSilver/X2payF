import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import AdaptableCard from '@/components/shared/AdaptableCard'
import DataTable from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Dialog from '@/components/ui/Dialog'
import Badge from '@/components/ui/Badge'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    apiGetProfitSharingStatistics,
    apiGetProfitSharingSchedules,
    apiGetProfitSharingScheduleDetail,
    apiCreateProfitSharingSchedule,
    apiUpdateProfitSharingSchedule,
    apiUpdateProfitSharingRules,
    apiDeleteProfitSharingSchedule,
    apiEnableProfitSharingSchedule,
    apiDisableProfitSharingSchedule,
    apiPauseProfitSharingSchedule,
    apiResumeProfitSharingSchedule,
    apiTriggerProfitSharingSchedule,
    apiGetProfitSharingTasks,
    apiGetProfitSharingTaskDetail,
    apiGetProfitSharingTaskRecords,
    apiGetProfitSharingRecords,
    apiExportProfitSharingReport,
    type ProfitSharingStatistics,
    type ProfitSharingSchedule,
    type ProfitSharingTask,
    type ProfitSharingRecord,
    type ProfitSharingSchedulePayload,
} from '@/services/FinanceService'
import type { ColumnDef } from '@/components/shared/DataTable'

type ScheduleFormState = {
    name: string
    description: string
    currency: string
    rules: string
}

type ScheduleAction =
    | 'enable'
    | 'disable'
    | 'pause'
    | 'resume'
    | 'trigger'
    | 'delete'

const statusColorMap: Record<
    string,
    {
        dotClass: string
        textClass: string
    }
> = {
    ENABLED: { dotClass: 'bg-emerald-500', textClass: 'text-emerald-500' },
    DISABLED: { dotClass: 'bg-gray-500', textClass: 'text-gray-500' },
    PAUSED: { dotClass: 'bg-amber-500', textClass: 'text-amber-500' },
    RUNNING: { dotClass: 'bg-blue-500', textClass: 'text-blue-500' },
    PENDING: { dotClass: 'bg-amber-500', textClass: 'text-amber-500' },
    SUCCESS: { dotClass: 'bg-emerald-500', textClass: 'text-emerald-500' },
    FAILED: { dotClass: 'bg-red-500', textClass: 'text-red-500' },
    CANCELLED: { dotClass: 'bg-gray-500', textClass: 'text-gray-500' },
}

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message
    if (error && typeof error === 'object') {
        const candidate = (error as { message?: unknown }).message
        if (typeof candidate === 'string') return candidate
    }
    return 'Request failed'
}

const safeAmount = (amount?: number) =>
    Number.isFinite(amount) ? Number(amount) : 0

const formatAmount = (amount?: number) =>
    new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(safeAmount(amount))

const formatDateTime = (value?: string) =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'

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

const defaultStats: ProfitSharingStatistics = {
    total_amount: 0,
    total_records: 0,
    success_amount: 0,
    pending_amount: 0,
    active_schedules: 0,
    pending_tasks: 0,
}

const defaultForm: ScheduleFormState = {
    name: '',
    description: '',
    currency: 'USD',
    rules: '',
}

const ProfitSharing = () => {
    const [statistics, setStatistics] = useState<ProfitSharingStatistics>(defaultStats)
    const [loadingStats, setLoadingStats] = useState(false)

    const [schedules, setSchedules] = useState<ProfitSharingSchedule[]>([])
    const [scheduleTotal, setScheduleTotal] = useState(0)
    const [schedulePage, setSchedulePage] = useState(1)
    const [schedulePageSize, setSchedulePageSize] = useState(10)
    const [scheduleKeyword, setScheduleKeyword] = useState('')
    const [loadingSchedules, setLoadingSchedules] = useState(false)

    const [tasks, setTasks] = useState<ProfitSharingTask[]>([])
    const [taskTotal, setTaskTotal] = useState(0)
    const [taskPage, setTaskPage] = useState(1)
    const [taskPageSize, setTaskPageSize] = useState(10)
    const [loadingTasks, setLoadingTasks] = useState(false)
    const [selectedTask, setSelectedTask] = useState<ProfitSharingTask | null>(null)
    const [loadingTaskRecords, setLoadingTaskRecords] = useState(false)
    const [taskRecords, setTaskRecords] = useState<ProfitSharingRecord[]>([])
    const [taskRecordsTotal, setTaskRecordsTotal] = useState(0)
    const [taskRecordsPage, setTaskRecordsPage] = useState(1)
    const [taskRecordsPageSize, setTaskRecordsPageSize] = useState(10)

    const [records, setRecords] = useState<ProfitSharingRecord[]>([])
    const [recordTotal, setRecordTotal] = useState(0)
    const [recordPage, setRecordPage] = useState(1)
    const [recordPageSize, setRecordPageSize] = useState(10)
    const [recordTaskIdFilter, setRecordTaskIdFilter] = useState('')
    const [loadingRecords, setLoadingRecords] = useState(false)
    const [exporting, setExporting] = useState(false)

    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
    const [scheduleSubmitting, setScheduleSubmitting] = useState(false)
    const [editingSchedule, setEditingSchedule] = useState<ProfitSharingSchedule | null>(
        null
    )
    const [form, setForm] = useState<ScheduleFormState>(defaultForm)

    const loadStatistics = async () => {
        setLoadingStats(true)
        try {
            const result = await apiGetProfitSharingStatistics()
            setStatistics({
                ...defaultStats,
                ...result,
            })
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Load failed">
                    {getErrorMessage(error)}
                </Notification>
            )
        } finally {
            setLoadingStats(false)
        }
    }

    const loadSchedules = async () => {
        setLoadingSchedules(true)
        try {
            const result = await apiGetProfitSharingSchedules({
                page: schedulePage,
                page_size: schedulePageSize,
                keyword: scheduleKeyword || undefined,
            })
            setSchedules(result.list)
            setScheduleTotal(result.total)
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Load schedules failed">
                    {getErrorMessage(error)}
                </Notification>
            )
        } finally {
            setLoadingSchedules(false)
        }
    }

    const loadTasks = async () => {
        setLoadingTasks(true)
        try {
            const result = await apiGetProfitSharingTasks({
                page: taskPage,
                page_size: taskPageSize,
            })
            setTasks(result.list)
            setTaskTotal(result.total)
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Load tasks failed">
                    {getErrorMessage(error)}
                </Notification>
            )
        } finally {
            setLoadingTasks(false)
        }
    }

    const loadRecords = async () => {
        setLoadingRecords(true)
        try {
            const result = await apiGetProfitSharingRecords({
                page: recordPage,
                page_size: recordPageSize,
                task_id: recordTaskIdFilter || undefined,
            })
            setRecords(result.list)
            setRecordTotal(result.total)
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Load records failed">
                    {getErrorMessage(error)}
                </Notification>
            )
        } finally {
            setLoadingRecords(false)
        }
    }

    const loadTaskRecords = async (taskId: string) => {
        setLoadingTaskRecords(true)
        try {
            const [detail, recordsResult] = await Promise.all([
                apiGetProfitSharingTaskDetail(taskId),
                apiGetProfitSharingTaskRecords(taskId, {
                    page: taskRecordsPage,
                    page_size: taskRecordsPageSize,
                }),
            ])
            setSelectedTask(detail)
            setTaskRecords(recordsResult.list)
            setTaskRecordsTotal(recordsResult.total)
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Load task detail failed">
                    {getErrorMessage(error)}
                </Notification>
            )
        } finally {
            setLoadingTaskRecords(false)
        }
    }

    useEffect(() => {
        loadStatistics()
    }, [])

    useEffect(() => {
        loadSchedules()
    }, [schedulePage, schedulePageSize])

    useEffect(() => {
        loadTasks()
    }, [taskPage, taskPageSize])

    useEffect(() => {
        loadRecords()
    }, [recordPage, recordPageSize])

    useEffect(() => {
        if (!selectedTask?.id) return
        loadTaskRecords(selectedTask.id)
    }, [taskRecordsPage, taskRecordsPageSize])

    const refreshAll = async () => {
        await Promise.all([loadStatistics(), loadSchedules(), loadTasks(), loadRecords()])
    }

    const openCreateScheduleDialog = () => {
        setEditingSchedule(null)
        setForm(defaultForm)
        setScheduleDialogOpen(true)
    }

    const openEditScheduleDialog = async (id: string) => {
        setScheduleSubmitting(true)
        try {
            const detail = await apiGetProfitSharingScheduleDetail(id)
            setEditingSchedule(detail)
            setForm({
                name: detail.name ?? '',
                description: detail.description ?? '',
                currency: detail.currency ?? 'USD',
                rules: detail.rules ?? '',
            })
            setScheduleDialogOpen(true)
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Load schedule detail failed">
                    {getErrorMessage(error)}
                </Notification>
            )
        } finally {
            setScheduleSubmitting(false)
        }
    }

    const submitSchedule = async () => {
        if (!form.name.trim()) {
            toast.push(
                <Notification type="warning" title="Validation">
                    Schedule name is required
                </Notification>
            )
            return
        }
        setScheduleSubmitting(true)
        const payload: ProfitSharingSchedulePayload = {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            currency: form.currency.trim() || undefined,
            rules: form.rules.trim() || undefined,
        }
        try {
            if (editingSchedule?.id) {
                await apiUpdateProfitSharingSchedule(editingSchedule.id, payload)
                if (typeof payload.rules === 'string') {
                    await apiUpdateProfitSharingRules(editingSchedule.id, payload.rules)
                }
            } else {
                await apiCreateProfitSharingSchedule(payload)
            }
            setScheduleDialogOpen(false)
            await Promise.all([loadSchedules(), loadStatistics()])
            toast.push(
                <Notification type="success" title="Saved">
                    Schedule saved successfully
                </Notification>
            )
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Save failed">
                    {getErrorMessage(error)}
                </Notification>
            )
        } finally {
            setScheduleSubmitting(false)
        }
    }

    const handleScheduleAction = async (row: ProfitSharingSchedule, action: ScheduleAction) => {
        setScheduleSubmitting(true)
        try {
            if (action === 'enable') await apiEnableProfitSharingSchedule(row.id)
            if (action === 'disable') await apiDisableProfitSharingSchedule(row.id)
            if (action === 'pause') await apiPauseProfitSharingSchedule(row.id)
            if (action === 'resume') await apiResumeProfitSharingSchedule(row.id)
            if (action === 'trigger') await apiTriggerProfitSharingSchedule(row.id)
            if (action === 'delete') await apiDeleteProfitSharingSchedule(row.id)
            await Promise.all([loadSchedules(), loadStatistics(), loadTasks()])
            toast.push(
                <Notification type="success" title="Success">
                    {`${action} action completed`}
                </Notification>
            )
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Action failed">
                    {getErrorMessage(error)}
                </Notification>
            )
        } finally {
            setScheduleSubmitting(false)
        }
    }

    const handleExport = async () => {
        setExporting(true)
        try {
            const blob = await apiExportProfitSharingReport({
                task_id: recordTaskIdFilter || undefined,
            })
            const filename = `profit-sharing-report-${dayjs().format('YYYYMMDD-HHmmss')}.csv`
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = filename
            document.body.appendChild(anchor)
            anchor.click()
            document.body.removeChild(anchor)
            URL.revokeObjectURL(url)
            toast.push(
                <Notification type="success" title="Exported">
                    Report downloaded successfully
                </Notification>
            )
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Export failed">
                    {getErrorMessage(error)}
                </Notification>
            )
        } finally {
            setExporting(false)
        }
    }

    const scheduleColumns: ColumnDef<ProfitSharingSchedule>[] = useMemo(
        () => [
            { header: 'Name', accessorKey: 'name' },
            { header: 'Currency', accessorKey: 'currency' },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => renderStatus(props.row.original.status),
            },
            {
                header: 'Next Execute',
                accessorKey: 'next_execute_at',
                cell: (props) => formatDateTime(props.row.original.next_execute_at),
            },
            {
                header: 'Last Execute',
                accessorKey: 'last_execute_at',
                cell: (props) => formatDateTime(props.row.original.last_execute_at),
            },
            {
                header: 'Operation',
                id: 'schedule_ops',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button size="xs" onClick={() => openEditScheduleDialog(row.id)}>
                                Edit
                            </Button>
                            {row.status === 'ENABLED' && (
                                <Button
                                    size="xs"
                                    onClick={() => handleScheduleAction(row, 'pause')}
                                >
                                    Pause
                                </Button>
                            )}
                            {row.status === 'PAUSED' && (
                                <Button
                                    size="xs"
                                    onClick={() => handleScheduleAction(row, 'resume')}
                                >
                                    Resume
                                </Button>
                            )}
                            {row.status === 'DISABLED' ? (
                                <Button
                                    size="xs"
                                    variant="solid"
                                    onClick={() => handleScheduleAction(row, 'enable')}
                                >
                                    Enable
                                </Button>
                            ) : (
                                <Button
                                    size="xs"
                                    onClick={() => handleScheduleAction(row, 'disable')}
                                >
                                    Disable
                                </Button>
                            )}
                            <Button
                                size="xs"
                                variant="solid"
                                onClick={() => handleScheduleAction(row, 'trigger')}
                            >
                                Trigger
                            </Button>
                            <Button
                                size="xs"
                                color="red-600"
                                onClick={() => handleScheduleAction(row, 'delete')}
                            >
                                Delete
                            </Button>
                        </div>
                    )
                },
            },
        ],
        []
    )

    const taskColumns: ColumnDef<ProfitSharingTask>[] = useMemo(
        () => [
            { header: 'Task ID', accessorKey: 'id' },
            { header: 'Schedule ID', accessorKey: 'schedule_id' },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => renderStatus(props.row.original.status),
            },
            { header: 'Trigger', accessorKey: 'trigger_mode' },
            {
                header: 'Start Time',
                accessorKey: 'started_at',
                cell: (props) => formatDateTime(props.row.original.started_at),
            },
            {
                header: 'Finish Time',
                accessorKey: 'finished_at',
                cell: (props) => formatDateTime(props.row.original.finished_at),
            },
            {
                header: 'Operation',
                id: 'task_ops',
                cell: (props) => (
                    <Button
                        size="xs"
                        onClick={() => {
                            setTaskRecordsPage(1)
                            loadTaskRecords(props.row.original.id)
                        }}
                    >
                        Detail
                    </Button>
                ),
            },
        ],
        []
    )

    const recordColumns: ColumnDef<ProfitSharingRecord>[] = useMemo(
        () => [
            { header: 'Record ID', accessorKey: 'id' },
            { header: 'Task ID', accessorKey: 'task_id' },
            { header: 'Schedule ID', accessorKey: 'schedule_id' },
            {
                header: 'Amount',
                accessorKey: 'amount',
                cell: (props) => formatAmount(props.row.original.amount),
            },
            { header: 'Currency', accessorKey: 'currency' },
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
        ],
        []
    )

    return (
        <AdaptableCard className="h-full" bodyClass="h-full overflow-auto">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="mb-1">Profit Sharing</h3>
                    <p className="text-sm text-gray-500">
                        Statistics, schedules, tasks and records in one page
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" loading={exporting} onClick={handleExport}>
                        Export Report
                    </Button>
                    <Button size="sm" variant="solid" onClick={refreshAll}>
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <h4>{formatAmount(statistics.total_amount)}</h4>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">Total Records</p>
                    <h4>{statistics.total_records}</h4>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">Active Schedules</p>
                    <h4>{statistics.active_schedules}</h4>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">Pending Tasks</p>
                    <h4>{statistics.pending_tasks}</h4>
                </Card>
            </div>

            <Card className="mb-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h5>Schedules</h5>
                    <div className="flex gap-2">
                        <Input
                            value={scheduleKeyword}
                            placeholder="Search by name"
                            onChange={(event) => setScheduleKeyword(event.target.value)}
                        />
                        <Button
                            size="sm"
                            onClick={() => {
                                if (schedulePage !== 1) {
                                    setSchedulePage(1)
                                } else {
                                    loadSchedules()
                                }
                            }}
                        >
                            Search
                        </Button>
                        <Button size="sm" variant="solid" onClick={openCreateScheduleDialog}>
                            New Schedule
                        </Button>
                    </div>
                </div>
                <DataTable
                    columns={scheduleColumns}
                    data={schedules}
                    loading={loadingSchedules || scheduleSubmitting}
                    pagingData={{
                        total: scheduleTotal,
                        pageIndex: schedulePage,
                        pageSize: schedulePageSize,
                    }}
                    onPaginationChange={setSchedulePage}
                    onSelectChange={(value) => {
                        setSchedulePageSize(Number(value))
                        setSchedulePage(1)
                    }}
                />
            </Card>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <Card>
                    <h5 className="mb-4">Tasks</h5>
                    <DataTable
                        columns={taskColumns}
                        data={tasks}
                        loading={loadingTasks}
                        pagingData={{
                            total: taskTotal,
                            pageIndex: taskPage,
                            pageSize: taskPageSize,
                        }}
                        onPaginationChange={setTaskPage}
                        onSelectChange={(value) => {
                            setTaskPageSize(Number(value))
                            setTaskPage(1)
                        }}
                    />
                </Card>

                <Card>
                    <div className="mb-4 flex items-center justify-between">
                        <h5>Selected Task Detail</h5>
                        {selectedTask?.id && (
                            <span className="text-xs text-gray-500">Task: {selectedTask.id}</span>
                        )}
                    </div>
                    {selectedTask ? (
                        <>
                            <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                                <div>
                                    <p className="text-xs text-gray-500">Schedule ID</p>
                                    <p>{selectedTask.schedule_id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    {renderStatus(selectedTask.status)}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Started At</p>
                                    <p>{formatDateTime(selectedTask.started_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Finished At</p>
                                    <p>{formatDateTime(selectedTask.finished_at)}</p>
                                </div>
                            </div>
                            <DataTable
                                columns={recordColumns}
                                data={taskRecords}
                                loading={loadingTaskRecords}
                                pagingData={{
                                    total: taskRecordsTotal,
                                    pageIndex: taskRecordsPage,
                                    pageSize: taskRecordsPageSize,
                                }}
                                onPaginationChange={setTaskRecordsPage}
                                onSelectChange={(value) => {
                                    setTaskRecordsPageSize(Number(value))
                                    setTaskRecordsPage(1)
                                }}
                            />
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">
                            Select a task from the task table to view detail records
                        </p>
                    )}
                </Card>
            </div>

            <Card className="mt-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h5>Profit Sharing Records</h5>
                    <div className="flex gap-2">
                        <Input
                            value={recordTaskIdFilter}
                            placeholder="Filter by task id"
                            onChange={(event) => setRecordTaskIdFilter(event.target.value)}
                        />
                        <Button
                            size="sm"
                            onClick={() => {
                                if (recordPage !== 1) {
                                    setRecordPage(1)
                                } else {
                                    loadRecords()
                                }
                            }}
                        >
                            Search
                        </Button>
                    </div>
                </div>
                <DataTable
                    columns={recordColumns}
                    data={records}
                    loading={loadingRecords || loadingStats}
                    pagingData={{
                        total: recordTotal,
                        pageIndex: recordPage,
                        pageSize: recordPageSize,
                    }}
                    onPaginationChange={setRecordPage}
                    onSelectChange={(value) => {
                        setRecordPageSize(Number(value))
                        setRecordPage(1)
                    }}
                />
            </Card>

            <Dialog
                isOpen={scheduleDialogOpen}
                onClose={() => setScheduleDialogOpen(false)}
                onRequestClose={() => setScheduleDialogOpen(false)}
                width={680}
            >
                <h5 className="mb-4">{editingSchedule ? 'Edit Schedule' : 'New Schedule'}</h5>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <p className="mb-1 text-sm text-gray-500">Name</p>
                        <Input
                            value={form.name}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, name: event.target.value }))
                            }
                        />
                    </div>
                    <div>
                        <p className="mb-1 text-sm text-gray-500">Currency</p>
                        <Input
                            value={form.currency}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, currency: event.target.value }))
                            }
                        />
                    </div>
                    <div>
                        <p className="mb-1 text-sm text-gray-500">Description</p>
                        <Input
                            textArea
                            rows={3}
                            value={form.description}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    description: event.target.value,
                                }))
                            }
                        />
                    </div>
                    <div>
                        <p className="mb-1 text-sm text-gray-500">Rules (JSON or text)</p>
                        <Input
                            textArea
                            rows={6}
                            value={form.rules}
                            onChange={(event) =>
                                setForm((prev) => ({ ...prev, rules: event.target.value }))
                            }
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
                    <Button variant="solid" loading={scheduleSubmitting} onClick={submitSchedule}>
                        Save
                    </Button>
                </div>
            </Dialog>
        </AdaptableCard>
    )
}

export default ProfitSharing
