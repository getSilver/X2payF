import AdaptableCard from '@/components/shared/AdaptableCard'
import { FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import CreatableSelect from 'react-select/creatable'
import { Field, FormikErrors, FormikTouched, FieldProps } from 'formik'

type Options = {
    label: string
    value: string
}[]

type FormFieldsName = {
    area: string
    tags: Options
    key: string
    brand: string
}

type OrganizationFieldsProps = {
    touched: FormikTouched<FormFieldsName>
    errors: FormikErrors<FormFieldsName>
    values: {
        area: string
        tags: Options
        [key: string]: unknown
    }
}

const area = [
    { label: '巴西', value: 'brl' },
    { label: '印度', value: 'inr' },
    { label: '沙特', value: 'mxn' },
    { label: '美国', value: 'usd' },
    { label: '欧洲', value: 'eur' },
]

const tags = [
    { label: '代收', value: 'payin' },
    { label: '代付', value: 'payout' },
]

const OrganizationFields = (props: OrganizationFieldsProps) => {
    const { values = { area: '', tags: [] }, touched, errors } = props

    return (
        <AdaptableCard divider isLastChild className="mb-4">
            <h5>Organizations 渠道信息</h5>
            <p className="mb-6">Section to config channel information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                    <FormItem
                        label="Area地区"
                        invalid={
                            (errors.area && touched.area) as boolean
                        }
                        errorMessage={errors.area}
                    >
                        <Field name="area">
                            {({ field, form }: FieldProps) => (
                                <Select
                                    field={field}
                                    form={form}
                                    options={area}
                                    value={area.filter(
                                        (area) =>
                                            area.value === values.area
                                    )}
                                    onChange={(option) =>
                                        form.setFieldValue(
                                            field.name,
                                            option?.value
                                        )
                                    }
                                />
                            )}
                        </Field>
                    </FormItem>
                </div>
                <div className="col-span-1">
                    <FormItem
                        label="Tags"
                        invalid={
                            (errors.tags && touched.tags) as unknown as boolean
                        }
                        errorMessage={errors.tags as string}
                    >
                        <Field name="tags">
                            {({ field, form }: FieldProps) => (
                                <Select
                                    isMulti
                                    componentAs={CreatableSelect}
                                    field={field}
                                    form={form}
                                    options={tags}
                                    value={values.tags}
                                    onChange={(option) =>
                                        form.setFieldValue(field.name, option)
                                    }
                                />
                            )}
                        </Field>
                    </FormItem>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                    <FormItem
                        label="上游网关URL"
                        invalid={(errors.brand && touched.brand) as boolean}
                        errorMessage={errors.brand}
                    >
                        <Field
                            type="text"
                            autoComplete="off"
                            name="url"
                            placeholder="网关URL"
                            component={Input}
                        />
                    </FormItem>
                </div>
                <div className="col-span-1">
                    <FormItem
                        label="密钥"
                        invalid={(errors.key && touched.key) as boolean}
                        errorMessage={errors.key}
                    >
                        <Field
                            type="text"
                            autoComplete="off"
                            name="key"
                            placeholder="密钥"
                            component={Input}
                        />
                    </FormItem>
                </div>
            </div>
        </AdaptableCard>
    )
}

export default OrganizationFields
