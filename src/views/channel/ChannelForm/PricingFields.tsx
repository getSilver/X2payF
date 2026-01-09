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
    fixed: number
    amount: number
    rates: number
}

type ChannelFieldsProps = {
    touched: FormikTouched<FormFieldsName>
    errors: FormikErrors<FormFieldsName>
}

const FixedInput = (props: InputProps) => {
    return <Input {...props} value={props.field.value} prefix="$" />
}

const RatesInput = (props: InputProps) => {
    return <Input {...props} value={props.field.value} />
}

const NumericFormatInput = ({
    onValueChange,
    ...rest
}: Omit<NumericFormatProps, 'form'> & {
    /* eslint-disable @typescript-eslint/no-explicit-any */
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

const PricingFields = (props: ChannelFieldsProps) => {
    const { touched, errors } = props

    return (
        <AdaptableCard divider className="mb-4">
            <h5>配置信息</h5>
            <p className="mb-6">Section to config channel information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                    <FormItem
                        label="Rates(%) 比例成本"
                        invalid={(errors.rates && touched.rates) as boolean}
                        errorMessage={errors.rates}
                    >
                        <Field name="rates">
                            {({ field, form }: FieldProps) => {
                                return (
                                    <NumericFormatInput
                                        form={form}
                                        field={field}
                                        placeholder="Rates"
                                        customInput={
                                            RatesInput as ComponentType
                                        }
                                        isAllowed={({ floatValue }) =>
                                            (floatValue as number) <= 100
                                        }
                                        onValueChange={(e) => {
                                            form.setFieldValue(
                                                field.name,
                                                e.value
                                            )
                                        }}
                                    />
                                )
                            }}
                        </Field>
                    </FormItem>
                </div>
                <div className="col-span-1">
                    <FormItem
                        label="Fixed costs 固定成本"
                        invalid={(errors.fixed && touched.fixed) as boolean}
                        errorMessage={errors.fixed}
                    >
                        <Field name="fixed">
                            {({ field, form }: FieldProps) => {
                                return (
                                    <NumericFormatInput
                                        form={form}
                                        field={field}
                                        placeholder="Fixed"
                                        customInput={
                                            FixedInput as ComponentType
                                        }
                                        onValueChange={(e) => {
                                            form.setFieldValue(
                                                field.name,
                                                e.value
                                            )
                                        }}
                                    />
                                )
                            }}
                        </Field>
                    </FormItem>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                    <FormItem
                        label="Min limit 最小限额"
                        invalid={(errors.amount && touched.amount) as boolean}
                        errorMessage={errors.amount}
                    >
                        <Field name="minAmount">
                            {({ field, form }: FieldProps) => {
                                return (
                                    <NumericFormatInput
                                        form={form}
                                        field={field}
                                        placeholder="Amount"
                                        customInput={
                                            FixedInput as ComponentType
                                        }
                                        onValueChange={(e) => {
                                            form.setFieldValue(
                                                field.name,
                                                e.value
                                            )
                                        }}
                                    />
                                )
                            }}
                        </Field>
                    </FormItem>
                </div>
                <div className="col-span-1">
                    <FormItem
                        label="Max limit 最大限额"
                        invalid={(errors.amount && touched.amount) as boolean}
                        errorMessage={errors.amount}
                    >
                        <Field name="maxAmount">
                            {({ field, form }: FieldProps) => {
                                return (
                                    <NumericFormatInput
                                        form={form}
                                        field={field}
                                        placeholder="Amount"
                                        customInput={
                                            FixedInput as ComponentType
                                        }
                                        onValueChange={(e) => {
                                            form.setFieldValue(
                                                field.name,
                                                e.value
                                            )
                                        }}
                                    />
                                )
                            }}
                        </Field>
                    </FormItem>
                </div>
            </div>
        </AdaptableCard>
    )
}

export default PricingFields
