import ApiService from './ApiService'

export async function apiGetCrmDashboardData<T>() {
    return ApiService.fetchData<T>({
        url: '/v1/crm/dashboard',
        method: 'get',
    })
}

export async function apiGetCrmCalendar<T>() {
    return ApiService.fetchData<T>({
        url: '/v1/crm/calendar',
        method: 'get',
    })
}

export async function apiGetCrmCustomers<T, U extends Record<string, unknown>>(
    data: U
) {
    return ApiService.fetchData<T>({
        url: '/v1/crm/customers',
        method: 'get',
        data,
    })
}

export async function apiGetCrmCustomersStatistic<T>() {
    return ApiService.fetchData<T>({
        url: '/v1/crm/customers-statistic',
        method: 'get',
    })
}

export async function apPutCrmCustomer<T, U extends Record<string, unknown>>(
    data: U
) {
    return ApiService.fetchData<T>({
        url: '/v1/crm/customers',
        method: 'put',
        data,
    })
}

export async function apiGetCrmCustomerDetails<
    T,
    U extends Record<string, unknown>
>(params: U) {
    return ApiService.fetchData<T>({
        url: '/v1/crm/mer-details',
        method: 'get',
        params,
    })
}

export async function apiDeleteCrmCustomer<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: '/v1/crm/customer/delete',
        method: 'delete',
        data,
    })
}

export async function apiGetCrmMails<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
        url: '/v1/crm/mails',
        method: 'get',
        params,
    })
}

export async function apiGetCrmMail<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
        url: '/v1/crm/mail',
        method: 'get',
        params,
    })
}

