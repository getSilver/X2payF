import PersonalInfoForm, {
    FormModel,
    SetSubmitting,
} from '@/views/merchants/CustomerForm/PersonalInfoForm'
import { FormContainer } from '@/components/ui/Form'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Button from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { apiCreateCrmCustomer } from '@/services/CrmService'
import type { Customer } from '@/views/merchants/Customers/store'

const CustomerNew = () => {
    const navigate = useNavigate()

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        location: Yup.string(),
        phoneNumber: Yup.string().matches(
            /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/,
            'Phone number is not valid'
        ),
        birthday: Yup.date(),
        agent: Yup.string(),
    })

    const initialValues: FormModel = {
        upload: '',
        name: '',
        agent: '',
        email: '',
        location: '',
        phoneNumber: '',
        birthday: new Date(),
        tags: [],
    }

    const addCustomer = async (data: FormModel) => {
        const response = await apiCreateCrmCustomer<Customer, FormModel>(data)
        return response.data
    }

    const handleFormSubmit = async (
        values: FormModel,
        { setSubmitting }: { setSubmitting: SetSubmitting }
    ) => {
        setSubmitting(true)
        try {
            const newCustomer = await addCustomer(values)
            if (newCustomer && newCustomer.id) {
                toast.push(
                    <Notification
                        title={'Successfully added'}
                        type="success"
                        duration={2500}
                    >
                        Customer successfully added
                    </Notification>,
                    {
                        placement: 'top-center',
                    }
                )
                navigate(`/app/merchants/mer-details?id=${newCustomer.id}`)
            }
        } catch (error) {
            console.error('Error creating customer:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDiscard = () => {
        navigate('/app/merchants/mgmt')
    }

    return (
        <div className="flex flex-col gap-4">
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleFormSubmit}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <PersonalInfoForm
                                touched={touched}
                                errors={errors}
                            />
                            <div className="mt-6 flex justify-end gap-3">
                                <Button
                                    size="sm"
                                    variant="plain"
                                    type="button"
                                    onClick={handleDiscard}
                                >
                                    Discard
                                </Button>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    type="submit"
                                    loading={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Customer'}
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default CustomerNew
