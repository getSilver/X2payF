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

import ChannelForm, {
    FormModel,
    SetSubmitting,
    OnDeleteCallback,
} from '@/views/channel/ChannelForm'
import isEmpty from 'lodash/isEmpty'

injectReducer('channelEdit', reducer)

const ChannelEdit = () => {
    const dispatch = useAppDispatch()
    const location = useLocation()
    const navigate = useNavigate()

    const channelData = useAppSelector(
        (state) => state.channelEdit.data.channelData
    )
    const channelConfig = useAppSelector(
        (state) => state.channelEdit.data.channelConfig
    )
    const loading = useAppSelector(
        (state) => state.channelEdit.data.loading
    )
    const configLoading = useAppSelector(
        (state) => state.channelEdit.data.configLoading
    )

    const fetchData = (channelId: string) => {
        dispatch(getChannel(channelId))
        dispatch(getChannelConfig(channelId))
    }

    const handleFormSubmit = async (
        values: FormModel,
        setSubmitting: SetSubmitting
    ) => {
        if (!channelData?.id) return
        
        setSubmitting(true)
        try {
            // 1. 更新渠道基本信息
            await dispatch(updateChannel({
                channelId: channelData.id,
                updates: {
                    name: values.name,
                    display_name: values.display_name,
                    supported_currencies: values.supported_currencies,
                    supported_payment_methods: values.supported_payment_methods,
                    supported_transaction_types: values.supported_transaction_types,
                }
            })).unwrap()
            
            // 2. 更新 API 配置
            // 编辑模式：如果用户输入了新密钥或证书，使用热更新接口；否则使用普通配置接口
            if ((values.secret_key && values.secret_key.trim()) || (values.certificate && values.certificate.trim())) {
                // 用户输入了新密钥或证书，使用热更新凭据接口（立即生效）
                await dispatch(hotUpdateCredentials({
                    channelId: channelData.id,
                    credentials: {
                        secret_key: values.secret_key || '',
                        certificate: values.certificate || '',
                    }
                })).unwrap()
            }
            
            // 更新其他 API 配置（端点、超时等）
            await dispatch(setAPIConfig({
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
                        secret_key: '', // 密钥已通过热更新接口更新，这里传空
                    },
                }
            })).unwrap()
            
            // 3. 更新费率配置（区分 Pay_In 和 Pay_Out）
            await dispatch(setFeeConfig({
                channelId: channelData.id,
                config: {
                    pay_in_percentage_fee: values.pay_in_percentage_fee,
                    pay_in_fixed_fee: values.pay_in_fixed_fee,
                    pay_out_percentage_fee: values.pay_out_percentage_fee,
                    pay_out_fixed_fee: values.pay_out_fixed_fee,
                }
            })).unwrap()
            
            // 4. 更新限额配置
            await dispatch(setLimitConfig({
                channelId: channelData.id,
                config: {
                    min_amount: values.min_amount,
                    max_amount: values.max_amount,
                    daily_limit: values.daily_limit,
                }
            })).unwrap()
            
            popNotification('更新')
        } catch (error) {
            console.error('更新渠道失败:', error)
            toast.push(
                <Notification title="更新失败" type="danger" duration={2500}>
                    渠道更新失败，请重试
                </Notification>,
                { placement: 'top-center' }
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
                { placement: 'top-center' }
            )
        }
    }

    const popNotification = (keyword: string) => {
        toast.push(
            <Notification
                title={`${keyword}成功`}
                type="success"
                duration={2500}
            >
                渠道已成功{keyword}
            </Notification>,
            {
                placement: 'top-center',
            }
        )
        navigate('/app/channel')
    }

    useEffect(() => {
        const path = location.pathname.substring(
            location.pathname.lastIndexOf('/') + 1
        )
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
                            // API 配置
                            production_endpoint: channelConfig?.api_config?.production_endpoint || '',
                            test_endpoint: channelConfig?.api_config?.test_endpoint || '',
                            timeout: channelConfig?.api_config?.timeout?.toString() || '30',
                            retry_count: channelConfig?.api_config?.retry_count?.toString() || '3',
                            retry_interval: channelConfig?.api_config?.retry_interval?.toString() || '1000',
                            merchant_id: channelConfig?.api_config?.auth_config?.merchant_id || '',
                            app_id: channelConfig?.api_config?.auth_config?.app_id || '',
                            secret_key: '', // 密钥不从后端返回，编辑时需要重新输入
                            certificate: '', // 证书不从后端返回，编辑时需要重新上传
                            certificateInfo: undefined,
                            // Pay_In 费率配置
                            pay_in_percentage_fee: channelConfig?.fee_config?.pay_in_percentage_fee || '0',
                            pay_in_fixed_fee: channelConfig?.fee_config?.pay_in_fixed_fee || '0',
                            // Pay_Out 费率配置
                            pay_out_percentage_fee: channelConfig?.fee_config?.pay_out_percentage_fee || '0',
                            pay_out_fixed_fee: channelConfig?.fee_config?.pay_out_fixed_fee || '0',
                            // 限额配置
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
