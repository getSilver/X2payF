import { useMemo, useState } from 'react'
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
import type { ColumnDef, OnSortParam } from '@/components/shared/DataTable'

type WithdrawStatus = 'COMPLETE' | 'PENDING' | 'CANCELED'
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
    status: WithdrawStatus
}

const statusColor: Record<
    WithdrawStatus,
    {
        label: string
        dotClass: string
        textClass: string
    }
> = {
    COMPLETE: {
        label: 'Complete',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-500',
    },
    PENDING: {
        label: 'Pending',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-500',
    },
    CANCELED: {
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

const mockRows: WithdrawRow[] = [
    {
        id: 'WD-10021',
        action: 'Withdraw',
        actionType: 'WITHDRAW',
        merchant: 'M-90211',
        date: 1724012250,
        forex: 1,
        amount: 1250.5,
        refund: 0,
        status: 'COMPLETE',
    },
    {
        id: 'WD-10022',
        action: 'Withdraw',
        actionType: 'WITHDRAW',
        merchant: 'M-90219',
        date: 1723925850,
        forex: 1.08,
        amount: 960.0,
        refund: 0,
        status: 'PENDING',
    },
    {
        id: 'WD-10023',
        action: 'Reverse',
        actionType: 'REFUND',
        merchant: 'M-90211',
        date: 1723839450,
        forex: 1,
        amount: 320.75,
        refund: 320.75,
        status: 'CANCELED',
    },
    {
        id: 'WD-10024',
        action: 'Withdraw',
        actionType: 'WITHDRAW',
        merchant: 'M-90302',
        date: 1723753050,
        forex: 1.27,
        amount: 510.0,
        refund: 0,
        status: 'COMPLETE',
    },
    {
        id: 'WD-10025',
        action: 'Reverse',
        actionType: 'REFUND',
        merchant: 'M-90444',
        date: 1723666650,
        forex: 1,
        amount: 240.25,
        refund: 240.25,
        status: 'PENDING',
    },
]

type ApprovalForm = {
    amount: number
    rate: number
    merchant: string
}

const WithdrawTable = () => {
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [sort, setSort] = useState<OnSortParam>({ order: '', key: '' })
    const [dialogOpen, setDialogOpen] = useState(false)
    const [activeRow, setActiveRow] = useState<WithdrawRow | null>(null)
    const { textTheme } = useThemeClass()

    const sortedRows = useMemo(() => {
        if (!sort.key || !sort.order) {
            return mockRows
        }

        const sorted = [...mockRows].sort((a, b) => {
            const key = sort.key as keyof WithdrawRow
            const aVal = a[key]
            const bVal = b[key]

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return aVal - bVal
            }
            return String(aVal).localeCompare(String(bVal))
        })

        return sort.order === 'asc' ? sorted : sorted.reverse()
    }, [sort])

    const pageRows = useMemo(() => {
        const start = (pageIndex - 1) * pageSize
        const end = start + pageSize
        return sortedRows.slice(start, end)
    }, [pageIndex, pageSize, sortedRows])

    const approvalSchema = useMemo(() => {
        const maxAmount = activeRow?.amount ?? 0
        return Yup.object().shape({
            amount: Yup.number()
                .min(0, 'Min amount 0')
                .max(maxAmount, 'Amount cannot exceed submitted')
                .required('Please enter amount'),
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
                    <span className="font-semibold">#{props.row.original.id}</span>
                ),
            },
            {
                header: 'Merchant',
                accessorKey: 'merchant',
            },
            {
                header: 'data',
                accessorKey: 'date',
                cell: (props) => (
                    <span>
                        {dayjs.unix(props.row.original.date).format(
                            'DD/MM/YYYY HH:mm:ss'
                        )}
                    </span>
                ),
            },
            {
                header: 'Forex',
                accessorKey: 'forex',
                cell: (props) => (
                    <span>{props.row.original.forex.toFixed(3)}</span>
                ),
            },
            {
                header: 'Amount',
                accessorKey: 'amount',
                cell: (props) => (
                    <NumericFormat
                        displayType="text"
                        value={props.row.original.amount.toFixed(2)}
                        prefix={'$'}
                        thousandSeparator={true}
                    />
                ),
            },
            {
                header: 'Refund',
                accessorKey: 'refund',
                cell: (props) => (
                    <NumericFormat
                        displayType="text"
                        value={props.row.original.refund.toFixed(2)}
                        prefix={'$'}
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
                            <span
                                className={`ml-2 rtl:mr-2 capitalize font-semibold ${statusColor[status].textClass}`}
                            >
                                {statusColor[status].label}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: '',
                id: 'operation',
                cell: (props) => (
                    <div className="flex justify-end text-lg">
                        <span
                            className={`cursor-pointer p-2 hover:${textTheme}`}
                            onClick={() => {
                                setActiveRow(props.row.original)
                                setDialogOpen(true)
                            }}
                        >
                            <HiOutlinePencil />
                        </span>
                    </div>
                ),
            },
        ],
        []
    )

    const handlePaginationChange = (page: number) => {
        setPageIndex(page)
    }

    const handleSelectChange = (value: number) => {
        setPageSize(Number(value))
        setPageIndex(1)
    }

    const handleDialogClose = () => {
        setDialogOpen(false)
    }

    return (
        <>
            <DataTable
                columns={columns}
                data={pageRows}
                pagingData={{
                    total: sortedRows.length,
                    pageIndex,
                    pageSize,
                }}
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={setSort}
            />
            <Dialog
                width={520}
                isOpen={dialogOpen}
                onClose={handleDialogClose}
                onRequestClose={handleDialogClose}
            >
                {activeRow && (
                    <>
                        <h5 className="mb-4">Approve Withdrawal</h5>
                        <Formik<ApprovalForm>
                            enableReinitialize
                            initialValues={{
                                amount: activeRow.amount,
                                rate: activeRow.forex,
                                merchant: activeRow.merchant,
                            }}
                            validationSchema={approvalSchema}
                            onSubmit={(values, { setSubmitting }) => {
                                const refundAmount = Math.max(
                                    0,
                                    activeRow.amount - values.amount
                                )
                                console.log('approve withdrawal', {
                                    id: activeRow.id,
                                    approvedAmount: values.amount,
                                    refundAmount,
                                })
                                setSubmitting(false)
                                handleDialogClose()
                            }}
                        >
                            {({ values, errors, touched, isSubmitting }) => {
                                const refundAmount = Math.max(
                                    0,
                                    activeRow.amount - values.amount
                                )

                                return (
                                    <Form>
                                        <FormContainer>
                                            <FormItem label="Merchant">
                                                <Field
                                                    type="text"
                                                    readOnly
                                                    name="merchant"
                                                    component={Input}
                                                />
                                            </FormItem>
                                            <FormItem label="Rate">
                                                <Field name="rate">
                                                    {({ field }: FieldProps) => (
                                                        <FormNumericInput
                                                            readOnly
                                                            field={field}
                                                            value={field.value}
                                                            decimalScale={4}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                            <FormItem
                                                label="Amount"
                                                invalid={
                                                    Boolean(errors.amount) &&
                                                    Boolean(touched.amount)
                                                }
                                                errorMessage={errors.amount}
                                            >
                                                <Field name="amount">
                                                    {({ field, form }: FieldProps) => (
                                                        <FormNumericInput
                                                            form={form}
                                                            field={field}
                                                            value={field.value}
                                                            decimalScale={2}
                                                            thousandSeparator={true}
                                                            onValueChange={(e) => {
                                                                form.setFieldValue(
                                                                    field.name,
                                                                    e.floatValue ?? 0
                                                                )
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                                <div className="mt-2 text-sm text-gray-500">
                                                    Submitted:{' '}
                                                    <NumericFormat
                                                        displayType="text"
                                                        value={activeRow.amount.toFixed(2)}
                                                        thousandSeparator={true}
                                                    />
                                                </div>
                                                <div className="mt-1 text-sm text-gray-500">
                                                    Refund to user:{' '}
                                                    <NumericFormat
                                                        displayType="text"
                                                        value={refundAmount.toFixed(2)}
                                                        thousandSeparator={true}
                                                    />
                                                </div>
                                            </FormItem>
                                            <div className="text-right">
                                                <Button
                                                    className="ltr:mr-2 rtl:ml-2"
                                                    type="button"
                                                    onClick={handleDialogClose}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="solid"
                                                    type="submit"
                                                    loading={isSubmitting}
                                                >
                                                    Approve
                                                </Button>
                                            </div>
                                        </FormContainer>
                                    </Form>
                                )
                            }}
                        </Formik>
                    </>
                )}
            </Dialog>
        </>
    )
}

export default WithdrawTable
