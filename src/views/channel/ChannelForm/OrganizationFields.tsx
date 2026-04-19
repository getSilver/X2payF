import AdaptableCard from '@/components/shared/AdaptableCard'
import { FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import { Field, FormikErrors, FormikTouched, FieldProps, FieldInputProps } from 'formik'
import type { ComponentType } from 'react'
import type { InputProps } from '@/components/ui/Input'
import type { ChannelAdapterBindingStatus, ChannelAdapterInfo } from '@/@types/channel'

type FormFieldsName = {
    production_endpoint: string
    test_endpoint: string
    merchant_id: string
    app_id: string
    sign_type: string
    adapter_config: string
    secret_key: string
    timeout: string
    retry_count: string
    retry_interval: string
    adapter_key: string
    protocol_version: string
    adapter_binding_status: ChannelAdapterBindingStatus | ''
}

const signTypeOptions: Array<{ value: string; label: string }> = [
    { value: 'HMAC', label: 'HMAC' },
    { value: 'RSA', label: 'RSA' },
    { value: 'MD5', label: 'MD5' },
]

type APIConfigFieldsProps = {
    touched: FormikTouched<FormFieldsName>
    errors: FormikErrors<FormFieldsName>
    values: FormFieldsName
    adapterOptions: ChannelAdapterInfo[]
    hasSecretKey?: boolean
}

const adapterBindingStatusOptions: Array<{ value: ChannelAdapterBindingStatus; label: string }> = [
    { value: 'enabled', label: '启用' },
    { value: 'test', label: '测试' },
    { value: 'disabled', label: '禁用' },
]

const NumericFormatInput = ({
    onValueChange,
    ...rest
}: Omit<NumericFormatProps, 'form'> & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any
    field: FieldInputProps<unknown>
}) => {
    return (
        <NumericFormat
            customInput={Input as ComponentType}
            type="text"
            autoComplete="off"
            onValueChange={onValueChange}
            {...rest}
        />
    )
}

const TimeoutInput = (props: InputProps) => {
    return <Input {...props} value={props.field.value} suffix="秒" />
}

const RetryCountInput = (props: InputProps) => {
    return <Input {...props} value={props.field.value} suffix="次" />
}

const RetryIntervalInput = (props: InputProps) => {
    return <Input {...props} value={props.field.value} suffix="毫秒" />
}

const APIConfigFields = (props: APIConfigFieldsProps) => {
    const { touched, errors, values, adapterOptions, hasSecretKey } = props

    return (
        <AdaptableCard divider isLastChild className="mb-4">
            <h5>API 配置</h5>
            <p className="mb-6">配置渠道的 API 端点和认证信息</p>
            
            {/* API 端点配置 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem
                    label="生产环境端点"
                    invalid={(errors.production_endpoint && touched.production_endpoint) as boolean}
                    errorMessage={errors.production_endpoint}
                >
                    <Field
                        type="text"
                        autoComplete="off"
                        name="production_endpoint"
                        placeholder="https://api.example.com/v1"
                        component={Input}
                    />
                </FormItem>

                <FormItem
                    label="测试环境端点"
                    invalid={(errors.test_endpoint && touched.test_endpoint) as boolean}
                    errorMessage={errors.test_endpoint}
                >
                    <Field
                        type="text"
                        autoComplete="off"
                        name="test_endpoint"
                        placeholder="https://sandbox.example.com/v1"
                        component={Input}
                    />
                </FormItem>
            </div>

            {/* 认证配置 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem
                    label="商户ID"
                    invalid={(errors.merchant_id && touched.merchant_id) as boolean}
                    errorMessage={errors.merchant_id}
                >
                    <Field
                        type="text"
                        autoComplete="off"
                        name="merchant_id"
                        placeholder="渠道分配的商户ID"
                        component={Input}
                    />
                </FormItem>

                <FormItem
                    label="应用ID"
                    invalid={(errors.app_id && touched.app_id) as boolean}
                    errorMessage={errors.app_id}
                >
                    <Field
                        type="text"
                        autoComplete="off"
                        name="app_id"
                        placeholder="渠道分配的应用ID"
                        component={Input}
                    />
                </FormItem>
            </div>

            <FormItem
                label="签名类型"
                invalid={(errors.sign_type && touched.sign_type) as boolean}
                errorMessage={errors.sign_type}
            >
                <Field name="sign_type">
                    {({ field, form }: FieldProps) => (
                        <Select
                            placeholder="选择签名类型"
                            options={signTypeOptions}
                            value={signTypeOptions.find((opt) => opt.value === field.value)}
                            onChange={(selected) => {
                                form.setFieldValue(field.name, selected?.value || '')
                            }}
                        />
                    )}
                </Field>
            </FormItem>

            <FormItem
                label="适配器配置"
                invalid={(errors.adapter_config && touched.adapter_config) as boolean}
                errorMessage={errors.adapter_config}
            >
                <Field
                    as="textarea"
                    autoComplete="off"
                    name="adapter_config"
                    placeholder='例如: {"amount_unit":"minor"}'
                    component={Input}
                    textArea
                />
            </FormItem>

            <FormItem
                label="密钥"
                invalid={(errors.secret_key && touched.secret_key) as boolean}
                errorMessage={errors.secret_key}
            >
                <Field
                    type="password"
                    autoComplete="off"
                    name="secret_key"
                    placeholder="渠道分配的密钥"
                    component={Input}
                />
                {hasSecretKey ? (
                    <p className="mt-1 text-xs text-emerald-600">
                        当前已配置密钥，留空可保持不变。
                    </p>
                ) : null}
            </FormItem>

            <div className="mt-8">
                <h6 className="mb-4 text-gray-700 dark:text-gray-200">适配器绑定</h6>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormItem
                        label="适配器"
                        invalid={(errors.adapter_key && touched.adapter_key) as boolean}
                        errorMessage={errors.adapter_key}
                    >
                        <Field name="adapter_key">
                            {({ field, form }: FieldProps) => (
                                <Select
                                    placeholder="选择适配器"
                                    options={adapterOptions.map((adapter) => ({
                                        value: adapter.adapter_key,
                                        label: `${adapter.adapter_key} (${adapter.status})`,
                                    }))}
                                    value={adapterOptions
                                        .map((adapter) => ({
                                            value: adapter.adapter_key,
                                            label: `${adapter.adapter_key} (${adapter.status})`,
                                        }))
                                        .find((option) => option.value === field.value) || null}
                                    onChange={(selected) => {
                                        form.setFieldValue(field.name, selected?.value || '')
                                    }}
                                />
                            )}
                        </Field>
                    </FormItem>

                    <FormItem
                        label="协议版本"
                        invalid={(errors.protocol_version && touched.protocol_version) as boolean}
                        errorMessage={errors.protocol_version}
                    >
                        <Field
                            type="text"
                            autoComplete="off"
                            name="protocol_version"
                            placeholder="例如: v1"
                            component={Input}
                        />
                    </FormItem>

                    <FormItem
                        label="绑定状态"
                        invalid={
                            (errors.adapter_binding_status &&
                                touched.adapter_binding_status) as boolean
                        }
                        errorMessage={errors.adapter_binding_status}
                    >
                        <Field name="adapter_binding_status">
                            {({ field, form }: FieldProps) => (
                                <Select
                                    placeholder="选择绑定状态"
                                    options={adapterBindingStatusOptions}
                                    value={
                                        adapterBindingStatusOptions.find(
                                            (option) => option.value === field.value,
                                        ) || null
                                    }
                                    onChange={(selected) => {
                                        form.setFieldValue(field.name, selected?.value || '')
                                    }}
                                />
                            )}
                        </Field>
                    </FormItem>
                </div>
                {(values.adapter_key || values.protocol_version || values.adapter_binding_status) ? (
                    <p className="mt-2 text-xs text-gray-500">
                        保存时会同步更新渠道与 adapter worker 的绑定关系。
                    </p>
                ) : null}
            </div>

            {/* 请求配置 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormItem
                    label="超时时间"
                    invalid={(errors.timeout && touched.timeout) as boolean}
                    errorMessage={errors.timeout}
                >
                    <Field name="timeout">
                        {({ field, form }: FieldProps) => (
                            <NumericFormatInput
                                form={form}
                                field={field}
                                placeholder="30"
                                customInput={TimeoutInput as ComponentType}
                                decimalScale={0}
                                isAllowed={({ floatValue }) =>
                                    floatValue === undefined || (floatValue >= 1 && floatValue <= 300)
                                }
                                onValueChange={(e) => {
                                    form.setFieldValue(field.name, e.value)
                                }}
                            />
                        )}
                    </Field>
                </FormItem>

                <FormItem
                    label="重试次数"
                    invalid={(errors.retry_count && touched.retry_count) as boolean}
                    errorMessage={errors.retry_count}
                >
                    <Field name="retry_count">
                        {({ field, form }: FieldProps) => (
                            <NumericFormatInput
                                form={form}
                                field={field}
                                placeholder="3"
                                customInput={RetryCountInput as ComponentType}
                                decimalScale={0}
                                isAllowed={({ floatValue }) =>
                                    floatValue === undefined || (floatValue >= 0 && floatValue <= 10)
                                }
                                onValueChange={(e) => {
                                    form.setFieldValue(field.name, e.value)
                                }}
                            />
                        )}
                    </Field>
                </FormItem>

                <FormItem
                    label="重试间隔"
                    invalid={(errors.retry_interval && touched.retry_interval) as boolean}
                    errorMessage={errors.retry_interval}
                >
                    <Field name="retry_interval">
                        {({ field, form }: FieldProps) => (
                            <NumericFormatInput
                                form={form}
                                field={field}
                                placeholder="1000"
                                customInput={RetryIntervalInput as ComponentType}
                                decimalScale={0}
                                isAllowed={({ floatValue }) =>
                                    floatValue === undefined || (floatValue >= 100 && floatValue <= 60000)
                                }
                                onValueChange={(e) => {
                                    form.setFieldValue(field.name, e.value)
                                }}
                            />
                        )}
                    </Field>
                </FormItem>
            </div>
        </AdaptableCard>
    )
}

export default APIConfigFields
