import { useState, useRef, forwardRef } from 'react'
import { HiOutlineFilter, HiOutlineSearch } from 'react-icons/hi'
import {
    getChannels,
    setFilterData,
    useAppDispatch,
    useAppSelector,
} from '../store'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { Field, Form, Formik, FormikProps } from 'formik'
import type { MouseEvent } from 'react'
import type { ChannelStatus } from '@/@types/channel'

type FormModel = {
    name: string
    status: ChannelStatus[]
    currency: string
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

        const filterData = useAppSelector((state) => state.channelList.data.filterData)

        const handleSubmit = (values: FormModel) => {
            onSubmitComplete?.()
            dispatch(setFilterData(values))
            dispatch(
                getChannels({
                    currency: values.currency || undefined,
                })
            )
        }

        return (
            <Formik enableReinitialize innerRef={ref} initialValues={filterData} onSubmit={handleSubmit}>
                <Form>
                    <FormContainer>
                        <FormItem>
                            <h6 className="mb-4">Keyword</h6>
                            <Field
                                type="text"
                                autoComplete="off"
                                name="name"
                                placeholder="Channel name"
                                component={Input}
                                prefix={<HiOutlineSearch className="text-lg" />}
                            />
                        </FormItem>
                        <FormItem>
                            <h6 className="mb-4">Currency</h6>
                            <Field
                                type="text"
                                autoComplete="off"
                                name="currency"
                                placeholder="Currency code (e.g. USD)"
                                component={Input}
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

const ChannelFilter = () => {
    const formikRef = useRef<FormikProps<FormModel>>(null)
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button
                size="sm"
                className="block md:inline-block ltr:md:ml-2 rtl:md:mr-2 md:mb-0 mb-4"
                icon={<HiOutlineFilter />}
                onClick={() => setIsOpen(true)}
            >
                Filter
            </Button>
            <Drawer
                title="Filter"
                isOpen={isOpen}
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

export default ChannelFilter
