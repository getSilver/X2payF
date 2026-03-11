import PersonalInfoForm, {
    FormModel,
    SetSubmitting,
} from '@/views/merchants/CustomerForm/PersonalInfoForm'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import { Form, Formik, Field } from 'formik'
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
} from '@/services/PlatformSettingsService'
import createUID from '@/components/ui/utils/createUid'
import type { AccountType } from '@/@types/account'
import type { LocationOption } from '@/views/merchants/CustomerForm/PersonalInfoForm'
import { HiLockClosed } from 'react-icons/hi2'

// 扩展表单类型，添加密码字段
type ExtendedFormModel = FormModel & {
    password: string
}

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
        name: Yup.string().min(3, 'Username must be at least 3 characters').required('Name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        location: Yup.string(),
        birthday: Yup.date(),
        agent: Yup.string(),
    })

    const initialValues: ExtendedFormModel = {
        upload: '',
        name: '',
        agent: '',
        email: '',
        location: '',
        birthday: new Date(),
        tags: [],
        password: '',
    }

    useEffect(() => {
        const fetchAssociations = async () => {
            try {
                // 获取币种时区关联数据作为位置选项
                const response = await apiGetPlatformAssociations<
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    any,
                    Record<string, unknown>
                >()
                // 后端返回格式: { code, message, data: [...] }
                const responseData = response.data
                const associations = responseData?.data || responseData || []
                const options = associations
                    .filter((assoc: { id?: string; status?: string }) => 
                        assoc.id && assoc.status === 'active'
                    )
                    .map((assoc: { 
                        id: string; 
                        currency?: { code?: string; name?: string }; 
                        timezone?: { code?: string; name?: string; offset?: string } 
                    }) => ({
                        value: assoc.timezone?.code || '',
                        label: [
                            assoc.currency?.code || assoc.currency?.name,
                            assoc.timezone?.code ||
                                assoc.timezone?.name ||
                                assoc.timezone?.offset
                        ].filter(Boolean).join(' - ') || assoc.id,
                    }))
                    .filter((option: { value: string }) => option.value !== '')
                setLocationOptions(options)
            } catch (error) {
                console.error('Failed to load associations:', error)
                setLocationOptions([])
            }
        }

        fetchAssociations()
    }, [])

    const createAccount = async (type: AccountType, data: ExtendedFormModel) => {
        const requestId = createUID(16)
        
        switch (type) {
            case 'MERCHANT':
                return apiCreateMerchant({
                    request_id: requestId,
                    name: data.name,
                    username: data.name,
                    password: data.password,
                    email: data.email,
                })
            case 'AGENT':
                return apiCreateAgent({
                    request_id: requestId,
                    username: data.name,
                    password: data.password,
                    email: data.email,
                    name: data.name,
                })
            case 'CHANNEL_PARTNER':
                return apiCreateChannelPartner({
                    request_id: requestId,
                    username: data.name,
                    password: data.password,
                    email: data.email,
                    name: data.name,
                    profit_share_rate: 0.03,
                    fee_rate: 0.015,
                    supported_currencies: ['CNY', 'USD'],
                })
            default:
                throw new Error(`Unsupported account type: ${type}`)
        }
    }

    const addCustomer = async (data: ExtendedFormModel) => {
        const response = await createAccount(submitAccountType, data)
        return response.data
    }

    const handleFormSubmit = async (
        values: ExtendedFormModel,
        { setSubmitting }: { setSubmitting: SetSubmitting }
    ) => {
        setSubmitting(true)
        try {
            const payload = {
                ...values,
                birthday: new Date(),
            }
            const newCustomer = await addCustomer(payload)
            if (newCustomer) {
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
                const merchantId = (newCustomer as { merchant_id?: string; id?: string }).merchant_id 
                    || (newCustomer as { id?: string }).id
                if (merchantId) {
                    navigate(`/app/merchants/mer-details?id=${merchantId}`)
                } else {
                    navigate('/app/merchants/mgmt')
                }
            }
        } catch (error) {
            console.error('Error creating customer:', error)
            toast.push(
                <Notification title={'Error'} type="danger">
                    Failed to create customer
                </Notification>,
                { placement: 'top-center' }
            )
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
                            {/* Password field */}
                            <FormItem
                                label="Password"
                                invalid={!!(errors.password && touched.password)}
                                errorMessage={errors.password}
                            >
                                <Field
                                    type="password"
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                    component={Input}
                                    prefix={<HiLockClosed className="text-xl" />}
                                />
                            </FormItem>
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

export default CustomerNew
