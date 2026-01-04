import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Checkbox from '@/components/ui/Checkbox'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik, FieldProps } from 'formik'
import {
    updatePaymentMethodData,
    closeEditPaymentMethodDialog,
    useAppDispatch,
    useAppSelector,
} from '../store'
import cloneDeep from 'lodash/cloneDeep'
import FormCustomFormatInput from '@/components/shared/FormCustomFormatInput'
import FormPatternInput from '@/components/shared/FormPatternInput'
import * as Yup from 'yup'

type FormModel = {
    cardHolderName: string
    ccNumber: string
    cardExpiry: string
    code: string
    primary: boolean
}

const validationSchema = Yup.object().shape({
    cardHolderName: Yup.string().required('Card holder name required'),
    ccNumber: Yup.string().required('Credit card number required'),
    cardExpiry: Yup.string()
        .required('Card holder name required')
        .matches(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/, 'Invalid Date'),
})

function limit(val: string, max: string) {
    if (val.length === 1 && val[0] > max[0]) {
        val = '0' + val
    }

    if (val.length === 2) {
        if (Number(val) === 0) {
            val = '01'
        } else if (val > max) {
            val = max
        }
    }

    return val
}

function cardExpiryFormat(val: string) {
    const month = limit(val.substring(0, 2), '12')
    const date = limit(val.substring(2, 4), '31')

    return month + (date.length ? '/' + date : '')
}

const EditPaymentMethod = () => {
    const dispatch = useAppDispatch()

    const card = useAppSelector(
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

    const onUpdateCreditCard = (values: FormModel) => {
        let newData = cloneDeep(data) || []
        const { cardHolderName, ccNumber, cardExpiry, primary } = values

        const isNewCard = !selectedCard.last4Number

        const updatedCard = {
            cardHolderName,
            last4Number: ccNumber.length >= 4 ? ccNumber.slice(-4) : ccNumber,
            expYear: cardExpiry.length >= 2 ? cardExpiry.slice(-2) : cardExpiry,
            expMonth: cardExpiry.length >= 2 ? cardExpiry.substring(0, 2) : cardExpiry,
            cardType: selectedCard.cardType || 'VISA',
            primary: primary || false,
        }

        if (isNewCard) {
            // 添加新卡
            if (primary) {
                // 如果设置为 primary，先将所有其他卡设为非 primary
                newData = newData.map((payment) => ({
                    ...payment,
                    primary: false,
                }))
            }
            newData.push(updatedCard)
        } else {
            // 编辑现有卡
            if (primary) {
                // 如果设置为 primary，先将所有其他卡设为非 primary
                newData = newData.map((payment) => ({
                    ...payment,
                    primary: false,
                }))
            }

            newData = newData.map((payment) => {
                if (payment.last4Number === selectedCard.last4Number) {
                    return { ...payment, ...updatedCard }
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
                        cardHolderName: card.cardHolderName || '',
                        ccNumber: '',
                        cardExpiry:
                            (card?.expMonth as string) + card.expYear || '',
                        code: '',
                        primary: card.primary || false,
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
                                        errors.cardHolderName &&
                                        touched.cardHolderName
                                    }
                                    errorMessage={errors.cardHolderName}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="cardHolderName"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    label="通道id"
                                    invalid={
                                        errors.ccNumber && touched.ccNumber
                                    }
                                    errorMessage={errors.ccNumber}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="ccNumber"
                                        component={Input}
                                        placeholder="通道ID"
                                    />
                                </FormItem>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormItem
                                        label="费率%"
                                        invalid={
                                            errors.cardExpiry &&
                                            touched.cardExpiry
                                        }
                                        errorMessage={errors.cardExpiry}
                                    >
                                        <Field name="cardExpiry">
                                            {({ field, form }: FieldProps) => {
                                                return (
                                                    <FormCustomFormatInput
                                                        form={form}
                                                        field={field}
                                                        placeholder="10%"
                                                        format={
                                                            cardExpiryFormat
                                                        }
                                                        defaultValue={
                                                            form.values
                                                                .cardExpiry
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
                                    <FormItem
                                        label="固定费率"
                                        invalid={errors.code && touched.code}
                                        errorMessage={errors.code}
                                    >
                                        <Field name="code">
                                            {({ field, form }: FieldProps) => {
                                                return (
                                                    <FormPatternInput
                                                        form={form}
                                                        field={field}
                                                        placeholder="00.00"
                                                        format="###"
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
