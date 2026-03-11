import {
    apiCreateWithdrawal,
    apiGetMerchantApplications,
    apiGetMerchantWithdrawals,
    type CreateWithdrawalRequest,
    type MerchantQueryParams,
} from './MerchantService'
import {
    apiGetAgentApps,
    apiCreateAgentWithdrawal,
    apiGetAgentWithdrawals,
    apiCancelAgentWithdrawal,
} from './AgentMerchantService'

export type TradeWithdrawProviderType = 'merchant' | 'agent'

export type TradeWithdrawProvider = {
    type: TradeWithdrawProviderType
    requiresAppId: boolean
    listApplications: () => Promise<any>
    listWithdrawals: (params: MerchantQueryParams) => ReturnType<typeof apiGetMerchantWithdrawals>
    createWithdrawal: (
        payload: CreateWithdrawalRequest
    ) => ReturnType<typeof apiCreateWithdrawal>
    cancelWithdrawal: (id: string, reason?: string) => Promise<unknown>
    dashboardPath: string
}

const merchantProvider: TradeWithdrawProvider = {
    type: 'merchant',
    requiresAppId: true,
    listApplications: () => apiGetMerchantApplications(),
    listWithdrawals: (params) => apiGetMerchantWithdrawals(params),
    createWithdrawal: (payload) => apiCreateWithdrawal(payload),
    cancelWithdrawal: async () => {
        // 商户取消接口暂未在 MerchantService 暴露，保留占位。
        return Promise.resolve(undefined)
    },
    dashboardPath: '/mer/dashboard',
}

const agentProvider: TradeWithdrawProvider = {
    type: 'agent',
    requiresAppId: false,
    listApplications: () => apiGetAgentApps(),
    listWithdrawals: (params) => apiGetAgentWithdrawals(params),
    createWithdrawal: (payload) => apiCreateAgentWithdrawal(payload),
    cancelWithdrawal: (id, reason) => apiCancelAgentWithdrawal(id, reason),
    dashboardPath: '/agent/dashboard',
}

export const getTradeWithdrawProvider = (
    type: TradeWithdrawProviderType
): TradeWithdrawProvider => {
    return type === 'agent' ? agentProvider : merchantProvider
}

export const resolveProviderTypeByPath = (
    pathname: string
): TradeWithdrawProviderType => {
    return pathname.startsWith('/agent') ? 'agent' : 'merchant'
}
