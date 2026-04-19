import { forwardRef, useState } from 'react'
import { FormContainer } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import StickyFooter from '@/components/shared/StickyFooter'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Form, Formik, FormikProps } from 'formik'
import BasicInformationFields from './BasicInformationFields'
import PricingFields from './PricingFields'
import APIConfigFields from './OrganizationFields'
import CertificateUpload from './CertificateUpload'
import cloneDeep from 'lodash/cloneDeep'
import { HiOutlineTrash } from 'react-icons/hi2'
import { AiOutlineSave } from 'react-icons/ai'
import type {
    ChannelStatus,
    PaymentMethod,
    ChannelAdapterBindingStatus,
    ChannelAdapterInfo,
} from '@/@types/channel'
import type { TransactionType } from '@/@types/payment'
import { getChannelValidationSchema } from './channelValidationSchema'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormikRef = FormikProps<any>

export type FeeMode = 'UNIFIED' | 'BY_TXN_TYPE' | 'TIERED'

export type TieredFeeRuleForm = {
    min_amount: string
    max_amount: string
    percentage_fee: string
    fixed_fee: string
}

/**
 * 证书信息
 */
type CertificateInfo = {
    id: string
    name: string
    content: string
    uploadTime: string
}

/**
 * 渠道表单初始数据
 */
export type InitialData = {
    id?: string
    code?: string
    name?: string
    display_name?: string
    status?: ChannelStatus
    supported_currencies?: string[]
    supported_payment_methods?: PaymentMethod[]
    supported_transaction_types?: TransactionType[]
    fee_mode?: FeeMode
    unified_percentage_fee?: string
    unified_fixed_fee?: string
    pay_in_percentage_fee?: string
    pay_in_fixed_fee?: string
    pay_out_percentage_fee?: string
    pay_out_fixed_fee?: string
    tiered_rules?: TieredFeeRuleForm[]
    min_amount?: string
    max_amount?: string
    daily_limit?: string
    production_endpoint?: string
    test_endpoint?: string
    merchant_id?: string
    app_id?: string
    sign_type?: string
    adapter_config?: string
    secret_key?: string
    has_secret_key?: boolean
    certificate?: string
    has_certificate?: boolean
    adapter_key?: string
    protocol_version?: string
    adapter_binding_status?: ChannelAdapterBindingStatus | ''
    has_existing_adapter_binding?: boolean
    adapter_options?: ChannelAdapterInfo[]
    certificateInfo?: CertificateInfo
    timeout?: string
    retry_count?: string
    retry_interval?: string
}

/**
 * 表单数据模型
 */
export type FormModel = {
    id?: string
    code: string
    name: string
    display_name: string
    supported_currencies: string[]
    supported_payment_methods: PaymentMethod[]
    supported_transaction_types: TransactionType[]
    fee_mode: FeeMode
    unified_percentage_fee: string
    unified_fixed_fee: string
    pay_in_percentage_fee: string
    pay_in_fixed_fee: string
    pay_out_percentage_fee: string
    pay_out_fixed_fee: string
    tiered_rules: TieredFeeRuleForm[]
    min_amount: string
    max_amount: string
    daily_limit: string
    production_endpoint: string
    test_endpoint: string
    merchant_id: string
    app_id: string
    sign_type: string
    adapter_config: string
    secret_key: string
    has_secret_key: boolean
    certificate: string
    has_certificate: boolean
    adapter_key: string
    protocol_version: string
    adapter_binding_status: ChannelAdapterBindingStatus | ''
    has_existing_adapter_binding: boolean
    certificateInfo?: CertificateInfo
    timeout: string
    retry_count: string
    retry_interval: string
}

export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type ChannelFormProps = {
    initialData?: InitialData
    adapterOptions?: ChannelAdapterInfo[]
    type: 'edit' | 'new'
    onDiscard?: () => void
    onDelete?: OnDelete
    onFormSubmit: (formData: FormModel, setSubmitting: SetSubmitting) => void
}

/**
 * 删除按钮组件
 */
const DeleteChannelButton = ({ onDelete }: { onDelete: OnDelete }) => {
    const [dialogOpen, setDialogOpen] = useState(false)

    const onConfirmDialogOpen = () => {
        setDialogOpen(true)
    }

    const onConfirmDialogClose = () => {
        setDialogOpen(false)
    }

    const handleConfirm = () => {
        onDelete?.(setDialogOpen)
    }

    return (
        <>
            <Button
                className="text-red-600"
                variant="plain"
                size="sm"
                icon={<HiOutlineTrash />}
                type="button"
                onClick={onConfirmDialogOpen}
            >
                删除
            </Button>
            <ConfirmDialog
                isOpen={dialogOpen}
                type="danger"
                title="删除渠道"
                confirmButtonColor="red-600"
                onClose={onConfirmDialogClose}
                onRequestClose={onConfirmDialogClose}
                onCancel={onConfirmDialogClose}
                onConfirm={handleConfirm}
            >
                <p>确定要删除此渠道吗？删除后将无法恢复，请谨慎操作。</p>
            </ConfirmDialog>
        </>
    )
}

/**
 * 渠道表单组件
 */
const ChannelForm = forwardRef<FormikRef, ChannelFormProps>((props, ref) => {
    const {
        type,
        adapterOptions = [],
        initialData = {
            id: '',
            code: '',
            name: '',
            display_name: '',
            supported_currencies: [],
            supported_payment_methods: [],
            supported_transaction_types: [],
            fee_mode: 'BY_TXN_TYPE',
            unified_percentage_fee: '',
            unified_fixed_fee: '',
            pay_in_percentage_fee: '',
            pay_in_fixed_fee: '',
            pay_out_percentage_fee: '',
            pay_out_fixed_fee: '',
            tiered_rules: [],
            min_amount: '',
            max_amount: '',
            daily_limit: '',
            production_endpoint: '',
            test_endpoint: '',
            merchant_id: '',
            app_id: '',
            sign_type: '',
            adapter_config: '',
            secret_key: '',
            has_secret_key: false,
            certificate: '',
            has_certificate: false,
            adapter_key: '',
            protocol_version: '',
            adapter_binding_status: '',
            has_existing_adapter_binding: false,
            certificateInfo: undefined,
            timeout: '30',
            retry_count: '3',
            retry_interval: '1000',
        },
        onFormSubmit,
        onDiscard,
        onDelete,
    } = props

    return (
        <Formik
            innerRef={ref}
            enableReinitialize
            initialValues={{
                id: initialData.id || '',
                code: initialData.code || '',
                name: initialData.name || '',
                display_name: initialData.display_name || '',
                supported_currencies: initialData.supported_currencies || [],
                supported_payment_methods: initialData.supported_payment_methods || [],
                supported_transaction_types: initialData.supported_transaction_types || [],
                fee_mode: initialData.fee_mode || 'BY_TXN_TYPE',
                unified_percentage_fee: initialData.unified_percentage_fee || '',
                unified_fixed_fee: initialData.unified_fixed_fee || '',
                pay_in_percentage_fee: initialData.pay_in_percentage_fee || '',
                pay_in_fixed_fee: initialData.pay_in_fixed_fee || '',
                pay_out_percentage_fee: initialData.pay_out_percentage_fee || '',
                pay_out_fixed_fee: initialData.pay_out_fixed_fee || '',
                tiered_rules: initialData.tiered_rules || [],
                min_amount: initialData.min_amount || '',
                max_amount: initialData.max_amount || '',
                daily_limit: initialData.daily_limit || '',
                production_endpoint: initialData.production_endpoint || '',
                test_endpoint: initialData.test_endpoint || '',
                merchant_id: initialData.merchant_id || '',
                app_id: initialData.app_id || '',
                sign_type: initialData.sign_type || '',
                adapter_config: initialData.adapter_config || '',
                secret_key: initialData.secret_key || '',
                has_secret_key: initialData.has_secret_key ?? false,
                certificate: initialData.certificate || '',
                has_certificate: initialData.has_certificate ?? false,
                adapter_key: initialData.adapter_key || '',
                protocol_version: initialData.protocol_version || '',
                adapter_binding_status: initialData.adapter_binding_status || '',
                has_existing_adapter_binding: initialData.has_existing_adapter_binding ?? false,
                certificateInfo: initialData.certificateInfo,
                timeout: initialData.timeout || '30',
                retry_count: initialData.retry_count || '3',
                retry_interval: initialData.retry_interval || '1000',
            }}
            validationSchema={getChannelValidationSchema(type)}
            onSubmit={(values: FormModel, { setSubmitting }) => {
                const formData = cloneDeep(values)
                onFormSubmit?.(formData, setSubmitting)
            }}
        >
            {({ values, touched, errors, isSubmitting }) => (
                <Form>
                    <FormContainer>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2">
                                <BasicInformationFields
                                    touched={touched}
                                    errors={errors}
                                    values={values}
                                    type={type}
                                />
                                <APIConfigFields
                                    touched={touched}
                                    errors={errors}
                                    values={values}
                                    adapterOptions={adapterOptions}
                                    hasSecretKey={values.has_secret_key}
                                />
                                <PricingFields touched={touched} errors={errors} values={values} />
                            </div>
                            <div className="lg:col-span-1">
                                <CertificateUpload
                                    values={values}
                                    touched={touched}
                                    errors={errors}
                                    hasCertificate={values.has_certificate}
                                />
                            </div>
                        </div>
                        <StickyFooter
                            className="-mx-8 px-8 flex items-center justify-between py-4"
                            stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        >
                            <div>
                                {type === 'edit' && onDelete && <DeleteChannelButton onDelete={onDelete} />}
                            </div>
                            <div className="md:flex items-center">
                                <Button
                                    size="sm"
                                    className="ltr:mr-3 rtl:ml-3"
                                    type="button"
                                    onClick={() => onDiscard?.()}
                                >
                                    取消
                                </Button>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    loading={isSubmitting}
                                    icon={<AiOutlineSave />}
                                    type="submit"
                                >
                                    保存
                                </Button>
                            </div>
                        </StickyFooter>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
})

ChannelForm.displayName = 'ChannelForm'

export default ChannelForm
