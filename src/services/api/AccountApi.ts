/**
 * 后端账户 API 服务
 * 等后端 API 准备好后切换使用
 */
import ApiService from '../ApiService'
import type {
    Account,
    Merchant,
    Agent,
    ChannelPartner,
    CreateMerchantRequest,
    CreateAgentRequest,
    CreateChannelPartnerRequest,
    UpdateAccountStatusRequest,
    AccountListParams,
    ListMerchantsParams,
    ListMerchantsResponse,
    MerchantApplication,
} from '@/@types/account'

const ACCOUNT_API = {
    // 账户管理
    ACCOUNTS: '/api/v1/admin/accounts',
    ACCOUNT_DETAIL: (id: string) => `/api/v1/admin/accounts/${id}`,
    ACCOUNT_STATUS: (id: string) => `/api/v1/admin/accounts/${id}/status`,
    ACCOUNT_UNLOCK: (id: string) => `/api/v1/admin/accounts/${id}/unlock`,
    
    // 商户管理
    CREATE_MERCHANT: '/api/v1/admin/accounts/merchants',
    MERCHANT_LIST: '/api/v1/admin/merchants',
    MERCHANT_DETAIL: (id: string) => `/api/v1/admin/merchants/${id}/details`,
    MERCHANT_APPLICATIONS: (id: string) => `/api/v1/admin/merchants/${id}/applications`,
    
    // 应用管理
    APPLICATIONS: '/api/v1/admin/applications',
    APPLICATION_DETAIL: (id: string) => `/api/v1/admin/applications/${id}`,
    APPLICATION_CONFIG: (id: string) => `/api/v1/admin/applications/${id}/config`,
    APPLICATION_STATUS: (id: string) => `/api/v1/admin/applications/${id}/status`,
    
    // 代理商管理
    CREATE_AGENT: '/api/v1/admin/accounts/agents',
    AGENT_LIST: '/api/v1/admin/agents',
    AGENT_MERCHANTS: (id: string) => `/api/v1/admin/agents/${id}/merchants`,
    
    // 渠道合作商管理
    CREATE_CHANNEL_PARTNER: '/api/v1/admin/accounts/channel-partners',
    CHANNEL_PARTNER_LIST: '/api/v1/admin/channel-partners',
}

export async function apiGetAccount(accountId: string) {
    return ApiService.fetchData<Account>({
        url: ACCOUNT_API.ACCOUNT_DETAIL(accountId),
        method: 'get',
    })
}

export async function apiUpdateAccountStatus(accountId: string, data: UpdateAccountStatusRequest) {
    return ApiService.fetchData<{ account_id: string; status: string; message: string }, UpdateAccountStatusRequest>({
        url: ACCOUNT_API.ACCOUNT_STATUS(accountId),
        method: 'put',
        data,
    })
}

export async function apiCreateMerchant(data: CreateMerchantRequest) {
    return ApiService.fetchData<Merchant, CreateMerchantRequest>({
        url: ACCOUNT_API.CREATE_MERCHANT,
        method: 'post',
        data,
    })
}

export async function apiGetMerchant(merchantId: string) {
    return ApiService.fetchData<Merchant>({
        url: ACCOUNT_API.MERCHANT_DETAIL(merchantId),
        method: 'get',
    })
}

export async function apiGetMerchants(params?: AccountListParams) {
    return ApiService.fetchData<Merchant[]>({
        url: ACCOUNT_API.MERCHANT_LIST,
        method: 'get',
        params,
    })
}

/**
 * 查询商户列表（支持分页和筛选）
 */
export async function apiListMerchants(params?: ListMerchantsParams) {
    return ApiService.fetchData<ListMerchantsResponse>({
        url: ACCOUNT_API.MERCHANT_LIST,
        method: 'get',
        params,
    })
}

/**
 * 查询所有账户列表参数
 */
export interface ListAllAccountsParams {
    account_type?: string  // 账户类型：MERCHANT, AGENT, CHANNEL_PARTNER
    status?: string        // 账户状态
    name?: string          // 名称（模糊搜索）
    page?: number          // 页码
    page_size?: number     // 每页数量
}

/**
 * 统一账户信息
 */
export interface UnifiedAccount {
    id: string
    account_type: string
    status: string
    name: string
    contact_email: string
    created_at: string
    created_by: string
    updated_at: string
}

/**
 * 查询所有账户列表响应
 */
export interface ListAllAccountsResponse {
    total: number
    page: number
    page_size: number
    list: UnifiedAccount[]
}

/**
 * 查询所有账户列表（商户、代理商、渠道合作商）
 */
export async function apiListAllAccounts(params?: ListAllAccountsParams) {
    return ApiService.fetchData<ListAllAccountsResponse>({
        url: ACCOUNT_API.ACCOUNTS,
        method: 'get',
        params,
    })
}

/**
 * 查询商户应用列表
 */
export async function apiGetMerchantApplications(merchantId: string) {
    return ApiService.fetchData<MerchantApplication[]>({
        url: ACCOUNT_API.MERCHANT_APPLICATIONS(merchantId),
        method: 'get',
    })
}

/**
 * 创建应用请求参数
 */
export interface CreateApplicationRequest {
    request_id: string
    merchant_id: string
    name: string
    config: {
        // 代收费率
        pay_in_percentage_fee?: number   // 代收百分比费率（如 0.5 表示 0.5%）
        pay_in_fixed_fee?: number        // 代收固定费用（分）
        // 代付费率
        pay_out_percentage_fee?: number  // 代付百分比费率（如 5 表示 5%）
        pay_out_fixed_fee?: number       // 代付固定费用（分）
        // 其他配置
        channels?: string[]
        payment_methods?: string[]
        default_payment_method?: string
        currency?: string
        timezone?: string
        single_txn_min?: number
        single_txn_max?: number
        daily_limit?: number
        monthly_limit?: number
        settlement_limit?: number
    }
}

/**
 * 创建应用
 */
export async function apiCreateApplication(data: CreateApplicationRequest) {
    return ApiService.fetchData<MerchantApplication, CreateApplicationRequest>({
        url: ACCOUNT_API.APPLICATIONS,
        method: 'post',
        data,
    })
}

/**
 * 更新应用配置
 */
export async function apiUpdateApplicationConfig(appId: string, config: CreateApplicationRequest['config']) {
    return ApiService.fetchData<{ app_id: string; message: string }>({
        url: ACCOUNT_API.APPLICATION_CONFIG(appId),
        method: 'put',
        data: { config },
    })
}

/**
 * 删除应用
 */
export async function apiDeleteApplication(appId: string) {
    return ApiService.fetchData<{ app_id: string; message: string }>({
        url: ACCOUNT_API.APPLICATION_DETAIL(appId),
        method: 'delete',
    })
}

export async function apiCreateAgent(data: CreateAgentRequest) {
    return ApiService.fetchData<Agent, CreateAgentRequest>({
        url: ACCOUNT_API.CREATE_AGENT,
        method: 'post',
        data,
    })
}

export async function apiGetAgentMerchants(agentId: string) {
    return ApiService.fetchData<Merchant[]>({
        url: ACCOUNT_API.AGENT_MERCHANTS(agentId),
        method: 'get',
    })
}

export async function apiGetAgents(params?: AccountListParams) {
    return ApiService.fetchData<Agent[]>({
        url: ACCOUNT_API.AGENT_LIST,
        method: 'get',
        params,
    })
}

export async function apiCreateChannelPartner(data: CreateChannelPartnerRequest) {
    return ApiService.fetchData<ChannelPartner, CreateChannelPartnerRequest>({
        url: ACCOUNT_API.CREATE_CHANNEL_PARTNER,
        method: 'post',
        data,
    })
}

export async function apiGetChannelPartners(params?: AccountListParams) {
    return ApiService.fetchData<ChannelPartner[]>({
        url: ACCOUNT_API.CHANNEL_PARTNER_LIST,
        method: 'get',
        params,
    })
}
