import { useState, useRef, forwardRef } from 'react'
import { HiOutlineFunnel, HiOutlineMagnifyingGlass } from 'react-icons/hi2'
import {
    getOrders,
    setFilterData,
    initialTableData,
    useAppDispatch,
    useAppSelector,
} from '../store'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Radio from '@/components/ui/Radio'
import Drawer from '@/components/ui/Drawer'
import { Field, Form, Formik, FormikProps, FieldProps } from 'formik'
import type { MouseEvent } from 'react'

type FormModel = {
    name: string
    category: string[]
    status: number[]
    productStatus: number
}

type FilterFormProps = {
    onSubmitComplete?: () => void
}

type DrawerFooterProps = {
    onSaveClick: (event: MouseEvent<HTMLButtonElement>) => void
    onCancel: (event: MouseEvent<HTMLButtonElement>) => void
}

const FilterForm = forwardRef<FormikProps<FormModel>, FilterFormProps>(
    ({ onSubmitComplete }, ref) => {
        const dispatch = useAppDispatch()

        const filterData = useAppSelector(
            (state) => state.salesOrderList.data.filterData
        )

        const handleSubmit = (values: FormModel) => {
            onSubmitComplete?.()
            dispatch(setFilterData(values))
            dispatch(getOrders(initialTableData))
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
                                invalid={errors.name && touched.name}
                                errorMessage={errors.name}
                            >
                                <h6 className="mb-4">Included text</h6>
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="name"
                                    placeholder="Keyword"
                                    component={Input}
                                    prefix={
                                        <HiOutlineMagnifyingGlass className="text-lg" />
                                    }
                                />
                            </FormItem>

                            <FormItem
                                invalid={errors.status && touched.status}
                                errorMessage={errors.status as string}
                            >
                                <h6 className="mb-4">支付状态</h6>
                                <Field name="status">
                                    {({ field, form }: FieldProps) => (
                                        <>
                                            <Checkbox.Group
                                                vertical
                                                value={values.status}
                                                onChange={(options) =>
                                                    form.setFieldValue(
                                                        field.name,
                                                        options
                                                    )
                                                }
                                            >
                                                <Checkbox
                                                    className="mb-3"
                                                    name={field.name}
                                                    value={0}
                                                >
                                                    已付{' '}
                                                </Checkbox>
                                                <Checkbox
                                                    className="mb-3"
                                                    name={field.name}
                                                    value={1}
                                                >
                                                    退款{' '}
                                                </Checkbox>
                                                <Checkbox
                                                    className="mb-3"
                                                    name={field.name}
                                                    value={2}
                                                >
                                                    未通知{' '}
                                                </Checkbox>
                                            </Checkbox.Group>
                                        </>
                                    )}
                                </Field>
                            </FormItem>
                            <FormItem
                                invalid={
                                    errors.productStatus &&
                                    touched.productStatus
                                }
                                errorMessage={errors.productStatus}
                            >
                                <h6 className="mb-4">备用</h6>
                                <Field name="productStatus">
                                    {({ field, form }: FieldProps) => (
                                        <Radio.Group
                                            vertical
                                            value={values.productStatus}
                                            onChange={(val) =>
                                                form.setFieldValue(
                                                    field.name,
                                                    val
                                                )
                                            }
                                        >
                                            <Radio value={0}>Published</Radio>
                                            <Radio value={1}>Disabled</Radio>
                                            <Radio value={2}>Archive</Radio>
                                        </Radio.Group>
                                    )}
                                </Field>
                            </FormItem>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        )
    }
)

const DrawerFooter = ({ onSaveClick, onCancel }: DrawerFooterProps) => {
    return (
        <div className="text-right w-full">
            <Button size="sm" className="mr-2" onClick={onCancel}>
                Cancel
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

    const openDrawer = () => {
        setIsOpen(true)
    }

    const onDrawerClose = () => {
        setIsOpen(false)
    }

    const formSubmit = () => {
        formikRef.current?.submitForm()
    }

    return (
        <>
            <Button
                size="sm"
                className="block md:inline-block ltr:md:ml-2 rtl:md:mr-2 md:mb-0 mb-4"
                icon={<HiOutlineFunnel />}
                onClick={() => openDrawer()}
            >
                Filter
            </Button>
            <Drawer
                title="Filter"
                isOpen={isOpen}
                width={800}
                footer={
                    <DrawerFooter
                        onCancel={onDrawerClose}
                        onSaveClick={formSubmit}
                    />
                }
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
            >
                <FilterForm ref={formikRef} onSubmitComplete={onDrawerClose} />
            </Drawer>
        </>
    )
}

FilterForm.displayName = 'FilterForm'

export default ProductFilter
