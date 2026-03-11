import ApiService from './ApiService'
import type {
    Merchant,
    MerchantApplication,
} from '@/@types/account'
import type { MerchantDailyReportResponse, MerchantQueryParams } from './MerchantService'
import type { CreateWithdrawalRequest, CreateWithdrawalResponse, MerchantWithdrawalResponse } from './MerchantService'

const AGENT_PREFIX = '/api/v1/merchant/agent'

// 代理商分润信息响应
export interface AgentProfitResponse {
    agent_id: string
    profit_balance: number        // 分润余额（分）
    pay_in_fixed_profit_sharing?: number
    pay_out_fixed_profit_sharing?: number
    pay_in_percentage_profit_sharing?: number
    pay_out_percentage_profit_sharing?: number
}

export async function apiGetAgentMerchants(params?: MerchantQueryParams) {
    return ApiService.fetchData<Merchant[]>({
        url: `${AGENT_PREFIX}/merchants`,
        method: 'get',
        params,
    })
}

export async function apiGetAgentApps(params?: MerchantQueryParams) {
    return ApiService.fetchData<MerchantApplication[]>({
        url: `${AGENT_PREFIX}/apps`,
        method: 'get',
        params,
    })
}

export async function apiGetAgentDailyReport(params: MerchantQueryParams & { merchant_id: string }) {
    return ApiService.fetchData<MerchantDailyReportResponse>({
        url: `${AGENT_PREFIX}/reports/daily`,
        method: 'get',
        params,
    })
}

// 获取代理商分润信息
export async function apiGetAgentProfit() {
    return ApiService.fetchData<AgentProfitResponse>({
        url: `${AGENT_PREFIX}/profit`,
        method: 'get',
    })
}

export type AgentProfile = {
    agent_id?: string
    id?: string
    name?: string
    withdrawal_address?: string
    profit_balance?: number
}

export async function apiGetAgentProfile() {
    return ApiService.fetchData<AgentProfile>({
        url: `${AGENT_PREFIX}/profile`,
        method: 'get',
    })
}

export async function apiUpdateAgentWithdrawalAddress(withdrawalAddress: string) {
    return ApiService.fetchData<{ agent_id: string; withdrawal_address: string; message: string }>({
        url: `${AGENT_PREFIX}/profile/withdrawal-address`,
        method: 'put',
        data: {
            withdrawal_address: withdrawalAddress,
        },
    })
}

export async function apiGetAgentWithdrawals(params: MerchantQueryParams) {
    return ApiService.fetchData<MerchantWithdrawalResponse>({
        url: `${AGENT_PREFIX}/withdrawals`,
        method: 'get',
        params,
    })
}

export async function apiCreateAgentWithdrawal(data: CreateWithdrawalRequest) {
    return ApiService.fetchData<CreateWithdrawalResponse>({
        url: `${AGENT_PREFIX}/withdrawals`,
        method: 'post',
        data,
    })
}

export async function apiCancelAgentWithdrawal(id: string, reason?: string) {
    return ApiService.fetchData<{ withdrawal_id: string; message: string }>({
        url: `${AGENT_PREFIX}/withdrawals/${id}/cancel`,
        method: 'post',
        data: reason ? { reason } : {},
    })
}
