import { useEffect } from 'react'
import Loading from '@/components/shared/Loading'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import reducer, {
    getChannelEditDetail,
    getChannelAdapters,
    updateChannel,
    updateChannelAdapterBinding,
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

    const channelDetail = useAppSelector((state) => state.channelEdit.data.channelDetail)
    const adapterOptions = useAppSelector((state) => state.channelEdit.data.adapterOptions)
    const loading = useAppSelector((state) => state.channelEdit.data.loading)

    const fetchData = (channelId: string) => {
        dispatch(getChannelEditDetail(channelId))
        dispatch(getChannelAdapters())
    }

    const handleFormSubmit = async (values: FormModel, setSubmitting: SetSubmitting) => {
        if (!channelDetail?.id) return

        setSubmitting(true)
        try {
            await dispatch(
                updateChannel({
                    channelId: channelDetail.id,
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
                        channelId: channelDetail.id,
                        credentials: {
                            secret_key: values.secret_key || '',
                            certificate: values.certificate || '',
                        },
                    }),
                ).unwrap()
            }

            await dispatch(
                setAPIConfig({
                    channelId: channelDetail.id,
                    config: {
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
                    },
                }),
            ).unwrap()

            await dispatch(
                setFeeConfig({
                    channelId: channelDetail.id,
                    config: buildFeeConfigPayload(values),
                }),
            ).unwrap()

            await dispatch(
                setLimitConfig({
                    channelId: channelDetail.id,
                    config: {
                        min_amount: values.min_amount,
                        max_amount: values.max_amount,
                        daily_limit: values.daily_limit,
                    },
                }),
            ).unwrap()

            if (
                values.adapter_key.trim() &&
                values.protocol_version.trim() &&
                values.adapter_binding_status
            ) {
                await dispatch(
                    updateChannelAdapterBinding({
                        channelId: channelDetail.id,
                        binding: {
                            adapter_key: values.adapter_key,
                            protocol_version: values.protocol_version,
                            status: values.adapter_binding_status,
                        },
                    }),
                ).unwrap()
            }

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
        if (!channelDetail?.id) return

        setDialogOpen(false)
        try {
            await dispatch(deleteChannel(channelDetail.id)).unwrap()
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
            <Loading loading={loading}>
                {channelDetail && (
                    <ChannelForm
                        type="edit"
                        initialData={{
                            id: channelDetail.id,
                            code: channelDetail.code,
                            name: channelDetail.name,
                            display_name: channelDetail.display_name,
                            status: channelDetail.status,
                            supported_currencies: channelDetail.supported_currencies,
                            supported_payment_methods: channelDetail.supported_payment_methods,
                            supported_transaction_types: channelDetail.supported_transaction_types,
                            production_endpoint: channelDetail.api_config?.production_endpoint || '',
                            test_endpoint: channelDetail.api_config?.test_endpoint || '',
                            timeout: channelDetail.api_config?.timeout?.toString() || '30',
                            retry_count: channelDetail.api_config?.retry_count?.toString() || '3',
                            retry_interval: channelDetail.api_config?.retry_interval?.toString() || '1000',
                            merchant_id: channelDetail.api_config?.auth_config?.merchant_id || '',
                            app_id: channelDetail.api_config?.auth_config?.app_id || '',
                            sign_type: channelDetail.api_config?.auth_config?.sign_type || '',
                            adapter_config: channelDetail.api_config?.adapter_config || '',
                            secret_key: '',
                            has_secret_key: channelDetail.api_config?.auth_config?.has_secret_key || false,
                            certificate: '',
                            has_certificate: channelDetail.api_config?.auth_config?.has_certificate || false,
                            adapter_key: channelDetail.adapter_binding?.adapter_key || '',
                            protocol_version: channelDetail.adapter_binding?.protocol_version || '',
                            adapter_binding_status: channelDetail.adapter_binding?.status || '',
                            certificateInfo: undefined,
                            fee_mode: channelDetail.fee_config?.fee_mode || 'BY_TXN_TYPE',
                            unified_percentage_fee: channelDetail.fee_config?.unified_percentage_fee || '0',
                            unified_fixed_fee: minorToMajor(channelDetail.fee_config?.unified_fixed_fee),
                            pay_in_percentage_fee: channelDetail.fee_config?.pay_in_percentage_fee || '0',
                            pay_in_fixed_fee: minorToMajor(channelDetail.fee_config?.pay_in_fixed_fee),
                            pay_out_percentage_fee: channelDetail.fee_config?.pay_out_percentage_fee || '0',
                            pay_out_fixed_fee: minorToMajor(channelDetail.fee_config?.pay_out_fixed_fee),
                            tiered_rules: (channelDetail.fee_config?.tiered_rules || []).map((rule) => ({
                                ...rule,
                                fixed_fee: minorToMajor(rule.fixed_fee),
                            })),
                            min_amount: channelDetail.limit_config?.min_amount || '0',
                            max_amount: channelDetail.limit_config?.max_amount || '0',
                            daily_limit: channelDetail.limit_config?.daily_limit || '0',
                        }}
                        adapterOptions={adapterOptions}
                        onFormSubmit={handleFormSubmit}
                        onDiscard={handleDiscard}
                        onDelete={handleDelete}
                    />
                )}
            </Loading>
            {!loading && !channelDetail && (
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
