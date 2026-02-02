import ChannelForm, {
    FormModel,
    SetSubmitting,
} from '@/views/channel/ChannelForm'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useNavigate } from 'react-router-dom'
import { apiCreateChannel, apiSetAPIConfig, apiSetFeeConfig, apiSetLimitConfig } from '@/services/api/ChannelApi'

const ChannelNew = () => {
    const navigate = useNavigate()

    const handleFormSubmit = async (
        values: FormModel,
        setSubmitting: SetSubmitting
    ) => {
        setSubmitting(true)
        try {
            // 1. 创建渠道
            const response = await apiCreateChannel({
                code: values.code,
                name: values.name,
                display_name: values.display_name,
                supported_currencies: values.supported_currencies,
                supported_payment_methods: values.supported_payment_methods,
                supported_transaction_types: values.supported_transaction_types,
            })
            
            // 后端返回格式: { code, message, request_id, data: { id, ... } }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const responseData = response.data as any
            const channelId = responseData.data?.id || responseData.id
            
            if (!channelId) {
                console.error('创建渠道响应中没有 channelId:', responseData)
                throw new Error('创建渠道失败：未获取到渠道ID')
            }
            
            // 2. 设置 API 配置
            await apiSetAPIConfig(channelId, {
                production_endpoint: values.production_endpoint,
                test_endpoint: values.test_endpoint,
                timeout: parseInt(values.timeout) || 30,
                retry_count: parseInt(values.retry_count) || 3,
                retry_interval: parseInt(values.retry_interval) || 1000,
                auth_config: {
                    merchant_id: values.merchant_id,
                    app_id: values.app_id,
                    secret_key: values.secret_key,
                    certificate: values.certificate || '', // 包含证书
                },
            })
            
            // 3. 设置费率配置（区分 Pay_In 和 Pay_Out）
            await apiSetFeeConfig(channelId, {
                pay_in_percentage_fee: values.pay_in_percentage_fee,
                pay_in_fixed_fee: values.pay_in_fixed_fee,
                pay_out_percentage_fee: values.pay_out_percentage_fee,
                pay_out_fixed_fee: values.pay_out_fixed_fee,
            })
            
            // 4. 设置限额配置
            await apiSetLimitConfig(channelId, {
                min_amount: values.min_amount,
                max_amount: values.max_amount,
                daily_limit: values.daily_limit,
            })
            
            toast.push(
                <Notification
                    title="创建成功"
                    type="success"
                    duration={2500}
                >
                    渠道已成功创建
                </Notification>,
                {
                    placement: 'top-center',
                }
            )
            navigate('/app/channel')
        } catch (error) {
            toast.push(
                <Notification
                    title="创建失败"
                    type="danger"
                    duration={2500}
                >
                    渠道创建失败，请重试
                </Notification>,
                {
                    placement: 'top-center',
                }
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
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default ChannelNew
