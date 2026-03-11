import AdaptableCard from '@/components/shared/AdaptableCard'
import { FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import { Field, FormikErrors, FormikTouched, FieldProps, FieldInputProps } from 'formik'
import type { ComponentType } from 'react'
import type { InputProps } from '@/components/ui/Input'

type TieredRule = {
    min_amount: string
    max_amount: string
    percentage_fee: string
    fixed_fee: string
}

type FormFieldsName = {
    fee_mode: 'UNIFIED' | 'BY_TXN_TYPE' | 'TIERED'
    unified_percentage_fee: string
    unified_fixed_fee: string
    pay_in_percentage_fee: string
    pay_in_fixed_fee: string
    pay_out_percentage_fee: string
    pay_out_fixed_fee: string
    tiered_rules: TieredRule[]
    min_amount: string
    max_amount: string
    daily_limit: string
}

type PricingFieldsProps = {
    touched: FormikTouched<FormFieldsName>
    errors: FormikErrors<FormFieldsName>
    values: FormFieldsName
}

const feeModeOptions = [
    { value: 'UNIFIED', label: '单一费率 (UNIFIED)' },
    { value: 'BY_TXN_TYPE', label: '按交易类型 (BY_TXN_TYPE)' },
    { value: 'TIERED', label: '阶梯费率 (TIERED)' },
]

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
    const { touched, errors, values } = props

    const tieredRuleErrors = Array.isArray(errors.tiered_rules) ? errors.tiered_rules : []
    const tieredRuleTouched = Array.isArray(touched.tiered_rules) ? touched.tiered_rules : []

    return (
        <AdaptableCard divider className="mb-4">
            <h5>费率与限额配置</h5>
            <p className="mb-6">配置渠道费率模式与交易限额</p>

            <FormItem label="费率模式" invalid={(errors.fee_mode && touched.fee_mode) as boolean} errorMessage={errors.fee_mode}>
                <Field name="fee_mode">
                    {({ field, form }: FieldProps) => (
                        <Select
                            placeholder="选择费率模式"
                            options={feeModeOptions}
                            value={feeModeOptions.find((opt) => opt.value === field.value)}
                            onChange={(selected) => {
                                const mode = selected?.value || 'BY_TXN_TYPE'
                                form.setFieldValue(field.name, mode)
                                if (mode !== 'TIERED') {
                                    form.setFieldValue('tiered_rules', [])
                                }
                            }}
                        />
                    )}
                </Field>
            </FormItem>

            {values.fee_mode === 'UNIFIED' && (
                <div className="mb-6">
                    <h6 className="mb-4 text-gray-700 dark:text-gray-200">统一费率（所有交易类型）</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem
                            label="百分比费率"
                            invalid={(errors.unified_percentage_fee && touched.unified_percentage_fee) as boolean}
                            errorMessage={errors.unified_percentage_fee}
                        >
                            <Field name="unified_percentage_fee">
                                {({ field, form }: FieldProps) => (
                                    <NumericFormatInput
                                        form={form}
                                        field={field}
                                        placeholder="例如: 2.5"
                                        customInput={PercentInput as ComponentType}
                                        decimalScale={4}
                                        isAllowed={({ floatValue }) => floatValue === undefined || floatValue <= 100}
                                        onValueChange={(e) => {
                                            form.setFieldValue(field.name, e.value)
                                        }}
                                    />
                                )}
                            </Field>
                        </FormItem>

                        <FormItem
                            label="固定费用"
                            invalid={(errors.unified_fixed_fee && touched.unified_fixed_fee) as boolean}
                            errorMessage={errors.unified_fixed_fee}
                        >
                            <Field name="unified_fixed_fee">
                                {({ field, form }: FieldProps) => (
                                    <NumericFormatInput
                                        form={form}
                                        field={field}
                                        placeholder="例如: 0.45"
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
            )}

            {values.fee_mode === 'BY_TXN_TYPE' && (
                <>
                    <div className="mb-6">
                        <h6 className="mb-4 text-gray-700 dark:text-gray-200">代收（PAY_IN）费率</h6>
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
                                            decimalScale={4}
                                            isAllowed={({ floatValue }) => floatValue === undefined || floatValue <= 100}
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
                                            placeholder="例如: 0.45"
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

                    <div className="mb-6">
                        <h6 className="mb-4 text-gray-700 dark:text-gray-200">代付（PAY_OUT）费率</h6>
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
                                            decimalScale={4}
                                            isAllowed={({ floatValue }) => floatValue === undefined || floatValue <= 100}
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
                                            placeholder="例如: 0.45"
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
                </>
            )}

            {values.fee_mode === 'TIERED' && (
                <Field name="tiered_rules">
                    {({ form }: FieldProps) => (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h6 className="text-gray-700 dark:text-gray-200">阶梯费率规则</h6>
                                <Button
                                    type="button"
                                    size="xs"
                                    onClick={() => {
                                        const current = form.values.tiered_rules || []
                                        form.setFieldValue('tiered_rules', [
                                            ...current,
                                            {
                                                min_amount: '',
                                                max_amount: '',
                                                percentage_fee: '',
                                                fixed_fee: '',
                                            },
                                        ])
                                    }}
                                >
                                    新增阶梯
                                </Button>
                            </div>

                            {typeof errors.tiered_rules === 'string' && (
                                <div className="text-red-500 text-sm mb-3">{errors.tiered_rules}</div>
                            )}

                            {(values.tiered_rules || []).map((_, index) => {
                                const rowErrors = tieredRuleErrors[index] as FormikErrors<TieredRule> | undefined
                                const rowTouched = tieredRuleTouched[index] as FormikTouched<TieredRule> | undefined

                                return (
                                    <div key={`tiered-rule-${index}`} className="border rounded-md p-4 mb-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormItem
                                                label="最小金额"
                                                invalid={Boolean(rowErrors?.min_amount && rowTouched?.min_amount)}
                                                errorMessage={rowErrors?.min_amount}
                                            >
                                                <Field name={`tiered_rules.${index}.min_amount`}>
                                                    {({ field, form }: FieldProps) => (
                                                        <NumericFormatInput
                                                            form={form}
                                                            field={field}
                                                            placeholder="例如: 0"
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
                                                label="最大金额（0 表示无上限）"
                                                invalid={Boolean(rowErrors?.max_amount && rowTouched?.max_amount)}
                                                errorMessage={rowErrors?.max_amount}
                                            >
                                                <Field name={`tiered_rules.${index}.max_amount`}>
                                                    {({ field, form }: FieldProps) => (
                                                        <NumericFormatInput
                                                            form={form}
                                                            field={field}
                                                            placeholder="例如: 1000"
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
                                                label="百分比费率"
                                                invalid={Boolean(rowErrors?.percentage_fee && rowTouched?.percentage_fee)}
                                                errorMessage={rowErrors?.percentage_fee}
                                            >
                                                <Field name={`tiered_rules.${index}.percentage_fee`}>
                                                    {({ field, form }: FieldProps) => (
                                                        <NumericFormatInput
                                                            form={form}
                                                            field={field}
                                                            placeholder="例如: 1.5"
                                                            customInput={PercentInput as ComponentType}
                                                            decimalScale={4}
                                                            isAllowed={({ floatValue }) => floatValue === undefined || floatValue <= 100}
                                                            onValueChange={(e) => {
                                                                form.setFieldValue(field.name, e.value)
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="固定费用"
                                                invalid={Boolean(rowErrors?.fixed_fee && rowTouched?.fixed_fee)}
                                                errorMessage={rowErrors?.fixed_fee}
                                            >
                                                <Field name={`tiered_rules.${index}.fixed_fee`}>
                                                    {({ field, form }: FieldProps) => (
                                                        <NumericFormatInput
                                                            form={form}
                                                            field={field}
                                                            placeholder="例如: 0.45"
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

                                        <div className="mt-2">
                                            <Button
                                                type="button"
                                                size="xs"
                                                className="text-red-600"
                                                onClick={() => {
                                                    const current = [...(form.values.tiered_rules || [])]
                                                    current.splice(index, 1)
                                                    form.setFieldValue('tiered_rules', current)
                                                }}
                                            >
                                                删除阶梯
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Field>
            )}

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
