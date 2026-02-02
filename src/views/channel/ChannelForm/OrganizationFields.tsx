import AdaptableCard from '@/components/shared/AdaptableCard'
import { FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import { Field, FormikErrors, FormikTouched, FieldProps, FieldInputProps } from 'formik'
import type { ComponentType } from 'react'
import type { InputProps } from '@/components/ui/Input'

type FormFieldsName = {
    production_endpoint: string
    test_endpoint: string
    merchant_id: string
    app_id: string
    secret_key: string
    timeout: string
    retry_count: string
    retry_interval: string
}

type APIConfigFieldsProps = {
    touched: FormikTouched<FormFieldsName>
    errors: FormikErrors<FormFieldsName>
}

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

const SuffixInput = (props: InputProps & { suffix: string }) => {
    return <Input {...props} value={props.field.value} suffix={props.suffix} />
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
    const { touched, errors } = props

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
            </FormItem>

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
