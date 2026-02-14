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
    currency: string
    in_fee_rate: string
    out_fee_rate: string
    in_fixed_fee: string
    out_fixed_fee: string
    channel_id: string
    payment_methods: string[]
    timezone: string
    single_txn_min: number
    single_txn_max: number
    daily_limit: number
    primary: boolean
    balance: number
    frozen_amount: number
    available_amount: number
    configType?: 'application' | 'agent_rate'
    entityId?: string
    appId?: string
    agentId?: string
    relationStatus?: string
    payInFixedProfitSharing?: number
    payOutFixedProfitSharing?: number
    payInPercentageProfitSharing?: number
    payOutPercentageProfitSharing?: number
    // 兼容代理分润组件的既有字段
    payIn?: string
    payOut?: string
    fixedFeeIn?: string
    fixedFeeOut?: string
    number?: string
    cardType?: string
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
        withdrawal_address: string
        withdrawal_fee_percent: string
        ip_whitelist: string
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
            pay_in_fixed_profit_sharing?: number
            pay_out_fixed_profit_sharing?: number
            pay_in_percentage_profit_sharing?: number
            pay_out_percentage_profit_sharing?: number
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
                  pay_in_fixed_profit_sharing?: number
                  pay_out_fixed_profit_sharing?: number
                  pay_in_percentage_profit_sharing?: number
                  pay_out_percentage_profit_sharing?: number
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
        if (isAgentAccount) {
            try {
                const relationResponse = await apiGetAgentAppRelations(data.id)
                const relationBackend = relationResponse.data as unknown as BackendResponse<
                    Array<{
                        id: string
                        app_id: string
                        agent_id: string
                        pay_in_fixed_profit_sharing?: number
                        pay_out_fixed_profit_sharing?: number
                        pay_in_percentage_profit_sharing?: number
                        pay_out_percentage_profit_sharing?: number
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
                  const payInFixedProfitSharing =
                      merchant.pay_in_fixed_profit_sharing ??
                      relationFromList?.pay_in_fixed_profit_sharing ??
                      0
                  const payOutFixedProfitSharing =
                      merchant.pay_out_fixed_profit_sharing ??
                      relationFromList?.pay_out_fixed_profit_sharing ??
                      0
                  const payInPercentageProfitSharing =
                      merchant.pay_in_percentage_profit_sharing ??
                      relationFromList?.pay_in_percentage_profit_sharing ??
                      0
                  const payOutPercentageProfitSharing =
                      merchant.pay_out_percentage_profit_sharing ??
                      relationFromList?.pay_out_percentage_profit_sharing ??
                      0
                  const hasAgentRateConfig = Boolean(
                      merchant.relation_id || relationFromList?.id
                  )

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
                          currency: 'Agent Profit Sharing',
                          in_fee_rate: String(payInPercentageProfitSharing),
                          out_fee_rate: String(payOutPercentageProfitSharing),
                          in_fixed_fee: String(payInFixedProfitSharing),
                          out_fixed_fee: String(payOutFixedProfitSharing),
                          channel_id:
                              merchant.app_id || relationFromList?.app_id || '',
                          payment_methods: [],
                          timezone: '',
                          single_txn_min: 0,
                          single_txn_max: 0,
                          daily_limit: 0,
                          primary: true,
                          balance: 0,
                          frozen_amount: 0,
                          available_amount: 0,
                          // 兼容字段
                          cardType: 'Agent Profit Sharing',
                          payIn: String(payInPercentageProfitSharing),
                          payOut: String(payOutPercentageProfitSharing),
                          fixedFeeIn: String(payInFixedProfitSharing),
                          fixedFeeOut: String(payOutFixedProfitSharing),
                          number:
                              merchant.app_id || relationFromList?.app_id || '',
                          configType: 'agent_rate',
                          entityId: merchant.relation_id || relationFromList?.id || '',
                          appId: merchant.app_id || relationFromList?.app_id || '',
                          agentId: merchant.id,
                          relationStatus:
                              merchant.relation_status ||
                              relationFromList?.status ||
                              'active',
                          payInFixedProfitSharing,
                          payOutFixedProfitSharing,
                          payInPercentageProfitSharing,
                          payOutPercentageProfitSharing,
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
                      currency: app.currency || 'CNY',
                      in_fee_rate: String((config.in_fee_rate as number) || 0),
                      out_fee_rate: String((config.out_fee_rate as number) || 0),
                      in_fixed_fee: String((config.in_fixed_fee as number) || 0),
                      out_fixed_fee: String((config.out_fixed_fee as number) || 0),
                      channel_id:
                          ((config.channels as string[] | undefined)?.[0] as
                              | string
                              | undefined) || '',
                      payment_methods:
                          (config.payment_methods as string[] | undefined) || [],
                      timezone: (config.timezone as string) || '',
                      single_txn_min: (config.single_txn_min as number) || 0,
                      single_txn_max: (config.single_txn_max as number) || 0,
                      daily_limit: (config.daily_limit as number) || 0,
                      primary: app.status === 'active',
                      balance: app.balance ?? 0,
                      frozen_amount: app.frozen_amount ?? 0,
                      available_amount: app.available_amount ?? 0,
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
                location:
                    paymentMethods.find(
                        (item) => item.configType === 'application'
                    )?.timezone || '',
                title: merchant.account_type,
                agent: merchant.agent_id || '',
                birthday: merchant.created_at,
                merchantID: merchant.id,
                withdrawal_address:
                    (merchant as unknown as { withdrawal_address?: string })
                        .withdrawal_address || '',
                withdrawal_fee_percent: String(
                    (merchant as unknown as { withdrawal_fee_percent?: number })
                        .withdrawal_fee_percent || 0
                ),
                ip_whitelist: (
                    (merchant as unknown as { ip_whitelist?: string[] })
                        .ip_whitelist || []
                ).join(','),
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
        const updateData: {
            name?: string
            contact_email?: string
            withdrawal_address?: string
            withdrawal_fee_percent?: number
            ip_whitelist?: string[]
        } = {}
        if (data.name) {
            updateData.name = data.name
        }
        if (data.email) {
            updateData.contact_email = data.email
        }
        if (data.personalInfo?.withdrawal_address !== undefined) {
            updateData.withdrawal_address = data.personalInfo.withdrawal_address
        }
        if (data.personalInfo?.withdrawal_fee_percent !== undefined) {
            updateData.withdrawal_fee_percent =
                Number(data.personalInfo.withdrawal_fee_percent) || 0
        }
        if (data.personalInfo?.ip_whitelist !== undefined) {
            updateData.ip_whitelist = data.personalInfo.ip_whitelist
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item !== '')
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
        pay_in_fixed_profit_sharing: number
        pay_out_fixed_profit_sharing: number
        pay_in_percentage_profit_sharing: number
        pay_out_percentage_profit_sharing: number
    }) => {
        const response = await apiCreateAppAgentRelation({
            app_id: data.app_id,
            agent_id: data.agentId,
            pay_in_fixed_profit_sharing: data.pay_in_fixed_profit_sharing,
            pay_out_fixed_profit_sharing: data.pay_out_fixed_profit_sharing,
            pay_in_percentage_profit_sharing:
                data.pay_in_percentage_profit_sharing,
            pay_out_percentage_profit_sharing:
                data.pay_out_percentage_profit_sharing,
        })
        const backendData = response.data as unknown as BackendResponse<{
            id: string
            app_id: string
            agent_id: string
            pay_in_fixed_profit_sharing?: number
            pay_out_fixed_profit_sharing?: number
            pay_in_percentage_profit_sharing?: number
            pay_out_percentage_profit_sharing?: number
            status?: string
        }>
        const relation = backendData.data

        return {
            relationId: relation?.id || '',
            agentId: relation?.agent_id || data.agentId,
            appId: relation?.app_id || data.app_id,
            pay_in_fixed_profit_sharing:
                relation?.pay_in_fixed_profit_sharing ??
                data.pay_in_fixed_profit_sharing,
            pay_out_fixed_profit_sharing:
                relation?.pay_out_fixed_profit_sharing ??
                data.pay_out_fixed_profit_sharing,
            pay_in_percentage_profit_sharing:
                relation?.pay_in_percentage_profit_sharing ??
                data.pay_in_percentage_profit_sharing,
            pay_out_percentage_profit_sharing:
                relation?.pay_out_percentage_profit_sharing ??
                data.pay_out_percentage_profit_sharing,
            status: relation?.status || 'active',
        }
    }
)

// 更新分润关联（支持 payin/payout 固定与百分比分润）
export const updateAgentRateConfig = createAsyncThunk(
    SLICE_NAME + '/updateAgentRateConfig',
    async (data: {
        relationId: string
        app_id?: string
        pay_in_fixed_profit_sharing?: number
        pay_out_fixed_profit_sharing?: number
        pay_in_percentage_profit_sharing?: number
        pay_out_percentage_profit_sharing?: number
        agentId: string
    }) => {
        const updatePayload: {
            pay_in_fixed_profit_sharing?: number
            pay_out_fixed_profit_sharing?: number
            pay_in_percentage_profit_sharing?: number
            pay_out_percentage_profit_sharing?: number
        } = {}
        if (typeof data.pay_in_fixed_profit_sharing === 'number') {
            updatePayload.pay_in_fixed_profit_sharing =
                data.pay_in_fixed_profit_sharing
        }
        if (typeof data.pay_out_fixed_profit_sharing === 'number') {
            updatePayload.pay_out_fixed_profit_sharing =
                data.pay_out_fixed_profit_sharing
        }
        if (typeof data.pay_in_percentage_profit_sharing === 'number') {
            updatePayload.pay_in_percentage_profit_sharing =
                data.pay_in_percentage_profit_sharing
        }
        if (typeof data.pay_out_percentage_profit_sharing === 'number') {
            updatePayload.pay_out_percentage_profit_sharing =
                data.pay_out_percentage_profit_sharing
        }

        let relation: {
            id?: string
            app_id?: string
            agent_id?: string
            pay_in_fixed_profit_sharing?: number
            pay_out_fixed_profit_sharing?: number
            pay_in_percentage_profit_sharing?: number
            pay_out_percentage_profit_sharing?: number
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
                pay_in_fixed_profit_sharing?: number
                pay_out_fixed_profit_sharing?: number
                pay_in_percentage_profit_sharing?: number
                pay_out_percentage_profit_sharing?: number
                status?: string
            }>
            relation = backendData.data || {}
        }

        return {
            relationId: relation?.id || data.relationId,
            appId: relation?.app_id || data.app_id || '',
            agentId: relation?.agent_id || data.agentId,
            pay_in_fixed_profit_sharing:
                relation?.pay_in_fixed_profit_sharing ??
                data.pay_in_fixed_profit_sharing,
            pay_out_fixed_profit_sharing:
                relation?.pay_out_fixed_profit_sharing ??
                data.pay_out_fixed_profit_sharing,
            pay_in_percentage_profit_sharing:
                relation?.pay_in_percentage_profit_sharing ??
                data.pay_in_percentage_profit_sharing,
            pay_out_percentage_profit_sharing:
                relation?.pay_out_percentage_profit_sharing ??
                data.pay_out_percentage_profit_sharing,
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
                    pay_in_fixed_profit_sharing,
                    pay_out_fixed_profit_sharing,
                    pay_in_percentage_profit_sharing,
                    pay_out_percentage_profit_sharing,
                    status,
                } = action.payload
                const profile = state.profileData as Record<string, unknown>
                profile.pay_in_fixed_profit_sharing =
                    pay_in_fixed_profit_sharing
                profile.pay_out_fixed_profit_sharing =
                    pay_out_fixed_profit_sharing
                profile.pay_in_percentage_profit_sharing =
                    pay_in_percentage_profit_sharing
                profile.pay_out_percentage_profit_sharing =
                    pay_out_percentage_profit_sharing
                state.paymentMethodData = [
                    {
                        id: relationId || `${agentId}_rate_config`,
                        channelName: 'Agent Rate Config',
                        currency: 'Agent Profit Sharing',
                        in_fee_rate: String(pay_in_percentage_profit_sharing),
                        out_fee_rate: String(pay_out_percentage_profit_sharing),
                        in_fixed_fee: String(pay_in_fixed_profit_sharing),
                        out_fixed_fee: String(pay_out_fixed_profit_sharing),
                        channel_id: appId,
                        payment_methods: [],
                        timezone: '',
                        single_txn_min: 0,
                        single_txn_max: 0,
                        daily_limit: 0,
                        primary: true,
                        balance: 0,
                        frozen_amount: 0,
                        available_amount: 0,
                        cardType: 'Agent Profit Sharing',
                        payIn: String(pay_in_percentage_profit_sharing),
                        payOut: String(pay_out_percentage_profit_sharing),
                        fixedFeeIn: String(pay_in_fixed_profit_sharing),
                        fixedFeeOut: String(pay_out_fixed_profit_sharing),
                        number: appId,
                        configType: 'agent_rate',
                        entityId: relationId,
                        appId,
                        agentId,
                        relationStatus: status || 'active',
                        payInFixedProfitSharing:
                            pay_in_fixed_profit_sharing,
                        payOutFixedProfitSharing:
                            pay_out_fixed_profit_sharing,
                        payInPercentageProfitSharing:
                            pay_in_percentage_profit_sharing,
                        payOutPercentageProfitSharing:
                            pay_out_percentage_profit_sharing,
                    },
                ]
            })
            .addCase(updateAgentRateConfig.fulfilled, (state, action) => {
                const {
                    relationId,
                    appId,
                    agentId,
                    pay_in_fixed_profit_sharing,
                    pay_out_fixed_profit_sharing,
                    pay_in_percentage_profit_sharing,
                    pay_out_percentage_profit_sharing,
                    status,
                } = action.payload
                const previous = state.paymentMethodData[0]
                const resolvedAppId =
                    appId || previous?.appId || previous?.number || ''
                const resolvedPayInFixed =
                    typeof pay_in_fixed_profit_sharing === 'number'
                        ? pay_in_fixed_profit_sharing
                        : Number(
                              previous?.payInFixedProfitSharing ??
                                  previous?.fixedFeeIn ??
                                  0
                          )
                const resolvedPayOutFixed =
                    typeof pay_out_fixed_profit_sharing === 'number'
                        ? pay_out_fixed_profit_sharing
                        : Number(
                              previous?.payOutFixedProfitSharing ??
                                  previous?.fixedFeeOut ??
                                  0
                          )
                const resolvedPayInPercentage =
                    typeof pay_in_percentage_profit_sharing === 'number'
                        ? pay_in_percentage_profit_sharing
                        : Number(
                              previous?.payInPercentageProfitSharing ??
                                  previous?.payIn ??
                                  0
                          )
                const resolvedPayOutPercentage =
                    typeof pay_out_percentage_profit_sharing === 'number'
                        ? pay_out_percentage_profit_sharing
                        : Number(
                              previous?.payOutPercentageProfitSharing ??
                                  previous?.payOut ??
                                  0
                          )
                const profile = state.profileData as Record<string, unknown>
                profile.pay_in_fixed_profit_sharing = resolvedPayInFixed
                profile.pay_out_fixed_profit_sharing = resolvedPayOutFixed
                profile.pay_in_percentage_profit_sharing =
                    resolvedPayInPercentage
                profile.pay_out_percentage_profit_sharing =
                    resolvedPayOutPercentage
                profile.relation_id = relationId || previous?.entityId || ''
                profile.app_id = resolvedAppId
                profile.relation_status =
                    status || previous?.relationStatus || 'active'
                state.paymentMethodData = [
                    {
                        id: relationId || `${agentId}_rate_config`,
                        channelName: 'Agent Rate Config',
                        currency: 'Agent Profit Sharing',
                        in_fee_rate: String(resolvedPayInPercentage),
                        out_fee_rate: String(resolvedPayOutPercentage),
                        in_fixed_fee: String(resolvedPayInFixed),
                        out_fixed_fee: String(resolvedPayOutFixed),
                        channel_id: resolvedAppId,
                        payment_methods: [],
                        timezone: '',
                        single_txn_min: 0,
                        single_txn_max: 0,
                        daily_limit: 0,
                        primary: true,
                        balance: 0,
                        frozen_amount: 0,
                        available_amount: 0,
                        cardType: 'Agent Profit Sharing',
                        payIn: String(resolvedPayInPercentage),
                        payOut: String(resolvedPayOutPercentage),
                        fixedFeeIn: String(resolvedPayInFixed),
                        fixedFeeOut: String(resolvedPayOutFixed),
                        number: resolvedAppId,
                        configType: 'agent_rate',
                        entityId: relationId,
                        appId: resolvedAppId,
                        agentId,
                        relationStatus: status || 'active',
                        payInFixedProfitSharing: resolvedPayInFixed,
                        payOutFixedProfitSharing: resolvedPayOutFixed,
                        payInPercentageProfitSharing: resolvedPayInPercentage,
                        payOutPercentageProfitSharing: resolvedPayOutPercentage,
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
                profile.pay_in_fixed_profit_sharing = 0
                profile.pay_out_fixed_profit_sharing = 0
                profile.pay_in_percentage_profit_sharing = 0
                profile.pay_out_percentage_profit_sharing = 0
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
