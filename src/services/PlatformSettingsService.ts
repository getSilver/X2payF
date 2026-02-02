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
