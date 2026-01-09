import AdaptableCard from '@/components/shared/AdaptableCard'
import RichTextEditor from '@/components/shared/RichTextEditor'
import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'
import { Field, FormikErrors, FormikTouched, FieldProps } from 'formik'

type FormFieldsName = {
    name: string
    channelCode: string
    description: string
}

type BasicInformationFields = {
    touched: FormikTouched<FormFieldsName>
    errors: FormikErrors<FormFieldsName>
}

const BasicInformationFields = (props: BasicInformationFields) => {
    const { touched, errors } = props

    return (
        <AdaptableCard divider className="mb-4">
            <h5>Basic Information支付渠道信息</h5>
            <p className="mb-6">Section to config basic channel information</p>
            <FormItem
                label="channel Name 渠道名"
                invalid={(errors.name && touched.name) as boolean}
                errorMessage={errors.name}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="name"
                    placeholder="Name"
                    component={Input}
                />
            </FormItem>
            <FormItem
                label="channel Code 渠道代码"
                invalid={(errors.channelCode && touched.channelCode) as boolean}
                errorMessage={errors.channelCode}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="channelCode"
                    placeholder="Code"
                    component={Input}
                />
            </FormItem>
            {/* <FormItem
                label="Description"
                labelClass="!justify-start"
                invalid={(errors.description && touched.description) as boolean}
                errorMessage={errors.description}
            >
                <Field name="description">
                    {({ field, form }: FieldProps) => (
                        <RichTextEditor
                            value={field.value}
                            onChange={(val) =>
                                form.setFieldValue(field.name, val)
                            }
                        />
                    )}
                </Field>
            </FormItem> */}
        </AdaptableCard>
    )
}

export default BasicInformationFields
