import * as Yup from 'yup'

type ValidationSchemaType = 'edit' | 'new'
type FeeMode = 'UNIFIED' | 'BY_TXN_TYPE' | 'TIERED'
type AdapterBindingStatus = 'enabled' | 'disabled' | 'test'

type AdapterBindingFormValues = {
    adapter_key?: string
    protocol_version?: string
    adapter_binding_status?: AdapterBindingStatus | ''
    has_existing_adapter_binding?: boolean
}

const requiredByMode = (mode: FeeMode | FeeMode[]) =>
    Yup.string().when('fee_mode', {
        is: (currentMode: FeeMode) =>
            Array.isArray(mode) ? mode.includes(currentMode) : currentMode === mode,
        then: (schema) => schema.required('必填'),
        otherwise: (schema) => schema.notRequired(),
    })

const hasAdapterBindingValues = (values: AdapterBindingFormValues) =>
    values.has_existing_adapter_binding ||
    Boolean(
        values.adapter_key?.trim() ||
            values.protocol_version?.trim() ||
            values.adapter_binding_status,
    )

const requireAdapterBindingField = (message: string) =>
    Yup.string().test({
        name: 'adapter-binding-field-required',
        message,
        test(value) {
            if (!hasAdapterBindingValues(this.parent as AdapterBindingFormValues)) {
                return true
            }

            return Boolean(value?.trim())
        },
    })

export const getChannelValidationSchema = (type: ValidationSchemaType) =>
    Yup.object({
        code: Yup.string()
            .required('渠道代码必填')
            .min(2, '渠道代码至少2个字符')
            .max(32, '渠道代码最多32个字符'),
        name: Yup.string().required('渠道名称必填').max(100, '渠道名称最多100个字符'),
        display_name: Yup.string()
            .required('显示名称必填')
            .max(100, '显示名称最多100个字符'),
        supported_currencies: Yup.array().min(1, '至少选择一种币种').required('支持币种必填'),
        supported_payment_methods: Yup.array()
            .min(1, '至少选择一种支付方式')
            .required('支付方式必填'),
        supported_transaction_types: Yup.array()
            .min(1, '至少选择一种交易类型')
            .required('交易类型必填'),
        fee_mode: Yup.mixed<FeeMode>()
            .oneOf(['UNIFIED', 'BY_TXN_TYPE', 'TIERED'])
            .required('费率模式必填'),
        unified_percentage_fee: requiredByMode('UNIFIED'),
        unified_fixed_fee: requiredByMode('UNIFIED'),
        pay_in_percentage_fee: requiredByMode('BY_TXN_TYPE'),
        pay_in_fixed_fee: requiredByMode('BY_TXN_TYPE'),
        pay_out_percentage_fee: requiredByMode('BY_TXN_TYPE'),
        pay_out_fixed_fee: requiredByMode('BY_TXN_TYPE'),
        tiered_rules: Yup.array()
            .of(
                Yup.object({
                    min_amount: Yup.string().required('最小金额必填'),
                    max_amount: Yup.string().required('最大金额必填'),
                    percentage_fee: Yup.string().required('百分比费率必填'),
                    fixed_fee: Yup.string().required('固定费用必填'),
                }),
            )
            .when('fee_mode', {
                is: 'TIERED',
                then: (schema) => schema.min(1, '至少配置一条阶梯规则').required('阶梯规则必填'),
                otherwise: (schema) => schema.notRequired(),
            }),
        min_amount: Yup.string().required('最小金额必填'),
        max_amount: Yup.string().required('最大金额必填'),
        daily_limit: Yup.string().required('日限额必填'),
        production_endpoint: Yup.string().url('请输入有效的URL').required('生产环境端点必填'),
        test_endpoint: Yup.string().url('请输入有效的URL').notRequired(),
        merchant_id: Yup.string().required('商户ID必填'),
        app_id: Yup.string().notRequired(),
        sign_type: Yup.string().oneOf(['', 'HMAC', 'RSA', 'MD5'], '签名类型不合法').notRequired(),
        adapter_config: Yup.string()
            .test('valid-json', '适配器配置必须是有效的 JSON', (value) => {
                if (!value || !value.trim()) {
                    return true
                }
                try {
                    JSON.parse(value)
                    return true
                } catch {
                    return false
                }
            })
            .notRequired(),
        secret_key: type === 'edit' ? Yup.string().notRequired() : Yup.string().required('密钥必填'),
        certificate: Yup.string().notRequired(),
        protocol_version: requireAdapterBindingField('协议版本必填'),
        adapter_binding_status: Yup.string()
            .oneOf(['', 'enabled', 'disabled', 'test'], '绑定状态不合法')
            .test({
                name: 'adapter-binding-status-required',
                message: '绑定状态必填',
                test(value) {
                    if (!hasAdapterBindingValues(this.parent as AdapterBindingFormValues)) {
                        return true
                    }

                    return Boolean(value)
                },
            }),
        adapter_key: requireAdapterBindingField('适配器必填'),
        has_existing_adapter_binding: Yup.boolean().notRequired(),
        timeout: Yup.string().required('超时时间必填'),
        retry_count: Yup.string().required('重试次数必填'),
        retry_interval: Yup.string().required('重试间隔必填'),
    })
