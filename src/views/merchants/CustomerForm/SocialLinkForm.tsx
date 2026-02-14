import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'
import { HiGlobeAlt, HiShieldCheck } from 'react-icons/hi2'
import { Field, FormikErrors, FormikTouched } from 'formik'

type FormFieldsName = {
    withdrawal_address: string
    withdrawal_fee_percent: string
    ip_whitelist: string
}

type SocialLinkFormProps = {
    touched: FormikTouched<FormFieldsName>
    errors: FormikErrors<FormFieldsName>
}

const SocialLinkForm = (props: SocialLinkFormProps) => {
    const { touched, errors } = props

    return (
        <>
            <FormItem
                label="Withdrawal Address"
                invalid={errors.withdrawal_address && touched.withdrawal_address}
                errorMessage={errors.withdrawal_address}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="withdrawal_address"
                    placeholder="TRX..."
                    component={Input}
                    prefix={<HiGlobeAlt className="text-xl" />}
                />
            </FormItem>
            <FormItem
                label="Withdrawal Fee Percent"
                invalid={
                    errors.withdrawal_fee_percent && touched.withdrawal_fee_percent
                }
                errorMessage={errors.withdrawal_fee_percent}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="withdrawal_fee_percent"
                    placeholder="0"
                    component={Input}
                    prefix={<HiGlobeAlt className="text-xl" />}
                />
            </FormItem>
            <FormItem
                label="IP Whitelist (comma-separated)"
                invalid={errors.ip_whitelist && touched.ip_whitelist}
                errorMessage={errors.ip_whitelist}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="ip_whitelist"
                    placeholder="127.0.0.1,10.0.0.1"
                    component={Input}
                    prefix={<HiShieldCheck className="text-xl" />}
                />
            </FormItem>
        </>
    )
}

export default SocialLinkForm
