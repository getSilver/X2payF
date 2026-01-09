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
} from '@/@types/account'

const ACCOUNT_API = {
    ACCOUNTS: '/api/v1/accounts',
    ACCOUNT_DETAIL: (id: string) => `/api/v1/accounts/${id}`,
    ACCOUNT_STATUS: (id: string) => `/api/v1/accounts/${id}/status`,
    MERCHANTS: '/api/v1/accounts/merchants',
    MERCHANT_DETAIL: (id: string) => `/api/v1/merchants/${id}/details`,
    AGENTS: '/api/v1/accounts/agents',
    AGENT_MERCHANTS: (id: string) => `/api/v1/agents/${id}/merchants`,
    CHANNEL_PARTNERS: '/api/v1/accounts/channel-partners',
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
        url: ACCOUNT_API.MERCHANTS,
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
        url: ACCOUNT_API.MERCHANTS,
        method: 'get',
        params,
    })
}

export async function apiCreateAgent(data: CreateAgentRequest) {
    return ApiService.fetchData<Agent, CreateAgentRequest>({
        url: ACCOUNT_API.AGENTS,
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
        url: ACCOUNT_API.AGENTS,
        method: 'get',
        params,
    })
}

export async function apiCreateChannelPartner(data: CreateChannelPartnerRequest) {
    return ApiService.fetchData<ChannelPartner, CreateChannelPartnerRequest>({
        url: ACCOUNT_API.CHANNEL_PARTNERS,
        method: 'post',
        data,
    })
}

export async function apiGetChannelPartners(params?: AccountListParams) {
    return ApiService.fetchData<ChannelPartner[]>({
        url: ACCOUNT_API.CHANNEL_PARTNERS,
        method: 'get',
        params,
    })
}
