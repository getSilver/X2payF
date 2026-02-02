import { useMemo, useState, useEffect } from 'react'
import Tabs from '@/components/ui/Tabs'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Container from '@/components/shared/Container'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    apiGetPlatformCurrencies,
    apiGetPlatformTimezones,
    apiGetPlatformAssociations,
    apiCreatePlatformCurrency,
    apiUpdatePlatformCurrency,
    apiDeletePlatformCurrency,
    apiCreatePlatformTimezone,
    apiUpdatePlatformTimezone,
    apiDeletePlatformTimezone,
    apiCreatePlatformAssociation,
    apiUpdatePlatformAssociation,
    apiDeletePlatformAssociation,
} from '@/services/PlatformSettingsService'
import type { ColumnDef } from '@/components/shared/DataTable'
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi2'

type Currency = {
    id?: string
    code?: string
    name?: string
    symbol?: string
    status?: string
    enabled?: boolean
    is_active?: boolean
}

type Timezone = {
    id?: string
    name?: string
    offset?: string
    region?: string
    status?: string
    enabled?: boolean
    is_active?: boolean
}

type Association = {
    id?: string
    currency_id?: string
    timezone_id?: string
    currencyId?: string
    timezoneId?: string
    currency?: Currency
    timezone?: Timezone
    status?: string
    enabled?: boolean
}

type SettingsTab = 'currencies' | 'timezones' | 'associations'

type CurrencyForm = {
    name: string
    code: string
    symbol: string
    status: string
}

type TimezoneForm = {
    name: string
    offset: string
    region: string
    status: string
}

type AssociationForm = {
    currencyId: string
    timezoneId: string
    status: string
}

type DeleteTarget = {
    type: SettingsTab
    id: string
    label: string
}

type SelectOption = {
    value: string
    label: string
}

const { TabNav, TabList } = Tabs

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

const getStatusConfig = (value?: string | boolean) => {
    const isActive =
        value === true ||
        value === 'active' ||
        value === 'enabled' ||
        value === 'on'
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

const getStatusValue = (value?: string | boolean) =>
    value === true ||
    value === 'active' ||
    value === 'enabled' ||
    value === 'on'
        ? 'active'
        : 'inactive'

const Settings = () => {
    const [currentTab, setCurrentTab] = useState<SettingsTab>('currencies')
    const [currencies, setCurrencies] = useState<Currency[]>([])
    const [timezones, setTimezones] = useState<Timezone[]>([])
    const [associations, setAssociations] = useState<Association[]>([])
    const [loading, setLoading] = useState({
        currencies: false,
        timezones: false,
        associations: false,
    })
    const [currencyTable, setCurrencyTable] = useState({
        pageIndex: 1,
        pageSize: 10,
    })
    const [timezoneTable, setTimezoneTable] = useState({
        pageIndex: 1,
        pageSize: 10,
    })
    const [associationTable, setAssociationTable] = useState({
        pageIndex: 1,
        pageSize: 10,
    })
    const [saving, setSaving] = useState({
        currency: false,
        timezone: false,
        association: false,
    })
    const [currencyDialogOpen, setCurrencyDialogOpen] = useState(false)
    const [currencyEditingId, setCurrencyEditingId] = useState<string | null>(
        null
    )
    const [currencyForm, setCurrencyForm] = useState<CurrencyForm>({
        name: '',
        code: '',
        symbol: '',
        status: 'active',
    })
    const [timezoneDialogOpen, setTimezoneDialogOpen] = useState(false)
    const [timezoneEditingId, setTimezoneEditingId] = useState<string | null>(
        null
    )
    const [timezoneForm, setTimezoneForm] = useState<TimezoneForm>({
        name: '',
        offset: '',
        region: '',
        status: 'active',
    })
    const [associationDialogOpen, setAssociationDialogOpen] = useState(false)
    const [associationEditingId, setAssociationEditingId] = useState<
        string | null
    >(null)
    const [associationForm, setAssociationForm] = useState<AssociationForm>({
        currencyId: '',
        timezoneId: '',
        status: 'active',
    })
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const fetchCurrencies = async () => {
        setLoading((prev) => ({ ...prev, currencies: true }))
        try {
            const response = await apiGetPlatformCurrencies<Currency[], Record<string, unknown>>()
            setCurrencies(normalizeList<Currency>(response.data))
        } catch (error) {
            toast.push(
                <Notification
                    title="Failed to load currencies"
                    type="danger"
                />,
                { placement: 'top-center' }
            )
        } finally {
            setLoading((prev) => ({ ...prev, currencies: false }))
        }
    }

    const fetchTimezones = async () => {
        setLoading((prev) => ({ ...prev, timezones: true }))
        try {
            const response = await apiGetPlatformTimezones<Timezone[], Record<string, unknown>>()
            setTimezones(normalizeList<Timezone>(response.data))
        } catch (error) {
            toast.push(
                <Notification
                    title="Failed to load timezones"
                    type="danger"
                />,
                { placement: 'top-center' }
            )
        } finally {
            setLoading((prev) => ({ ...prev, timezones: false }))
        }
    }

    const fetchAssociations = async () => {
        setLoading((prev) => ({ ...prev, associations: true }))
        try {
            const response = await apiGetPlatformAssociations<Association[], Record<string, unknown>>()
            setAssociations(normalizeList<Association>(response.data))
        } catch (error) {
            toast.push(
                <Notification
                    title="Failed to load associations"
                    type="danger"
                />,
                { placement: 'top-center' }
            )
        } finally {
            setLoading((prev) => ({ ...prev, associations: false }))
        }
    }

    useEffect(() => {
        fetchCurrencies()
        fetchTimezones()
        fetchAssociations()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const openCurrencyCreate = () => {
        setCurrencyEditingId(null)
        setCurrencyForm({
            name: '',
            code: '',
            symbol: '',
            status: 'active',
        })
        setCurrencyDialogOpen(true)
    }

    const openCurrencyEdit = (currency: Currency) => {
        setCurrencyEditingId(currency.id || null)
        setCurrencyForm({
            name: currency.name || '',
            code: currency.code || '',
            symbol: currency.symbol || '',
            status: getStatusValue(
                currency.status ?? currency.enabled ?? currency.is_active
            ),
        })
        setCurrencyDialogOpen(true)
    }

    const openTimezoneCreate = () => {
        setTimezoneEditingId(null)
        setTimezoneForm({
            name: '',
            offset: '',
            region: '',
            status: 'active',
        })
        setTimezoneDialogOpen(true)
    }

    const openTimezoneEdit = (timezone: Timezone) => {
        setTimezoneEditingId(timezone.id || null)
        setTimezoneForm({
            name: timezone.name || '',
            offset: timezone.offset || '',
            region: timezone.region || '',
            status: getStatusValue(
                timezone.status ?? timezone.enabled ?? timezone.is_active
            ),
        })
        setTimezoneDialogOpen(true)
    }

    const openAssociationCreate = () => {
        setAssociationEditingId(null)
        setAssociationForm({
            currencyId: '',
            timezoneId: '',
            status: 'active',
        })
        setAssociationDialogOpen(true)
    }

    const openAssociationEdit = (association: Association) => {
        setAssociationEditingId(association.id || null)
        setAssociationForm({
            currencyId:
                association.currency_id || association.currencyId || '',
            timezoneId:
                association.timezone_id || association.timezoneId || '',
            status: getStatusValue(association.status ?? association.enabled),
        })
        setAssociationDialogOpen(true)
    }

    const openDeleteDialog = (target: DeleteTarget) => {
        setDeleteTarget(target)
        setDeleteDialogOpen(true)
    }

    const closeDeleteDialog = () => {
        setDeleteTarget(null)
        setDeleteDialogOpen(false)
    }

    const handleCurrencySave = async () => {
        if (!currencyForm.code && !currencyForm.name) {
            toast.push(
                <Notification
                    title="Currency code or name is required"
                    type="warning"
                />,
                { placement: 'top-center' }
            )
            return
        }
        setSaving((prev) => ({ ...prev, currency: true }))
        try {
            if (currencyEditingId) {
                const response = await apiUpdatePlatformCurrency<Currency, CurrencyForm>(
                    currencyEditingId,
                    currencyForm
                )
                const next = response.data as Currency
                setCurrencies((prev) =>
                    prev.map((item) =>
                        item.id === currencyEditingId
                            ? { ...item, ...currencyForm, ...next }
                            : item
                    )
                )
                toast.push(
                    <Notification title="Currency updated" type="success" />,
                    { placement: 'top-center' }
                )
            } else {
                const response = await apiCreatePlatformCurrency<Currency, CurrencyForm>(
                    currencyForm
                )
                const next =
                    (response.data as Currency) || {
                        id: `cur-${Date.now()}`,
                        ...currencyForm,
                    }
                setCurrencies((prev) => [next, ...prev])
                toast.push(
                    <Notification title="Currency created" type="success" />,
                    { placement: 'top-center' }
                )
            }
            setCurrencyDialogOpen(false)
        } catch (error) {
            toast.push(
                <Notification title="Failed to save currency" type="danger" />,
                { placement: 'top-center' }
            )
        } finally {
            setSaving((prev) => ({ ...prev, currency: false }))
        }
    }

    const handleTimezoneSave = async () => {
        if (!timezoneForm.name) {
            toast.push(
                <Notification title="Timezone name is required" type="warning" />,
                { placement: 'top-center' }
            )
            return
        }
        setSaving((prev) => ({ ...prev, timezone: true }))
        try {
            if (timezoneEditingId) {
                const response = await apiUpdatePlatformTimezone<Timezone, TimezoneForm>(
                    timezoneEditingId,
                    timezoneForm
                )
                const next = response.data as Timezone
                setTimezones((prev) =>
                    prev.map((item) =>
                        item.id === timezoneEditingId
                            ? { ...item, ...timezoneForm, ...next }
                            : item
                    )
                )
                toast.push(
                    <Notification title="Timezone updated" type="success" />,
                    { placement: 'top-center' }
                )
            } else {
                const response = await apiCreatePlatformTimezone<Timezone, TimezoneForm>(
                    timezoneForm
                )
                const next =
                    (response.data as Timezone) || {
                        id: `tz-${Date.now()}`,
                        ...timezoneForm,
                    }
                setTimezones((prev) => [next, ...prev])
                toast.push(
                    <Notification title="Timezone created" type="success" />,
                    { placement: 'top-center' }
                )
            }
            setTimezoneDialogOpen(false)
        } catch (error) {
            toast.push(
                <Notification title="Failed to save timezone" type="danger" />,
                { placement: 'top-center' }
            )
        } finally {
            setSaving((prev) => ({ ...prev, timezone: false }))
        }
    }

    const handleAssociationSave = async () => {
        if (!associationForm.currencyId || !associationForm.timezoneId) {
            toast.push(
                <Notification
                    title="Currency and timezone are required"
                    type="warning"
                />,
                { placement: 'top-center' }
            )
            return
        }
        setSaving((prev) => ({ ...prev, association: true }))
        const payload = {
            currency_id: associationForm.currencyId,
            timezone_id: associationForm.timezoneId,
            status: associationForm.status,
        }
        try {
            if (associationEditingId) {
                const response = await apiUpdatePlatformAssociation<
                    Association,
                    typeof payload
                >(associationEditingId, payload)
                const next = response.data as Association
                setAssociations((prev) =>
                    prev.map((item) =>
                        item.id === associationEditingId
                            ? {
                                  ...item,
                                  ...payload,
                                  ...next,
                              }
                            : item
                    )
                )
                toast.push(
                    <Notification title="Association updated" type="success" />,
                    { placement: 'top-center' }
                )
            } else {
                const response = await apiCreatePlatformAssociation<
                    Association,
                    typeof payload
                >(payload)
                const next =
                    (response.data as Association) || {
                        id: `assoc-${Date.now()}`,
                        ...payload,
                    }
                setAssociations((prev) => [next, ...prev])
                toast.push(
                    <Notification title="Association created" type="success" />,
                    { placement: 'top-center' }
                )
            }
            setAssociationDialogOpen(false)
        } catch (error) {
            toast.push(
                <Notification
                    title="Failed to save association"
                    type="danger"
                />,
                { placement: 'top-center' }
            )
        } finally {
            setSaving((prev) => ({ ...prev, association: false }))
        }
    }

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) {
            return
        }
        try {
            if (deleteTarget.type === 'currencies') {
                await apiDeletePlatformCurrency(deleteTarget.id)
                setCurrencies((prev) =>
                    prev.filter((item) => item.id !== deleteTarget.id)
                )
            }
            if (deleteTarget.type === 'timezones') {
                await apiDeletePlatformTimezone(deleteTarget.id)
                setTimezones((prev) =>
                    prev.filter((item) => item.id !== deleteTarget.id)
                )
            }
            if (deleteTarget.type === 'associations') {
                await apiDeletePlatformAssociation(deleteTarget.id)
                setAssociations((prev) =>
                    prev.filter((item) => item.id !== deleteTarget.id)
                )
            }
            toast.push(
                <Notification title="Deleted" type="success" />,
                { placement: 'top-center' }
            )
            closeDeleteDialog()
        } catch (error) {
            toast.push(
                <Notification title="Failed to delete" type="danger" />,
                { placement: 'top-center' }
            )
        }
    }

    const currencyMap = useMemo(() => {
        const map = new Map<string, Currency>()
        currencies.forEach((currency) => {
            if (currency.id) {
                map.set(currency.id, currency)
            }
        })
        return map
    }, [currencies])

    const timezoneMap = useMemo(() => {
        const map = new Map<string, Timezone>()
        timezones.forEach((timezone) => {
            if (timezone.id) {
                map.set(timezone.id, timezone)
            }
        })
        return map
    }, [timezones])

    const currencyOptions = useMemo(
        () =>
            currencies
                .map((currency) => ({
                    value: currency.id || '',
                    label: `${currency.code || ''} ${currency.name || ''}`.trim(),
                }))
                .filter((option) => option.value),
        [currencies]
    )

    const timezoneOptions = useMemo(
        () =>
            timezones
                .map((timezone) => ({
                    value: timezone.id || '',
                    label: `${timezone.name || ''} ${timezone.offset || ''}`.trim(),
                }))
                .filter((option) => option.value),
        [timezones]
    )

    const currencyColumns: ColumnDef<Currency>[] = useMemo(
        () => [
            {
                header: 'Name',
                accessorKey: 'name',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <span className="font-semibold">
                            {row.name || row.code || '-'}
                        </span>
                    )
                },
            },
            {
                header: 'Code',
                accessorKey: 'code',
                cell: (props) => props.row.original.code || '-',
            },
            {
                header: 'Symbol',
                accessorKey: 'symbol',
                cell: (props) => props.row.original.symbol || '-',
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const row = props.row.original
                    const status = getStatusConfig(
                        row.status ?? row.enabled ?? row.is_active
                    )
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
                header: '',
                id: 'action',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex justify-end gap-2 text-lg">
                            <span
                                className="cursor-pointer p-2 hover:text-blue-500"
                                onClick={() => openCurrencyEdit(row)}
                            >
                                <HiOutlinePencil />
                            </span>
                            <span
                                className="cursor-pointer p-2 hover:text-red-500"
                                onClick={() => {
                                    if (row.id) {
                                        openDeleteDialog({
                                            type: 'currencies',
                                            id: row.id,
                                            label:
                                                row.name ||
                                                row.code ||
                                                'currency',
                                        })
                                    }
                                }}
                            >
                                <HiOutlineTrash />
                            </span>
                        </div>
                    )
                },
            },
        ],
        [openCurrencyEdit, openDeleteDialog]
    )

    const timezoneColumns: ColumnDef<Timezone>[] = useMemo(
        () => [
            {
                header: 'Name',
                accessorKey: 'name',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <span className="font-semibold">
                            {row.name || '-'}
                        </span>
                    )
                },
            },
            {
                header: 'Offset',
                accessorKey: 'offset',
                cell: (props) => props.row.original.offset || '-',
            },
            {
                header: 'Region',
                accessorKey: 'region',
                cell: (props) => props.row.original.region || '-',
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const row = props.row.original
                    const status = getStatusConfig(
                        row.status ?? row.enabled ?? row.is_active
                    )
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
                header: '',
                id: 'action',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex justify-end gap-2 text-lg">
                            <span
                                className="cursor-pointer p-2 hover:text-blue-500"
                                onClick={() => openTimezoneEdit(row)}
                            >
                                <HiOutlinePencil />
                            </span>
                            <span
                                className="cursor-pointer p-2 hover:text-red-500"
                                onClick={() => {
                                    if (row.id) {
                                        openDeleteDialog({
                                            type: 'timezones',
                                            id: row.id,
                                            label: row.name || 'timezone',
                                        })
                                    }
                                }}
                            >
                                <HiOutlineTrash />
                            </span>
                        </div>
                    )
                },
            },
        ],
        [openTimezoneEdit, openDeleteDialog]
    )

    const associationColumns: ColumnDef<Association>[] = useMemo(
        () => [
            {
                header: 'Currency',
                accessorKey: 'currency_id',
                cell: (props) => {
                    const row = props.row.original
                    const currency =
                        row.currency ||
                        currencyMap.get(
                            row.currency_id || row.currencyId || ''
                        )
                    return (
                        <span className="font-semibold">
                            {currency?.name || currency?.code || '-'}
                        </span>
                    )
                },
            },
            {
                header: 'Timezone',
                accessorKey: 'timezone_id',
                cell: (props) => {
                    const row = props.row.original
                    const timezone =
                        row.timezone ||
                        timezoneMap.get(
                            row.timezone_id || row.timezoneId || ''
                        )
                    return (
                        <span className="font-semibold">
                            {timezone?.name || timezone?.offset || '-'}
                        </span>
                    )
                },
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const row = props.row.original
                    const status = getStatusConfig(
                        row.status ?? row.enabled
                    )
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
                header: '',
                id: 'action',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex justify-end gap-2 text-lg">
                            <span
                                className="cursor-pointer p-2 hover:text-blue-500"
                                onClick={() => openAssociationEdit(row)}
                            >
                                <HiOutlinePencil />
                            </span>
                            <span
                                className="cursor-pointer p-2 hover:text-red-500"
                                onClick={() => {
                                    if (row.id) {
                                        openDeleteDialog({
                                            type: 'associations',
                                            id: row.id,
                                            label: row.id,
                                        })
                                    }
                                }}
                            >
                                <HiOutlineTrash />
                            </span>
                        </div>
                    )
                },
            },
        ],
        [currencyMap, timezoneMap, openAssociationEdit, openDeleteDialog]
    )

    const currencyTableData = useMemo(
        () => ({
            total: currencies.length,
            pageIndex: currencyTable.pageIndex,
            pageSize: currencyTable.pageSize,
        }),
        [currencies.length, currencyTable.pageIndex, currencyTable.pageSize]
    )

    const timezoneTableData = useMemo(
        () => ({
            total: timezones.length,
            pageIndex: timezoneTable.pageIndex,
            pageSize: timezoneTable.pageSize,
        }),
        [timezones.length, timezoneTable.pageIndex, timezoneTable.pageSize]
    )

    const associationTableData = useMemo(
        () => ({
            total: associations.length,
            pageIndex: associationTable.pageIndex,
            pageSize: associationTable.pageSize,
        }),
        [
            associations.length,
            associationTable.pageIndex,
            associationTable.pageSize,
        ]
    )

    const pagedCurrencies = useMemo(() => {
        const start = (currencyTable.pageIndex - 1) * currencyTable.pageSize
        const end = start + currencyTable.pageSize
        return currencies.slice(start, end)
    }, [currencies, currencyTable.pageIndex, currencyTable.pageSize])

    const pagedTimezones = useMemo(() => {
        const start = (timezoneTable.pageIndex - 1) * timezoneTable.pageSize
        const end = start + timezoneTable.pageSize
        return timezones.slice(start, end)
    }, [timezones, timezoneTable.pageIndex, timezoneTable.pageSize])

    const pagedAssociations = useMemo(() => {
        const start = (associationTable.pageIndex - 1) * associationTable.pageSize
        const end = start + associationTable.pageSize
        return associations.slice(start, end)
    }, [associations, associationTable.pageIndex, associationTable.pageSize])

    return (
        <Container>
            <AdaptableCard>
                <Tabs
                    value={currentTab}
                    onChange={(value) => setCurrentTab(value as SettingsTab)}
                >
                    <TabList>
                        <TabNav value="currencies">Currencies</TabNav>
                        <TabNav value="timezones">Timezones</TabNav>
                        <TabNav value="associations">Associations</TabNav>
                    </TabList>
                </Tabs>
                <div className="px-4 py-6">
                    {currentTab === 'currencies' && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h4>Currency Settings</h4>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    onClick={openCurrencyCreate}
                                >
                                    <span className="flex items-center gap-2">
                                        <HiPlus />
                                        Add Currency
                                    </span>
                                </Button>
                            </div>
                            <DataTable
                                columns={currencyColumns}
                                data={pagedCurrencies}
                                loading={loading.currencies}
                                pagingData={currencyTableData}
                                onPaginationChange={(page) =>
                                    setCurrencyTable((prev) => ({
                                        ...prev,
                                        pageIndex: page,
                                    }))
                                }
                                onSelectChange={(value) =>
                                    setCurrencyTable({
                                        pageIndex: 1,
                                        pageSize: value,
                                    })
                                }
                            />
                        </>
                    )}
                    {currentTab === 'timezones' && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h4>Timezone Settings</h4>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    onClick={openTimezoneCreate}
                                >
                                    <span className="flex items-center gap-2">
                                        <HiPlus />
                                        Add Timezone
                                    </span>
                                </Button>
                            </div>
                            <DataTable
                                columns={timezoneColumns}
                                data={pagedTimezones}
                                loading={loading.timezones}
                                pagingData={timezoneTableData}
                                onPaginationChange={(page) =>
                                    setTimezoneTable((prev) => ({
                                        ...prev,
                                        pageIndex: page,
                                    }))
                                }
                                onSelectChange={(value) =>
                                    setTimezoneTable({
                                        pageIndex: 1,
                                        pageSize: value,
                                    })
                                }
                            />
                        </>
                    )}
                    {currentTab === 'associations' && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h4>Association Settings</h4>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    onClick={openAssociationCreate}
                                >
                                    <span className="flex items-center gap-2">
                                        <HiPlus />
                                        Add Association
                                    </span>
                                </Button>
                            </div>
                            <DataTable
                                columns={associationColumns}
                                data={pagedAssociations}
                                loading={loading.associations}
                                pagingData={associationTableData}
                                onPaginationChange={(page) =>
                                    setAssociationTable((prev) => ({
                                        ...prev,
                                        pageIndex: page,
                                    }))
                                }
                                onSelectChange={(value) =>
                                    setAssociationTable({
                                        pageIndex: 1,
                                        pageSize: value,
                                    })
                                }
                            />
                        </>
                    )}
                </div>
                <Dialog
                    width={520}
                    isOpen={currencyDialogOpen}
                    onClose={() => setCurrencyDialogOpen(false)}
                    onRequestClose={() => setCurrencyDialogOpen(false)}
                >
                    <h5 className="mb-4">
                        {currencyEditingId ? 'Edit Currency' : 'Add Currency'}
                    </h5>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm mb-2">Name</label>
                            <Input
                                value={currencyForm.name}
                                onChange={(e) =>
                                    setCurrencyForm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="US Dollar"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2">Code</label>
                            <Input
                                value={currencyForm.code}
                                onChange={(e) =>
                                    setCurrencyForm((prev) => ({
                                        ...prev,
                                        code: e.target.value.toUpperCase(),
                                    }))
                                }
                                placeholder="USD"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2">Symbol</label>
                            <Input
                                value={currencyForm.symbol}
                                onChange={(e) =>
                                    setCurrencyForm((prev) => ({
                                        ...prev,
                                        symbol: e.target.value,
                                    }))
                                }
                                placeholder="$"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2">Status</label>
                            <Select
                                options={statusOptions}
                                value={statusOptions.find(
                                    (option) =>
                                        option.value === currencyForm.status
                                )}
                                onChange={(option) =>
                                    setCurrencyForm((prev) => ({
                                        ...prev,
                                        status: option?.value || 'inactive',
                                    }))
                                }
                            />
                        </div>
                    </div>
                    <div className="mt-6 text-right">
                        <Button
                            className="ltr:mr-2 rtl:ml-2"
                            onClick={() => setCurrencyDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            loading={saving.currency}
                            onClick={handleCurrencySave}
                        >
                            Save
                        </Button>
                    </div>
                </Dialog>
                <Dialog
                    width={520}
                    isOpen={timezoneDialogOpen}
                    onClose={() => setTimezoneDialogOpen(false)}
                    onRequestClose={() => setTimezoneDialogOpen(false)}
                >
                    <h5 className="mb-4">
                        {timezoneEditingId ? 'Edit Timezone' : 'Add Timezone'}
                    </h5>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm mb-2">Name</label>
                            <Input
                                value={timezoneForm.name}
                                onChange={(e) =>
                                    setTimezoneForm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="Asia/Shanghai"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2">Offset</label>
                            <Input
                                value={timezoneForm.offset}
                                onChange={(e) =>
                                    setTimezoneForm((prev) => ({
                                        ...prev,
                                        offset: e.target.value,
                                    }))
                                }
                                placeholder="+08:00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2">Region</label>
                            <Input
                                value={timezoneForm.region}
                                onChange={(e) =>
                                    setTimezoneForm((prev) => ({
                                        ...prev,
                                        region: e.target.value,
                                    }))
                                }
                                placeholder="Asia"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2">Status</label>
                            <Select
                                options={statusOptions}
                                value={statusOptions.find(
                                    (option) =>
                                        option.value === timezoneForm.status
                                )}
                                onChange={(option) =>
                                    setTimezoneForm((prev) => ({
                                        ...prev,
                                        status: option?.value || 'inactive',
                                    }))
                                }
                            />
                        </div>
                    </div>
                    <div className="mt-6 text-right">
                        <Button
                            className="ltr:mr-2 rtl:ml-2"
                            onClick={() => setTimezoneDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            loading={saving.timezone}
                            onClick={handleTimezoneSave}
                        >
                            Save
                        </Button>
                    </div>
                </Dialog>
                <Dialog
                    width={520}
                    isOpen={associationDialogOpen}
                    onClose={() => setAssociationDialogOpen(false)}
                    onRequestClose={() => setAssociationDialogOpen(false)}
                >
                    <h5 className="mb-4">
                        {associationEditingId
                            ? 'Edit Association'
                            : 'Add Association'}
                    </h5>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm mb-2">Currency</label>
                            <Select
                                options={currencyOptions}
                                value={currencyOptions.find(
                                    (option) =>
                                        option.value ===
                                        associationForm.currencyId
                                )}
                                onChange={(option) =>
                                    setAssociationForm((prev) => ({
                                        ...prev,
                                        currencyId: option?.value || '',
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2">Timezone</label>
                            <Select
                                options={timezoneOptions}
                                value={timezoneOptions.find(
                                    (option) =>
                                        option.value ===
                                        associationForm.timezoneId
                                )}
                                onChange={(option) =>
                                    setAssociationForm((prev) => ({
                                        ...prev,
                                        timezoneId: option?.value || '',
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2">Status</label>
                            <Select
                                options={statusOptions}
                                value={statusOptions.find(
                                    (option) =>
                                        option.value ===
                                        associationForm.status
                                )}
                                onChange={(option) =>
                                    setAssociationForm((prev) => ({
                                        ...prev,
                                        status: option?.value || 'inactive',
                                    }))
                                }
                            />
                        </div>
                    </div>
                    <div className="mt-6 text-right">
                        <Button
                            className="ltr:mr-2 rtl:ml-2"
                            onClick={() => setAssociationDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            loading={saving.association}
                            onClick={handleAssociationSave}
                        >
                            Save
                        </Button>
                    </div>
                </Dialog>
                <ConfirmDialog
                    isOpen={deleteDialogOpen}
                    onClose={closeDeleteDialog}
                    onRequestClose={closeDeleteDialog}
                    onCancel={closeDeleteDialog}
                    onConfirm={handleDeleteConfirm}
                    type="danger"
                    title="Confirm delete"
                    confirmButtonColor="red-500"
                >
                    <p>
                        Delete{' '}
                        <span className="font-semibold">
                            {deleteTarget?.label}
                        </span>
                        ?
                    </p>
                </ConfirmDialog>
            </AdaptableCard>
        </Container>
    )
}

export default Settings
