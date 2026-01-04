import ApiService from './ApiService'

export async function apiGetCryptoDashboardData<T>() {
    return ApiService.fetchData<T>({
        url: '/crypto/dashboard',
        method: 'get',
    })
}

export async function apiGetPortfolioData<T>() {
    return ApiService.fetchData<T>({
        url: '/crypto/portfolio',
        method: 'get',
    })
}

export async function apiGetWalletData<T>(params?: { startDate?: number; endDate?: number }) {
    return ApiService.fetchData<T>({
        url: '/crypto/wallets',
        method: 'get',
        params,
    })
}

export async function apiGetTransctionHistoryData<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: '/crypto/wallets/history',
        method: 'get',
        params: data,
    })
}

export async function apiGetMarketData<T, U extends Record<string, unknown>>(
    data: U
) {
    return ApiService.fetchData<T>({
        url: '/crypto/market',
        method: 'post',
        data,
    })
}
