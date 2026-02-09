import { useState, useRef, forwardRef } from 'react'
import { HiOutlineFunnel, HiOutlineMagnifyingGlass } from 'react-icons/hi2'
import { getOrders, useAppDispatch, useAppSelector } from '../store'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { Field, Form, Formik, FormikProps } from 'formik'
import type { MouseEvent } from 'react'

type FormModel = {
    query: string
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
        const tableData = useAppSelector((state) => state.salesOrderList.data.tableData)

        const handleSubmit = (values: FormModel) => {
            onSubmitComplete?.()
            dispatch(
                getOrders({
                    ...tableData,
                    pageIndex: 1,
                    query: values.query,
                })
            )
        }

        return (
            <Formik
                enableReinitialize
                innerRef={ref}
                initialValues={{ query: String(tableData.query || '') }}
                onSubmit={handleSubmit}
            >
                <Form>
                    <FormContainer>
                        <FormItem>
                            <h6 className="mb-4">Keyword</h6>
                            <Field
                                type="text"
                                autoComplete="off"
                                name="query"
                                placeholder="Search by order / merchant"
                                component={Input}
                                prefix={<HiOutlineMagnifyingGlass className="text-lg" />}
                            />
                        </FormItem>
                    </FormContainer>
                </Form>
            </Formik>
        )
    }
)

const DrawerFooter = ({ onSaveClick, onCancel }: DrawerFooterProps) => (
    <div className="text-right w-full">
        <Button size="sm" className="mr-2" onClick={onCancel}>
            Cancel
        </Button>
        <Button size="sm" variant="solid" onClick={onSaveClick}>
            Query
        </Button>
    </div>
)

const OrderFilter = () => {
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
                width={600}
                footer={
                    <DrawerFooter
                        onCancel={() => setIsOpen(false)}
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

export default OrderFilter
