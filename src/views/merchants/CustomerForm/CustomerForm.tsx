import { forwardRef } from 'react'
import Tabs from '@/components/ui/Tabs'
import { FormContainer } from '@/components/ui/Form'
import { Form, Formik, FormikProps } from 'formik'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import * as Yup from 'yup'
import PersonalInfoForm from './PersonalInfoForm'
import SocialLinkForm from './SocialLinkForm'

type BaseCustomerInfo = {
    name: string
    email: string
    img: string
}

type CustomerPersonalInfo = {
    location: string
    title: string
    birthday: string
    facebook: string
    twitter: string
    pinterest: string
    linkedIn: string
    agent: string
}

export type Customer = BaseCustomerInfo & CustomerPersonalInfo

export interface FormModel extends Omit<Customer, 'birthday'> {
    birthday: Date
}

export type FormikRef = FormikProps<FormModel>

export type CustomerProps = Partial<
    BaseCustomerInfo & { personalInfo: CustomerPersonalInfo }
>

type CustomerFormProps = {
    customer: CustomerProps
    onFormSubmit: (values: FormModel) => void
}

dayjs.extend(customParseFormat)

const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email Required'),
    name: Yup.string().required('User Name Required'),
    location: Yup.string(),
    title: Yup.string(),
    birthday: Yup.string(),
    facebook: Yup.string(),
    twitter: Yup.string(),
    pinterest: Yup.string(),
    linkedIn: Yup.string(),
    img: Yup.string(),
    agent: Yup.string(),
})

const { TabNav, TabList, TabContent } = Tabs

const CustomerForm = forwardRef<FormikRef, CustomerFormProps>((props, ref) => {
    const { customer, onFormSubmit } = props

    return (
        <Formik<FormModel>
            innerRef={ref}
            initialValues={{
                name: customer.name || '',
                email: customer.email || '',
                img: customer.img || '',
                location: customer?.personalInfo?.location || '',
                title: customer?.personalInfo?.title || '',
                birthday: customer?.personalInfo?.birthday
                    ? dayjs(customer.personalInfo.birthday, 'DD/MM/YYYY').toDate()
                    : new Date(),
                facebook: customer?.personalInfo?.facebook || '',
                twitter: customer?.personalInfo?.twitter || '',
                pinterest: customer?.personalInfo?.pinterest || '',
                linkedIn: customer?.personalInfo?.linkedIn || '',
                agent: customer?.personalInfo?.agent || '',
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
                onFormSubmit?.(values)
                setSubmitting(false)
            }}
        >
            {({ touched, errors }) => (
                <Form>
                    <FormContainer>
                        <Tabs defaultValue="personalInfo">
                            <TabList>
                                <TabNav value="personalInfo">
                                    Personal Info
                                </TabNav>
                                <TabNav value="social">Social</TabNav>
                            </TabList>
                            <div className="p-6">
                                <TabContent value="personalInfo">
                                    <PersonalInfoForm
                                        touched={touched}
                                        errors={errors}
                                    />
                                </TabContent>
                                <TabContent value="social">
                                    <SocialLinkForm
                                        touched={touched}
                                        errors={errors}
                                    />
                                </TabContent>
                            </div>
                        </Tabs>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
})

CustomerForm.displayName = 'CustomerForm'

export default CustomerForm
