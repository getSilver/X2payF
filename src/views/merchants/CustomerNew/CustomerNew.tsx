import PersonalInfoForm, {
    FormModel,
    SetSubmitting,
} from '@/views/merchants/CustomerForm/PersonalInfoForm'
import { FormContainer } from '@/components/ui/Form'
import { Form, Formik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import * as Yup from 'yup'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Button from '@/components/ui/Button'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    apiCreateMerchant,
    apiCreateAgent,
    apiCreateChannelPartner,
} from '@/services/api/AccountApi'
import {
    apiGetPlatformAssociations,
    apiGetPlatformTimezones,
} from '@/services/PlatformSettingsService'
import type { AccountType } from '@/@types/account'
import type { LocationOption } from '@/views/merchants/CustomerForm/PersonalInfoForm'

const CustomerNew = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [locationOptions, setLocationOptions] = useState<LocationOption[]>([])

    const [selectedAccountType, setSelectedAccountType] = useState<
        AccountType | null
    >(
        resolveSelectableAccountType(
            searchParams.get('type')?.toUpperCase() ?? null
        )
    )
    const submitAccountType = useMemo<AccountType>(
        () => selectedAccountType ?? 'MERCHANT',
        [selectedAccountType]
    )

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        location: Yup.string(),
        birthday: Yup.date(),
        agent: Yup.string(),
    })

    const initialValues: FormModel = {
        upload: '',
        name: '',
        agent: '',
        email: '',
        location: '',
        birthday: new Date(),
        tags: [],
    }

    useEffect(() => {
        const fetchAssociations = async () => {
            try {
                const [associationsResponse, timezonesResponse] =
                    await Promise.all([
                        apiGetPlatformAssociations<Association[]>(),
                        apiGetPlatformTimezones<Timezone[]>(),
                    ])
                const timezones = timezonesResponse.data || []
                const associations = associationsResponse.data || []
                const timezoneMap = new Map(
                    timezones
                        .filter((timezone) => Boolean(timezone.id))
                        .map((timezone) => [timezone.id as string, timezone])
                )
                const options = associations
                    .filter((association) =>
                        isActive(
                            association.status ?? association.enabled ?? false
                        )
                    )
                    .map((association) => {
                        const timezoneId =
                            association.timezone_id ||
                            association.timezoneId ||
                            ''
                        const timezone = timezoneMap.get(timezoneId)
                        const label = [timezone?.name, timezone?.offset]
                            .filter(Boolean)
                            .join(' ')
                        return {
                            value: timezoneId,
                            label: label || timezoneId || 'Unknown',
                        }
                    })
                    .filter((option) => option.value)
                setLocationOptions(options)
            } catch (error) {
                console.error('Failed to load associations:', error)
                setLocationOptions([])
            }
        }

        fetchAssociations()
    }, [])

    const createAccount = async (type: AccountType, data: any) => {
        switch (type) {
            case 'MERCHANT':
                return apiCreateMerchant(data)
            case 'AGENT':
                return apiCreateAgent(data)
            case 'CHANNEL_PARTNER':
                return apiCreateChannelPartner(data)
            default:
                throw new Error(`Unsupported account type: ${type}`)
        }
    }

    const addCustomer = async (data: FormModel) => {
        const response = await createAccount(submitAccountType, data)
        return response.data
    }

    const handleFormSubmit = async (
        values: FormModel,
        { setSubmitting }: { setSubmitting: SetSubmitting }
    ) => {
        setSubmitting(true)
        try {
            const payload = {
                ...values,
                birthday: new Date(),
            }
            const newCustomer = await addCustomer(payload)
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
                                locationOptions={locationOptions}
                            />
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    Account Type (default Merchant)
                                </span>
                                <Button
                                    size="sm"
                                    variant={
                                        selectedAccountType === 'AGENT'
                                            ? 'solid'
                                            : 'plain'
                                    }
                                    type="button"
                                    onClick={() =>
                                        setSelectedAccountType(
                                            selectedAccountType === 'AGENT'
                                                ? null
                                                : 'AGENT'
                                        )
                                    }
                                >
                                    AGENT
                                </Button>
                                <Button
                                    size="sm"
                                    variant={
                                        selectedAccountType ===
                                        'CHANNEL_PARTNER'
                                            ? 'solid'
                                            : 'plain'
                                    }
                                    type="button"
                                    onClick={() =>
                                        setSelectedAccountType(
                                            selectedAccountType ===
                                                'CHANNEL_PARTNER'
                                                ? null
                                                : 'CHANNEL_PARTNER'
                                        )
                                    }
                                >
                                    CHANNEL_PARTNER
                                </Button>
                            </div>
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

const resolveSelectableAccountType = (
    value: string | null
): AccountType | null => {
    switch (value) {
        case 'AGENT':
        case 'CHANNEL_PARTNER':
            return value
        default:
            return null
    }
}

type Timezone = {
    id?: string
    name?: string
    offset?: string
    status?: string
    enabled?: boolean
    is_active?: boolean
}

type Association = {
    id?: string
    timezone_id?: string
    timezoneId?: string
    status?: string
    enabled?: boolean
}

const isActive = (value?: string | boolean) =>
    value === true ||
    value === 'active' ||
    value === 'enabled' ||
    value === 'on'

export default CustomerNew
