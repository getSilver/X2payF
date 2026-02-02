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
import cloneDeep from 'lodash/cloneDeep'
import * as Yup from 'yup'

type FormModel = {
    channelName: string
    channelID: string
    appFee: string
    code: string
    primary: boolean
}

//渠道设置
const validationSchema = Yup.object().shape({
    channelName: Yup.string().required('Card holder name required'),
    channelID: Yup.string().required('Credit card number required'),
    appFee: Yup.string()
        .required('Card holder name required')
        .required('Card holder name required'),
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
        const { channelName, channelID, appFee, code, primary } = values

        const isNewApp = !selectedCard.number

        // 从 appFee 字符串中提取 payIn 和 payOut（格式：5.5/6.8）
        const [payIn, payOut] = appFee.split('/').map(v => v.trim())
        // 从 code 字符串中提取 fixedFeeIn 和 fixedFeeOut（格式：10/11）
        const [fixedFeeIn, fixedFeeOut] = code.split('/').map(v => v.trim())

        const updatedApp = {
            channelName,
            number: channelID,
            payIn: payIn || '',
            payOut: payOut || '',
            fixedFeeIn: fixedFeeIn || '',
            fixedFeeOut: fixedFeeOut || '',
            cardType: selectedCard.cardType || 'VISA',
            primary: primary || false,
        }

        if (isNewApp && profileData.id) {
            // 调用后端 API 创建新应用
            // 前端输入格式：appFee = "0.5/5" (代收百分比/代付百分比)
            // 前端输入格式：code = "5/200" (代收固定费用/代付固定费用)
            const payInPercentage = parseFloat(payIn) || 0
            const payOutPercentage = parseFloat(payOut) || 0
            const payInFixed = parseInt(fixedFeeIn) || 0
            const payOutFixed = parseInt(fixedFeeOut) || 0
            
            try {
                await dispatch(createApplication({
                    merchantId: profileData.id,
                    name: channelName,
                    config: {
                        pay_in_percentage_fee: payInPercentage,
                        pay_in_fixed_fee: payInFixed,
                        pay_out_percentage_fee: payOutPercentage,
                        pay_out_fixed_fee: payOutFixed,
                        currency: 'CNY',
                    },
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
        } else {
            // 编辑现有卡（本地更新，后端暂无更新接口）
            if (primary) {
                newData = newData.map((payment) => ({
                    ...payment,
                    primary: false,
                }))
            }

            newData = newData.map((payment) => {
                if (payment.number === selectedCard.number) {
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
                    initialValues={{
                        channelName: merApp.channelName || '',
                        channelID: merApp.number || '',
                        appFee: (merApp?.payIn || merApp?.payOut) 
                            ? `${merApp.payIn || ''}/${merApp.payOut || ''}` 
                            : '',
                        code: (merApp?.fixedFeeIn || merApp?.fixedFeeOut)
                            ? `${merApp.fixedFeeIn || ''}/${merApp.fixedFeeOut || ''}`
                            : '',
                        primary: merApp.primary || false,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        onUpdateCreditCard(values)
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
                                    label="通道id"
                                    invalid={
                                        errors.channelID && touched.channelID
                                    }
                                    errorMessage={errors.channelID}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="channelID"
                                        component={Input}
                                        placeholder="通道ID"
                                    />
                                </FormItem>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormItem
                                        label="费率%"
                                        invalid={
                                            errors.appFee && touched.appFee
                                        }
                                        errorMessage={errors.appFee}
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="appFee"
                                            component={Input}
                                            placeholder="5.5/6.8"
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="固定费率"
                                        invalid={errors.code && touched.code}
                                        errorMessage={errors.code}
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="code"
                                            component={Input}
                                            placeholder="10/11"
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
