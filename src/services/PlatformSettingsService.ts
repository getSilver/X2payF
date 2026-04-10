import ApiService from './ApiService'

// API 基础路径
const API_BASE = '/api/v1/admin/platform-settings'

export async function apiGetPlatformCurrencies<T, U extends Record<string, unknown>>(
    params?: U
) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/currencies`,
        method: 'get',
        params,
    })
}

export async function apiCreatePlatformCurrency<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/currencies`,
        method: 'post',
        data,
    })
}

export async function apiUpdatePlatformCurrency<
    T,
    U extends Record<string, unknown>
>(id: string, data: U) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/currencies/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeletePlatformCurrency<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/currencies/${id}`,
        method: 'delete',
    })
}

export async function apiGetPlatformTimezones<T, U extends Record<string, unknown>>(
    params?: U
) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/timezones`,
        method: 'get',
        params,
    })
}

export async function apiCreatePlatformTimezone<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/timezones`,
        method: 'post',
        data,
    })
}

export async function apiUpdatePlatformTimezone<
    T,
    U extends Record<string, unknown>
>(id: string, data: U) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/timezones/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeletePlatformTimezone<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/timezones/${id}`,
        method: 'delete',
    })
}

export async function apiGetPlatformAssociations<
    T,
    U extends Record<string, unknown>
>(params?: U) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/associations`,
        method: 'get',
        params,
    })
}

export async function apiCreatePlatformAssociation<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/associations`,
        method: 'post',
        data,
    })
}

export async function apiUpdatePlatformAssociation<
    T,
    U extends Record<string, unknown>
>(id: string, data: U) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/associations/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeletePlatformAssociation<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/associations/${id}`,
        method: 'delete',
    })
}

// Exchange Rate APIs
export async function apiGetPlatformExchangeRates<T, U extends Record<string, unknown>>(
    params?: U
) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/exchange-rates`,
        method: 'get',
        params,
    })
}

// 汇率响应类型
export type ExchangeRateResponse = {
    id: string
    base_currency: string
    quote_currency: string
    rate: number  // 实际汇率值（如 5.0）
    is_active: boolean
    updated_at: string
}

// 商户端获取汇率（根据报价币种获取对 USD 的汇率）
// 使用商户端接口，不需要平台管理员权限
export async function apiGetExchangeRateByQuoteCurrency(
    quoteCurrency: string,
    providerType: 'merchant' | 'agent' = 'merchant'
) {
    const path =
        providerType === 'agent'
            ? '/api/v1/merchant/agent/exchange-rates/by-pair'
            : '/api/v1/merchant/exchange-rates/by-pair'
    return ApiService.fetchData<ExchangeRateResponse>({
        url: path,
        method: 'get',
        params: {
            base_currency: 'USD',
            quote_currency: quoteCurrency,
        },
    })
}

export async function apiCreatePlatformExchangeRate<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/exchange-rates`,
        method: 'post',
        data,
    })
}

export async function apiUpdatePlatformExchangeRate<
    T,
    U extends Record<string, unknown>
>(id: string, data: U) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/exchange-rates/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeletePlatformExchangeRate<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `${API_BASE}/exchange-rates/${id}`,
        method: 'delete',
    })
}
