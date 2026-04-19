import { useState, useRef, forwardRef } from 'react'
import { HiOutlineFunnel } from 'react-icons/hi2'
import {
    getOrders,
    setFilterData,
    initialFilterData,
    setTableData,
    useAppDispatch,
    useAppSelector,
} from '../store'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Radio from '@/components/ui/Radio'
import Drawer from '@/components/ui/Drawer'
import { Field, Form, Formik, FormikProps, FieldProps } from 'formik'
import type { MouseEvent } from 'react'
import type { PaymentStatus } from '@/@types/payment'

type FormModel = {
    direction: '' | 'PAY_IN' | 'PAY_OUT'
    statuses: PaymentStatus[]
    notifyFailed: boolean
}

type FilterFormProps = {
    onSubmitComplete?: () => void
}

type DrawerFooterProps = {
    onSaveClick: (event: MouseEvent<HTMLButtonElement>) => void
    onReset: (event: MouseEvent<HTMLButtonElement>) => void
    onCancel: (event: MouseEvent<HTMLButtonElement>) => void
}

const FilterForm = forwardRef<FormikProps<FormModel>, FilterFormProps>(
    ({ onSubmitComplete }, ref) => {
        const dispatch = useAppDispatch()

        const filterData = useAppSelector(
            (state) => state.salesOrderList.data.filterData,
        )
        const tableData = useAppSelector(
            (state) => state.salesOrderList.data.tableData,
        )

        const handleSubmit = (values: FormModel) => {
            const nextTableData = {
                ...tableData,
                pageIndex: 1,
            }

            onSubmitComplete?.()
            dispatch(setFilterData(values))
            dispatch(setTableData(nextTableData))
            dispatch(getOrders(nextTableData))
        }

        return (
            <Formik
                enableReinitialize
                innerRef={ref}
                initialValues={filterData}
                onSubmit={(values) => {
                    handleSubmit(values)
                }}
            >
                {({ values, touched, errors }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                invalid={errors.statuses && touched.statuses}
                                errorMessage={errors.statuses as string}
                            >
                                <h6 className="mb-4">订单状态</h6>
                                <Field name="statuses">
                                    {({ field, form }: FieldProps) => (
                                        <>
                                            <Checkbox.Group
                                                vertical
                                                value={values.statuses}
                                                onChange={(options) =>
                                                    form.setFieldValue(field.name, options)
                                                }
                                            >
                                                <Checkbox className="mb-3" name={field.name} value="SUCCESS">
                                                    成功
                                                </Checkbox>
                                                <Checkbox className="mb-3" name={field.name} value="FAILED">
                                                    失败
                                                </Checkbox>
                                                <Checkbox className="mb-3" name={field.name} value="REFUNDED">
                                                    退款
                                                </Checkbox>
                                            </Checkbox.Group>
                                            <div className="block">
                                                <Checkbox
                                                    className="mb-3"
                                                    checked={values.notifyFailed}
                                                    name="notifyFailed"
                                                    onChange={(checked) =>
                                                        form.setFieldValue('notifyFailed', checked)
                                                    }
                                                >
                                                    未通知
                                                </Checkbox>
                                            </div>
                                        </>
                                    )}
                                </Field>
                            </FormItem>
                            <FormItem
                                invalid={errors.direction && touched.direction}
                                errorMessage={errors.direction}
                            >
                                <h6 className="mb-4">方向</h6>
                                <Field name="direction">
                                    {({ field, form }: FieldProps) => (
                                        <Radio.Group
                                            vertical
                                            value={values.direction}
                                            onChange={(val) =>
                                                form.setFieldValue(field.name, val)
                                            }
                                        >
                                            <Radio value="PAY_IN">代收</Radio>
                                            <Radio value="PAY_OUT">代付</Radio>
                                        </Radio.Group>
                                    )}
                                </Field>
                            </FormItem>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        )
    },
)

const DrawerFooter = ({ onSaveClick, onReset, onCancel }: DrawerFooterProps) => {
    return (
        <div className="text-right w-full">
            <Button size="sm" className="mr-2" onClick={onCancel}>
                Cancel
            </Button>
            <Button size="sm" className="mr-2" onClick={onReset}>
                Reset
            </Button>
            <Button size="sm" variant="solid" onClick={onSaveClick}>
                Query
            </Button>
        </div>
    )
}

const ProductFilter = () => {
    const formikRef = useRef<FormikProps<FormModel>>(null)

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button
                size="sm"
                className="block md:inline-block ltr:md:ml-2 rtl:md:mr-2 md:mb-0 mb-4"
                icon={<HiOutlineFunnel />}
                onClick={() => setIsOpen(true)}
            >
                Filter
            </Button>
            <Drawer
                title="Filter"
                isOpen={isOpen}
                width={800}
                footer={
                    <DrawerFooter
                        onCancel={() => setIsOpen(false)}
                        onReset={() =>
                            formikRef.current?.resetForm({
                                values: initialFilterData,
                            })
                        }
                        onSaveClick={() => formikRef.current?.submitForm()}
                    />
                }
                onClose={() => setIsOpen(false)}
                onRequestClose={() => setIsOpen(false)}
            >
                <FilterForm ref={formikRef} onSubmitComplete={() => setIsOpen(false)} />
            </Drawer>
        </>
    )
}

FilterForm.displayName = 'FilterForm'

export default ProductFilter
