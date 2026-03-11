import { useEffect } from 'react'
import Loading from '@/components/shared/Loading'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import reducer, {
    getChannel,
    getChannelConfig,
    updateChannel,
    setAPIConfig,
    setFeeConfig,
    setLimitConfig,
    hotUpdateCredentials,
    deleteChannel,
    resetChannelData,
    useAppSelector,
    useAppDispatch,
} from './store'
import { injectReducer } from '@/store'
import { useLocation, useNavigate } from 'react-router-dom'

import ChannelForm, { FormModel, OnDeleteCallback, SetSubmitting } from '@/views/channel/ChannelForm'
import isEmpty from 'lodash/isEmpty'
import type { SetFeeConfigRequest } from '@/@types/channel'

injectReducer('channelEdit', reducer)

const majorToMinor = (value?: string) => {
    const numericValue = Number(value || '0')
    if (!Number.isFinite(numericValue)) {
        return '0'
    }

    return String(Math.round(numericValue * 100))
}

const minorToMajor = (value?: string) => {
    const numericValue = Number(value || '0')
    if (!Number.isFinite(numericValue)) {
        return '0.00'
    }

    return (numericValue / 100).toFixed(2)
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

const ChannelEdit = () => {
    const dispatch = useAppDispatch()
    const location = useLocation()
    const navigate = useNavigate()

    const channelData = useAppSelector((state) => state.channelEdit.data.channelData)
    const channelConfig = useAppSelector((state) => state.channelEdit.data.channelConfig)
    const loading = useAppSelector((state) => state.channelEdit.data.loading)
    const configLoading = useAppSelector((state) => state.channelEdit.data.configLoading)

    const fetchData = (channelId: string) => {
        dispatch(getChannel(channelId))
        dispatch(getChannelConfig(channelId))
    }

    const handleFormSubmit = async (values: FormModel, setSubmitting: SetSubmitting) => {
        if (!channelData?.id) return

        setSubmitting(true)
        try {
            await dispatch(
                updateChannel({
                    channelId: channelData.id,
                    updates: {
                        name: values.name,
                        display_name: values.display_name,
                        supported_currencies: values.supported_currencies,
                        supported_payment_methods: values.supported_payment_methods,
                        supported_transaction_types: values.supported_transaction_types,
                    },
                }),
            ).unwrap()

            if ((values.secret_key && values.secret_key.trim()) || (values.certificate && values.certificate.trim())) {
                await dispatch(
                    hotUpdateCredentials({
                        channelId: channelData.id,
                        credentials: {
                            secret_key: values.secret_key || '',
                            certificate: values.certificate || '',
                        },
                    }),
                ).unwrap()
            }

            await dispatch(
                setAPIConfig({
                    channelId: channelData.id,
                    config: {
                        production_endpoint: values.production_endpoint,
                        test_endpoint: values.test_endpoint,
                        timeout: parseInt(values.timeout) || 30,
                        retry_count: parseInt(values.retry_count) || 3,
                        retry_interval: parseInt(values.retry_interval) || 1000,
                        auth_config: {
                            merchant_id: values.merchant_id,
                            app_id: values.app_id,
                        },
                    },
                }),
            ).unwrap()

            await dispatch(
                setFeeConfig({
                    channelId: channelData.id,
                    config: buildFeeConfigPayload(values),
                }),
            ).unwrap()

            await dispatch(
                setLimitConfig({
                    channelId: channelData.id,
                    config: {
                        min_amount: values.min_amount,
                        max_amount: values.max_amount,
                        daily_limit: values.daily_limit,
                    },
                }),
            ).unwrap()

            popNotification('更新')
        } catch (error) {
            toast.push(
                <Notification title="更新失败" type="danger" duration={2500}>
                    渠道更新失败，请重试
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleDiscard = () => {
        navigate('/app/channel')
    }

    const handleDelete = async (setDialogOpen: OnDeleteCallback) => {
        if (!channelData?.id) return

        setDialogOpen(false)
        try {
            await dispatch(deleteChannel(channelData.id)).unwrap()
            popNotification('删除')
        } catch (error) {
            toast.push(
                <Notification title="删除失败" type="danger" duration={2500}>
                    渠道删除失败，请重试
                </Notification>,
                { placement: 'top-center' },
            )
        }
    }

    const popNotification = (keyword: string) => {
        toast.push(
            <Notification title={`${keyword}成功`} type="success" duration={2500}>
                渠道已成功{keyword}
            </Notification>,
            {
                placement: 'top-center',
            },
        )
        navigate('/app/channel')
    }

    useEffect(() => {
        const path = location.pathname.substring(location.pathname.lastIndexOf('/') + 1)
        fetchData(path)

        return () => {
            dispatch(resetChannelData())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname])

    return (
        <>
            <Loading loading={loading || configLoading}>
                {!isEmpty(channelData) && channelData && (
                    <ChannelForm
                        type="edit"
                        initialData={{
                            id: channelData.id,
                            code: channelData.code,
                            name: channelData.name,
                            display_name: channelData.display_name,
                            status: channelData.status,
                            supported_currencies: channelData.supported_currencies,
                            supported_payment_methods: channelData.supported_payment_methods,
                            supported_transaction_types: channelData.supported_transaction_types,
                            production_endpoint: channelConfig?.api_config?.production_endpoint || '',
                            test_endpoint: channelConfig?.api_config?.test_endpoint || '',
                            timeout: channelConfig?.api_config?.timeout?.toString() || '30',
                            retry_count: channelConfig?.api_config?.retry_count?.toString() || '3',
                            retry_interval: channelConfig?.api_config?.retry_interval?.toString() || '1000',
                            merchant_id: channelConfig?.api_config?.auth_config?.merchant_id || '',
                            app_id: channelConfig?.api_config?.auth_config?.app_id || '',
                            secret_key: '',
                            certificate: '',
                            certificateInfo: undefined,
                            fee_mode: channelConfig?.fee_config?.fee_mode || 'BY_TXN_TYPE',
                            unified_percentage_fee: channelConfig?.fee_config?.unified_percentage_fee || '0',
                            unified_fixed_fee: minorToMajor(channelConfig?.fee_config?.unified_fixed_fee),
                            pay_in_percentage_fee: channelConfig?.fee_config?.pay_in_percentage_fee || '0',
                            pay_in_fixed_fee: minorToMajor(channelConfig?.fee_config?.pay_in_fixed_fee),
                            pay_out_percentage_fee: channelConfig?.fee_config?.pay_out_percentage_fee || '0',
                            pay_out_fixed_fee: minorToMajor(channelConfig?.fee_config?.pay_out_fixed_fee),
                            tiered_rules: (channelConfig?.fee_config?.tiered_rules || []).map((rule) => ({
                                ...rule,
                                fixed_fee: minorToMajor(rule.fixed_fee),
                            })),
                            min_amount: channelConfig?.limit_config?.min_amount || '0',
                            max_amount: channelConfig?.limit_config?.max_amount || '0',
                            daily_limit: channelConfig?.limit_config?.daily_limit || '0',
                        }}
                        onFormSubmit={handleFormSubmit}
                        onDiscard={handleDiscard}
                        onDelete={handleDelete}
                    />
                )}
            </Loading>
            {!loading && isEmpty(channelData) && (
                <div className="h-full flex flex-col items-center justify-center">
                    <DoubleSidedImage
                        src="/img/others/img-2.png"
                        darkModeSrc="/img/others/img-2-dark.png"
                        alt="未找到渠道"
                    />
                    <h3 className="mt-8">未找到渠道</h3>
                </div>
            )}
        </>
    )
}

export default ChannelEdit
