import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiGetMerchant,
    apiGetMerchantApplications,
    apiGetAgentAppRelations,
    apiUpdateAccountStatus,
    apiCreateApplication,
    apiDeleteApplication,
    apiCreateAppAgentRelation,
    apiUpdateAppAgentRelation,
    apiDeactivateAppAgentRelation,
    apiDeleteAppAgentRelation,
    apiBindMerchantAgent,
    apiUnbindMerchantAgent,
    apiUpdateMerchant,
} from '@/services/api/AccountApi'
import type { CreateApplicationRequest } from '@/services/api/AccountApi'
import type {
    Merchant,
    MerchantApplication,
    AccountStatus,
} from '@/@types/account'

export const SLICE_NAME = 'crmCustomerDetails'


// 后端统一响应结构
interface BackendResponse<T> {
    code: string
    message: string
    request_id: string
    data: T
}

export type OrderHistory = {
    id: string
    item: string
    status: string
    amount: number
    date: number
}

export type PaymentMethod = {
    id: string
    channelName: string
    cardType: string
    payIn: string
    payOut: string
    fixedFeeIn: string
    fixedFeeOut: string
    number: string
    primary: boolean
    balanceAmount: number
    frozenAmount: number
    availableAmount: number
    withdrawalFeePercent: number
    exchangeRateSell: number
    exchangeRateBuy: number
    configType?: 'application' | 'agent_rate'
    entityId?: string
    appId?: string
    agentId?: string
    relationStatus?: string
    feeRate?: number
    profitShareRate?: number
    supportedCurrencies?: string[]
}

export type Subscription = {
    plan: string
    status: string
    amount: number
    funds: number
    freeze: number
}

export type Customer = Merchant & {
    email?: string
    name?: string
    img?: string
    role?: string
    lastOnline?: number
    personalInfo?: {
        location: string
        title: string
        agent: string
        birthday: string
        merchantID: string
        facebook: string
        twitter: string
        pinterest: string
        linkedIn: string
    }
}

export type CustomerDetailState = {
    loading: boolean
    profileData: Partial<Customer>
    subscriptionData: Subscription[]
    paymentHistoryData: OrderHistory[]
    paymentMethodData: PaymentMethod[]
    applicationsData: MerchantApplication[]
    deletePaymentMethodDialog: boolean
    editPaymentMethodDialog: boolean
    editCustomerDetailDialog: boolean
    agentBindDialog: boolean
    selectedCard: Partial<PaymentMethod>
}


// 获取账户详情（商户/代理商）
export const getCustomer = createAsyncThunk(
    SLICE_NAME + '/getCustomer',
    async (data: { id: string }) => {
        const merchantResponse = await apiGetMerchant(data.id)
        const merchantBackend = merchantResponse.data as unknown as BackendResponse<Merchant & {
            fee_rate?: number
            profit_share_rate?: number
            supported_currencies?: string[]
            relation_id?: string
            app_id?: string
            relation_status?: string
        }>
        const merchant = merchantBackend.data
        const isAgentAccount = data.id.startsWith('agent_')
        let relationFromList:
            | {
                  id: string
                  app_id: string
                  agent_id: string
                  commission_rate?: number
                  fixed_amount?: number
                  status?: string
              }
            | undefined

        let applications: MerchantApplication[] = []
        if (data.id.startsWith('mch_')) {
            try {
                const applicationsResponse = await apiGetMerchantApplications(data.id)
                const applicationsBackend = applicationsResponse.data as unknown as BackendResponse<MerchantApplication[]>
                applications = applicationsBackend.data || []
            } catch (error) {
                console.warn('获取应用列表失败，可能不是商户账户', error)
            }
        }
        if (isAgentAccount && !merchant.relation_id) {
            try {
                const relationResponse = await apiGetAgentAppRelations(data.id)
                const relationBackend = relationResponse.data as unknown as BackendResponse<
                    Array<{
                        id: string
                        app_id: string
                        agent_id: string
                        commission_rate?: number
                        fixed_amount?: number
                        status?: string
                    }>
                >
                const relationList = relationBackend.data || []
                relationFromList =
                    relationList.find((item) => item.status === 'active') ||
                    relationList[0]
            } catch (error) {
                console.warn('获取代理分润关联列表失败', error)
            }
        }

        const subscriptions: Subscription[] = applications.map((app) => ({
            plan: app.name,
            status: app.status,
            amount: app.balance ?? 0,
            funds: app.balance ?? 0,
            freeze: app.frozen_amount ?? 0,
        }))

        const paymentMethods: PaymentMethod[] = isAgentAccount
            ? (() => {
                  const feeRate = merchant.fee_rate ?? 0
                  const profitShareRate = merchant.profit_share_rate ?? 0
                  const supportedCurrencies = merchant.supported_currencies ?? []
                  const hasAgentRateConfig =
                      feeRate > 0 ||
                      profitShareRate > 0 ||
                      supportedCurrencies.length > 0

                  if (!hasAgentRateConfig) {
                      return []
                  }

                  return [
                      {
                          id:
                              merchant.relation_id ||
                              relationFromList?.id ||
                              `${merchant.id}_rate_config`,
                          channelName: 'Agent Rate Config',
                          cardType: supportedCurrencies.join(', '),
                          payIn: String(feeRate),
                          payOut: '',
                          fixedFeeIn: String(profitShareRate),
                          fixedFeeOut: '',
                          number: merchant.app_id || relationFromList?.app_id || '',
                          primary: true,
                          balanceAmount: 0,
                          frozenAmount: 0,
                          availableAmount: 0,
                          withdrawalFeePercent: 0,
                          exchangeRateSell: 0,
                          exchangeRateBuy: 0,
                          configType: 'agent_rate',
                          entityId: merchant.relation_id || relationFromList?.id || '',
                          appId: merchant.app_id || relationFromList?.app_id || '',
                          agentId: merchant.id,
                          relationStatus:
                              merchant.relation_status ||
                              relationFromList?.status ||
                              'active',
                          feeRate,
                          profitShareRate,
                          supportedCurrencies,
                      },
                  ]
              })()
            : applications.map((app) => {
                  let config: Record<string, unknown> = {}
                  if (typeof app.config === 'string') {
                      try {
                          config = JSON.parse(app.config)
                      } catch (e) {
                          console.error('解析应用配置失败:', e)
                      }
                  } else if (app.config) {
                      config = app.config as unknown as Record<string, unknown>
                  }

                  return {
                      id: app.id,
                      channelName: app.name,
                      cardType: (config.currency as string) || 'CNY',
                      payIn: String((config.pay_in_percentage_fee as number) || 0),
                      payOut: String((config.pay_out_percentage_fee as number) || 0),
                      fixedFeeIn: String((config.pay_in_fixed_fee as number) || 0),
                      fixedFeeOut: String((config.pay_out_fixed_fee as number) || 0),
                      number: app.api_key,
                      primary: app.status === 'active',
                      balanceAmount: app.balance ?? 0,
                      frozenAmount: app.frozen_amount ?? 0,
                      availableAmount: app.available_amount ?? 0,
                      withdrawalFeePercent:
                          (config.withdrawal_fee_percent as number) || 0,
                      exchangeRateSell: (config.exchange_rate_sell as number) || 0,
                      exchangeRateBuy: (config.exchange_rate_buy as number) || 0,
                      configType: 'application',
                      entityId: app.id,
                  }
              })

        const customerData: Customer = {
            ...merchant,
            email: merchant.contact_email,
            name: merchant.name,
            img: '',
            role: merchant.account_type,
            lastOnline: new Date(merchant.updated_at).getTime() / 1000,
            personalInfo: {
                location: '',
                title: merchant.account_type,
                agent: merchant.agent_id || '',
                birthday: merchant.created_at,
                merchantID: merchant.id,
                facebook: '',
                twitter: '',
                pinterest: '',
                linkedIn: '',
            },
        }

        return {
            profile: customerData,
            subscription: subscriptions,
            paymentMethod: paymentMethods,
            applications: applications,
            orderHistory: [] as OrderHistory[],
        }
    }
)

// 禁用账户
export const deleteCustomer = createAsyncThunk(
    SLICE_NAME + '/deleteCustomer',
    async (data: { id: string }) => {
        const response = await apiUpdateAccountStatus(data.id, {
            status: 'Disabled',
            reason: '用户请求禁用账户',
        })
        return response.data
    }
)

// 更新账户状态
export const updateCustomerStatus = createAsyncThunk(
    SLICE_NAME + '/updateCustomerStatus',
    async (data: { id: string; status: AccountStatus; reason: string }) => {
        const response = await apiUpdateAccountStatus(data.id, {
            status: data.status,
            reason: data.reason,
        })
        return response.data
    }
)

// 更新账户基础信息
export const putCustomer = createAsyncThunk(
    SLICE_NAME + '/putCustomer',
    async (data: Customer) => {
        const updateData: { name?: string; contact_email?: string } = {}
        if (data.name) {
            updateData.name = data.name
        }
        if (data.email) {
            updateData.contact_email = data.email
        }

        await apiUpdateMerchant(data.id, updateData)

        return data
    }
)

// 创建商户应用
export const createApplication = createAsyncThunk(
    SLICE_NAME + '/createApplication',
    async (data: { merchantId: string; name: string; config: CreateApplicationRequest['config'] }) => {
        const requestId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const response = await apiCreateApplication({
            request_id: requestId,
            merchant_id: data.merchantId,
            name: data.name,
            config: data.config,
        })
        const backendData = response.data as unknown as BackendResponse<MerchantApplication>
        return backendData.data
    }
)

// 删除商户应用
export const deleteApplication = createAsyncThunk(
    SLICE_NAME + '/deleteApplication',
    async (data: { appId: string }) => {
        const response = await apiDeleteApplication(data.appId)
        const backendData = response.data as unknown as BackendResponse<{ app_id: string; message: string }>
        return backendData.data?.app_id || data.appId
    }
)


// 创建应用与代理商分润关联
export const createAgentRateConfig = createAsyncThunk(
    SLICE_NAME + '/createAgentRateConfig',
    async (data: {
        agentId: string
        app_id: string
        fee_rate: number
        profit_share_rate: number
        supported_currencies: string[]
    }) => {
        const response = await apiCreateAppAgentRelation({
            app_id: data.app_id,
            agent_id: data.agentId,
            commission_rate: data.profit_share_rate,
            fixed_amount: 0,
            fee_rate: data.fee_rate,
            supported_currencies: data.supported_currencies,
        })
        const backendData = response.data as unknown as BackendResponse<{
            id: string
            app_id: string
            agent_id: string
            commission_rate?: number
            profit_share_rate: number
            fixed_amount?: number
            fee_rate?: number
            supported_currencies?: string[]
            status?: string
        }>
        const relation = backendData.data

        return {
            relationId: relation?.id || '',
            agentId: relation?.agent_id || data.agentId,
            appId: relation?.app_id || data.app_id,
            fee_rate: relation?.fee_rate ?? data.fee_rate,
            profit_share_rate:
                relation?.commission_rate ??
                relation?.profit_share_rate ??
                data.profit_share_rate,
            supported_currencies: relation?.supported_currencies ?? data.supported_currencies,
            status: relation?.status || 'active',
        }
    }
)

// 更新分润关联（当前仅更新 profit_share_rate）
export const updateAgentRateConfig = createAsyncThunk(
    SLICE_NAME + '/updateAgentRateConfig',
    async (data: {
        relationId: string
        app_id?: string
        fee_rate?: number
        profit_share_rate?: number
        supported_currencies?: string[]
        agentId: string
    }) => {
        const updatePayload: { commission_rate?: number } = {}
        if (typeof data.profit_share_rate === 'number') {
            updatePayload.commission_rate = data.profit_share_rate
        }

        let relation: {
            id?: string
            app_id?: string
            agent_id?: string
            commission_rate?: number
            profit_share_rate?: number
            fixed_amount?: number
            status?: string
        } = {}

        if (!data.relationId) {
            throw new Error('缺少 relationId，无法更新分润关联')
        }

        if (Object.keys(updatePayload).length > 0) {
            const response = await apiUpdateAppAgentRelation(
                data.relationId,
                updatePayload
            )
            const backendData = response.data as unknown as BackendResponse<{
                id: string
                app_id?: string
                agent_id?: string
                commission_rate?: number
                profit_share_rate?: number
                fixed_amount?: number
                status?: string
            }>
            relation = backendData.data || {}
        }

        return {
            relationId: relation?.id || data.relationId,
            appId: relation?.app_id || data.app_id || '',
            agentId: relation?.agent_id || data.agentId,
            fee_rate: data.fee_rate,
            profit_share_rate:
                relation?.commission_rate ??
                relation?.profit_share_rate ??
                data.profit_share_rate,
            supported_currencies: data.supported_currencies,
            status: relation?.status || 'active',
        }
    }
)

// 停用分润关联
export const deactivateAgentRateConfig = createAsyncThunk(
    SLICE_NAME + '/deactivateAgentRateConfig',
    async (data: { relationId: string }) => {
        await apiDeactivateAppAgentRelation(data.relationId)
        return data.relationId
    }
)

// 删除分润关联
export const deleteAgentRateConfig = createAsyncThunk(
    SLICE_NAME + '/deleteAgentRateConfig',
    async (data: { relationId: string }) => {
        await apiDeleteAppAgentRelation(data.relationId)
        return data.relationId
    }
)


// 绑定商户到代理商
export const bindMerchantAgent = createAsyncThunk(
    SLICE_NAME + '/bindMerchantAgent',
    async (data: { merchantId: string; agentId: string }) => {
        const response = await apiBindMerchantAgent(data.merchantId, data.agentId)
        const backendData = response.data as unknown as BackendResponse<{ merchant_id: string; agent_id: string; message: string }>
        return backendData.data
    }
)

// 解绑商户与代理商
export const unbindMerchantAgent = createAsyncThunk(
    SLICE_NAME + '/unbindMerchantAgent',
    async (data: { merchantId: string }) => {
        const response = await apiUnbindMerchantAgent(data.merchantId)
        const backendData = response.data as unknown as BackendResponse<{ merchant_id: string; message: string }>
        return backendData.data
    }
)


// 初始状态
const initialState: CustomerDetailState = {
    loading: true,
    profileData: {},
    subscriptionData: [],
    paymentHistoryData: [],
    paymentMethodData: [],
    applicationsData: [],
    deletePaymentMethodDialog: false,
    editPaymentMethodDialog: false,
    editCustomerDetailDialog: false,
    agentBindDialog: false,
    selectedCard: {},
}


const customerDetailSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        updatePaymentMethodData: (state, action) => {
            state.paymentMethodData = action.payload
        },
        updateProfileData: (state, action) => {
            state.profileData = action.payload
        },
        openDeletePaymentMethodDialog: (state) => {
            state.deletePaymentMethodDialog = true
        },
        closeDeletePaymentMethodDialog: (state) => {
            state.deletePaymentMethodDialog = false
        },
        openEditPaymentMethodDialog: (state) => {
            state.editPaymentMethodDialog = true
        },
        closeEditPaymentMethodDialog: (state) => {
            state.editPaymentMethodDialog = false
        },
        openEditCustomerDetailDialog: (state) => {
            state.editCustomerDetailDialog = true
        },
        closeEditCustomerDetailDialog: (state) => {
            state.editCustomerDetailDialog = false
        },
        openAgentBindDialog: (state) => {
            state.agentBindDialog = true
        },
        closeAgentBindDialog: (state) => {
            state.agentBindDialog = false
        },
        updateSelectedCard: (state, action) => {
            state.selectedCard = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCustomer.fulfilled, (state, action) => {
                state.loading = false
                state.profileData = action.payload.profile
                state.subscriptionData = action.payload.subscription
                state.paymentHistoryData = action.payload.orderHistory
                state.paymentMethodData = action.payload.paymentMethod
                state.applicationsData = action.payload.applications
            })
            .addCase(getCustomer.pending, (state) => {
                state.loading = true
            })
            .addCase(getCustomer.rejected, (state) => {
                state.loading = false
            })
            .addCase(deleteCustomer.fulfilled, (state) => {
                state.profileData.status = 'Disabled'
            })
            .addCase(updateCustomerStatus.fulfilled, (state, action) => {
                state.profileData.status = action.meta.arg.status
            })
            .addCase(putCustomer.fulfilled, (state, action) => {
                state.profileData = action.payload
            })
            .addCase(createApplication.fulfilled, (state, action) => {
                if (action.payload) {
                    state.applicationsData.push(action.payload)
                }
            })
            .addCase(deleteApplication.fulfilled, (state, action) => {
                const deletedAppId = action.payload
                state.applicationsData = state.applicationsData.filter(app => app.id !== deletedAppId)
                state.paymentMethodData = state.paymentMethodData.filter(pm => pm.id !== deletedAppId)
            })
            .addCase(createAgentRateConfig.fulfilled, (state, action) => {
                const {
                    relationId,
                    appId,
                    agentId,
                    fee_rate,
                    profit_share_rate,
                    supported_currencies,
                    status,
                } = action.payload
                const profile = state.profileData as Record<string, unknown>
                profile.fee_rate = fee_rate
                profile.profit_share_rate = profit_share_rate
                profile.supported_currencies = supported_currencies
                state.paymentMethodData = [
                    {
                        id: relationId || `${agentId}_rate_config`,
                        channelName: 'Agent Rate Config',
                        cardType: supported_currencies.join(', '),
                        payIn: String(fee_rate),
                        payOut: '',
                        fixedFeeIn: String(profit_share_rate),
                        fixedFeeOut: '',
                        number: appId,
                        primary: true,
                        balanceAmount: 0,
                        frozenAmount: 0,
                        availableAmount: 0,
                        withdrawalFeePercent: 0,
                        exchangeRateSell: 0,
                        exchangeRateBuy: 0,
                        configType: 'agent_rate',
                        entityId: relationId,
                        appId,
                        agentId,
                        relationStatus: status || 'active',
                        feeRate: fee_rate,
                        profitShareRate: profit_share_rate,
                        supportedCurrencies: supported_currencies,
                    },
                ]
            })
            .addCase(updateAgentRateConfig.fulfilled, (state, action) => {
                const {
                    relationId,
                    appId,
                    agentId,
                    fee_rate,
                    profit_share_rate,
                    supported_currencies,
                    status,
                } = action.payload
                const previous = state.paymentMethodData[0]
                const resolvedAppId =
                    appId || previous?.appId || previous?.number || ''
                const resolvedFeeRate =
                    typeof fee_rate === 'number'
                        ? fee_rate
                        : Number(previous?.feeRate ?? previous?.payIn ?? 0)
                const resolvedProfitShareRate =
                    typeof profit_share_rate === 'number'
                        ? profit_share_rate
                        : Number(
                              previous?.profitShareRate ??
                                  previous?.fixedFeeIn ??
                                  0
                          )
                const resolvedSupportedCurrencies =
                    supported_currencies ??
                    previous?.supportedCurrencies ??
                    []
                const profile = state.profileData as Record<string, unknown>
                profile.fee_rate = resolvedFeeRate
                profile.profit_share_rate = resolvedProfitShareRate
                profile.supported_currencies = resolvedSupportedCurrencies
                profile.relation_id = relationId || previous?.entityId || ''
                profile.app_id = resolvedAppId
                profile.relation_status =
                    status || previous?.relationStatus || 'active'
                state.paymentMethodData = [
                    {
                        id: relationId || `${agentId}_rate_config`,
                        channelName: 'Agent Rate Config',
                        cardType: resolvedSupportedCurrencies.join(', '),
                        payIn: String(resolvedFeeRate),
                        payOut: '',
                        fixedFeeIn: String(resolvedProfitShareRate),
                        fixedFeeOut: '',
                        number: resolvedAppId,
                        primary: true,
                        balanceAmount: 0,
                        frozenAmount: 0,
                        availableAmount: 0,
                        withdrawalFeePercent: 0,
                        exchangeRateSell: 0,
                        exchangeRateBuy: 0,
                        configType: 'agent_rate',
                        entityId: relationId,
                        appId: resolvedAppId,
                        agentId,
                        relationStatus: status || 'active',
                        feeRate: resolvedFeeRate,
                        profitShareRate: resolvedProfitShareRate,
                        supportedCurrencies: resolvedSupportedCurrencies,
                    },
                ]
            })
            .addCase(deactivateAgentRateConfig.fulfilled, (state, action) => {
                const relationId = action.payload
                state.paymentMethodData = state.paymentMethodData.map((item) =>
                    item.entityId === relationId || item.id === relationId
                        ? { ...item, relationStatus: 'inactive', primary: false }
                        : item
                )
            })
            .addCase(deleteAgentRateConfig.fulfilled, (state, action) => {
                const relationId = action.payload
                const profile = state.profileData as Record<string, unknown>
                profile.fee_rate = 0
                profile.profit_share_rate = 0
                profile.supported_currencies = []
                state.paymentMethodData = state.paymentMethodData.filter(
                    (item) => item.entityId !== relationId && item.id !== relationId
                )
            })
            .addCase(bindMerchantAgent.fulfilled, (state, action) => {
                const agentId = action.payload?.agent_id || action.meta.arg.agentId
                state.profileData.agent_id = agentId
                if (state.profileData.personalInfo) {
                    state.profileData.personalInfo.agent = agentId
                }
                state.agentBindDialog = false
            })
            .addCase(unbindMerchantAgent.fulfilled, (state) => {
                state.profileData.agent_id = ''
                if (state.profileData.personalInfo) {
                    state.profileData.personalInfo.agent = ''
                }
            })
    },
})

export const {
    updatePaymentMethodData,
    updateProfileData,
    openDeletePaymentMethodDialog,
    closeDeletePaymentMethodDialog,
    openEditPaymentMethodDialog,
    closeEditPaymentMethodDialog,
    openEditCustomerDetailDialog,
    closeEditCustomerDetailDialog,
    openAgentBindDialog,
    closeAgentBindDialog,
    updateSelectedCard,
} = customerDetailSlice.actions

export default customerDetailSlice.reducer
