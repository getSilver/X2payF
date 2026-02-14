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
    payInFixedProfitSharing: string
    payOutFixedProfitSharing: string
    payInPercentageProfitSharing: string
    payOutPercentageProfitSharing: string
}

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
    const initialPayInFixedProfitSharing = String(
        selectedCard.payInFixedProfitSharing ?? selectedCard.fixedFeeIn ?? '0'
    )
    const initialPayOutFixedProfitSharing = String(
        selectedCard.payOutFixedProfitSharing ?? selectedCard.fixedFeeOut ?? '0'
    )
    const initialPayInPercentageProfitSharing = String(
        selectedCard.payInPercentageProfitSharing ?? selectedCard.payIn ?? '0'
    )
    const initialPayOutPercentageProfitSharing = String(
        selectedCard.payOutPercentageProfitSharing ?? selectedCard.payOut ?? '0'
    )
    const hasExistingConfigData =
        Boolean(initialAppId) ||
        initialPayInFixedProfitSharing !== '0' ||
        initialPayOutFixedProfitSharing !== '0' ||
        initialPayInPercentageProfitSharing !== '0' ||
        initialPayOutPercentageProfitSharing !== '0'
    const isUpdateMode = hasPersistedRelationId || hasExistingConfigData

    const validationSchema = Yup.object().shape({
        appId: isUpdateMode
            ? Yup.string()
            : Yup.string().required('商户应用ID不能为空'),
        payInFixedProfitSharing: Yup.number()
            .typeError('代收固定分润必须是数字')
            .min(0, '代收固定分润不能小于0')
            .required('pay_in_fixed_profit_sharing 不能为空'),
        payOutFixedProfitSharing: Yup.number()
            .typeError('代付固定分润必须是数字')
            .min(0, '代付固定分润不能小于0')
            .required('pay_out_fixed_profit_sharing 不能为空'),
        payInPercentageProfitSharing: Yup.number()
            .typeError('代收百分比分润必须是数字')
            .min(0, '代收百分比分润不能小于0')
            .max(100, '代收百分比分润不能大于100')
            .required('pay_in_percentage_profit_sharing 不能为空'),
        payOutPercentageProfitSharing: Yup.number()
            .typeError('代付百分比分润必须是数字')
            .min(0, '代付百分比分润不能小于0')
            .max(100, '代付百分比分润不能大于100')
            .required('pay_out_percentage_profit_sharing 不能为空'),
    })

    const onDialogClose = () => {
        dispatch(closeEditPaymentMethodDialog())
    }

    const onSubmit = async (values: FormModel) => {
        const agentId = String(profileData.id || '').trim()
        if (!agentId) {
            return
        }

        const payload = {
            app_id: values.appId.trim(),
            pay_in_fixed_profit_sharing:
                Number(values.payInFixedProfitSharing) || 0,
            pay_out_fixed_profit_sharing:
                Number(values.payOutFixedProfitSharing) || 0,
            pay_in_percentage_profit_sharing:
                Number(values.payInPercentageProfitSharing) || 0,
            pay_out_percentage_profit_sharing:
                Number(values.payOutPercentageProfitSharing) || 0,
            agentId,
        }

        try {
            if (hasPersistedRelationId) {
                const changedPayInFixed =
                    Number(values.payInFixedProfitSharing) !==
                    Number(initialPayInFixedProfitSharing)
                const changedPayOutFixed =
                    Number(values.payOutFixedProfitSharing) !==
                    Number(initialPayOutFixedProfitSharing)
                const changedPayInPercentage =
                    Number(values.payInPercentageProfitSharing) !==
                    Number(initialPayInPercentageProfitSharing)
                const changedPayOutPercentage =
                    Number(values.payOutPercentageProfitSharing) !==
                    Number(initialPayOutPercentageProfitSharing)
                const changedAppId = values.appId.trim() !== initialAppId

                await dispatch(
                    updateAgentRateConfig({
                        relationId,
                        agentId,
                        app_id: changedAppId ? values.appId.trim() : undefined,
                        pay_in_fixed_profit_sharing: changedPayInFixed
                            ? Number(values.payInFixedProfitSharing)
                            : undefined,
                        pay_out_fixed_profit_sharing: changedPayOutFixed
                            ? Number(values.payOutFixedProfitSharing)
                            : undefined,
                        pay_in_percentage_profit_sharing:
                            changedPayInPercentage
                                ? Number(values.payInPercentageProfitSharing)
                                : undefined,
                        pay_out_percentage_profit_sharing:
                            changedPayOutPercentage
                                ? Number(values.payOutPercentageProfitSharing)
                                : undefined,
                    })
                ).unwrap()
            } else if (isUpdateMode) {
                console.error('missing relationId in update mode, abort')
                return
            } else {
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
                        payInFixedProfitSharing:
                            initialPayInFixedProfitSharing,
                        payOutFixedProfitSharing:
                            initialPayOutFixedProfitSharing,
                        payInPercentageProfitSharing:
                            initialPayInPercentageProfitSharing,
                        payOutPercentageProfitSharing:
                            initialPayOutPercentageProfitSharing,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        await onSubmit(values)
                        setSubmitting(false)
                    }}
                >
                    {({ touched, errors, isSubmitting }) => {
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
                                        label="代收单笔费"
                                        invalid={
                                            errors.payInFixedProfitSharing &&
                                            touched.payInFixedProfitSharing
                                        }
                                        errorMessage={
                                            errors.payInFixedProfitSharing
                                        }
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="payInFixedProfitSharing"
                                            component={Input}
                                            placeholder="0"
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="代付单笔费"
                                        invalid={
                                            errors.payOutFixedProfitSharing &&
                                            touched.payOutFixedProfitSharing
                                        }
                                        errorMessage={
                                            errors.payOutFixedProfitSharing
                                        }
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="payOutFixedProfitSharing"
                                            component={Input}
                                            placeholder="0"
                                        />
                                    </FormItem>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormItem
                                        label="代收费率"
                                        invalid={
                                            errors.payInPercentageProfitSharing &&
                                            touched.payInPercentageProfitSharing
                                        }
                                        errorMessage={
                                            errors.payInPercentageProfitSharing
                                        }
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="payInPercentageProfitSharing"
                                            component={Input}
                                            placeholder="0%"
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="代付费率"
                                        invalid={
                                            errors.payOutPercentageProfitSharing &&
                                            touched.payOutPercentageProfitSharing
                                        }
                                        errorMessage={
                                            errors.payOutPercentageProfitSharing
                                        }
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="payOutPercentageProfitSharing"
                                            component={Input}
                                            placeholder="0%"
                                        />
                                    </FormItem>
                                </div>
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
