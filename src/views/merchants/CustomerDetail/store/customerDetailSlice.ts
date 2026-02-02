import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiGetMerchant,
    apiGetMerchantApplications,
    apiUpdateAccountStatus,
    apiCreateApplication,
    apiDeleteApplication,
} from '@/services/api/AccountApi'
import type { CreateApplicationRequest } from '@/services/api/AccountApi'
import type {
    Merchant,
    MerchantApplication,
    AccountStatus,
} from '@/@types/account'

export const SLICE_NAME = 'crmCustomerDetails'

// ==================== 类型定义 ====================

/**
 * 后端响应包装格式
 */
interface BackendResponse<T> {
    code: string
    message: string
    request_id: string
    data: T
}

/**
 * 订单历史（用于支付记录展示）
 * 注意：后端暂无此接口，保留类型以便后续对接
 */
export type OrderHistory = {
    id: string
    item: string
    status: string
    amount: number
    date: number
}

/**
 * 支付方式/渠道配置（映射自商户应用）
 */
export type PaymentMethod = {
    id: string          // 应用ID（用于删除等操作）
    channelName: string
    cardType: string
    payIn: string
    payOut: string
    fixedFeeIn: string
    fixedFeeOut: string
    number: string
    primary: boolean
    // 余额信息
    balanceAmount: number  // 总余额（分）
    frozenAmount: number   // 冻结金额（分）
    availableAmount: number // 可用余额（分）
}

/**
 * 订阅/应用信息
 */
export type Subscription = {
    plan: string
    status: string
    amount: number
    funds: number   // 账户资金
    freeze: number  // 冻结资金
}

/**
 * 商户详情（扩展自后端Merchant）
 */
export type Customer = Merchant & {
    img?: string
    role?: string
    lastOnline?: number
    personalInfo?: {
        location: string
        title: string
        agent: string
        birthday: string
        phoneNumber: string
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
    selectedCard: Partial<PaymentMethod>
}

// ==================== 异步操作 ====================

/**
 * 获取商户详情（包含应用列表）
 */
export const getCustomer = createAsyncThunk(
    SLICE_NAME + '/getCustomer',
    async (data: { id: string }) => {
        // 并行获取商户详情和应用列表
        const [merchantResponse, applicationsResponse] = await Promise.all([
            apiGetMerchant(data.id),
            apiGetMerchantApplications(data.id),
        ])
        
        // 解析后端响应格式
        const merchantBackend = merchantResponse.data as unknown as BackendResponse<Merchant>
        const applicationsBackend = applicationsResponse.data as unknown as BackendResponse<MerchantApplication[]>
        
        const merchant = merchantBackend.data
        const applications = applicationsBackend.data || []
        
        // 将应用数据转换为订阅格式
        const subscriptions: Subscription[] = applications.map(app => ({
            plan: app.name,
            status: app.status,
            amount: app.balance_amount,
            funds: app.balance_amount,
            freeze: 0, // 后端暂无冻结金额字段
        }))
        
        // 将应用数据转换为支付方式格式（用于渠道配置展示）
        const paymentMethods: PaymentMethod[] = applications.map(app => {
            // 解析应用配置
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
                id: app.id,  // 保存应用ID，用于删除等操作
                channelName: app.name,
                cardType: (config.currency as string) || 'CNY',
                payIn: String((config.pay_in_percentage_fee as number) || 0),
                payOut: String((config.pay_out_percentage_fee as number) || 0),
                fixedFeeIn: String((config.pay_in_fixed_fee as number) || 0),
                fixedFeeOut: String((config.pay_out_fixed_fee as number) || 0),
                number: app.api_key,
                primary: app.status === 'active',
                // 余额信息（优先使用后端返回的详细余额字段）
                balanceAmount: app.balance ?? app.balance_amount ?? 0,
                frozenAmount: app.frozen_amount ?? 0,
                availableAmount: app.available_amount ?? app.balance_amount ?? 0,
            }
        })
        
        // 构建商户详情数据
        const customerData: Customer = {
            ...merchant,
            img: '', // 后端无头像字段
            role: merchant.account_type,
            lastOnline: new Date(merchant.updated_at).getTime() / 1000,
            personalInfo: {
                location: '', // 需要从应用配置获取时区
                title: merchant.account_type,
                agent: merchant.agent_id || '',
                birthday: merchant.created_at,
                phoneNumber: merchant.id,
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
            orderHistory: [] as OrderHistory[], // 后端暂无支付历史接口
        }
    }
)

/**
 * 禁用/删除商户
 */
export const deleteCustomer = createAsyncThunk(
    SLICE_NAME + '/deleteCustomer',
    async (data: { id: string }) => {
        // 将商户状态设置为 Disabled
        const response = await apiUpdateAccountStatus(data.id, {
            status: 'Disabled',
            reason: '用户请求禁用账户',
        })
        return response.data
    }
)

/**
 * 更新商户状态
 */
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

/**
 * 更新商户信息
 * 注意：后端暂无更新商户详情的 API，这里只更新本地状态
 */
export const putCustomer = createAsyncThunk(
    SLICE_NAME + '/putCustomer',
    async (data: Customer) => {
        // TODO: 后端需要实现更新商户详情的 API
        // const response = await apiUpdateMerchant(data.id, data)
        // return response.data
        return data
    }
)

/**
 * 创建应用
 */
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
        // 解析后端响应
        const backendData = response.data as unknown as BackendResponse<MerchantApplication>
        return backendData.data
    }
)

/**
 * 删除应用
 */
export const deleteApplication = createAsyncThunk(
    SLICE_NAME + '/deleteApplication',
    async (data: { appId: string }) => {
        const response = await apiDeleteApplication(data.appId)
        // 解析后端响应
        const backendData = response.data as unknown as BackendResponse<{ app_id: string; message: string }>
        return backendData.data?.app_id || data.appId
    }
)

// ==================== 初始状态 ====================

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
    selectedCard: {},
}

// ==================== Slice ====================

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
                // 删除成功后更新状态
                state.profileData.status = 'Disabled'
            })
            .addCase(updateCustomerStatus.fulfilled, (state, action) => {
                // 更新状态成功
                state.profileData.status = action.meta.arg.status
            })
            .addCase(putCustomer.fulfilled, (state, action) => {
                // 更新商户信息成功
                state.profileData = action.payload
            })
            .addCase(createApplication.fulfilled, (state, action) => {
                // 创建应用成功，添加到列表
                if (action.payload) {
                    state.applicationsData.push(action.payload)
                }
            })
            .addCase(deleteApplication.fulfilled, (state, action) => {
                // 删除应用成功，从列表中移除
                const deletedAppId = action.payload
                state.applicationsData = state.applicationsData.filter(app => app.id !== deletedAppId)
                state.paymentMethodData = state.paymentMethodData.filter(pm => pm.id !== deletedAppId)
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
    updateSelectedCard,
} = customerDetailSlice.actions

export default customerDetailSlice.reducer
