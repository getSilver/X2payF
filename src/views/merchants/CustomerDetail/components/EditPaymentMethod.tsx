import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Checkbox from '@/components/ui/Checkbox'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import { Field, Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import {
    closeEditPaymentMethodDialog,
    createApplication,
    getCustomer,
    useAppDispatch,
    useAppSelector,
} from '../store'
import {
    apiCreateAppAgentRelation,
    apiDeleteAppAgentRelation,
    apiUpdateApplicationConfig,
    apiUpdateAppAgentRelation,
} from '@/services/api/AccountApi'
import { apiGetPlatformAssociations } from '@/services/PlatformSettingsService'
import type { SingleValue } from 'react-select'
import * as Yup from 'yup'

type CurrencyAssociationOption = {
    value: string
    label: string
    timezone: string
}

type FormModel = {
    channelName: string
    channels: string
    currency: string
    timezone: string
    exchange_rate_sell: string
    exchange_rate_buy: string
    fee_rate_pair: string
    fixed_fee_pair: string
    payment_methods: string
    single_txn_min: string
    single_txn_max: string
    daily_limit: string
    agent_id: string
    agent_fee_rate_pair: string
    agent_fixed_fee_pair: string
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
    currency: Yup.string().required('币种不能为空'),
    timezone: Yup.string().required('时区不能为空'),
    exchange_rate_sell: Yup.number()
        .typeError('Sell Markup 必须是数字')
        .min(0, 'Sell Markup 不能小于 0')
        .required('Sell Markup 不能为空'),
    exchange_rate_buy: Yup.number()
        .typeError('Buy Markup 必须是数字')
        .min(0, 'Buy Markup 不能小于 0')
        .required('Buy Markup 不能为空'),
    fee_rate_pair: pairFieldSchema('费率'),
    fixed_fee_pair: pairFieldSchema('单笔费用'),
    agent_id: Yup.string(),
    agent_fee_rate_pair: pairFieldSchema('代理费率'),
    agent_fixed_fee_pair: pairFieldSchema('代理单笔费用'),
})

const EditPaymentMethod = () => {
    const dispatch = useAppDispatch()
    const [currencyOptions, setCurrencyOptions] = useState<CurrencyAssociationOption[]>([])

    const merApp = useAppSelector(
        (state) => state.crmCustomerDetails.data.selectedCard
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
    const isNewApp = !selectedCard.id

    useEffect(() => {
        const fetchAssociations = async () => {
            try {
                const response = await apiGetPlatformAssociations<
                    { data?: Array<Record<string, unknown>> } | Array<Record<string, unknown>>,
                    Record<string, unknown>
                >()
                const responseData = response.data as
                    | { data?: Array<Record<string, unknown>> }
                    | Array<Record<string, unknown>>
                const associations = Array.isArray(responseData)
                    ? responseData
                    : responseData?.data || []
                const options = associations
                    .filter((assoc) => Boolean(assoc.id))
                    .map((assoc) => {
                        const currency = assoc.currency as
                            | { code?: string; name?: string }
                            | undefined
                        const timezone = assoc.timezone as
                            | { code?: string; name?: string; offset?: string }
                            | undefined
                        const timezoneValue = timezone?.code || ''
                        return {
                            value: currency?.code || '',
                            label:
                                [
                                    currency?.code || currency?.name,
                                    timezoneValue ||
                                        timezone?.name ||
                                        timezone?.offset,
                                ]
                                    .filter(Boolean)
                                    .join(' - ') || String(assoc.id),
                            timezone: timezoneValue,
                        }
                    })
                    .filter((option) => option.value !== '')
                setCurrencyOptions(options)
            } catch (error) {
                console.error('Failed to load currency associations:', error)
                setCurrencyOptions([])
            }
        }

        fetchAssociations()
    }, [])

    const onUpdateCreditCard = async (values: FormModel) => {
        const {
            channelName,
            channels,
            currency,
            timezone,
            exchange_rate_sell,
            exchange_rate_buy,
            fee_rate_pair,
            fixed_fee_pair,
            payment_methods,
            single_txn_min,
            single_txn_max,
            daily_limit,
            agent_id,
            agent_fee_rate_pair,
            agent_fixed_fee_pair,
        } = values
        const { left: inFeeRate, right: outFeeRate } = parseSlashPair(
            fee_rate_pair
        )
        const { left: inFixedFee, right: outFixedFee } = parseSlashPair(
            fixed_fee_pair
        )
        const {
            left: agentPayInPercentageProfitSharing,
            right: agentPayOutPercentageProfitSharing,
        } = parseSlashPair(agent_fee_rate_pair)
        const {
            left: agentPayInFixedProfitSharing,
            right: agentPayOutFixedProfitSharing,
        } = parseSlashPair(agent_fixed_fee_pair)

        const paymentMethodList = payment_methods
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item !== '')

        const singleTxnMin = Number(single_txn_min) || 0
        const singleTxnMax = Number(single_txn_max) || 0
        const dailyLimit = Number(daily_limit) || 0
        const exchangeRateSell = Number(exchange_rate_sell) || 0
        const exchangeRateBuy = Number(exchange_rate_buy) || 0

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

        try {
            let appID = String(selectedCard.id || '').trim()
            if (isNewApp) {
                if (!profileData.id) {
                    throw new Error('缺少商户ID，无法创建应用')
                }
                const createdApp = await dispatch(
                    createApplication({
                        merchantId: profileData.id,
                        name: channelName,
                        currency,
                        exchange_rate_sell: exchangeRateSell,
                        exchange_rate_buy: exchangeRateBuy,
                        config: applicationConfig,
                    })
                ).unwrap()
                appID = String(createdApp?.id || '').trim()
            } else if (selectedCard.id) {
                await apiUpdateApplicationConfig(selectedCard.id, {
                    name: channelName,
                    currency,
                    exchange_rate_sell: exchangeRateSell,
                    exchange_rate_buy: exchangeRateBuy,
                    config: applicationConfig,
                })
            } else {
                throw new Error('缺少应用ID，无法更新配置')
            }

            const nextAgentID = agent_id.trim()
            const currentRelationId = String(selectedCard.relationId || '').trim()
            const currentAgentID = String(selectedCard.agentId || '').trim()
            const hasCurrentRelation = Boolean(currentRelationId)

            if (!appID) {
                throw new Error('缺少应用ID，无法处理代理绑定')
            }

            if (!nextAgentID && hasCurrentRelation) {
                await apiDeleteAppAgentRelation(currentRelationId)
            } else if (nextAgentID) {
                const relationPayload = {
                    app_id: appID,
                    agent_id: nextAgentID,
                    pay_in_percentage_profit_sharing:
                        Number(agentPayInPercentageProfitSharing) || 0,
                    pay_out_percentage_profit_sharing:
                        Number(agentPayOutPercentageProfitSharing) || 0,
                    pay_in_fixed_profit_sharing:
                        Number(agentPayInFixedProfitSharing) || 0,
                    pay_out_fixed_profit_sharing:
                        Number(agentPayOutFixedProfitSharing) || 0,
                }

                if (!hasCurrentRelation) {
                    await apiCreateAppAgentRelation(relationPayload)
                } else if (currentAgentID && currentAgentID !== nextAgentID) {
                    await apiDeleteAppAgentRelation(currentRelationId)
                    await apiCreateAppAgentRelation(relationPayload)
                } else {
                    await apiUpdateAppAgentRelation(currentRelationId, {
                        pay_in_percentage_profit_sharing:
                            relationPayload.pay_in_percentage_profit_sharing,
                        pay_out_percentage_profit_sharing:
                            relationPayload.pay_out_percentage_profit_sharing,
                        pay_in_fixed_profit_sharing:
                            relationPayload.pay_in_fixed_profit_sharing,
                        pay_out_fixed_profit_sharing:
                            relationPayload.pay_out_fixed_profit_sharing,
                    })
                }
            }

            if (profileData.id) {
                await dispatch(getCustomer({ id: profileData.id })).unwrap()
            }
            onDialogClose()
        } catch (error) {
            console.error(
                isNewApp ? '创建应用失败:' : '更新应用配置失败:',
                error
            )
        }
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
                        currency: merApp.currency || '',
                        timezone:
                            merApp.timezone ||
                            profileData.personalInfo?.location ||
                            '',
                        exchange_rate_sell: String(
                            merApp.exchange_rate_sell ?? 0
                        ),
                        exchange_rate_buy: String(
                            merApp.exchange_rate_buy ?? 0
                        ),
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
                        agent_id: String(merApp.agentId || ''),
                        agent_fee_rate_pair: formatSlashPair(
                            merApp.payInPercentageProfitSharing || 0,
                            merApp.payOutPercentageProfitSharing || 0
                        ),
                        agent_fixed_fee_pair: formatSlashPair(
                            merApp.payInFixedProfitSharing || 0,
                            merApp.payOutFixedProfitSharing || 0
                        ),
                        primary: merApp.primary || false,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        await onUpdateCreditCard(values)
                        setSubmitting(false)
                    }}
                >
                    {({ touched, errors, values, setFieldValue }) => (
                        <Form>
                            <FormContainer>
                                <FormItem
                                    label="商户App"
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
                                        label="Sell Markup %"
                                        invalid={
                                            errors.exchange_rate_sell &&
                                            touched.exchange_rate_sell
                                        }
                                        errorMessage={errors.exchange_rate_sell}
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="exchange_rate_sell"
                                            component={Input}
                                            placeholder="0.5"
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="Buy Markup %"
                                        invalid={
                                            errors.exchange_rate_buy &&
                                            touched.exchange_rate_buy
                                        }
                                        errorMessage={errors.exchange_rate_buy}
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="exchange_rate_buy"
                                            component={Input}
                                            placeholder="0.3"
                                        />
                                    </FormItem>
                                </div>
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
                                    <FormItem
                                        label="Currency Association"
                                        invalid={
                                            (errors.currency && touched.currency) ||
                                            (errors.timezone && touched.timezone)
                                        }
                                        errorMessage={errors.currency || errors.timezone}
                                    >
                                        <Field name="currency">
                                            {() => (
                                                <div>
                                                    <Select<CurrencyAssociationOption>
                                                        options={currencyOptions}
                                                        placeholder="Select Currency Association"
                                                        value={
                                                            currencyOptions.find(
                                                                (option) =>
                                                                    option.value ===
                                                                    values.currency
                                                            ) || null
                                                        }
                                                        className="w-full"
                                                        onChange={(
                                                            option: SingleValue<CurrencyAssociationOption>
                                                        ) => {
                                                            setFieldValue(
                                                                'currency',
                                                                option?.value || ''
                                                            )
                                                            setFieldValue(
                                                                'timezone',
                                                                option?.timezone || ''
                                                            )
                                                        }}
                                                    />
                                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                        Auto-filled timezone:{' '}
                                                        {values.timezone || '-'}
                                                    </div>
                                                </div>
                                            )}
                                        </Field>
                                    </FormItem>
                                    <FormItem label="payment methods">
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="payment_methods"
                                            component={Input}
                                            placeholder="PIX,QR"
                                        />
                                    </FormItem>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormItem
                                        label="agent_id"
                                        invalid={
                                            errors.agent_id && touched.agent_id
                                        }
                                        errorMessage={errors.agent_id}
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="agent_id"
                                            component={Input}
                                            placeholder="留空表示解绑代理"
                                        />
                                    </FormItem>
                                    <FormItem label="relation_status">
                                        <Input
                                            disabled
                                            value={
                                                selectedCard.relationStatus ||
                                                'unbound'
                                            }
                                        />
                                    </FormItem>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormItem
                                        label="代理费率 (in/out)"
                                        invalid={
                                            errors.agent_fee_rate_pair &&
                                            touched.agent_fee_rate_pair
                                        }
                                        errorMessage={errors.agent_fee_rate_pair}
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="agent_fee_rate_pair"
                                            component={Input}
                                            placeholder="2/1"
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="代理单笔费用 (in/out)"
                                        invalid={
                                            errors.agent_fixed_fee_pair &&
                                            touched.agent_fixed_fee_pair
                                        }
                                        errorMessage={errors.agent_fixed_fee_pair}
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="agent_fixed_fee_pair"
                                            component={Input}
                                            placeholder="5/3"
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
