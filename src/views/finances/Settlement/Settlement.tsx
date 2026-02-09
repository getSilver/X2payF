import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import AdaptableCard from '@/components/shared/AdaptableCard'
import DataTable from '@/components/shared/DataTable'
import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    apiCreateSettlement,
    apiExecuteSettlement,
    apiGetReconciliationStatus,
    apiGetSettlementStatus,
    apiReconcileBalance,
    apiReconcileJournals,
    apiStartReconciliation,
    type SettlementRequestPayload,
} from '@/services/FinanceService'
import type { ColumnDef } from '@/components/shared/DataTable'

type ActionGroup = 'settlement' | 'reconciliation'
type LogStatus = 'SUCCESS' | 'FAILED'
type FieldType = 'text' | 'number' | 'textarea'

type FieldDef = {
    name: string
    label: string
    type?: FieldType
    required?: boolean
    placeholder?: string
}

type ActionDef = {
    key: string
    group: ActionGroup
    title: string
    path: string
    submitText: string
    fields: FieldDef[]
    initialValues: Record<string, string | number>
    request: (payload: SettlementRequestPayload) => Promise<unknown>
}

type LogRow = {
    id: string
    action: string
    status: LogStatus
    message: string
    timestamp: number
}

const ACTIONS: ActionDef[] = [
    {
        key: 'createSettlement',
        group: 'settlement',
        title: 'Create Settlement',
        path: '/api/v1/admin/settlement/create',
        submitText: 'Create',
        fields: [
            { name: 'request_id', label: 'Request ID', required: true },
            { name: 'app_id', label: 'App ID', required: true },
            { name: 'merchant_id', label: 'Merchant ID' },
            { name: 'currency', label: 'Currency', required: true },
            { name: 'amount', label: 'Amount', type: 'number', required: true },
            { name: 'biz_date', label: 'Biz Date (YYYY-MM-DD)' },
            { name: 'note', label: 'Note', type: 'textarea' },
        ],
        initialValues: {
            request_id: '',
            app_id: '',
            merchant_id: '',
            currency: 'USD',
            amount: '',
            biz_date: '',
            note: '',
        },
        request: apiCreateSettlement,
    },
    {
        key: 'executeSettlement',
        group: 'settlement',
        title: 'Execute Settlement',
        path: '/api/v1/admin/settlement/execute',
        submitText: 'Execute',
        fields: [
            { name: 'settlement_id', label: 'Settlement ID', required: true },
            { name: 'operator_note', label: 'Operator Note', type: 'textarea' },
        ],
        initialValues: { settlement_id: '', operator_note: '' },
        request: apiExecuteSettlement,
    },
    {
        key: 'getSettlementStatus',
        group: 'settlement',
        title: 'Get Settlement Status',
        path: '/api/v1/admin/settlement/status',
        submitText: 'Query',
        fields: [
            { name: 'settlement_id', label: 'Settlement ID', required: true },
            { name: 'request_id', label: 'Request ID' },
        ],
        initialValues: { settlement_id: '', request_id: '' },
        request: apiGetSettlementStatus,
    },
    {
        key: 'startReconciliation',
        group: 'reconciliation',
        title: 'Start Reconciliation',
        path: '/api/v1/admin/settlement/reconciliation/start',
        submitText: 'Start',
        fields: [
            { name: 'reconciliation_id', label: 'Reconciliation ID', required: true },
            { name: 'settlement_id', label: 'Settlement ID' },
            { name: 'biz_date', label: 'Biz Date (YYYY-MM-DD)', required: true },
            { name: 'currency', label: 'Currency', required: true },
        ],
        initialValues: {
            reconciliation_id: '',
            settlement_id: '',
            biz_date: '',
            currency: 'USD',
        },
        request: apiStartReconciliation,
    },
    {
        key: 'getReconciliationStatus',
        group: 'reconciliation',
        title: 'Get Reconciliation Status',
        path: '/api/v1/admin/settlement/reconciliation/status',
        submitText: 'Query',
        fields: [
            { name: 'task_id', label: 'Task ID', required: true },
            { name: 'reconciliation_id', label: 'Reconciliation ID' },
        ],
        initialValues: { task_id: '', reconciliation_id: '' },
        request: apiGetReconciliationStatus,
    },
    {
        key: 'reconcileBalance',
        group: 'reconciliation',
        title: 'Reconcile Balance',
        path: '/api/v1/admin/settlement/reconciliation/balance',
        submitText: 'Reconcile',
        fields: [{ name: 'task_id', label: 'Task ID', required: true }],
        initialValues: { task_id: '' },
        request: apiReconcileBalance,
    },
    {
        key: 'reconcileJournals',
        group: 'reconciliation',
        title: 'Reconcile Journals',
        path: '/api/v1/admin/settlement/reconciliation/journals',
        submitText: 'Reconcile',
        fields: [
            { name: 'task_id', label: 'Task ID', required: true },
            { name: 'page', label: 'Page', type: 'number', required: true },
            { name: 'page_size', label: 'Page Size', type: 'number', required: true },
        ],
        initialValues: { task_id: '', page: 1, page_size: 20 },
        request: apiReconcileJournals,
    },
]

const statusColor: Record<LogStatus, { dotClass: string; textClass: string; label: string }> = {
    SUCCESS: { dotClass: 'bg-emerald-500', textClass: 'text-emerald-500', label: 'Success' },
    FAILED: { dotClass: 'bg-red-500', textClass: 'text-red-500', label: 'Failed' },
}

const compactPayload = (values: Record<string, string | number>) => {
    const next: Record<string, string | number> = {}
    Object.entries(values).forEach(([key, value]) => {
        if (value === '' || value === null || typeof value === 'undefined') return
        next[key] = value
    })
    return next
}

const findString = (obj: unknown, keys: string[]) => {
    if (!obj || typeof obj !== 'object') return ''
    const source = obj as Record<string, unknown>
    for (const key of keys) {
        const direct = source[key]
        if (typeof direct === 'string' && direct) return direct
        const data = source.data
        if (data && typeof data === 'object') {
            const nested = (data as Record<string, unknown>)[key]
            if (typeof nested === 'string' && nested) return nested
        }
    }
    return ''
}

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message
    if (typeof error === 'object' && error && 'message' in error) {
        const message = (error as { message?: unknown }).message
        if (typeof message === 'string') return message
    }
    return 'Request failed'
}

const Settlement = () => {
    const [tab, setTab] = useState<ActionGroup>('settlement')
    const [forms, setForms] = useState<Record<string, Record<string, string | number>>>(
        ACTIONS.reduce((acc, action) => ({ ...acc, [action.key]: action.initialValues }), {})
    )
    const [loading, setLoading] = useState<Record<string, boolean>>({})
    const [results, setResults] = useState<Record<string, string>>({})
    const [logs, setLogs] = useState<LogRow[]>([])
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const actionsByGroup = useMemo(
        () => ({
            settlement: ACTIONS.filter((item) => item.group === 'settlement'),
            reconciliation: ACTIONS.filter((item) => item.group === 'reconciliation'),
        }),
        []
    )

    const updateFormValue = (actionKey: string, field: string, value: string | number) => {
        setForms((prev) => ({
            ...prev,
            [actionKey]: {
                ...prev[actionKey],
                [field]: value,
            },
        }))
    }

    const appendLog = (action: string, status: LogStatus, message: string) => {
        setLogs((prev) => [
            { id: `${Date.now()}-${Math.random()}`, action, status, message, timestamp: Date.now() },
            ...prev,
        ])
    }

    const handleSubmit = async (action: ActionDef) => {
        const values = forms[action.key]
        const missingField = action.fields.find((field) => field.required && !values[field.name])
        if (missingField) {
            toast.push(
                <Notification type="danger" title="参数不完整">
                    {missingField.label} is required
                </Notification>
            )
            return
        }

        const payload = compactPayload(values)
        setLoading((prev) => ({ ...prev, [action.key]: true }))
        try {
            const response = await action.request(payload)
            setResults((prev) => ({ ...prev, [action.key]: JSON.stringify(response, null, 2) }))
            appendLog(action.title, 'SUCCESS', 'Request completed')

            if (action.key === 'createSettlement') {
                const settlementId = findString(response, ['settlement_id', 'id'])
                if (settlementId) {
                    updateFormValue('executeSettlement', 'settlement_id', settlementId)
                    updateFormValue('getSettlementStatus', 'settlement_id', settlementId)
                    updateFormValue('startReconciliation', 'settlement_id', settlementId)
                }
            }
            if (action.key === 'startReconciliation') {
                const taskId = findString(response, ['task_id'])
                const reconciliationId = findString(response, ['reconciliation_id'])
                if (taskId) {
                    updateFormValue('getReconciliationStatus', 'task_id', taskId)
                    updateFormValue('reconcileBalance', 'task_id', taskId)
                    updateFormValue('reconcileJournals', 'task_id', taskId)
                }
                if (reconciliationId) {
                    updateFormValue('getReconciliationStatus', 'reconciliation_id', reconciliationId)
                }
            }

            toast.push(
                <Notification type="success" title="执行成功">
                    {action.title} completed
                </Notification>
            )
        } catch (error) {
            const message = getErrorMessage(error)
            setResults((prev) => ({ ...prev, [action.key]: JSON.stringify({ error: message }, null, 2) }))
            appendLog(action.title, 'FAILED', message)
            toast.push(
                <Notification type="danger" title="执行失败">
                    {action.title}: {message}
                </Notification>
            )
        } finally {
            setLoading((prev) => ({ ...prev, [action.key]: false }))
        }
    }

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

    const renderActionCard = (action: ActionDef) => {
        const values = forms[action.key]
        return (
            <Card key={action.key}>
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h6>{action.title}</h6>
                    <span className="text-xs text-gray-500 font-mono">POST {action.path}</span>
                </div>
                <div className="space-y-3">
                    {action.fields.map((field) => (
                        <div key={field.name}>
                            <div className="mb-1 text-sm text-gray-600">{field.label}</div>
                            <Input
                                textArea={field.type === 'textarea'}
                                type={field.type === 'number' ? 'number' : 'text'}
                                value={values[field.name] as string | number}
                                placeholder={field.placeholder}
                                onChange={(event) => {
                                    const raw = event.target.value
                                    const nextValue =
                                        field.type === 'number' ? (raw === '' ? '' : Number(raw)) : raw
                                    updateFormValue(action.key, field.name, nextValue)
                                }}
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-3 text-right">
                    <Button
                        variant="solid"
                        loading={Boolean(loading[action.key])}
                        onClick={() => handleSubmit(action)}
                    >
                        {action.submitText}
                    </Button>
                </div>
                <div className="mt-3 rounded-md bg-gray-50 p-3 dark:bg-gray-700">
                    <p className="mb-2 text-xs text-gray-500">Response</p>
                    <pre className="max-h-52 overflow-auto text-xs whitespace-pre-wrap break-all">
                        {results[action.key] || '// no response yet'}
                    </pre>
                </div>
            </Card>
        )
    }

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="mb-1">Settlement 结算管理</h3>
                    <p className="text-sm text-gray-500">结构化表单已直接对接 7 个结算接口。</p>
                </div>
                <Button
                    size="sm"
                    onClick={() => {
                        setLogs([])
                        setResults({})
                    }}
                >
                    Clear
                </Button>
            </div>

            <Tabs value={tab} onChange={(value) => setTab(String(value) as ActionGroup)}>
                <Tabs.TabList>
                    <Tabs.TabNav value="settlement">Settlement</Tabs.TabNav>
                    <Tabs.TabNav value="reconciliation">Reconciliation</Tabs.TabNav>
                </Tabs.TabList>
                <Tabs.TabContent value="settlement" className="mt-4">
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {actionsByGroup.settlement.map(renderActionCard)}
                    </div>
                </Tabs.TabContent>
                <Tabs.TabContent value="reconciliation" className="mt-4">
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {actionsByGroup.reconciliation.map(renderActionCard)}
                    </div>
                </Tabs.TabContent>
            </Tabs>

            <Card className="mt-6">
                <h5 className="mb-3">Operation Logs</h5>
                <DataTable
                    columns={logColumns}
                    data={logs}
                    pagingData={{ total: logs.length, pageIndex, pageSize }}
                    onPaginationChange={setPageIndex}
                    onSelectChange={(value) => {
                        setPageSize(Number(value))
                        setPageIndex(1)
                    }}
                />
            </Card>
        </AdaptableCard>
    )
}

export default Settlement
