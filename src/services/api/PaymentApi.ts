/**
 * 后端支付 API 服务
 * 等后端 API 准备好后切换使用
 */
import ApiService from '../ApiService'
import type {
    CreatePaymentRequest,
    CreatePaymentResponse,
    PaymentOrder,
    PaymentListParams,
    PaginatedResponse,
} from '@/@types/payment'

const PAYMENT_API = {
    PAYMENTS: '/api/v1/payments',
    PAYMENT_DETAIL: (id: string) => `/api/v1/payments/${id}`,
    PAYMENT_CANCEL: (id: string) => `/api/v1/payments/${id}/cancel`,
    PAYMENT_CLOSE: (id: string) => `/api/v1/payments/${id}/close`,
}

export async function apiCreatePayment(data: CreatePaymentRequest) {
    return ApiService.fetchData<CreatePaymentResponse, CreatePaymentRequest>({
        url: PAYMENT_API.PAYMENTS,
        method: 'post',
        data,
    })
}

export async function apiGetPayment(paymentId: string) {
    return ApiService.fetchData<PaymentOrder>({
        url: PAYMENT_API.PAYMENT_DETAIL(paymentId),
        method: 'get',
    })
}

export async function apiGetPayments(params?: PaymentListParams) {
    return ApiService.fetchData<PaginatedResponse<PaymentOrder>>({
        url: PAYMENT_API.PAYMENTS,
        method: 'get',
        params,
    })
}

export async function apiCancelPayment(paymentId: string) {
    return ApiService.fetchData<{ payment_id: string; message: string }>({
        url: PAYMENT_API.PAYMENT_CANCEL(paymentId),
        method: 'put',
    })
}

export async function apiClosePayment(paymentId: string) {
    return ApiService.fetchData<{ payment_id: string; message: string }>({
        url: PAYMENT_API.PAYMENT_CLOSE(paymentId),
        method: 'put',
    })
}
