import ApiService from './ApiService'

export async function apiGetPlatformCurrencies<T, U extends Record<string, unknown>>(
    params?: U
) {
    return ApiService.fetchData<T>({
        url: '/v1/platform-settings/currencies',
        method: 'get',
        params,
    })
}

export async function apiCreatePlatformCurrency<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: '/v1/platform-settings/currencies',
        method: 'post',
        data,
    })
}

export async function apiUpdatePlatformCurrency<
    T,
    U extends Record<string, unknown>
>(id: string, data: U) {
    return ApiService.fetchData<T>({
        url: `/v1/platform-settings/currencies/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeletePlatformCurrency<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/v1/platform-settings/currencies/${id}`,
        method: 'delete',
    })
}

export async function apiGetPlatformTimezones<T, U extends Record<string, unknown>>(
    params?: U
) {
    return ApiService.fetchData<T>({
        url: '/v1/platform-settings/timezones',
        method: 'get',
        params,
    })
}

export async function apiCreatePlatformTimezone<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: '/v1/platform-settings/timezones',
        method: 'post',
        data,
    })
}

export async function apiUpdatePlatformTimezone<
    T,
    U extends Record<string, unknown>
>(id: string, data: U) {
    return ApiService.fetchData<T>({
        url: `/v1/platform-settings/timezones/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeletePlatformTimezone<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/v1/platform-settings/timezones/${id}`,
        method: 'delete',
    })
}

export async function apiGetPlatformAssociations<
    T,
    U extends Record<string, unknown>
>(params?: U) {
    return ApiService.fetchData<T>({
        url: '/v1/platform-settings/associations',
        method: 'get',
        params,
    })
}

export async function apiCreatePlatformAssociation<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: '/v1/platform-settings/associations',
        method: 'post',
        data,
    })
}

export async function apiUpdatePlatformAssociation<
    T,
    U extends Record<string, unknown>
>(id: string, data: U) {
    return ApiService.fetchData<T>({
        url: `/v1/platform-settings/associations/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeletePlatformAssociation<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/v1/platform-settings/associations/${id}`,
        method: 'delete',
    })
}
