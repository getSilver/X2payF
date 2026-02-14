import ApiService from './ApiService'
import type {
    Merchant,
    MerchantApplication,
} from '@/@types/account'
import type { MerchantDailyReportResponse, MerchantQueryParams } from './MerchantService'

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
