import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import {
    closeEditPaymentMethodDialog,
    createAgentRateConfig,
    updateAgentRateConfig,
    useAppDispatch,
    useAppSelector,
} from '../store'
import * as Yup from 'yup'

type FormModel = {
    appId: string
    feeRate: string
    profitShareRate: string
    supportedCurrencies: string
}

const parseCurrencies = (value: string) =>
    value
        .split(',')
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean)

const EditAgentRateConfig = () => {
    const dispatch = useAppDispatch()

    const dialogOpen = useAppSelector(
        (state) => state.crmCustomerDetails.data.editPaymentMethodDialog
    )
    const selectedCard = useAppSelector(
        (state) => state.crmCustomerDetails.data.selectedCard
    )
    const paymentMethodData = useAppSelector(
        (state) => state.crmCustomerDetails.data.paymentMethodData
    )
    const profileData = useAppSelector(
        (state) => state.crmCustomerDetails.data.profileData
    )

    const fallbackRelationIdFromProfile = String(
        (profileData as Record<string, unknown>).relation_id || ''
    ).trim()
    const fallbackAppIdFromProfile = String(
        (profileData as Record<string, unknown>).app_id || ''
    ).trim()
    const agentRateCard = paymentMethodData.find(
        (item) => item.configType === 'agent_rate'
    )
    const fallbackRelationIdFromList = String(
        agentRateCard?.entityId ||
            (agentRateCard?.id?.startsWith('aar_') ? agentRateCard.id : '') ||
            ''
    ).trim()
    const fallbackAppIdFromList = String(
        agentRateCard?.appId || agentRateCard?.number || ''
    ).trim()

    const relationIdFromEntity = String(selectedCard.entityId || '').trim()
    const relationIdFromId = String(selectedCard.id || '').trim()
    const relationId =
        relationIdFromEntity ||
        (relationIdFromId && !relationIdFromId.endsWith('_rate_config')
            ? relationIdFromId
            : '') ||
        fallbackRelationIdFromProfile ||
        fallbackRelationIdFromList
    const hasPersistedRelationId = Boolean(relationId)
    const initialAppId = String(
        selectedCard.appId ||
            selectedCard.number ||
            fallbackAppIdFromProfile ||
            fallbackAppIdFromList ||
            ''
    ).trim()
    const initialFeeRate = String(
        selectedCard.feeRate ?? selectedCard.payIn ?? '0'
    )
    const initialProfitShareRate = String(
        selectedCard.profitShareRate ?? selectedCard.fixedFeeIn ?? '0'
    )
    const initialSupportedCurrencies = (
        selectedCard.supportedCurrencies || []
    ).join(',')
    const hasExistingConfigData =
        Boolean(initialAppId) ||
        initialFeeRate !== '0' ||
        initialProfitShareRate !== '0' ||
        Boolean(initialSupportedCurrencies)
    const isUpdateMode = hasPersistedRelationId || hasExistingConfigData
    console.log('[AgentRateDebug] dialog context', {
        relationId,
        hasPersistedRelationId,
        isUpdateMode,
        initialAppId,
        fallbackRelationIdFromProfile,
        fallbackRelationIdFromList,
        fallbackAppIdFromProfile,
        fallbackAppIdFromList,
    })

    const validationSchema = Yup.object().shape({
        appId: isUpdateMode
            ? Yup.string()
            : Yup.string().required('商户应用ID不能为空'),
        feeRate: Yup.number()
            .typeError('费率必须是数字')
            .min(0, '费率不能小于0')
            .required('fee_rate 不能为空'),
        profitShareRate: Yup.number()
            .typeError('分润比例必须是数字')
            .min(0, '分润比例不能小于0')
            .required('profit_share_rate 不能为空'),
        supportedCurrencies: Yup.string().required(
            'supported_currencies 不能为空'
        ),
    })

    const onDialogClose = () => {
        dispatch(closeEditPaymentMethodDialog())
    }

    const onSubmit = async (values: FormModel) => {
        console.log('[AgentRateDebug] formik onSubmit fired')
        console.log('[AgentRateDebug] submit values', values)
        const agentId = String(profileData.id || '').trim()
        if (!agentId) {
            console.log('[AgentRateDebug] missing agentId, abort submit')
            return
        }

        console.log('[AgentRateDebug] agent submit context', {
            agentId,
            relationId,
            hasPersistedRelationId,
            isUpdateMode,
            appIdFromCard: initialAppId,
            fallbackRelationIdFromProfile,
            fallbackRelationIdFromList,
            fallbackAppIdFromProfile,
            fallbackAppIdFromList,
            selectedCard,
        })

        const payload = {
            app_id: values.appId.trim(),
            fee_rate: Number(values.feeRate) || 0,
            profit_share_rate: Number(values.profitShareRate) || 0,
            supported_currencies: parseCurrencies(values.supportedCurrencies),
            agentId,
        }

        try {
            if (hasPersistedRelationId) {
                const changedProfitShareRate =
                    Number(values.profitShareRate) !==
                    Number(initialProfitShareRate)
                const changedFeeRate =
                    Number(values.feeRate) !== Number(initialFeeRate)
                const changedSupportedCurrencies =
                    parseCurrencies(values.supportedCurrencies).join(',') !==
                    parseCurrencies(initialSupportedCurrencies).join(',')
                const changedAppId = values.appId.trim() !== initialAppId

                console.log('[AgentRateDebug] submit branch: updateAgentRateConfig')
                await dispatch(
                    updateAgentRateConfig({
                        relationId,
                        agentId,
                        app_id: changedAppId ? values.appId.trim() : undefined,
                        profit_share_rate: changedProfitShareRate
                            ? Number(values.profitShareRate)
                            : undefined,
                        fee_rate: changedFeeRate
                            ? Number(values.feeRate)
                            : undefined,
                        supported_currencies: changedSupportedCurrencies
                            ? parseCurrencies(values.supportedCurrencies)
                            : undefined,
                    })
                ).unwrap()
            } else if (isUpdateMode) {
                console.log('[AgentRateDebug] submit branch: updateAgentRateConfig')
                console.error(
                    '[AgentRateDebug] missing relationId in update mode, abort'
                )
                return
            } else {
                console.log('[AgentRateDebug] submit branch: createAgentRateConfig')
                await dispatch(createAgentRateConfig(payload)).unwrap()
            }
            onDialogClose()
        } catch (error) {
            console.error('保存代理分润配置失败:', error)
        }
    }

    const lockAppId = isUpdateMode && Boolean(initialAppId)

    return (
        <Dialog
            isOpen={dialogOpen}
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
        >
            <h4>{isUpdateMode ? '编辑代理分润配置' : '新增代理分润配置'}</h4>
            <div className="mt-6">
                <Formik
                    enableReinitialize
                    initialValues={{
                        appId: initialAppId,
                        feeRate: initialFeeRate,
                        profitShareRate: initialProfitShareRate,
                        supportedCurrencies: initialSupportedCurrencies,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        await onSubmit(values)
                        setSubmitting(false)
                    }}
                >
                    {({ touched, errors, isSubmitting, submitCount, values }) => {
                        if (submitCount > 0 && errors.appId) {
                            console.log('[AgentRateDebug] validation failed: appId', {
                                error: errors.appId,
                                submitCount,
                                values,
                                hasPersistedRelationId,
                                relationId,
                                initialAppId,
                            })
                        }

                        return (
                            <Form>
                                <FormContainer>
                                <FormItem
                                    label="商户应用ID"
                                    invalid={errors.appId && touched.appId}
                                    errorMessage={errors.appId}
                                >
                                    <Field
                                        disabled={lockAppId}
                                        type="text"
                                        autoComplete="off"
                                        name="appId"
                                        component={Input}
                                        placeholder="app_xxx"
                                    />
                                </FormItem>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormItem
                                        label="fee_rate"
                                        invalid={
                                            errors.feeRate && touched.feeRate
                                        }
                                        errorMessage={errors.feeRate}
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="feeRate"
                                            component={Input}
                                            placeholder="0.02"
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="profit_share_rate"
                                        invalid={
                                            errors.profitShareRate &&
                                            touched.profitShareRate
                                        }
                                        errorMessage={errors.profitShareRate}
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="profitShareRate"
                                            component={Input}
                                            placeholder="0.05"
                                        />
                                    </FormItem>
                                </div>
                                <FormItem
                                    label="supported_currencies"
                                    invalid={
                                        errors.supportedCurrencies &&
                                        touched.supportedCurrencies
                                    }
                                    errorMessage={errors.supportedCurrencies}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="supportedCurrencies"
                                        component={Input}
                                        placeholder="CNY,USD"
                                    />
                                </FormItem>
                                <FormItem className="mb-0 text-right">
                                    <Button
                                        block
                                        variant="solid"
                                        type="submit"
                                        loading={isSubmitting}
                                    >
                                        {isUpdateMode
                                            ? '保存分润配置'
                                            : '创建分润配置'}
                                    </Button>
                                </FormItem>
                                </FormContainer>
                            </Form>
                        )
                    }}
                </Formik>
            </div>
        </Dialog>
    )
}

export default EditAgentRateConfig
