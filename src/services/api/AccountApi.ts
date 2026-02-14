/**
 * 鍚庣璐︽埛 API 鏈嶅姟
 * 绛夊悗绔?API 鍑嗗濂藉悗鍒囨崲浣跨敤
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
    // 璐︽埛绠＄悊
    ACCOUNTS: '/api/v1/admin/accounts',
    ACCOUNT_DETAIL: (id: string) => `/api/v1/admin/accounts/${id}`,
    ACCOUNT_STATUS: (id: string) => `/api/v1/admin/accounts/${id}/status`,
    ACCOUNT_UNLOCK: (id: string) => `/api/v1/admin/accounts/${id}/unlock`,
    
    // 鍟嗘埛绠＄悊
    CREATE_MERCHANT: '/api/v1/admin/accounts/merchants',
    MERCHANT_LIST: '/api/v1/admin/merchants',
    MERCHANT_DETAIL: (id: string) => `/api/v1/admin/merchants/${id}/details`,
    MERCHANT_UPDATE: (id: string) => `/api/v1/admin/merchants/${id}`,
    MERCHANT_APPLICATIONS: (id: string) => `/api/v1/admin/merchants/${id}/applications`,
    MERCHANT_AGENT: (id: string) => `/api/v1/admin/merchants/${id}/agent`,
    
    // 搴旂敤绠＄悊
    APPLICATIONS: '/api/v1/admin/applications',
    APPLICATION_DETAIL: (id: string) => `/api/v1/admin/applications/${id}`,
    APPLICATION_CONFIG: (id: string) => `/api/v1/admin/applications/${id}/config`,
    APPLICATION_STATUS: (id: string) => `/api/v1/admin/applications/${id}/status`,
    
    // 浠ｇ悊鍟嗙鐞?
    CREATE_AGENT: '/api/v1/admin/accounts/agents',
    AGENT_LIST: '/api/v1/admin/agents',
    AGENT_DETAIL: (id: string) => `/api/v1/admin/agents/${id}/details`,
    AGENT_UPDATE: (id: string) => `/api/v1/admin/agents/${id}`,
    AGENT_MERCHANTS: (id: string) => `/api/v1/admin/agents/${id}/merchants`,
    AGENT_APP_RELATIONS: (id: string) => `/api/v1/admin/agents/${id}/app-relations`,
    APP_AGENT_RELATIONS: '/api/v1/admin/app-agent-relations',
    APP_AGENT_RELATION_DETAIL: (id: string) => `/api/v1/admin/app-agent-relations/${id}`,
    APP_AGENT_RELATION_DEACTIVATE: (id: string) => `/api/v1/admin/app-agent-relations/${id}/deactivate`,
    
    // 娓犻亾鍚堜綔鍟嗙鐞?
    CREATE_CHANNEL_PARTNER: '/api/v1/admin/accounts/channel-partners',
    CHANNEL_PARTNER_LIST: '/api/v1/admin/channel-partners',
    CHANNEL_PARTNER_DETAIL: (id: string) => `/api/v1/admin/channel-partners/${id}/details`,
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

/**
 * 鑾峰彇璐︽埛璇︽儏锛堟櫤鑳借瘑鍒处鎴风被鍨嬶級
 * 鏍规嵁 ID 鍓嶇紑鑷姩閫夋嫨鍚堥€傜殑 API锛?
 * - mch_ 寮€澶达細璋冪敤鍟嗘埛璇︽儏鎺ュ彛
 * - agent_ 寮€澶达細璋冪敤浠ｇ悊鍟嗚鎯呮帴鍙?
 * - cp_ 寮€澶达細璋冪敤娓犻亾鍚堜綔鍟嗚鎯呮帴鍙?
 */
export async function apiGetMerchant(accountId: string) {
    let url: string
    
    // 鏍规嵁 ID 鍓嶇紑鍒ゆ柇璐︽埛绫诲瀷
    if (accountId.startsWith('agent_')) {
        url = ACCOUNT_API.AGENT_DETAIL(accountId)
    } else if (accountId.startsWith('cp_')) {
        url = ACCOUNT_API.CHANNEL_PARTNER_DETAIL(accountId)
    } else {
        // 榛樿浣跨敤鍟嗘埛璇︽儏鎺ュ彛锛堝寘鎷?mch_ 鍓嶇紑鍜屽叾浠栨儏鍐碉級
        url = ACCOUNT_API.MERCHANT_DETAIL(accountId)
    }
    
    return ApiService.fetchData<Merchant>({
        url,
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
 * 鏌ヨ鍟嗘埛鍒楄〃锛堟敮鎸佸垎椤靛拰绛涢€夛級
 */
export async function apiListMerchants(params?: ListMerchantsParams) {
    return ApiService.fetchData<ListMerchantsResponse>({
        url: ACCOUNT_API.MERCHANT_LIST,
        method: 'get',
        params,
    })
}

/**
 * 鏌ヨ鎵€鏈夎处鎴峰垪琛ㄥ弬鏁?
 */
export interface ListAllAccountsParams {
    account_type?: string  // 璐︽埛绫诲瀷锛歁ERCHANT, AGENT, CHANNEL_PARTNER
    status?: string        // 璐︽埛鐘舵€?
    name?: string          // 鍚嶇О锛堟ā绯婃悳绱級
    page?: number          // 椤电爜
    page_size?: number     // 姣忛〉鏁伴噺
}

/**
 * 缁熶竴璐︽埛淇℃伅
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
 * 鏌ヨ鎵€鏈夎处鎴峰垪琛ㄥ搷搴?
 */
export interface ListAllAccountsResponse {
    total: number
    page: number
    page_size: number
    list: UnifiedAccount[]
}

/**
 * 鏌ヨ鎵€鏈夎处鎴峰垪琛紙鍟嗘埛銆佷唬鐞嗗晢銆佹笭閬撳悎浣滃晢锛?
 */
export async function apiListAllAccounts(params?: ListAllAccountsParams) {
    return ApiService.fetchData<ListAllAccountsResponse>({
        url: ACCOUNT_API.ACCOUNTS,
        method: 'get',
        params,
    })
}

/**
 * 鏌ヨ鍟嗘埛搴旂敤鍒楄〃
 */
export async function apiGetMerchantApplications(merchantId: string) {
    return ApiService.fetchData<MerchantApplication[]>({
        url: ACCOUNT_API.MERCHANT_APPLICATIONS(merchantId),
        method: 'get',
    })
}

/**
 * 鍒涘缓搴旂敤璇锋眰鍙傛暟
 */
export interface CreateApplicationRequest {
    request_id: string
    merchant_id: string
    name: string
    config: {
        // 应用配置（严格后端字段）
        in_fee_rate?: number
        in_fixed_fee?: number
        out_fee_rate?: number
        out_fixed_fee?: number
        channels?: string[]
        payment_methods?: string[]
        timezone?: string
        single_txn_min?: number
        single_txn_max?: number
        daily_limit?: number
    }
}

/**
 * 鍒涘缓搴旂敤
 */
export async function apiCreateApplication(data: CreateApplicationRequest) {
    return ApiService.fetchData<MerchantApplication, CreateApplicationRequest>({
        url: ACCOUNT_API.APPLICATIONS,
        method: 'post',
        data,
    })
}

/**
 * 鏇存柊搴旂敤閰嶇疆
 */
export async function apiUpdateApplicationConfig(appId: string, config: CreateApplicationRequest['config']) {
    return ApiService.fetchData<{ app_id: string; message: string }>({
        url: ACCOUNT_API.APPLICATION_CONFIG(appId),
        method: 'put',
        data: { config },
    })
}

/**
 * 鍒犻櫎搴旂敤
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

export async function apiGetAgentAppRelations(agentId: string) {
    return ApiService.fetchData<
        Array<{
            id: string
            app_id: string
            agent_id: string
            pay_in_fixed_profit_sharing?: number
            pay_out_fixed_profit_sharing?: number
            pay_in_percentage_profit_sharing?: number
            pay_out_percentage_profit_sharing?: number
            status?: string
            created_at?: string
            updated_at?: string
        }>
    >({
        url: ACCOUNT_API.AGENT_APP_RELATIONS(agentId),
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

export interface UpdateAgentConfigRequest {
    pay_in_fixed_profit_sharing?: number
    pay_out_fixed_profit_sharing?: number
    pay_in_percentage_profit_sharing?: number
    pay_out_percentage_profit_sharing?: number
}

export async function apiUpdateAgentConfig(agentId: string, data: UpdateAgentConfigRequest) {
    return ApiService.fetchData<{ agent_id: string; message: string }, UpdateAgentConfigRequest>({
        url: ACCOUNT_API.AGENT_UPDATE(agentId),
        method: 'put',
        data,
    })
}

export interface CreateAppAgentRelationRequest {
    app_id: string
    agent_id: string
    pay_in_fixed_profit_sharing?: number
    pay_out_fixed_profit_sharing?: number
    pay_in_percentage_profit_sharing?: number
    pay_out_percentage_profit_sharing?: number
}

export interface UpdateAppAgentRelationRequest {
    pay_in_fixed_profit_sharing?: number
    pay_out_fixed_profit_sharing?: number
    pay_in_percentage_profit_sharing?: number
    pay_out_percentage_profit_sharing?: number
}

export async function apiCreateAppAgentRelation(data: CreateAppAgentRelationRequest) {
    return ApiService.fetchData<{
        id: string
        app_id: string
        agent_id: string
        pay_in_fixed_profit_sharing?: number
        pay_out_fixed_profit_sharing?: number
        pay_in_percentage_profit_sharing?: number
        pay_out_percentage_profit_sharing?: number
        status?: string
        message?: string
    }, CreateAppAgentRelationRequest>({
        url: ACCOUNT_API.APP_AGENT_RELATIONS,
        method: 'post',
        data,
    })
}

export async function apiUpdateAppAgentRelation(
    relationId: string,
    data: UpdateAppAgentRelationRequest
) {
    return ApiService.fetchData<{
        id: string
        app_id?: string
        agent_id?: string
        pay_in_fixed_profit_sharing?: number
        pay_out_fixed_profit_sharing?: number
        pay_in_percentage_profit_sharing?: number
        pay_out_percentage_profit_sharing?: number
        status?: string
        message?: string
    }, UpdateAppAgentRelationRequest>({
        url: ACCOUNT_API.APP_AGENT_RELATION_DETAIL(relationId),
        method: 'put',
        data,
    })
}

export async function apiDeactivateAppAgentRelation(relationId: string) {
    return ApiService.fetchData<{ id: string; message?: string }>({
        url: ACCOUNT_API.APP_AGENT_RELATION_DEACTIVATE(relationId),
        method: 'put',
    })
}

export async function apiDeleteAppAgentRelation(relationId: string) {
    return ApiService.fetchData<{ id: string; message?: string }>({
        url: ACCOUNT_API.APP_AGENT_RELATION_DETAIL(relationId),
        method: 'delete',
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

/**
 * 缁戝畾鍟嗘埛鍒颁唬鐞嗗晢
 */
export async function apiBindMerchantAgent(merchantId: string, agentId: string) {
    return ApiService.fetchData<{ merchant_id: string; agent_id: string; message: string }>({
        url: ACCOUNT_API.MERCHANT_AGENT(merchantId),
        method: 'put',
        data: { agent_id: agentId },
    })
}

/**
 * 瑙ｇ粦鍟嗘埛涓庝唬鐞嗗晢
 */
export async function apiUnbindMerchantAgent(merchantId: string) {
    return ApiService.fetchData<{ merchant_id: string; message: string }>({
        url: ACCOUNT_API.MERCHANT_AGENT(merchantId),
        method: 'delete',
    })
}

/**
 * 鏇存柊鍟嗘埛淇℃伅
 */
export async function apiUpdateMerchant(
    merchantId: string,
    data: {
        name?: string
        contact_email?: string
        withdrawal_address?: string
        withdrawal_fee_percent?: number
        ip_whitelist?: string[]
    }
) {
    return ApiService.fetchData<{ merchant_id: string; message: string }>({
        url: ACCOUNT_API.MERCHANT_UPDATE(merchantId),
        method: 'put',
        data,
    })
}
