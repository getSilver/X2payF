import AdaptableCard from '@/components/shared/AdaptableCard'
import { FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import {
    Field,
    FormikErrors,
    FormikTouched,
    FieldProps,
    FieldInputProps,
} from 'formik'
import type { ComponentType } from 'react'
import type { InputProps } from '@/components/ui/Input'

type FormFieldsName = {
    // Pay_In 费率
    pay_in_percentage_fee: string
    pay_in_fixed_fee: string
    // Pay_Out 费率
    pay_out_percentage_fee: string
    pay_out_fixed_fee: string
    // 限额配置
    min_amount: string
    max_amount: string
    daily_limit: string
}

type PricingFieldsProps = {
    touched: FormikTouched<FormFieldsName>
    errors: FormikErrors<FormFieldsName>
}

const AmountInput = (props: InputProps) => {
    return <Input {...props} value={props.field.value} prefix="$" />
}

const PercentInput = (props: InputProps) => {
    return <Input {...props} value={props.field.value} suffix="%" />
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

const PricingFields = (props: PricingFieldsProps) => {
    const { touched, errors } = props

    return (
        <AdaptableCard divider className="mb-4">
            <h5>费率与限额配置</h5>
            <p className="mb-6">配置渠道的费率和交易限额</p>
            
            {/* Pay_In（代收）费率配置 */}
            <div className="mb-6">
                <h6 className="mb-4 text-gray-700 dark:text-gray-200">代收（Pay_In）费率</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem
                        label="百分比费率"
                        invalid={(errors.pay_in_percentage_fee && touched.pay_in_percentage_fee) as boolean}
                        errorMessage={errors.pay_in_percentage_fee}
                    >
                        <Field name="pay_in_percentage_fee">
                            {({ field, form }: FieldProps) => (
                                <NumericFormatInput
                                    form={form}
                                    field={field}
                                    placeholder="例如: 2.5"
                                    customInput={PercentInput as ComponentType}
                                    decimalScale={2}
                                    isAllowed={({ floatValue }) =>
                                        floatValue === undefined || floatValue <= 100
                                    }
                                    onValueChange={(e) => {
                                        form.setFieldValue(field.name, e.value)
                                    }}
                                />
                            )}
                        </Field>
                    </FormItem>

                    <FormItem
                        label="固定费用"
                        invalid={(errors.pay_in_fixed_fee && touched.pay_in_fixed_fee) as boolean}
                        errorMessage={errors.pay_in_fixed_fee}
                    >
                        <Field name="pay_in_fixed_fee">
                            {({ field, form }: FieldProps) => (
                                <NumericFormatInput
                                    form={form}
                                    field={field}
                                    placeholder="例如: 0.30"
                                    customInput={AmountInput as ComponentType}
                                    decimalScale={2}
                                    onValueChange={(e) => {
                                        form.setFieldValue(field.name, e.value)
                                    }}
                                />
                            )}
                        </Field>
                    </FormItem>
                </div>
            </div>

            {/* Pay_Out（代付）费率配置 */}
            <div className="mb-6">
                <h6 className="mb-4 text-gray-700 dark:text-gray-200">代付（Pay_Out）费率</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem
                        label="百分比费率"
                        invalid={(errors.pay_out_percentage_fee && touched.pay_out_percentage_fee) as boolean}
                        errorMessage={errors.pay_out_percentage_fee}
                    >
                        <Field name="pay_out_percentage_fee">
                            {({ field, form }: FieldProps) => (
                                <NumericFormatInput
                                    form={form}
                                    field={field}
                                    placeholder="例如: 1.5"
                                    customInput={PercentInput as ComponentType}
                                    decimalScale={2}
                                    isAllowed={({ floatValue }) =>
                                        floatValue === undefined || floatValue <= 100
                                    }
                                    onValueChange={(e) => {
                                        form.setFieldValue(field.name, e.value)
                                    }}
                                />
                            )}
                        </Field>
                    </FormItem>

                    <FormItem
                        label="固定费用"
                        invalid={(errors.pay_out_fixed_fee && touched.pay_out_fixed_fee) as boolean}
                        errorMessage={errors.pay_out_fixed_fee}
                    >
                        <Field name="pay_out_fixed_fee">
                            {({ field, form }: FieldProps) => (
                                <NumericFormatInput
                                    form={form}
                                    field={field}
                                    placeholder="例如: 1.00"
                                    customInput={AmountInput as ComponentType}
                                    decimalScale={2}
                                    onValueChange={(e) => {
                                        form.setFieldValue(field.name, e.value)
                                    }}
                                />
                            )}
                        </Field>
                    </FormItem>
                </div>
            </div>

            {/* 限额配置 */}
            <div>
                <h6 className="mb-4 text-gray-700 dark:text-gray-200">交易限额</h6>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormItem
                        label="单笔最小金额"
                        invalid={(errors.min_amount && touched.min_amount) as boolean}
                        errorMessage={errors.min_amount}
                    >
                        <Field name="min_amount">
                            {({ field, form }: FieldProps) => (
                                <NumericFormatInput
                                    form={form}
                                    field={field}
                                    placeholder="例如: 1.00"
                                    customInput={AmountInput as ComponentType}
                                    decimalScale={2}
                                    onValueChange={(e) => {
                                        form.setFieldValue(field.name, e.value)
                                    }}
                                />
                            )}
                        </Field>
                    </FormItem>

                    <FormItem
                        label="单笔最大金额"
                        invalid={(errors.max_amount && touched.max_amount) as boolean}
                        errorMessage={errors.max_amount}
                    >
                        <Field name="max_amount">
                            {({ field, form }: FieldProps) => (
                                <NumericFormatInput
                                    form={form}
                                    field={field}
                                    placeholder="例如: 10000.00"
                                    customInput={AmountInput as ComponentType}
                                    decimalScale={2}
                                    onValueChange={(e) => {
                                        form.setFieldValue(field.name, e.value)
                                    }}
                                />
                            )}
                        </Field>
                    </FormItem>

                    <FormItem
                        label="日交易限额"
                        invalid={(errors.daily_limit && touched.daily_limit) as boolean}
                        errorMessage={errors.daily_limit}
                    >
                        <Field name="daily_limit">
                            {({ field, form }: FieldProps) => (
                                <NumericFormatInput
                                    form={form}
                                    field={field}
                                    placeholder="例如: 100000.00"
                                    customInput={AmountInput as ComponentType}
                                    decimalScale={2}
                                    onValueChange={(e) => {
                                        form.setFieldValue(field.name, e.value)
                                    }}
                                />
                            )}
                        </Field>
                    </FormItem>
                </div>
            </div>
        </AdaptableCard>
    )
}

export default PricingFields
