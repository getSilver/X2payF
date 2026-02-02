import { useEffect, useMemo, useState } from 'react'
import Container from '@/components/shared/Container'
import AdaptableCard from '@/components/shared/AdaptableCard'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    apiListRiskRules,
    apiCreateRiskRule,
    apiUpdateRiskRule,
    apiDeleteRiskRule,
} from '@/services/RiskService'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { RiskRuleRequest, RiskRuleResponse } from '@/@types/risk'
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi2'

type SelectOption = {
    value: string
    label: string
}

type RuleForm = {
    name: string
    type: string
    priority: string
    status: string
    description: string
    conditions: string
    actions: string
}

const statusOptions: SelectOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
]

const normalizeList = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) {
        return payload as T[]
    }
    if (payload && typeof payload === 'object' && 'data' in payload) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Array.isArray((payload as any).data)
            ? ((payload as any).data as T[])
            : []
    }
    return []
}

const getStatusConfig = (value?: string) => {
    const isActive = value === 'active' || value === 'enabled'
    return isActive
        ? {
              label: 'Active',
              dotClass: 'bg-emerald-500',
              textClass: 'text-emerald-500',
          }
        : {
              label: 'Inactive',
              dotClass: 'bg-amber-500',
              textClass: 'text-amber-500',
          }
}

const Rules = () => {
    const [rules, setRules] = useState<RiskRuleResponse[]>([])
    const [loading, setLoading] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [table, setTable] = useState({ pageIndex: 1, pageSize: 10 })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<RiskRuleResponse | null>(
        null
    )
    const [form, setForm] = useState<RuleForm>({
        name: '',
        type: '',
        priority: '',
        status: 'active',
        description: '',
        conditions: '',
        actions: '',
    })

    const fetchRules = async () => {
        setLoading(true)
        try {
            const response = await apiListRiskRules()
            setRules(normalizeList<RiskRuleResponse>(response.data))
        } catch (error) {
            toast.push(
                <Notification title="Failed to load rules" type="danger" />,
                { placement: 'top-center' }
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRules()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const resetForm = () => {
        setForm({
            name: '',
            type: '',
            priority: '',
            status: 'active',
            description: '',
            conditions: '',
            actions: '',
        })
    }

    const openCreateDialog = () => {
        setEditingId(null)
        resetForm()
        setDialogOpen(true)
    }

    const openEditDialog = (rule: RiskRuleResponse) => {
        setEditingId(rule.id)
        setForm({
            name: rule.name || '',
            type: rule.type || '',
            priority: rule.priority?.toString() || '',
            status: rule.status || 'active',
            description: rule.description || '',
            conditions: JSON.stringify(rule.conditions || {}, null, 2),
            actions: JSON.stringify(rule.actions || {}, null, 2),
        })
        setDialogOpen(true)
    }

    const parseJson = (value: string, fieldName: string) => {
        if (!value.trim()) {
            return {}
        }
        try {
            return JSON.parse(value)
        } catch {
            toast.push(
                <Notification
                    title={`${fieldName} must be valid JSON`}
                    type="warning"
                />,
                { placement: 'top-center' }
            )
            return null
        }
    }

    const handleSave = async () => {
        if (!form.name.trim() || !form.type.trim()) {
            toast.push(
                <Notification
                    title="Name and type are required"
                    type="warning"
                />,
                { placement: 'top-center' }
            )
            return
        }
        const conditions = parseJson(form.conditions, 'Conditions')
        if (conditions === null) {
            return
        }
        const actions = parseJson(form.actions, 'Actions')
        if (actions === null) {
            return
        }
        const payload: RiskRuleRequest = {
            name: form.name,
            type: form.type,
            priority: form.priority ? Number(form.priority) : undefined,
            status: form.status,
            description: form.description || undefined,
            conditions,
            actions,
        }
        setSaving(true)
        try {
            if (editingId) {
                await apiUpdateRiskRule(editingId, payload)
                toast.push(
                    <Notification title="Rule updated" type="success" />,
                    { placement: 'top-center' }
                )
            } else {
                await apiCreateRiskRule(payload)
                toast.push(
                    <Notification title="Rule created" type="success" />,
                    { placement: 'top-center' }
                )
            }
            setDialogOpen(false)
            setEditingId(null)
            // 重新获取列表以确保数据同步
            await fetchRules()
        } catch (error) {
            toast.push(
                <Notification
                    title={`Failed to ${editingId ? 'update' : 'create'} rule`}
                    type="danger"
                />,
                { placement: 'top-center' }
            )
        } finally {
            setSaving(false)
        }
    }

    const openDelete = (rule: RiskRuleResponse) => {
        setDeleteTarget(rule)
        setDeleteDialogOpen(true)
    }

    const closeDelete = () => {
        setDeleteTarget(null)
        setDeleteDialogOpen(false)
    }

    const handleDelete = async () => {
        if (!deleteTarget) {
            return
        }
        try {
            await apiDeleteRiskRule(deleteTarget.id)
            toast.push(
                <Notification title="Rule deleted" type="success" />,
                { placement: 'top-center' }
            )
            closeDelete()
            // 重新获取列表以确保数据同步
            await fetchRules()
        } catch (error) {
            toast.push(
                <Notification title="Failed to delete rule" type="danger" />,
                { placement: 'top-center' }
            )
        }
    }

    const columns: ColumnDef<RiskRuleResponse>[] = useMemo(
        () => [
            {
                header: 'Name',
                accessorKey: 'name',
                cell: (props) => (
                    <span className="font-semibold">
                        {props.row.original.name}
                    </span>
                ),
            },
            {
                header: 'Type',
                accessorKey: 'type',
            },
            {
                header: 'Priority',
                accessorKey: 'priority',
                cell: (props) => props.row.original.priority ?? '-',
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const status = getStatusConfig(props.row.original.status)
                    return (
                        <div className="flex items-center gap-2">
                            <Badge className={status.dotClass} />
                            <span
                                className={`capitalize font-semibold ${status.textClass}`}
                            >
                                {status.label}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: 'Updated',
                accessorKey: 'updated_at',
                cell: (props) => {
                    const value = props.row.original.updated_at
                    return value ? new Date(value).toLocaleString() : '-'
                },
            },
            {
                header: '',
                id: 'action',
                cell: (props) => (
                    <div className="flex justify-end gap-2 text-lg">
                        <span
                            className="cursor-pointer p-2 hover:text-blue-500"
                            onClick={() => openEditDialog(props.row.original)}
                        >
                            <HiOutlinePencil />
                        </span>
                        <span
                            className="cursor-pointer p-2 hover:text-red-500"
                            onClick={() => openDelete(props.row.original)}
                        >
                            <HiOutlineTrash />
                        </span>
                    </div>
                ),
            },
        ],
        [openDelete, openEditDialog]
    )

    const pagedRules = useMemo(() => {
        const start = (table.pageIndex - 1) * table.pageSize
        const end = start + table.pageSize
        return rules.slice(start, end)
    }, [rules, table.pageIndex, table.pageSize])

    return (
        <Container>
            <AdaptableCard>
                <div className="flex items-center justify-between mb-4">
                    <h3>Risk Rules</h3>
                    <Button size="sm" variant="solid" onClick={openCreateDialog}>
                        <span className="flex items-center gap-2">
                            <HiPlus />
                            Add Rule
                        </span>
                    </Button>
                </div>
                <DataTable
                    columns={columns}
                    data={pagedRules}
                    loading={loading}
                    pagingData={{
                        total: rules.length,
                        pageIndex: table.pageIndex,
                        pageSize: table.pageSize,
                    }}
                    onPaginationChange={(page) =>
                        setTable((prev) => ({ ...prev, pageIndex: page }))
                    }
                    onSelectChange={(value) =>
                        setTable({ pageIndex: 1, pageSize: value })
                    }
                />
                <Dialog
                    width={560}
                    isOpen={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onRequestClose={() => setDialogOpen(false)}
                    scrollable
                >
                    <h5 className="mb-4">
                        {editingId ? 'Edit Risk Rule' : 'Add Risk Rule'}
                    </h5>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm mb-2">Name</label>
                            <Input
                                value={form.name}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="High amount rule"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2">Type</label>
                            <Input
                                value={form.type}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        type: e.target.value,
                                    }))
                                }
                                placeholder="transaction"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2">
                                Priority
                            </label>
                            <Input
                                type="number"
                                value={form.priority}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        priority: e.target.value,
                                    }))
                                }
                                placeholder="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2">Status</label>
                            <Select
                                options={statusOptions}
                                value={statusOptions.find(
                                    (option) => option.value === form.status
                                )}
                                onChange={(option) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        status: option?.value || 'inactive',
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2">
                                Description
                            </label>
                            <Input
                                textArea
                                value={form.description}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                placeholder="Describe this rule"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2">
                                Conditions (JSON)
                            </label>
                            <Input
                                textArea
                                value={form.conditions}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        conditions: e.target.value,
                                    }))
                                }
                                placeholder='{"amount": { "$gt": 5000 }}'
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2">
                                Actions (JSON)
                            </label>
                            <Input
                                textArea
                                value={form.actions}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        actions: e.target.value,
                                    }))
                                }
                                placeholder='{"action": "block"}'
                            />
                        </div>
                    </div>
                    <div className="mt-6 text-right">
                        <Button
                            className="ltr:mr-2 rtl:ml-2"
                            onClick={() => setDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            loading={saving}
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                    </div>
                </Dialog>
                <ConfirmDialog
                    isOpen={deleteDialogOpen}
                    onClose={closeDelete}
                    onRequestClose={closeDelete}
                    onCancel={closeDelete}
                    onConfirm={handleDelete}
                    type="danger"
                    title="Delete rule"
                    confirmButtonColor="red-500"
                >
                    <p>
                        Delete{' '}
                        <span className="font-semibold">
                            {deleteTarget?.name}
                        </span>
                        ?
                    </p>
                </ConfirmDialog>
            </AdaptableCard>
        </Container>
    )
}

export default Rules
