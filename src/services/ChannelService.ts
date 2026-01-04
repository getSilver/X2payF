import ApiService from './ApiService'

export async function apiGetCrmDashboardData<T>() {
    return ApiService.fetchData<T>({
        url: '/channel/dashboard',
        method: 'get',
    })
}

// export async function apiGetCrmCalendar<T>() {
//     return ApiService.fetchData<T>({
//         url: '/channel/calendar',
//         method: 'get',
//     })
// }

// export async function apiCreateCrmCustomer<T, U extends Record<string, unknown>>(
//     data: U
// ) {
//     return ApiService.fetchData<T>({
//         url: '/channel/customers',
//         method: 'post',
//         data,
//     })
// }

// export async function apiGetCrmCustomers<T, U extends Record<string, unknown>>(
//     data: U
// ) {
//     return ApiService.fetchData<T>({
//         url: '/channel/customers',
//         method: 'get',
//         params: data,
//     })
// }

// export async function apiGetCrmCustomersStatistic<T>() {
//     return ApiService.fetchData<T>({
//         url: '/channel/customers-statistic',
//         method: 'get',
//     })
// }

// export async function apPutCrmCustomer<T, U extends Record<string, unknown>>(
//     data: U
// ) {
//     return ApiService.fetchData<T>({
//         url: '/channel/customers',
//         method: 'put',
//         data,
//     })
// }

// export async function apiGetCrmCustomerDetails<
//     T,
//     U extends Record<string, unknown>
// >(params: U) {
//     return ApiService.fetchData<T>({
//         url: '/channel/mer-details',
//         method: 'get',
//         params,
//     })
// }

// export async function apiDeleteCrmCustomer<
//     T,
//     U extends Record<string, unknown>
// >(data: U) {
//     return ApiService.fetchData<T>({
//         url: '/channel/customer/delete',
//         method: 'delete',
//         data,
//     })
// }

// export async function apiGetCrmMails<T, U extends Record<string, unknown>>(
//     params: U
// ) {
//     return ApiService.fetchData<T>({
//         url: '/channel/mails',
//         method: 'get',
//         params,
//     })
// }

// export async function apiGetCrmMail<T, U extends Record<string, unknown>>(
//     params: U
// ) {
//     return ApiService.fetchData<T>({
//         url: '/channel/mail',
//         method: 'get',
//         params,
//     })
// }
