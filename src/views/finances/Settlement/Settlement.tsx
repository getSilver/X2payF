import { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import AdaptableCard from '@/components/shared/AdaptableCard'
import DataTable from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import DatePicker from '@/components/ui/DatePicker'
import Input from '@/components/ui/Input'
import Tabs from '@/components/ui/Tabs'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    apiGetReconciliationStatus,
    apiListReconciliationTasks,
    apiReconcileBalance,
    apiReconcileJournals,
    apiStartReconciliation,
    type ReconciliationTaskListItem,
    type SettlementRequestPayload,
} from '@/services/FinanceService'
import createUID from '@/components/ui/utils/createUid'
import type { ColumnDef } from '@/components/shared/DataTable'

type LogStatus = 'SUCCESS' | 'FAILED'
type TaskType = 'FULL' | 'BALANCE' | 'JOURNAL'

type LogRow = {
    id: string
    action: string
    status: LogStatus
    message: string
    timestamp: number
}

type ManualTaskRow = {
    task_id: string
    app_id: string
    type: string
    status: string
    progress: number
    message: string
    start_time?: string
    end_time?: string
    updated_at?: string
    completed_at?: string
}

type StartForm = {
    app_id: string
    type: TaskType
    requested_by: string
    start_time: string
    end_time: string
    description: string
}

type TaskActionForm = {
    task_id: string
}

const dateFormat = 'MMM DD, YYYY'
const { DatePickerRange } = DatePicker
const { TabNav, TabList, TabContent } = Tabs

const statusColor: Record<LogStatus, { dotClass: string; textClass: string; label: string }> = {
    SUCCESS: { dotClass: 'bg-emerald-500', textClass: 'text-emerald-500', label: 'Success' },
    FAILED: { dotClass: 'bg-red-500', textClass: 'text-red-500', label: 'Failed' },
}

const taskStatusColorMap: Record<string, { dotClass: string; textClass: string }> = {
    PENDING: { dotClass: 'bg-amber-500', textClass: 'text-amber-500' },
    RUNNING: { dotClass: 'bg-blue-500', textClass: 'text-blue-500' },
    COMPLETED: { dotClass: 'bg-emerald-500', textClass: 'text-emerald-500' },
    FAILED: { dotClass: 'bg-red-500', textClass: 'text-red-500' },
    CANCELLED: { dotClass: 'bg-gray-500', textClass: 'text-gray-500' },
}

const asRecord = (value: unknown): Record<string, unknown> =>
    (value && typeof value === 'object' ? value : {}) as Record<string, unknown>

const unwrapData = (payload: unknown) => {
    const source = asRecord(payload)
    const data = source.data
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : source
}

const findString = (obj: unknown, keys: string[]) => {
    const source = unwrapData(obj)
    for (const key of keys) {
        const direct = source[key]
        if (typeof direct === 'string' && direct) return direct
    }
    return ''
}

const findNumber = (obj: unknown, keys: string[]) => {
    const source = unwrapData(obj)
    for (const key of keys) {
        const value = source[key]
        if (typeof value === 'number' && Number.isFinite(value)) return value
    }
    return 0
}

const toRFC3339 = (value: string | undefined) => {
    if (!value) return undefined
    const parsed = dayjs(value)
    return parsed.isValid() ? parsed.toISOString() : undefined
}

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message
    if (typeof error === 'object' && error && 'message' in error) {
        const message = (error as { message?: unknown }).message
        if (typeof message === 'string') return message
    }
    return 'Request failed'
}

const formatDateTime = (value?: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-')

const renderTaskStatus = (status?: string) => {
    if (!status) return <span>-</span>
    const style = taskStatusColorMap[status] ?? {
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

const Settlement = () => {
    const [startForm, setStartForm] = useState<StartForm>({
        app_id: '',
        type: 'FULL',
        requested_by: 'finance-admin',
        start_time: '',
        end_time: '',
        description: '',
    })
    const [taskActionForm, setTaskActionForm] = useState<TaskActionForm>({ task_id: '' })

    const [manualTasks, setManualTasks] = useState<ManualTaskRow[]>([])
    const [autoTasks, setAutoTasks] = useState<ReconciliationTaskListItem[]>([])
    const [logs, setLogs] = useState<LogRow[]>([])

    const [taskRefreshing, setTaskRefreshing] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState<Record<string, boolean>>({
        start: false,
        status: false,
        balance: false,
        journals: false,
        autoList: false,
    })

    const [autoTaskPageIndex, setAutoTaskPageIndex] = useState(1)
    const [autoTaskPageSize, setAutoTaskPageSize] = useState(10)
    const [autoTaskTotal, setAutoTaskTotal] = useState(0)

    const [manualTaskPageIndex, setManualTaskPageIndex] = useState(1)
    const [manualTaskPageSize, setManualTaskPageSize] = useState(10)

    const [logPageIndex, setLogPageIndex] = useState(1)
    const [logPageSize, setLogPageSize] = useState(10)

    const appendLog = (action: string, status: LogStatus, message: string) => {
        setLogs((prev) => [
            { id: `${Date.now()}-${createUID(8)}`, action, status, message, timestamp: Date.now() },
            ...prev,
        ])
    }

    const upsertManualTask = (nextTask: ManualTaskRow) => {
        if (!nextTask.task_id) return
        setManualTasks((prev) => {
            const idx = prev.findIndex((item) => item.task_id === nextTask.task_id)
            if (idx === -1) return [nextTask, ...prev]
            const current = prev[idx]
            const merged = {
                ...current,
                ...nextTask,
                app_id: nextTask.app_id || current.app_id,
                type: nextTask.type || current.type,
            }
            const next = [...prev]
            next[idx] = merged
            return next
        })
    }

    const mapResponseToManualTask = (response: unknown, fallbackTaskId = ''): ManualTaskRow => ({
        task_id: findString(response, ['task_id', 'id']) || fallbackTaskId,
        app_id: findString(response, ['app_id']),
        type: findString(response, ['type']),
        status: findString(response, ['status']) || 'PENDING',
        progress: findNumber(response, ['progress']),
        message: findString(response, ['message', 'summary']),
        start_time: findString(response, ['started_at', 'start_time']),
        end_time: findString(response, ['end_time']),
        updated_at: findString(response, ['updated_at', 'created_at']) || dayjs().toISOString(),
        completed_at: findString(response, ['completed_at']),
    })

    const setDefaultTaskId = (taskId: string) => {
        if (!taskId) return
        setTaskActionForm((prev) => ({ ...prev, task_id: taskId }))
    }

    const handleDateRangeChange = (value: [Date | null, Date | null]) => {
        const [start, end] = value
        setStartForm((prev) => ({
            ...prev,
            start_time: start ? dayjs(start).startOf('day').format('YYYY-MM-DDTHH:mm:ss') : '',
            end_time: end ? dayjs(end).endOf('day').format('YYYY-MM-DDTHH:mm:ss') : '',
        }))
    }

    const loadAutoTasks = useCallback(async () => {
        setLoading((prev) => ({ ...prev, autoList: true }))
        try {
            const result = await apiListReconciliationTasks({
                source: 'AUTO',
                page: autoTaskPageIndex,
                page_size: autoTaskPageSize,
            })
            setAutoTasks(result.list)
            setAutoTaskTotal(result.total)
        } catch (error) {
            toast.push(
                <Notification title="加载自动任务失败" type="danger">
                    {getErrorMessage(error)}
                </Notification>
            )
        } finally {
            setLoading((prev) => ({ ...prev, autoList: false }))
        }
    }, [autoTaskPageIndex, autoTaskPageSize])

    useEffect(() => {
        loadAutoTasks()
    }, [loadAutoTasks])

    const runTaskAction = async (
        actionKey: 'status' | 'balance' | 'journals',
        actionTitle: string,
        request: (payload: SettlementRequestPayload) => Promise<unknown>,
        taskId: string
    ) => {
        if (!taskId) {
            toast.push(
                <Notification title="参数不完整" type="danger">
                    Task ID is required
                </Notification>
            )
            return
        }

        setLoading((prev) => ({ ...prev, [actionKey]: true }))
        try {
            const response = await request({ task_id: taskId })
            upsertManualTask(mapResponseToManualTask(response, taskId))
            appendLog(actionTitle, 'SUCCESS', 'Request completed')
            toast.push(
                <Notification title="执行成功" type="success">
                    {actionTitle} completed
                </Notification>
            )
        } catch (error) {
            const message = getErrorMessage(error)
            appendLog(actionTitle, 'FAILED', message)
            toast.push(
                <Notification title="执行失败" type="danger">
                    {actionTitle}: {message}
                </Notification>
            )
        } finally {
            setLoading((prev) => ({ ...prev, [actionKey]: false }))
        }
    }

    const handleStart = async () => {
        if (!startForm.app_id || !startForm.requested_by) {
            toast.push(
                <Notification title="参数不完整" type="danger">
                    App ID and Requested By are required
                </Notification>
            )
            return
        }

        const payload: SettlementRequestPayload = {
            app_id: startForm.app_id,
            type: startForm.type,
            requested_by: startForm.requested_by,
            description: startForm.description || undefined,
            start_time: toRFC3339(startForm.start_time),
            end_time: toRFC3339(startForm.end_time),
        }

        setLoading((prev) => ({ ...prev, start: true }))
        try {
            const response = await apiStartReconciliation(payload)
            const task = mapResponseToManualTask(response)
            upsertManualTask(task)
            setDefaultTaskId(task.task_id)
            appendLog('Start Reconciliation', 'SUCCESS', 'Task created')
            toast.push(
                <Notification title="任务已创建" type="success">
                    {task.task_id || 'Task created successfully'}
                </Notification>
            )
        } catch (error) {
            const message = getErrorMessage(error)
            appendLog('Start Reconciliation', 'FAILED', message)
            toast.push(
                <Notification title="创建失败" type="danger">
                    {message}
                </Notification>
            )
        } finally {
            setLoading((prev) => ({ ...prev, start: false }))
        }
    }

    const refreshManualTaskStatus = async (taskId: string) => {
        if (!taskId) return
        setTaskRefreshing((prev) => ({ ...prev, [taskId]: true }))
        try {
            const response = await apiGetReconciliationStatus({ task_id: taskId })
            upsertManualTask(mapResponseToManualTask(response, taskId))
        } catch (error) {
            toast.push(
                <Notification title="刷新失败" type="danger">
                    {getErrorMessage(error)}
                </Notification>
            )
        } finally {
            setTaskRefreshing((prev) => ({ ...prev, [taskId]: false }))
        }
    }

    const autoTaskColumns: ColumnDef<ReconciliationTaskListItem>[] = [
        {
            header: 'Task ID',
            accessorKey: 'task_id',
            cell: (props) => <span className="font-semibold">{props.row.original.task_id}</span>,
        },
        { header: 'App ID', accessorKey: 'app_id' },
        { header: 'Type', accessorKey: 'type' },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (props) => renderTaskStatus(props.row.original.status),
        },
        {
            header: 'Discrepancies',
            accessorKey: 'discrepancy_count',
            cell: (props) => {
                const value = Number(props.row.original.discrepancy_count || 0)
                return (
                    <span className={value > 0 ? 'font-semibold text-red-500' : ''}>
                        {value}
                    </span>
                )
            },
        },
        {
            header: 'Message',
            accessorKey: 'message',
            cell: (props) => props.row.original.message || '-',
        },
        {
            header: 'Completed At',
            accessorKey: 'completed_at',
            cell: (props) => formatDateTime(props.row.original.completed_at),
        },
        {
            header: 'Action',
            id: 'auto_action',
            cell: (props) => (
                <Button
                    size="xs"
                    onClick={() => setDefaultTaskId(props.row.original.task_id)}
                >
                    Use Task ID
                </Button>
            ),
        },
    ]

    const manualTaskColumns: ColumnDef<ManualTaskRow>[] = [
        {
            header: 'Task ID',
            accessorKey: 'task_id',
            cell: (props) => <span className="font-semibold">{props.row.original.task_id || '-'}</span>,
        },
        { header: 'App ID', accessorKey: 'app_id' },
        { header: 'Type', accessorKey: 'type' },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (props) => renderTaskStatus(props.row.original.status),
        },
        {
            header: 'Progress',
            accessorKey: 'progress',
            cell: (props) => `${props.row.original.progress ?? 0}%`,
        },
        {
            header: 'Message',
            accessorKey: 'message',
            cell: (props) => props.row.original.message || '-',
        },
        {
            header: 'Updated At',
            accessorKey: 'updated_at',
            cell: (props) => formatDateTime(props.row.original.updated_at),
        },
        {
            header: 'Action',
            id: 'manual_action',
            cell: (props) => {
                const taskId = props.row.original.task_id
                return (
                    <div className="flex gap-2">
                        <Button
                            loading={Boolean(taskRefreshing[taskId])}
                            size="xs"
                            onClick={() => {
                                setDefaultTaskId(taskId)
                                refreshManualTaskStatus(taskId)
                            }}
                        >
                            Status
                        </Button>
                        <Button
                            loading={Boolean(loading.balance)}
                            size="xs"
                            onClick={() => {
                                setDefaultTaskId(taskId)
                                runTaskAction('balance', 'Reconcile Balance', apiReconcileBalance, taskId)
                            }}
                        >
                            Balance
                        </Button>
                        <Button
                            loading={Boolean(loading.journals)}
                            size="xs"
                            onClick={() => {
                                setDefaultTaskId(taskId)
                                runTaskAction('journals', 'Reconcile Journals', apiReconcileJournals, taskId)
                            }}
                        >
                            Journals
                        </Button>
                    </div>
                )
            },
        },
    ]

    const logColumns: ColumnDef<LogRow>[] = useMemo(
        () => [
            { header: 'Action', accessorKey: 'action' },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const value = props.row.original.status
                    return (
                        <div className="flex items-center">
                            <Badge className={statusColor[value].dotClass} />
                            <span className={`ml-2 font-semibold ${statusColor[value].textClass}`}>
                                {statusColor[value].label}
                            </span>
                        </div>
                    )
                },
            },
            { header: 'Message', accessorKey: 'message' },
            {
                header: 'Time',
                accessorKey: 'timestamp',
                cell: (props) => dayjs(props.row.original.timestamp).format('YYYY-MM-DD HH:mm:ss'),
            },
        ],
        []
    )

    return (
        <AdaptableCard bodyClass="h-full" className="h-full">
            <div className="mb-4">
                <h3 className="mb-1">Settlement Reconciliation</h3>
                <p className="text-sm text-gray-500">生产运营页：自动任务看板 + 手动补跑与排障。</p>
            </div>

            <Tabs defaultValue="operations">
                <TabList>
                    <TabNav value="operations">Operations</TabNav>
                    <TabNav value="inspect">Inspect</TabNav>
                </TabList>

                <div className="mt-4 space-y-6">
                    <TabContent value="operations">
                        <Card>
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h5>Auto Reconciliation Tasks</h5>
                                    <span className="text-xs text-gray-500">自动对账任务列表 / 状态 / 差异数</span>
                                </div>
                                <Button
                                    loading={Boolean(loading.autoList)}
                                    size="sm"
                                    onClick={loadAutoTasks}
                                >
                                    Refresh
                                </Button>
                            </div>
                            <DataTable
                                columns={autoTaskColumns}
                                data={autoTasks}
                                loading={Boolean(loading.autoList)}
                                pagingData={{
                                    total: autoTaskTotal,
                                    pageIndex: autoTaskPageIndex,
                                    pageSize: autoTaskPageSize,
                                }}
                                onPaginationChange={setAutoTaskPageIndex}
                                onSelectChange={(value) => {
                                    setAutoTaskPageSize(Number(value))
                                    setAutoTaskPageIndex(1)
                                }}
                            />
                        </Card>
                    </TabContent>

                    <TabContent value="inspect">
                        <Card className="mb-6">
                            <h5 className="mb-4">Start Reconciliation Task</h5>
                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                                <div>
                                    <div className="mb-1 text-sm text-gray-600">App ID</div>
                                    <Input
                                        value={startForm.app_id}
                                        onChange={(e) => setStartForm((prev) => ({ ...prev, app_id: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <div className="mb-1 text-sm text-gray-600">Requested By</div>
                                    <Input
                                        value={startForm.requested_by}
                                        onChange={(e) =>
                                            setStartForm((prev) => ({ ...prev, requested_by: e.target.value }))
                                        }
                                    />
                                </div>
                                <div>
                                    <div className="mb-1 text-sm text-gray-600">Type</div>
                                    <div className="flex gap-2">
                                        {(['FULL', 'BALANCE', 'JOURNAL'] as TaskType[]).map((type) => (
                                            <Button
                                                key={type}
                                                size="sm"
                                                variant={startForm.type === type ? 'solid' : 'default'}
                                                onClick={() => setStartForm((prev) => ({ ...prev, type }))}
                                            >
                                                {type}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="xl:col-span-2">
                                    <div className="mb-1 text-sm text-gray-600">Date Range</div>
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                                        <DatePickerRange
                                            inputFormat={dateFormat}
                                            size="sm"
                                            value={[
                                                startForm.start_time ? dayjs(startForm.start_time).toDate() : null,
                                                startForm.end_time ? dayjs(startForm.end_time).toDate() : null,
                                            ]}
                                            onChange={handleDateRangeChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-1 text-sm text-gray-600">Description</div>
                                    <Input
                                        value={startForm.description}
                                        onChange={(e) =>
                                            setStartForm((prev) => ({ ...prev, description: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="mt-4 text-right">
                                <Button loading={Boolean(loading.start)} variant="solid" onClick={handleStart}>
                                    Start Task
                                </Button>
                            </div>
                        </Card>

                        <Card className="mb-6">
                            <div className="mb-3 flex items-center justify-between">
                                <h5>Manual Reconciliation Tasks</h5>
                                <span className="text-xs text-gray-500">手动触发/查询过的任务</span>
                            </div>
                            <DataTable
                                columns={manualTaskColumns}
                                data={manualTasks}
                                pagingData={{
                                    total: manualTasks.length,
                                    pageIndex: manualTaskPageIndex,
                                    pageSize: manualTaskPageSize,
                                }}
                                onPaginationChange={setManualTaskPageIndex}
                                onSelectChange={(value) => {
                                    setManualTaskPageSize(Number(value))
                                    setManualTaskPageIndex(1)
                                }}
                            />
                        </Card>

                        <Card className="mb-6">
                            <h5 className="mb-4">Task Operation</h5>
                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                                <div className="xl:col-span-2">
                                    <div className="mb-1 text-sm text-gray-600">Task ID</div>
                                    <Input
                                        value={taskActionForm.task_id}
                                        onChange={(e) => setTaskActionForm({ task_id: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button
                                        loading={Boolean(loading.status)}
                                        onClick={() =>
                                            runTaskAction(
                                                'status',
                                                'Get Reconciliation Status',
                                                apiGetReconciliationStatus,
                                                taskActionForm.task_id
                                            )
                                        }
                                    >
                                        Status
                                    </Button>
                                    <Button
                                        loading={Boolean(loading.balance)}
                                        onClick={() =>
                                            runTaskAction(
                                                'balance',
                                                'Reconcile Balance',
                                                apiReconcileBalance,
                                                taskActionForm.task_id
                                            )
                                        }
                                    >
                                        Balance
                                    </Button>
                                    <Button
                                        loading={Boolean(loading.journals)}
                                        onClick={() =>
                                            runTaskAction(
                                                'journals',
                                                'Reconcile Journals',
                                                apiReconcileJournals,
                                                taskActionForm.task_id
                                            )
                                        }
                                    >
                                        Journals
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="mb-3 flex items-center justify-between">
                                <h5>Operation Logs</h5>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setLogs([])
                                    }}
                                >
                                    Clear Logs
                                </Button>
                            </div>
                            <DataTable
                                columns={logColumns}
                                data={logs}
                                pagingData={{ total: logs.length, pageIndex: logPageIndex, pageSize: logPageSize }}
                                onPaginationChange={setLogPageIndex}
                                onSelectChange={(value) => {
                                    setLogPageSize(Number(value))
                                    setLogPageIndex(1)
                                }}
                            />
                        </Card>
                    </TabContent>
                </div>
            </Tabs>
        </AdaptableCard>
    )
}

export default Settlement
