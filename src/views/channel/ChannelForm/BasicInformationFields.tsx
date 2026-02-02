import AdaptableCard from '@/components/shared/AdaptableCard'
import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import { Field, FormikErrors, FormikTouched, FieldProps } from 'formik'
import type { PaymentMethod } from '@/@types/channel'
import type { TransactionType } from '@/@types/payment'

type FormFieldsName = {
    code: string
    name: string
    display_name: string
    supported_currencies: string[]
    supported_payment_methods: PaymentMethod[]
    supported_transaction_types: TransactionType[]
}

type BasicInformationFieldsProps = {
    touched: FormikTouched<FormFieldsName>
    errors: FormikErrors<FormFieldsName>
    values: FormFieldsName
    type: 'edit' | 'new'
}

/**
 * 币种选项
 */
const currencyOptions = [
    { value: 'USD', label: 'USD - 美元' },
    { value: 'EUR', label: 'EUR - 欧元' },
    { value: 'GBP', label: 'GBP - 英镑' },
    { value: 'JPY', label: 'JPY - 日元' },
    { value: 'CNY', label: 'CNY - 人民币' },
    { value: 'BRL', label: 'BRL - 巴西雷亚尔' },
    { value: 'INR', label: 'INR - 印度卢比' },
    { value: 'KRW', label: 'KRW - 韩元' },
]

/**
 * 支付方式选项
 */
const paymentMethodOptions = [
    { value: 'qr_code', label: '二维码支付' },
    { value: 'h5', label: 'H5支付' },
    { value: 'pix', label: 'PIX' },
    { value: 'CREDIT_CARD', label: '信用卡' },
    { value: 'DEBIT_CARD', label: '借记卡' },
    { value: 'BANK_TRANSFER', label: '银行转账' },
    { value: 'E_WALLET', label: '电子钱包' },
    { value: 'CRYPTO', label: '加密货币' },
]

/**
 * 交易类型选项
 * 注意：值必须为大写，与后端 TransactionType 定义一致
 */
const transactionTypeOptions = [
    { value: 'PAY_IN', label: '代收 (Pay In)' },
    { value: 'PAY_OUT', label: '代付 (Pay Out)' },
]

const BasicInformationFields = (props: BasicInformationFieldsProps) => {
    const { touched, errors, type } = props

    return (
        <AdaptableCard divider className="mb-4">
            <h5>渠道基本信息</h5>
            <p className="mb-6">配置支付渠道的基本信息</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem
                    label="渠道代码"
                    invalid={(errors.code && touched.code) as boolean}
                    errorMessage={errors.code}
                >
                    <Field
                        type="text"
                        autoComplete="off"
                        name="code"
                        placeholder="例如: STRIPE, PAYPAL"
                        component={Input}
                        disabled={type === 'edit'}
                    />
                </FormItem>

                <FormItem
                    label="渠道名称"
                    invalid={(errors.name && touched.name) as boolean}
                    errorMessage={errors.name}
                >
                    <Field
                        type="text"
                        autoComplete="off"
                        name="name"
                        placeholder="渠道内部名称"
                        component={Input}
                    />
                </FormItem>
            </div>

            <FormItem
                label="显示名称"
                invalid={(errors.display_name && touched.display_name) as boolean}
                errorMessage={errors.display_name}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="display_name"
                    placeholder="前端显示的渠道名称"
                    component={Input}
                />
            </FormItem>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem
                    label="交易类型"
                    invalid={
                        (errors.supported_transaction_types &&
                            touched.supported_transaction_types) as boolean
                    }
                    errorMessage={errors.supported_transaction_types as string}
                >
                    <Field name="supported_transaction_types">
                        {({ field, form }: FieldProps) => (
                            <Select
                                isMulti
                                placeholder="选择支持的交易类型"
                                options={transactionTypeOptions}
                                value={transactionTypeOptions.filter((opt) =>
                                    field.value?.includes(opt.value)
                                )}
                                onChange={(selected) => {
                                    const values = selected
                                        ? selected.map((opt: { value: string }) => opt.value)
                                        : []
                                    form.setFieldValue(field.name, values)
                                }}
                            />
                        )}
                    </Field>
                </FormItem>

                <FormItem
                    label="支持币种"
                    invalid={
                        (errors.supported_currencies && touched.supported_currencies) as boolean
                    }
                    errorMessage={errors.supported_currencies as string}
                >
                    <Field name="supported_currencies">
                        {({ field, form }: FieldProps) => (
                            <Select
                                isMulti
                                placeholder="选择支持的币种"
                                options={currencyOptions}
                                value={currencyOptions.filter((opt) =>
                                    field.value?.includes(opt.value)
                                )}
                                onChange={(selected) => {
                                    const values = selected
                                        ? selected.map((opt: { value: string }) => opt.value)
                                        : []
                                    form.setFieldValue(field.name, values)
                                }}
                            />
                        )}
                    </Field>
                </FormItem>
            </div>

            <FormItem
                label="支付方式"
                invalid={
                    (errors.supported_payment_methods &&
                        touched.supported_payment_methods) as boolean
                }
                errorMessage={errors.supported_payment_methods as string}
            >
                <Field name="supported_payment_methods">
                    {({ field, form }: FieldProps) => (
                        <Select
                            isMulti
                            placeholder="选择支持的支付方式"
                            options={paymentMethodOptions}
                            value={paymentMethodOptions.filter((opt) =>
                                field.value?.includes(opt.value)
                            )}
                            onChange={(selected) => {
                                const values = selected
                                    ? selected.map((opt: { value: string }) => opt.value)
                                    : []
                                form.setFieldValue(field.name, values)
                            }}
                        />
                    )}
                </Field>
            </FormItem>
        </AdaptableCard>
    )
}

export default BasicInformationFields
