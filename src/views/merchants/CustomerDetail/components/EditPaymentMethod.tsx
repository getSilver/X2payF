import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Checkbox from '@/components/ui/Checkbox'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import {
    updatePaymentMethodData,
    closeEditPaymentMethodDialog,
    createApplication,
    useAppDispatch,
    useAppSelector,
} from '../store'
import { apiUpdateApplicationConfig } from '@/services/api/AccountApi'
import cloneDeep from 'lodash/cloneDeep'
import * as Yup from 'yup'

type FormModel = {
    channelName: string
    channels: string
    timezone: string
    fee_rate_pair: string
    fixed_fee_pair: string
    payment_methods: string
    single_txn_min: string
    single_txn_max: string
    daily_limit: string
    primary: boolean
}

const pairPattern = /^\s*-?\d+(?:\.\d+)?\s*\/\s*-?\d+(?:\.\d+)?\s*$/

const pairFieldSchema = (label: string) =>
    Yup.string()
        .required(`${label}不能为空`)
        .test(
            'slash-pair-format',
            `${label}格式必须为 in/out，例如 0.1/3`,
            (value) => pairPattern.test(value || '')
        )

const parseSlashPair = (value: string) => {
    const [left = '0', right = '0'] = value.split('/')

    return {
        left: left.trim(),
        right: right.trim(),
    }
}

const formatSlashPair = (
    left: string | number | null | undefined,
    right: string | number | null | undefined
) => `${left ?? 0}/${right ?? 0}`

//渠道设置
const validationSchema = Yup.object().shape({
    channelName: Yup.string().required('通道名不能为空'),
    channels: Yup.string().required('通道ID不能为空'),
    timezone: Yup.string().required('时区不能为空'),
    fee_rate_pair: pairFieldSchema('费率'),
    fixed_fee_pair: pairFieldSchema('单笔费用'),
})

const EditPaymentMethod = () => {
    const dispatch = useAppDispatch()

    const merApp = useAppSelector(
        (state) => state.crmCustomerDetails.data.selectedCard
    )
    const data = useAppSelector(
        (state) => state.crmCustomerDetails.data.paymentMethodData
    )
    const dialogOpen = useAppSelector(
        (state) => state.crmCustomerDetails.data.editPaymentMethodDialog
    )
    const selectedCard = useAppSelector(
        (state) => state.crmCustomerDetails.data.selectedCard
    )
    const profileData = useAppSelector(
        (state) => state.crmCustomerDetails.data.profileData
    )

    const onUpdateCreditCard = async (values: FormModel) => {
        let newData = cloneDeep(data) || []
        const {
            channelName,
            channels,
            timezone,
            fee_rate_pair,
            fixed_fee_pair,
            payment_methods,
            single_txn_min,
            single_txn_max,
            daily_limit,
            primary,
        } = values
        const { left: inFeeRate, right: outFeeRate } = parseSlashPair(
            fee_rate_pair
        )
        const { left: inFixedFee, right: outFixedFee } = parseSlashPair(
            fixed_fee_pair
        )

        // 使用 id 判断是否为新应用（id 存在表示编辑现有应用）
        const isNewApp = !selectedCard.id
        const paymentMethodList = payment_methods
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item !== '')

        const singleTxnMin = Number(single_txn_min) || 0
        const singleTxnMax = Number(single_txn_max) || 0
        const dailyLimit = Number(daily_limit) || 0

        const updatedApp = {
            id: selectedCard.id || '',
            channelName,
            channel_id: channels,
            in_fee_rate: inFeeRate || '',
            out_fee_rate: outFeeRate || '',
            in_fixed_fee: inFixedFee || '',
            out_fixed_fee: outFixedFee || '',
            currency: selectedCard.currency || merApp.currency || 'USD',
            timezone: timezone || '',
            payment_methods: paymentMethodList,
            single_txn_min: singleTxnMin,
            single_txn_max: singleTxnMax,
            daily_limit: dailyLimit,
            primary: primary || false,
            balance: selectedCard.balance || 0,
            frozen_amount: selectedCard.frozen_amount || 0,
            available_amount: selectedCard.available_amount || 0,
        }

        const applicationConfig = {
            in_fee_rate: parseFloat(inFeeRate) || 0,
            in_fixed_fee: parseFloat(inFixedFee) || 0,
            out_fee_rate: parseFloat(outFeeRate) || 0,
            out_fixed_fee: parseFloat(outFixedFee) || 0,
            channels: channels ? [channels] : [],
            payment_methods: paymentMethodList,
            timezone: timezone || '',
            single_txn_min: singleTxnMin,
            single_txn_max: singleTxnMax,
            daily_limit: dailyLimit,
        }

        if (isNewApp && profileData.id) {
            // 调用后端 API 创建新应用
            try {
                await dispatch(createApplication({
                    merchantId: profileData.id,
                    name: channelName,
                    config: applicationConfig,
                }))
            } catch (error) {
                console.error('创建应用失败:', error)
            }
            
            // 更新本地状态
            if (primary) {
                newData = newData.map((payment) => ({
                    ...payment,
                    primary: false,
                }))
            }
            newData.push(updatedApp)
        } else if (selectedCard.id) {
            // 编辑现有应用 - 调用后端 API 更新配置
            try {
                await apiUpdateApplicationConfig(selectedCard.id, applicationConfig)
            } catch (error) {
                console.error('更新应用配置失败:', error)
            }

            // 更新本地状态
            if (primary) {
                newData = newData.map((payment) => ({
                    ...payment,
                    primary: false,
                }))
            }

            // 使用 id 匹配更新
            newData = newData.map((payment) => {
                if (payment.id === selectedCard.id) {
                    return { ...payment, ...updatedApp }
                }
                return payment
            })
        }

        onDialogClose()
        dispatch(updatePaymentMethodData(newData))
    }
    const onDialogClose = () => {
        dispatch(closeEditPaymentMethodDialog())
    }

    return (
        <Dialog
            isOpen={dialogOpen}
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
        >
            <h4>编辑通道信息</h4>
            <div className="mt-6">
                <Formik
                    enableReinitialize
                    initialValues={{
                        channelName: merApp.channelName || '',
                        channels: merApp.channel_id || '',
                        timezone: merApp.timezone || '',
                        fee_rate_pair: formatSlashPair(
                            merApp.in_fee_rate,
                            merApp.out_fee_rate
                        ),
                        fixed_fee_pair: formatSlashPair(
                            merApp.in_fixed_fee,
                            merApp.out_fixed_fee
                        ),
                        payment_methods: (merApp.payment_methods || []).join(','),
                        single_txn_min: String(merApp.single_txn_min || 0),
                        single_txn_max: String(merApp.single_txn_max || 0),
                        daily_limit: String(merApp.daily_limit || 0),
                        primary: merApp.primary || false,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        await onUpdateCreditCard(values)
                        setSubmitting(false)
                    }}
                >
                    {({ touched, errors }) => (
                        <Form>
                            <FormContainer>
                                <FormItem
                                    label="通道名"
                                    invalid={
                                        errors.channelName &&
                                        touched.channelName
                                    }
                                    errorMessage={errors.channelName}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="channelName"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    label="通道ID"
                                    invalid={
                                        errors.channels && touched.channels
                                    }
                                    errorMessage={errors.channels}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="channels"
                                        component={Input}
                                        placeholder="通道ID"
                                    />
                                </FormItem>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormItem
                                        label="费率 (in/out)"
                                        invalid={
                                            errors.fee_rate_pair &&
                                            touched.fee_rate_pair
                                        }
                                        errorMessage={errors.fee_rate_pair}
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="fee_rate_pair"
                                            component={Input}
                                            placeholder="0.1/3"
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="单笔费用 (in/out)"
                                        invalid={
                                            errors.fixed_fee_pair &&
                                            touched.fixed_fee_pair
                                        }
                                        errorMessage={errors.fixed_fee_pair}
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="fixed_fee_pair"
                                            component={Input}
                                            placeholder="5/20"
                                        />
                                    </FormItem>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormItem label="timezone">
                                        <Input
                                            value={merApp.timezone || ''}
                                            readOnly
                                            disabled
                                        />
                                    </FormItem>
                                    <FormItem label="payment_methods (comma-separated)">
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="payment_methods"
                                            component={Input}
                                            placeholder="PIX,QR"
                                        />
                                    </FormItem>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <FormItem label="single_txn_min">
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="single_txn_min"
                                            component={Input}
                                            placeholder="100"
                                        />
                                    </FormItem>
                                    <FormItem label="single_txn_max">
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="single_txn_max"
                                            component={Input}
                                            placeholder="1000000"
                                        />
                                    </FormItem>
                                    <FormItem label="daily_limit">
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="daily_limit"
                                            component={Input}
                                            placeholder="5000000"
                                        />
                                    </FormItem>
                                </div>
                                <FormItem>
                                    <Field name="primary" component={Checkbox}>
                                    Set this card as primary
                                    </Field>
                                </FormItem>
                                <FormItem className="mb-0 text-right">
                                    <Button block variant="solid" type="submit">
                                        Update
                                    </Button>
                                </FormItem>
                            </FormContainer>
                        </Form>
                    )}
                </Formik>
            </div>
        </Dialog>
    )
}

export default EditPaymentMethod
