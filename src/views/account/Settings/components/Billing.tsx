import { useState, useEffect } from 'react'
import classNames from 'classnames'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Tooltip from '@/components/ui/Tooltip'
import Dialog from '@/components/ui/Dialog'
import { FormContainer } from '@/components/ui/Form'
import FormDesription from './FormDesription'
import FormRow from './FormRow'
import { HiOutlineClipboardCopy, HiOutlineKey, HiExclamation } from 'react-icons/hi'

import BillingHistory from './BillingHistory'
import { Form, Formik } from 'formik'

import isLastChild from '@/utils/isLastChild'
import { apiGetMerchantApplications, apiGenerateSecret, apiUpdateMerchantApplicationConfig, MerchantApplication, MerchantAppConfig } from '@/services/MerchantService'


type PaymentApp = {
    cardId: string
    channelName: string
    paymentMethod: string
    in: string
    out: string
    singleIn: string
    singleOut: string
    primary: boolean
    apiKey?: string
    apiSecret?: string
    withdrawalAddress?: string  // 提款收款地址
}

type OtherPayemnt = {
    id: string
    identifier: string
    redirect: string
    type: string
}

type Bill = {
    id: string
    item: string
    status: string
    amount: number
    date: number
}

type BillingData = {
    paymentMethods: PaymentApp[]
    otherMethod: OtherPayemnt[]
    billingHistory: Bill[]
}

type BillingFormModel = BillingData

// 解析应用配置
const parseAppConfig = (config: MerchantAppConfig | string | undefined): MerchantAppConfig => {
    if (!config) return {}
    if (typeof config === 'string') {
        try {
            return JSON.parse(config)
        } catch {
            return {}
        }
    }
    return config
}

// 将商户应用数据转换为 PaymentMethod 格式
const transformApplicationToPaymentMethod = (app: MerchantApplication): PaymentApp => {
    const config = parseAppConfig(app.config)
    return {
        cardId: app.id,
        channelName: app.name,
        paymentMethod: config.currency || app.currency || 'USD',
        in: String(config.pay_in_percentage_fee || 0),
        out: String(config.pay_out_percentage_fee || 0),
        singleIn: String(config.pay_in_fixed_fee || 0),
        singleOut: String(config.pay_out_fixed_fee || 0),
        primary: app.status === 'active',
        apiKey: app.api_key,
        apiSecret: app.api_secret,
        withdrawalAddress: config.withdrawal_address || '',
    }
}

// 复制到剪贴板
const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
        toast.push(
            <Notification title={`${label} 已复制`} type="success" duration={2000} />,
            { placement: 'top-center' }
        )
    }).catch(() => {
        toast.push(
            <Notification title="复制失败" type="danger" duration={2000} />,
            { placement: 'top-center' }
        )
    })
}

const Billing = () => {
    const [data, setData] = useState<BillingData>({
        paymentMethods: [],
        otherMethod: [],
        billingHistory: [],
    })
    const [secretDialogOpen, setSecretDialogOpen] = useState(false)
    const [generatedSecret, setGeneratedSecret] = useState<{ appId: string; apiKey: string; apiSecret: string } | null>(null)
    const [generatingAppId, setGeneratingAppId] = useState<string | null>(null)
    const [usdtAddress, setUsdtAddress] = useState('')
    const [savingAddress, setSavingAddress] = useState(false)
    const [selectedAppForAddress, setSelectedAppForAddress] = useState<string | null>(null)
    
    const fetchData = async () => {
        try {
            const response = await apiGetMerchantApplications()
            // 后端返回的是数组，不是 { data: [] } 格式
            const applications = Array.isArray(response.data) ? response.data : (response.data?.data || [])
            const paymentMethods = applications.map(transformApplicationToPaymentMethod)
            setData(prev => ({
                ...prev,
                paymentMethods,
            }))
        } catch (error) {
            console.error('获取商户应用列表失败:', error)
            toast.push(
                <Notification title="获取应用列表失败" type="danger" />,
                { placement: 'top-center' }
            )
        }
    }


    const onFormSubmit = (
        _: BillingFormModel,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        toast.push(
            <Notification
                title={'Billing information updated'}
                type="success"
            />,
            {
                placement: 'top-center',
            }
        )
        setSubmitting(false)
    }

    // 生成 Secret
    const handleGenerateSecret = async (appId: string) => {
        setGeneratingAppId(appId)
        try {
            const response = await apiGenerateSecret(appId)
            // 后端返回格式: { code: 0, data: { app_id, api_key, api_secret }, message: "success" }
            const data = (response.data as any).data || response.data
            setGeneratedSecret({
                appId: data.app_id,
                apiKey: data.api_key,
                apiSecret: data.api_secret,
            })
            setSecretDialogOpen(true)
        } catch (error) {
            console.error('生成 Secret 失败:', error)
            toast.push(
                <Notification title="生成 Secret 失败" type="danger" />,
                { placement: 'top-center' }
            )
        } finally {
            setGeneratingAppId(null)
        }
    }

    // 关闭 Secret 对话框
    const handleCloseSecretDialog = () => {
        setSecretDialogOpen(false)
        setGeneratedSecret(null)
    }

    // 保存 USDT 地址
    const handleSaveUsdtAddress = async () => {
        if (!usdtAddress.trim()) {
            toast.push(
                <Notification title="请输入 USDT 地址" type="warning" />,
                { placement: 'top-center' }
            )
            return
        }

        // 如果只有一个应用，直接使用该应用
        const targetAppId = selectedAppForAddress || (data.paymentMethods.length === 1 ? data.paymentMethods[0].cardId : null)
        
        if (!targetAppId) {
            toast.push(
                <Notification title="请先选择要保存地址的应用" type="warning" />,
                { placement: 'top-center' }
            )
            return
        }

        setSavingAddress(true)
        try {
            await apiUpdateMerchantApplicationConfig(targetAppId, {
                withdrawal_address: usdtAddress.trim(),
            })
            toast.push(
                <Notification title="USDT 地址保存成功" type="success" />,
                { placement: 'top-center' }
            )
            // 刷新数据
            fetchData()
        } catch (error) {
            console.error('保存 USDT 地址失败:', error)
            toast.push(
                <Notification title="保存 USDT 地址失败" type="danger" />,
                { placement: 'top-center' }
            )
        } finally {
            setSavingAddress(false)
        }
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 当应用列表加载后，初始化 USDT 地址
    useEffect(() => {
        if (data.paymentMethods.length > 0) {
            // 如果只有一个应用，自动选择并加载其地址
            if (data.paymentMethods.length === 1) {
                setSelectedAppForAddress(data.paymentMethods[0].cardId)
                setUsdtAddress(data.paymentMethods[0].withdrawalAddress || '')
            } else if (selectedAppForAddress) {
                // 如果已选择应用，加载该应用的地址
                const selectedApp = data.paymentMethods.find(app => app.cardId === selectedAppForAddress)
                if (selectedApp) {
                    setUsdtAddress(selectedApp.withdrawalAddress || '')
                }
            }
        }
    }, [data.paymentMethods, selectedAppForAddress])

    return (
        <>
        <Formik
            enableReinitialize
            initialValues={data}
            onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true)
                setTimeout(() => {
                    onFormSubmit(values, setSubmitting)
                }, 1000)
            }}
        >
            {({ values, touched, errors, isSubmitting, resetForm }) => {
                const validatorProps = { touched, errors }
                return (
                    <Form>
                        <FormContainer>
                            <FormDesription
                                title="Payment Method"
                                desc="Payment apps displayed by region"
                            />
                            <FormRow
                                name="paymentMethods"
                                alignCenter={false}
                                label="Payment apps"
                                {...validatorProps}
                            >
                                <div className="rounded-lg border border-gray-200 dark:border-gray-600">
                                    {values?.paymentMethods?.map(
                                        (card, index) => (
                                            <div
                                                key={card.cardId}
                                                className={classNames(
                                                    'flex flex-col lg:flex-row lg:items-center justify-between p-4 gap-3',
                                                    !isLastChild(
                                                        values.paymentMethods,
                                                        index
                                                    ) &&
                                                        'border-b border-gray-200 dark:border-gray-600'
                                                )}
                                            >
                                                <div className="flex items-center">
                                                    {card.paymentMethod ===
                                                        'VISA' && (
                                                        <img
                                                            src="/img/others/img-8.png"
                                                            alt="visa"
                                                        />
                                                    )}
                                                    {card.paymentMethod ===
                                                        'MASTER' && (
                                                        <img
                                                            src="/img/others/img-9.png"
                                                            alt="master"
                                                        />
                                                    )}
                                                    <div className="ml-3 rtl:mr-3">
                                                        <div className="flex items-center flex-wrap gap-2">
                                                            <div className="text-gray-900 dark:text-gray-100 font-semibold">
                                                                {card.channelName}
                                                            </div>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                ID: {card.cardId}
                                                            </span>
                                                            <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 rounded-md border-0">
                                                                {card.paymentMethod}
                                                            </Tag>
                                                            {card.primary && (
                                                                <Tag className="bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-100 rounded-md border-0">
                                                                    Active
                                                                </Tag>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            PayIn {card.in}% / PayOut {card.out}%
                                                            <span className="mx-2">|</span>
                                                            Fixed: {card.singleIn} / {card.singleOut}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {card.apiKey && (
                                                        <Tooltip title="Copy API Key">
                                                            <Button
                                                                size="xs"
                                                                variant="plain"
                                                                icon={<HiOutlineClipboardCopy />}
                                                                onClick={() => copyToClipboard(card.apiKey!, 'API Key')}
                                                            >
                                                                API Key
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="Generate a new API Secret (the old Secret will become invalid).">
                                                        <Button
                                                            size="xs"
                                                            variant="solid"
                                                            icon={<HiOutlineKey />}
                                                            loading={generatingAppId === card.cardId}
                                                            onClick={() => handleGenerateSecret(card.cardId)}
                                                        >
                                                            Generate Secret
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div className="mt-2">
                                    {/* <Button
                                        type="button"
                                        variant="plain"
                                        size="sm"
                                        icon={<HiPlus className="text-lg" />}
                                        onClick={() =>
                                            onEditCreditCard({}, 'NEW')
                                        }
                                    >
                                        <span className="font-semibold">
                                            Add new card
                                        </span>
                                    </Button> */}
                                </div>
                            </FormRow>
                            <FormRow
                                border={false}
                                name="otherMethod"
                                alignCenter={false}
                                label="ADD.USDT address"
                                {...validatorProps}
                            >
                                <div className="rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center flex-1 mr-3">
                                            <img
                                                src="/img/thumbs/tether-us.png"
                                                alt="USDT"
                                                className="w-8 h-8 mr-3"
                                            />
                                            <div className="flex-1 flex gap-2">
                                                {values.paymentMethods.length > 1 && (
                                                    <select
                                                        className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm"
                                                        value={selectedAppForAddress || ''}
                                                        onChange={(e) => setSelectedAppForAddress(e.target.value)}
                                                    >
                                                        <option value="">选择应用</option>
                                                        {values.paymentMethods.map(app => (
                                                            <option key={app.cardId} value={app.cardId}>
                                                                {app.channelName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                                <Input
                                                    placeholder="Enter USDT address for TRC-20 protocol"
                                                    className="flex-1"
                                                    value={usdtAddress}
                                                    onChange={(e) => setUsdtAddress(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex">
                                            <Button
                                                size="sm"
                                                type="button"
                                                loading={savingAddress}
                                                onClick={handleSaveUsdtAddress}
                                            >
                                                {savingAddress ? 'Saving...' : 'Save'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </FormRow>
                            <div className="mt-4 ltr:text-right">
                                <Button
                                    className="ltr:mr-2 rtl:ml-2"
                                    type="button"
                                    onClick={() => resetForm()}
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="solid"
                                    loading={isSubmitting}
                                    type="submit"
                                >
                                    {isSubmitting ? 'Updating' : 'Update'}
                                </Button>
                            </div>
                            <FormDesription
                                className="mt-6"
                                title="Billing History"
                                desc="View your previos billing"
                            />
                            <BillingHistory
                                className="mt-4 rounded-lg border border-gray-200 dark:border-gray-600"
                                data={data.billingHistory}
                            />
                        </FormContainer>
                    </Form>
                )
            }}
        </Formik>

        {/* Secret 显示对话框 */}
        <Dialog
            isOpen={secretDialogOpen}
            onClose={handleCloseSecretDialog}
            onRequestClose={handleCloseSecretDialog}
        >
            <div className="flex flex-col">
                <div className="flex items-center gap-2 text-amber-600 mb-4">
                    <HiExclamation className="text-xl" />
                    <span className="font-semibold">请妥善保存 API Secret</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    API Secret 仅显示一次，关闭此对话框后将无法再次查看。如果丢失，需要重新生成。
                </p>
                {generatedSecret && (
                    <div className="space-y-3">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">App ID</div>
                            <div className="flex items-center justify-between">
                                <code className="text-sm break-all">{generatedSecret.appId}</code>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">API Key</div>
                            <div className="flex items-center justify-between">
                                <code className="text-sm break-all">{generatedSecret.apiKey}</code>
                                <Button
                                    size="xs"
                                    variant="plain"
                                    icon={<HiOutlineClipboardCopy />}
                                    onClick={() => copyToClipboard(generatedSecret.apiKey, 'API Key')}
                                />
                            </div>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                            <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">API Secret（仅显示一次）</div>
                            <div className="flex items-center justify-between">
                                <code className="text-sm break-all text-amber-700 dark:text-amber-300">{generatedSecret.apiSecret}</code>
                                <Button
                                    size="xs"
                                    variant="plain"
                                    icon={<HiOutlineClipboardCopy />}
                                    onClick={() => copyToClipboard(generatedSecret.apiSecret, 'API Secret')}
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div className="mt-6 text-right">
                    <Button variant="solid" onClick={handleCloseSecretDialog}>
                        我已保存，关闭
                    </Button>
                </div>
            </div>
        </Dialog>
    </>
    )
}

export default Billing
