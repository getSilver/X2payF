import { useEffect, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import InputGroup from '@/components/ui/InputGroup'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { FormNumericInput } from '@/components/shared'
import { Field, Form, Formik, FieldProps } from 'formik'
import { components, ControlProps, OptionProps, GroupBase } from 'react-select'
import { HiCheck } from 'react-icons/hi'
import { currencyList, Currency, getCurrencyIcon } from './options.data'
import { MerchantApplication, MerchantAppConfig } from '@/services/MerchantService'
import {
    getTradeWithdrawProvider,
    resolveProviderTypeByPath,
} from '@/services/tradeWithdrawProvider'
import { apiGetAgentProfit } from '@/services/AgentMerchantService'
import { apiGetExchangeRateByQuoteCurrency } from '@/services/PlatformSettingsService'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'

export type FormModel = {
    amount: number           // 获得的 USD 金额
    price: number            // 卖出的币种金额
    cryptoSymbol: string     // 选择的币种
    rate: number             // 显示汇率（基础汇率 × (1 + 加点百分比)）
    // 提款扩展字段
    appId?: string
    currency?: string
    availableBalance?: number
    isAppCurrency?: boolean
    baseRate?: number        // 平台基础汇率
    markupPercent?: number   // 加点百分比
}

export type SellFormProps = {
    amount: number
    symbol: string
    onSell: (
        values: FormModel,
        setSubmitting: (isSubmitting: boolean) => void
    ) => void
}

const { Control } = components

// 动态验证 schema，需要检查可用余额和应用币种
const createValidationSchema = (availableBalance: number, isAppCurrency: boolean) => {
    return Yup.object().shape({
        cryptoSymbol: Yup.string()
            .required('Please select a currency')
            .test('is-app-currency', 'Please select an app currency', function(value) {
                // 必须选择应用币种
                return isAppCurrency
            }),
        price: Yup.number()
            .min(0.01, 'Min amount 0.01')
            .required('Please enter an amount')
            .test('max-balance', 'Exceeds available balance', function(value) {
                if (!isAppCurrency || !value) return true
                // 金额单位是分，需要转换
                const valueInCents = Math.round((value || 0) * 100)
                return valueInCents <= availableBalance
            }),
        amount: Yup.number()
            .min(0.01, 'Amount must be greater than 0')
            .required('Amount is required'),
    })
}

const CryptoSelectOption = (props: OptionProps<Currency>) => {
    const { innerProps, data, isSelected } = props
    // 只显示币种代码，不显示 app 名称
    const currencyCode = data.isAppCurrency ? data.value.split('_')[0] : data.label
    return (
        <div
            className={`cursor-pointer flex items-center justify-between p-2 ${
                isSelected
                    ? 'bg-gray-100 dark:bg-gray-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            {...innerProps}
        >
            <div className="flex items-center">
                <Avatar shape="circle" size={20} src={data.img} />
                <span className="ml-2 rtl:mr-2">{currencyCode}</span>
            </div>
            {isSelected && <HiCheck className="text-emerald-500 text-xl" />}
        </div>
    )
}

const CryptoControl = ({ children, ...props }: ControlProps<Currency>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <Avatar
                    className="ltr:ml-4 rtl:mr-4"
                    shape="circle"
                    size={18}
                    src={selected.img}
                />
            )}
            {children}
        </Control>
    )
}

// 默认验证 schema - 要求必须选择应用币种
const defaultValidationSchema = Yup.object().shape({
    cryptoSymbol: Yup.string()
        .required('Please select a currency')
        .test('is-app-currency', 'Please select an app currency', function(value) {
            // 检查是否为应用币种（包含下划线）
            return value ? value.includes('_') : false
        }),
    price: Yup.number()
        .min(0.01, 'Min amount 0.01')
        .required('Please enter an amount'),
    amount: Yup.number()
        .min(0.01, 'Amount must be greater than 0')
        .required('Amount is required'),
})

const SellForm = (props: SellFormProps) => {
    const { onSell, amount, symbol } = props
    const location = useLocation()
    const provider = getTradeWithdrawProvider(
        resolveProviderTypeByPath(location.pathname)
    )
    const [appCurrencies, setAppCurrencies] = useState<Currency[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
    const [validationSchema, setValidationSchema] = useState(defaultValidationSchema)

    // 加载应用币种
    useEffect(() => {
        const loadAppCurrencies = async () => {
            setLoading(true)
            try {
                const isAgentProvider = provider.type === 'agent'
                let agentProfitBalance = 0

                if (isAgentProvider) {
                    try {
                        const profitResponse = await apiGetAgentProfit()
                        const profitData =
                            (profitResponse.data as any)?.data || profitResponse.data
                        const parsedProfitBalance = Number(profitData?.profit_balance)
                        agentProfitBalance = Number.isFinite(parsedProfitBalance)
                            ? parsedProfitBalance
                            : 0
                    } catch (error) {
                        console.error('加载代理分润余额失败:', error)
                    }
                }

                const response = await provider.listApplications()
                const responseData = (response as any)?.data
                console.log('API 响应:', response)
                
                // 尝试多种数据结构
                let apps: MerchantApplication[] = []
                if (Array.isArray(responseData?.data?.list)) {
                    apps = responseData.data.list as MerchantApplication[]
                } else if (Array.isArray(responseData?.data)) {
                    apps = responseData.data as MerchantApplication[]
                } else if (Array.isArray(responseData?.list)) {
                    apps = responseData.list as MerchantApplication[]
                } else if (Array.isArray(responseData)) {
                    apps = responseData as MerchantApplication[]
                }
                
                console.log('解析后的应用列表:', apps)
                
                // 将应用转换为币种选项（需要异步获取汇率）
                const appCurrencyPromises = apps
                    .filter((app: MerchantApplication) => {
                        // 币种唯一来源：商户 app 顶层字段 app.currency
                        const currency = app.currency
                        const isActive = app.status === 'active'
                        console.log(`应用 ${app.name}: currency=${currency}, status=${app.status}, isActive=${isActive}`)
                        return currency && isActive
                    })
                    .map(async (app: MerchantApplication) => {
                        // 解析配置（可能是字符串或对象）
                        let config: MerchantAppConfig = {}
                        if (typeof app.config === 'string') {
                            try {
                                config = JSON.parse(app.config)
                            } catch (e) {
                                console.error('解析应用配置失败:', e)
                            }
                        } else if (app.config) {
                            config = app.config as MerchantAppConfig
                        }
                        
                        // 币种唯一来源：商户 app 顶层字段 app.currency
                        const currency = app.currency || 'USD'
                        
                        // 获取卖出汇率加点百分比（默认 0.5%）
                        const markupPercent = config.exchange_rate_sell || 0.5
                        
                        // 获取平台基础汇率
                        let baseRate = 1
                        if (currency !== 'USD') {
                            try {
                                const rateResponse = await apiGetExchangeRateByQuoteCurrency(currency)
                                if (rateResponse.data?.rate) {
                                    baseRate = rateResponse.data.rate
                                }
                                console.log(`获取 ${currency} 基础汇率:`, baseRate)
                            } catch (e) {
                                console.error(`获取 ${currency} 汇率失败:`, e)
                            }
                        }
                        
                        // 计算实际汇率：基础汇率 × (1 + 加点百分比/100)
                        const effectiveRate = baseRate * (1 + markupPercent / 100)
                        
                        const parsedAvailableAmount = Number(app.available_amount)
                        const appAvailableAmount = Number.isFinite(parsedAvailableAmount)
                            ? parsedAvailableAmount
                            : 0
                        const availableAmount = isAgentProvider
                            ? agentProfitBalance
                            : appAvailableAmount

                        console.log(`创建币种选项: ${currency} (${app.name}), baseRate=${baseRate}, markup=${markupPercent}%, effectiveRate=${effectiveRate}, balance=${app.available_amount}`)
                        
                        return {
                            label: currency,  // 只显示币种代码
                            img: getCurrencyIcon(currency),
                            value: `${currency}_${app.id}`,
                            // 使用计算后的实际汇率
                            rate: effectiveRate,
                            isAppCurrency: true,
                            appId: app.id,
                            // 唯一来源：应用可用余额 available_amount（分）
                            availableBalance: availableAmount,
                            // 保存基础汇率和加点百分比，用于显示
                            baseRate: baseRate,
                            markupPercent: markupPercent,
                        }
                    })
                
                let appCurrencyOptions = await Promise.all(appCurrencyPromises)

                if (isAgentProvider && appCurrencyOptions.length === 0) {
                    appCurrencyOptions = [
                        {
                            label: 'USD',
                            img: getCurrencyIcon('USD'),
                            value: 'USD_AGENT',
                            rate: 1,
                            isAppCurrency: true,
                            appId: '',
                            availableBalance: agentProfitBalance,
                            baseRate: 1,
                            markupPercent: 0,
                        },
                    ]
                }
                console.log('最终币种选项:', appCurrencyOptions)
                setAppCurrencies(appCurrencyOptions)
            } catch (error) {
                console.error('加载应用币种失败:', error)
            } finally {
                setLoading(false)
            }
        }
        
        loadAppCurrencies()
    }, [provider])

    // 合并区块链币种和应用币种
    const allCurrencies: Currency[] = [
        ...appCurrencies,
        ...currencyList,
    ]

    // 分组选项
    const groupedOptions: GroupBase<Currency>[] = [
        {
            label: 'App Currencies',
            options: appCurrencies,
        },
        {
            label: 'Crypto Currencies',
            options: currencyList,
        },
    ]

    return (
        <div>
            <Formik
                initialValues={{
                    amount: amount,
                    price: 1,
                    cryptoSymbol: '',  // 默认为空，强制用户选择
                    rate: amount,
                    appId: '',
                    currency: '',
                    availableBalance: 0,
                    isAppCurrency: false,
                    baseRate: 1,
                    markupPercent: 0,
                }}
                enableReinitialize={true}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (values.isAppCurrency) {
                        const availableBalance = Number(values.availableBalance)
                        if (!Number.isFinite(availableBalance) || availableBalance <= 0) {
                            setSubmitting(false)
                            return
                        }
                    }
                    onSell(values, setSubmitting)
                }}
            >
                {({ values, touched, errors, isSubmitting, setFieldValue }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                label="Price"
                                invalid={errors.price && touched.price}
                                errorMessage={errors.price}
                            >
                                <InputGroup>
                                    <Field name="price">
                                        {({ field, form }: FieldProps) => {
                                            return (
                                                <FormNumericInput
                                                    form={form}
                                                    field={field}
                                                    placeholder="YOU SELL"
                                                    value={field.value}
                                                    onValueChange={(e) => {
                                                        form.setFieldValue(
                                                            field.name,
                                                            e.floatValue
                                                        )
                                                        // 计算获得的 USD 金额
                                                        // 商户卖出币种（如 BRL），获得 USD
                                                        // 汇率表示 1 USD = X BRL，所以 USD = BRL / 汇率
                                                        const sellAmount = e?.floatValue as number || 0
                                                        const rate = form.values.rate || 1
                                                        const usdAmount = sellAmount / rate
                                                        form.setFieldValue(
                                                            'amount',
                                                            parseFloat(usdAmount.toFixed(2))
                                                        )
                                                    }}
                                                />
                                            )
                                        }}
                                    </Field>
                                    <Field name="cryptoSymbol">
                                        {({ field, form }: FieldProps) => (
                                            <Select<Currency>
                                                className="min-w-[140px]"
                                                isLoading={loading}
                                                // placeholder="Select currency"
                                                components={{
                                                    Option: CryptoSelectOption,
                                                    Control: CryptoControl,
                                                }}
                                                field={field}
                                                form={form}
                                                options={groupedOptions}
                                                value={allCurrencies.filter(
                                                    (currency) =>
                                                        currency.value ===
                                                        values.cryptoSymbol
                                                )}
                                                onChange={(currency) => {
                                                    const selectedValue = currency?.value || ''
                                                    const selectedOption = allCurrencies.find(
                                                        (item) => item.value === selectedValue
                                                    )

                                                    form.setFieldValue(
                                                        field.name,
                                                        selectedValue
                                                    )
                                                    form.setFieldValue(
                                                        'rate',
                                                        selectedOption?.rate || 1
                                                    )
                                                    // 重新计算金额：当前 price / 新汇率
                                                    const currentPrice = form.values.price || 1
                                                    const newRate = selectedOption?.rate || 1
                                                    const newAmount = currentPrice / newRate
                                                    form.setFieldValue(
                                                        'amount',
                                                        parseFloat(newAmount.toFixed(2))
                                                    )
                                                    // 设置应用币种相关字段
                                                    const isAppCurrency = selectedOption?.isAppCurrency || false
                                                    const availableBalance = selectedOption?.availableBalance || 0
                                                    
                                                    form.setFieldValue(
                                                        'isAppCurrency',
                                                        isAppCurrency
                                                    )
                                                    form.setFieldValue(
                                                        'appId',
                                                        selectedOption?.appId || ''
                                                    )
                                                    form.setFieldValue(
                                                        'currency',
                                                        isAppCurrency 
                                                            ? (selectedOption?.value || '').split('_')[0] 
                                                            : selectedValue
                                                    )
                                                    form.setFieldValue(
                                                        'availableBalance',
                                                        availableBalance
                                                    )
                                                    // 设置基础汇率和加点百分比
                                                    form.setFieldValue(
                                                        'baseRate',
                                                        selectedOption?.baseRate || selectedOption?.rate || 1
                                                    )
                                                    form.setFieldValue(
                                                        'markupPercent',
                                                        selectedOption?.markupPercent || 0
                                                    )
                                                    setSelectedCurrency(selectedOption || null)
                                                    // 动态更新验证 schema
                                                    setValidationSchema(
                                                        createValidationSchema(availableBalance, isAppCurrency)
                                                    )
                                                }}
                                            />
                                        )}
                                    </Field>
                                </InputGroup>
                                {/* 显示币种选择错误 */}
                                {errors.cryptoSymbol && touched.cryptoSymbol && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.cryptoSymbol}
                                    </div>
                                )}
                            </FormItem>
                            
                            {/* 显示应用可用余额和费率信息 */}
                            {selectedCurrency?.isAppCurrency && (
                                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Available Balance:</span>
                                        <span className="font-semibold">
                                            {((selectedCurrency.availableBalance || 0) / 100).toFixed(2)} {selectedCurrency.value.split('_')[0]}
                                        </span>
                                    </div>
                                    {/* <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Base Rate:</span>
                                        <span className="font-semibold">
                                            1 {selectedCurrency.value.split('_')[0]} = {(selectedCurrency.baseRate || 1).toFixed(4)} USD
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Markup:</span>
                                        <span className="font-semibold">
                                            {(selectedCurrency.markupPercent || 0).toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-t pt-2">
                                        <span className="text-gray-500">Effective Rate:</span>
                                        <span className="font-semibold text-primary-600">
                                            1 {selectedCurrency.value.split('_')[0]} = {(selectedCurrency.rate || 1).toFixed(4)} USD
                                        </span>
                                    </div> */}
                                </div>
                            )}
                            
                            <FormItem
                                label="Amount"
                                invalid={errors.amount && touched.amount}
                                errorMessage={errors.amount}
                            >
                                <Field name="amount">
                                    {({ field, form }: FieldProps) => {
                                        return (
                                            <FormNumericInput
                                                readOnly
                                                thousandSeparator={true}
                                                form={form}
                                                field={field}
                                                placeholder="YOU RECEIVE"
                                                value={field.value}
                                                inputSuffix={
                                                    <span className="font-semibold">
                                                        USDT
                                                    </span>
                                                }
                                                onValueChange={(e) => {
                                                    form.setFieldValue(
                                                        field.name,
                                                        e.floatValue
                                                    )
                                                }}
                                            />
                                        )
                                    }}
                                </Field>
                            </FormItem>
                            <Button
                                block
                                variant="solid"
                                loading={isSubmitting}
                                type="submit"
                            >
                                Sell
                            </Button>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SellForm
