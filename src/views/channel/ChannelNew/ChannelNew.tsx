import ChannelForm, { FormModel, SetSubmitting } from '@/views/channel/ChannelForm'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useNavigate } from 'react-router-dom'
import {
    apiCreateChannel,
    apiGetChannelAdapters,
    apiHotUpdateCredentials,
    apiSetAPIConfig,
    apiUpdateChannelAdapterBinding,
    apiSetFeeConfig,
    apiSetLimitConfig,
} from '@/services/api/ChannelApi'
import type { ChannelAdapterInfo, SetFeeConfigRequest } from '@/@types/channel'
import { useEffect, useState } from 'react'

const majorToMinor = (value?: string) => {
    const numericValue = Number(value || '0')
    if (!Number.isFinite(numericValue)) {
        return '0'
    }

    return String(Math.round(numericValue * 100))
}

const buildFeeConfigPayload = (values: FormModel): SetFeeConfigRequest => {
    const base: SetFeeConfigRequest = {
        fee_mode: values.fee_mode,
    }

    if (values.fee_mode === 'UNIFIED') {
        return {
            ...base,
            unified_percentage_fee: values.unified_percentage_fee,
            unified_fixed_fee: majorToMinor(values.unified_fixed_fee),
        }
    }

    if (values.fee_mode === 'TIERED') {
        return {
            ...base,
            tiered_rules: (values.tiered_rules || []).map((rule) => ({
                ...rule,
                fixed_fee: majorToMinor(rule.fixed_fee),
            })),
        }
    }

    return {
        ...base,
        pay_in_percentage_fee: values.pay_in_percentage_fee,
        pay_in_fixed_fee: majorToMinor(values.pay_in_fixed_fee),
        pay_out_percentage_fee: values.pay_out_percentage_fee,
        pay_out_fixed_fee: majorToMinor(values.pay_out_fixed_fee),
    }
}

const ChannelNew = () => {
    const navigate = useNavigate()
    const [adapterOptions, setAdapterOptions] = useState<ChannelAdapterInfo[]>([])

    useEffect(() => {
        const loadAdapters = async () => {
            try {
                const response = await apiGetChannelAdapters()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const responseData = response.data as any
                setAdapterOptions(responseData.data || responseData || [])
            } catch (error) {
                setAdapterOptions([])
            }
        }

        loadAdapters()
    }, [])

    const handleFormSubmit = async (values: FormModel, setSubmitting: SetSubmitting) => {
        setSubmitting(true)
        try {
            const response = await apiCreateChannel({
                code: values.code,
                name: values.name,
                display_name: values.display_name,
                supported_currencies: values.supported_currencies,
                supported_payment_methods: values.supported_payment_methods,
                supported_transaction_types: values.supported_transaction_types,
            })

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const responseData = response.data as any
            const channelId = responseData.data?.id || responseData.id

            if (!channelId) {
                throw new Error('创建渠道失败：未获取到渠道ID')
            }

            await apiSetAPIConfig(channelId, {
                production_endpoint: values.production_endpoint,
                test_endpoint: values.test_endpoint,
                timeout: parseInt(values.timeout) || 30,
                retry_count: parseInt(values.retry_count) || 3,
                retry_interval: parseInt(values.retry_interval) || 1000,
                adapter_config: values.adapter_config,
                auth_config: {
                    merchant_id: values.merchant_id,
                    app_id: values.app_id,
                    sign_type: values.sign_type || undefined,
                },
            })

            if ((values.secret_key && values.secret_key.trim()) || (values.certificate && values.certificate.trim())) {
                await apiHotUpdateCredentials(channelId, {
                    secret_key: values.secret_key || '',
                    certificate: values.certificate || '',
                })
            }

            await apiSetFeeConfig(channelId, buildFeeConfigPayload(values))

            await apiSetLimitConfig(channelId, {
                min_amount: values.min_amount,
                max_amount: values.max_amount,
                daily_limit: values.daily_limit,
            })

            if (
                values.adapter_key.trim() &&
                values.protocol_version.trim() &&
                values.adapter_binding_status
            ) {
                await apiUpdateChannelAdapterBinding(channelId, {
                    adapter_key: values.adapter_key,
                    protocol_version: values.protocol_version,
                    status: values.adapter_binding_status,
                })
            }

            toast.push(
                <Notification title="创建成功" type="success" duration={2500}>
                    渠道已成功创建
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
            navigate('/app/channel')
        } catch (error) {
            toast.push(
                <Notification title="创建失败" type="danger" duration={2500}>
                    渠道创建失败，请重试
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleDiscard = () => {
        navigate('/app/channel')
    }

    return (
        <ChannelForm
            type="new"
            adapterOptions={adapterOptions}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default ChannelNew
