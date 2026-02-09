import ApiService from './ApiService'

export async function apiGetCrmDashboardData<T>() {
    return ApiService.fetchData<T>({
        url: '/api/crm/dashboard',
        method: 'get',
    })
}
