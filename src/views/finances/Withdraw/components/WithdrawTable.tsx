import { useMemo, useState, useEffect } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import DataTable from '@/components/shared/DataTable'
import Dialog from '@/components/ui/Dialog'
import Avatar from '@/components/ui/Avatar'
import Input from '@/components/ui/Input'
import { FormContainer, FormItem } from '@/components/ui/Form'
import { FormNumericInput } from '@/components/shared'
import { Field, Form, Formik, FieldProps } from 'formik'
import { HiOutlineArrowUp, HiOutlineArrowDown, HiOutlinePencil } from 'react-icons/hi2'
import { NumericFormat } from 'react-number-format'
import dayjs from 'dayjs'
import * as Yup from 'yup'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { getCurrencySymbol } from '@/utils/currencySymbols'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    apiGetPendingWithdrawals,
    apiApproveWithdrawal,
    apiRejectWithdrawal,
    apiCompleteWithdrawal,
    type Withdrawal,
    type WithdrawalStatus,
} from '@/services/FinanceService'
import type { ColumnDef, OnSortParam } from '@/components/shared/DataTable'

type WithdrawAction = 'WITHDRAW' | 'REFUND'

type WithdrawRow = {
    id: string
    action: string
    actionType: WithdrawAction
    merchant: string
    date: number
    forex: number
    amount: number
    refund: number
    status: WithdrawalStatus
    currency: string
    fee: number
    actual_amount: number
    note: string
}

const statusColor: Record<
    WithdrawalStatus,
    {
        label: string
        dotClass: string
        textClass: string
    }
> = {
    COMPLETED: {
        label: 'Complete',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-500',
    },
    PENDING: {
        label: 'Pending',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-500',
    },
    APPROVED: {
        label: 'Approved',
        dotClass: 'bg-blue-500',
        textClass: 'text-blue-500',
    },
    REJECTED: {
        label: 'Rejected',
        dotClass: 'bg-red-500',
        textClass: 'text-red-500',
    },
    CANCELLED: {
        label: 'Canceled',
        dotClass: 'bg-gray-500',
        textClass: 'text-gray-500',
    },
}

const ActionIcon = ({ type }: { type: WithdrawAction }) => {
    if (type === 'REFUND') {
        return (
            <Avatar
                size="sm"
                className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100"
                icon={<HiOutlineArrowDown style={{ transform: 'rotate(45deg)' }} />}
            />
        )
    }

    return (
        <Avatar
            size="sm"
            className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100"
            icon={<HiOutlineArrowUp style={{ transform: 'rotate(45deg)' }} />}
        />
    )
}

type ApprovalForm = {
    amount: number
    rate: number
    merchant: string
    action: 'approve' | 'reject' | 'complete'
    reason?: string
    note?: string
}

const WithdrawTable = () => {
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [sort, setSort] = useState<OnSortParam>({ order: '', key: '' })
    const [dialogOpen, setDialogOpen] = useState(false)
    const [activeRow, setActiveRow] = useState<WithdrawRow | null>(null)
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    const [total, setTotal] = useState(0)
    const { textTheme } = useThemeClass()

    const loadWithdrawals = async () => {
        setLoading(true)
        try {
            // 获取所有提款列表(支持所有状态: PENDING, APPROVED, COMPLETED, REJECTED, CANCELLED)
            const response = await apiGetPendingWithdrawals(pageIndex, pageSize)
            setWithdrawals(response.list || [])
            setTotal(response.total || 0)
        } catch (error) {
            console.error('加载提款列表失败:', error)
            toast.push(
                <Notification type="danger" title="加载失败">
                    无法加载提款列表
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadWithdrawals()
    }, [pageIndex, pageSize])

    const rows: WithdrawRow[] = useMemo(() => {
        return withdrawals.map((w) => ({
            id: w.id,
            action: 'Withdraw',
            actionType: 'WITHDRAW' as WithdrawAction,
            merchant: w.merchant_id,
            date: new Date(w.applied_at).getTime() / 1000,
            forex: 1,
            amount: w.amount / 100,
            refund: 0,
            status: w.status,
            currency: w.currency,
            fee: w.fee / 100,
            actual_amount: w.actual_amount / 100,
            note: w.note || '',
        }))
    }, [withdrawals])

    const sortedRows = useMemo(() => {
        if (!sort.key || !sort.order) {
            return rows
        }
        const sorted = [...rows].sort((a, b) => {
            const key = sort.key as keyof WithdrawRow
            const aVal = a[key]
            const bVal = b[key]
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return aVal - bVal
            }
            return String(aVal).localeCompare(String(bVal))
        })
        return sort.order === 'asc' ? sorted : sorted.reverse()
    }, [rows, sort])

    const approvalSchema = useMemo(() => {
        const maxAmount = activeRow?.amount ?? 0
        return Yup.object().shape({
            amount: Yup.number()
                .min(0, 'Min amount 0')
                .max(maxAmount, 'Amount cannot exceed submitted')
                .required('Please enter amount'),
            reason: Yup.string().when('action', {
                is: 'reject',
                then: (schema) => schema.required('Please enter rejection reason'),
                otherwise: (schema) => schema,
            }),
            note: Yup.string().when('action', {
                is: 'complete',
                then: (schema) => schema.required('Please enter completion note (e.g., transfer voucher number)'),
                otherwise: (schema) => schema,
            }),
        })
    }, [activeRow?.amount])

    const columns: ColumnDef<WithdrawRow>[] = useMemo(
        () => [
            {
                header: 'Action',
                accessorKey: 'action',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center gap-2">
                            <ActionIcon type={row.actionType} />
                            <span className="font-semibold heading-text whitespace-nowrap">
                                {row.action}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: 'ID',
                accessorKey: 'id',
                cell: (props) => (
                    <span className="font-semibold">#{props.row.original.id.slice(0, 8)}</span>
                ),
            },
            {
                header: 'Merchant',
                accessorKey: 'merchant',
            },
            {
                header: 'Date',
                accessorKey: 'date',
                cell: (props) => (
                    <span>
                        {dayjs.unix(props.row.original.date).format('DD/MM/YYYY HH:mm:ss')}
                    </span>
                ),
            },
            {
                header: 'Amount',
                accessorKey: 'amount',
                cell: (props) => (
                    <NumericFormat
                        displayType="text"
                        value={props.row.original.amount.toFixed(2)}
                        prefix={getCurrencySymbol(props.row.original.currency, '$')}
                        thousandSeparator={true}
                    />
                ),
            },
            {
                header: 'Fee',
                accessorKey: 'fee',
                cell: (props) => (
                    <NumericFormat
                        displayType="text"
                        value={props.row.original.fee.toFixed(2)}
                        prefix={getCurrencySymbol(props.row.original.currency, '$')}
                        thousandSeparator={true}
                    />
                ),
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const status = props.row.original.status
                    return (
                        <div className="flex items-center">
                            <Badge className={statusColor[status].dotClass} />
                            <span className={`ml-2 rtl:mr-2 capitalize font-semibold ${statusColor[status].textClass}`}>
                                {statusColor[status].label}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: '',
                id: 'operation',
                cell: (props) => {
                    const row = props.row.original
                    // 只有 PENDING 和 APPROVED 状态可以操作
                    // PENDING: 可以审核通过或拒绝
                    // APPROVED: 可以完成提款
                    if (row.status !== 'PENDING' && row.status !== 'APPROVED') return null
                    return (
                        <div className="flex justify-end text-lg">
                            <span
                                className={`cursor-pointer p-2 hover:${textTheme}`}
                                onClick={() => {
                                    setActiveRow(row)
                                    setDialogOpen(true)
                                }}
                            >
                                <HiOutlinePencil />
                            </span>
                        </div>
                    )
                },
            },
        ],
        [textTheme]
    )

    const handleDialogClose = () => setDialogOpen(false)

    const handleSubmit = async (values: ApprovalForm) => {
        if (!activeRow) return
        setSubmitting(true)
        try {
            if (values.action === 'approve') {
                await apiApproveWithdrawal(activeRow.id, { note: values.note || `Approved amount: ${values.amount}` })
                toast.push(<Notification type="success" title="审核成功">提款申请已审核通过</Notification>)
            } else if (values.action === 'complete') {
                await apiCompleteWithdrawal(activeRow.id, { note: values.note || 'Withdrawal completed' })
                toast.push(<Notification type="success" title="完成成功">提款已完成并扣款</Notification>)
            } else {
                await apiRejectWithdrawal(activeRow.id, { reason: values.reason || 'Rejected by admin' })
                toast.push(<Notification type="success" title="拒绝成功">提款申请已拒绝</Notification>)
            }
            handleDialogClose()
            loadWithdrawals()
        } catch (error) {
            console.error('操作失败:', error)
            const actionText = values.action === 'approve' ? '审核' : values.action === 'complete' ? '完成' : '拒绝'
            toast.push(<Notification type="danger" title="操作失败">{actionText}失败</Notification>)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <DataTable
                columns={columns}
                data={sortedRows}
                loading={loading}
                pagingData={{ total, pageIndex, pageSize }}
                onPaginationChange={setPageIndex}
                onSelectChange={(v) => { setPageSize(Number(v)); setPageIndex(1) }}
                onSort={setSort}
            />
            <Dialog width={520} isOpen={dialogOpen} onClose={handleDialogClose} onRequestClose={handleDialogClose}>
                {activeRow && (
                    <>
                        <h5 className="mb-4">
                            {activeRow.status === 'PENDING' ? 'Review Withdrawal' : 'Complete Withdrawal'}
                        </h5>
                        <Formik<ApprovalForm>
                            enableReinitialize
                            initialValues={{ 
                                amount: activeRow.amount, 
                                rate: activeRow.forex, 
                                merchant: activeRow.merchant, 
                                action: activeRow.status === 'APPROVED' ? 'complete' : 'approve', 
                                reason: '',
                                note: ''
                            }}
                            validationSchema={approvalSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ values, errors, touched, setFieldValue }) => (
                                <Form>
                                    <FormContainer>
                                        <FormItem label="Merchant">
                                            <Field type="text" readOnly name="merchant" component={Input} />
                                        </FormItem>
                                        <FormItem label="Rate">
                                            <Field name="rate">
                                                {({ field }: FieldProps) => <FormNumericInput readOnly field={field} value={field.value} decimalScale={4} />}
                                            </Field>
                                        </FormItem>
                                        <FormItem label="Amount" invalid={Boolean(errors.amount) && Boolean(touched.amount)} errorMessage={errors.amount}>
                                            <Field name="amount">
                                                {({ field, form }: FieldProps) => (
                                                    <FormNumericInput 
                                                        form={form} 
                                                        field={field} 
                                                        value={field.value} 
                                                        decimalScale={2} 
                                                        thousandSeparator={true} 
                                                        readOnly={activeRow.status === 'APPROVED'}
                                                        onValueChange={(e) => form.setFieldValue(field.name, e.floatValue ?? 0)} 
                                                    />
                                                )}
                                            </Field>
                                            <div className="mt-2 text-sm text-gray-500">Submitted: <NumericFormat displayType="text" value={activeRow.amount.toFixed(2)} thousandSeparator={true} /></div>
                                        </FormItem>
                                        
                                        {/* PENDING状态显示拒绝原因输入框 */}
                                        {activeRow.status === 'PENDING' && values.action === 'reject' && (
                                            <FormItem label="Rejection Reason" invalid={Boolean(errors.reason) && Boolean(touched.reason)} errorMessage={errors.reason}>
                                                <Field as="textarea" name="reason" component={Input} textArea placeholder="Please enter rejection reason" />
                                            </FormItem>
                                        )}
                                        
                                        {/* APPROVED状态或审核通过时显示完成备注输入框 */}
                                        {(activeRow.status === 'APPROVED' || values.action === 'complete') && (
                                            <FormItem label="Completion Note" invalid={Boolean(errors.note) && Boolean(touched.note)} errorMessage={errors.note}>
                                                <Field as="textarea" name="note" component={Input} textArea placeholder="Please enter completion note (e.g., transfer voucher number)" />
                                            </FormItem>
                                        )}
                                        
                                        <div className="text-right mt-4">
                                            <Button className="ltr:mr-2 rtl:ml-2" type="button" onClick={handleDialogClose}>Cancel</Button>
                                            
                                            {/* PENDING状态显示拒绝和审核通过按钮 */}
                                            {activeRow.status === 'PENDING' && (
                                                <>
                                                    <Button 
                                                        className="ltr:mr-2 rtl:ml-2" 
                                                        variant="solid" 
                                                        color="red-600" 
                                                        type="submit" 
                                                        loading={submitting && values.action === 'reject'} 
                                                        onClick={() => setFieldValue('action', 'reject')}
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button 
                                                        variant="solid" 
                                                        type="submit" 
                                                        loading={submitting && values.action === 'approve'} 
                                                        onClick={() => setFieldValue('action', 'approve')}
                                                    >
                                                        Approve
                                                    </Button>
                                                </>
                                            )}
                                            
                                            {/* APPROVED状态显示完成提款按钮 */}
                                            {activeRow.status === 'APPROVED' && (
                                                <Button 
                                                    variant="solid" 
                                                    color="emerald-600"
                                                    type="submit" 
                                                    loading={submitting && values.action === 'complete'} 
                                                    onClick={() => setFieldValue('action', 'complete')}
                                                >
                                                    Complete Withdrawal
                                                </Button>
                                            )}
                                        </div>
                                    </FormContainer>
                                </Form>
                            )}
                        </Formik>
                    </>
                )}
            </Dialog>
        </>
    )
}

export default WithdrawTable
