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
    channelID: string
    currency: string  // 币种
    appFee: string
    code: string
    primary: boolean
    exchangeRateMarkup: string  // 汇率加点（格式：卖出/买入）
    withdrawalFeePercent: string  // 提款手续费百分比
}

//渠道设置
const validationSchema = Yup.object().shape({
    channelName: Yup.string().required('通道名不能为空'),
    channelID: Yup.string().required('通道ID不能为空'),
    currency: Yup.string().required('币种不能为空'),
    appFee: Yup.string().required('费率不能为空'),
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
        const { channelName, channelID, currency, appFee, code, primary, exchangeRateMarkup, withdrawalFeePercent } = values

        // 使用 id 判断是否为新应用（id 存在表示编辑现有应用）
        const isNewApp = !selectedCard.id

        // 从 appFee 字符串中提取 payIn 和 payOut（格式：5.5/6.8）
        const [payIn, payOut] = appFee.split('/').map(v => v.trim())
        // 从 code 字符串中提取 fixedFeeIn 和 fixedFeeOut（格式：10/11）
        const [fixedFeeIn, fixedFeeOut] = code.split('/').map(v => v.trim())
        // 从 exchangeRateMarkup 字符串中提取卖出和买入加点（格式：0.5/0.3）
        const [rateSell, rateBuy] = exchangeRateMarkup.split('/').map(v => v.trim())

        const updatedApp = {
            id: selectedCard.id || '',
            channelName,
            number: channelID,
            payIn: payIn || '',
            payOut: payOut || '',
            fixedFeeIn: fixedFeeIn || '',
            fixedFeeOut: fixedFeeOut || '',
            cardType: currency || 'CNY',  // 使用币种字段
            primary: primary || false,
            balanceAmount: selectedCard.balanceAmount || 0,
            frozenAmount: selectedCard.frozenAmount || 0,
            availableAmount: selectedCard.availableAmount || 0,
            withdrawalFeePercent: parseFloat(withdrawalFeePercent) || 0,
            exchangeRateSell: parseFloat(rateSell) || 0,
            exchangeRateBuy: parseFloat(rateBuy) || 0,
        }

        // 解析费率值
        const payInPercentage = parseFloat(payIn) || 0
        const payOutPercentage = parseFloat(payOut) || 0
        const payInFixed = parseInt(fixedFeeIn) || 0
        const payOutFixed = parseInt(fixedFeeOut) || 0

        if (isNewApp && profileData.id) {
            // 调用后端 API 创建新应用
            try {
                await dispatch(createApplication({
                    merchantId: profileData.id,
                    name: channelName,
                    config: {
                        pay_in_percentage_fee: payInPercentage,
                        pay_in_fixed_fee: payInFixed,
                        pay_out_percentage_fee: payOutPercentage,
                        pay_out_fixed_fee: payOutFixed,
                        currency: currency,  // 使用用户选择的币种
                        withdrawal_fee_percent: parseFloat(withdrawalFeePercent) || 0,
                        exchange_rate_sell: parseFloat(rateSell) || 0,
                        exchange_rate_buy: parseFloat(rateBuy) || 0,
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
        } else if (selectedCard.id) {
            // 编辑现有应用 - 调用后端 API 更新配置
            try {
                await apiUpdateApplicationConfig(selectedCard.id, {
                    pay_in_percentage_fee: payInPercentage,
                    pay_in_fixed_fee: payInFixed,
                    pay_out_percentage_fee: payOutPercentage,
                    pay_out_fixed_fee: payOutFixed,
                    currency: currency,  // 使用用户选择的币种
                    withdrawal_fee_percent: parseFloat(withdrawalFeePercent) || 0,
                    exchange_rate_sell: parseFloat(rateSell) || 0,
                    exchange_rate_buy: parseFloat(rateBuy) || 0,
                })
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
                    initialValues={{
                        channelName: merApp.channelName || '',
                        channelID: merApp.number || '',
                        currency: merApp.cardType || 'CNY',  // 从 cardType 读取币种
                        appFee: (merApp?.payIn || merApp?.payOut) 
                            ? `${merApp.payIn || ''}/${merApp.payOut || ''}` 
                            : '',
                        code: (merApp?.fixedFeeIn || merApp?.fixedFeeOut)
                            ? `${merApp.fixedFeeIn || ''}/${merApp.fixedFeeOut || ''}`
                            : '',
                        primary: merApp.primary || false,
                        exchangeRateMarkup: `${merApp.exchangeRateSell || '0'}/${merApp.exchangeRateBuy || '0'}`,
                        withdrawalFeePercent: String(merApp.withdrawalFeePercent || '0'),
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
                                <div className="grid grid-cols-2 gap-4">
                                    <FormItem
                                        label="通道ID"
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
                                    <FormItem
                                        label="币种"
                                        invalid={
                                            errors.currency && touched.currency
                                        }
                                        errorMessage={errors.currency}
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="currency"
                                            component={Input}
                                            placeholder="CNY/USD/EUR"
                                        />
                                    </FormItem>
                                </div>
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
                                <div className="grid grid-cols-2 gap-4">
                                    <FormItem
                                        label="汇率加点% (卖出/买入)"
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="exchangeRateMarkup"
                                            component={Input}
                                            placeholder="0.5/0.3"
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="提款手续费%"
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="withdrawalFeePercent"
                                            component={Input}
                                            placeholder="5"
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
