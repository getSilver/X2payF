import { forwardRef, useEffect, useState } from 'react'
import Tabs from '@/components/ui/Tabs'
import { FormContainer } from '@/components/ui/Form'
import { Form, Formik, FormikProps } from 'formik'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import * as Yup from 'yup'
import PersonalInfoForm from './PersonalInfoForm'
import SocialLinkForm from './SocialLinkForm'
import { apiGetPlatformAssociations } from '@/services/PlatformSettingsService'
import type { LocationOption } from './PersonalInfoForm'

type BaseCustomerInfo = {
    name: string
    email: string
    img: string
}

type CustomerPersonalInfo = {
    location: string
    title: string
    birthday: string
    withdrawal_address: string
    withdrawal_fee_percent: string
    ip_whitelist: string
    cashier_return_url_whitelist: string
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
    withdrawal_address: Yup.string(),
    withdrawal_fee_percent: Yup.string(),
    ip_whitelist: Yup.string(),
    cashier_return_url_whitelist: Yup.string(),
    img: Yup.string(),
    agent: Yup.string(),
})

const { TabNav, TabList, TabContent } = Tabs

const CustomerForm = forwardRef<FormikRef, CustomerFormProps>((props, ref) => {
    const { customer, onFormSubmit } = props
    const [locationOptions, setLocationOptions] = useState<LocationOption[]>([])

    useEffect(() => {
        const fetchAssociations = async () => {
            try {
                const response = await apiGetPlatformAssociations<
                    { data?: Array<Record<string, unknown>> } | Array<Record<string, unknown>>,
                    Record<string, unknown>
                >()
                const responseData = response.data as
                    | { data?: Array<Record<string, unknown>> }
                    | Array<Record<string, unknown>>
                const associations = Array.isArray(responseData)
                    ? responseData
                    : responseData?.data || []
                const options = associations
                    .filter((assoc) => Boolean(assoc.id))
                    .map((assoc) => {
                        const currency = assoc.currency as
                            | { code?: string; name?: string }
                            | undefined
                        const timezone = assoc.timezone as
                            | { code?: string; name?: string; offset?: string }
                            | undefined
                        const timezoneValue = timezone?.code || ''
                        return {
                            value: timezoneValue,
                            label:
                                currency?.code ||
                                currency?.name ||
                                timezoneValue ||
                                String(assoc.id),
                        }
                    })
                    .filter((option) => option.value !== '')
                setLocationOptions(options)
            } catch (error) {
                console.error('Failed to load currency associations:', error)
                setLocationOptions([])
            }
        }
        fetchAssociations()
    }, [])

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
                withdrawal_address:
                    customer?.personalInfo?.withdrawal_address || '',
                withdrawal_fee_percent:
                    customer?.personalInfo?.withdrawal_fee_percent || '0',
                ip_whitelist: customer?.personalInfo?.ip_whitelist || '',
                cashier_return_url_whitelist:
                    customer?.personalInfo?.cashier_return_url_whitelist || '',
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
                                        locationOptions={locationOptions}
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
