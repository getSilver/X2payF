/**
 * 商户支付 API 服务
 * 使用 API Key 认证，供商户系统调用
 */
import ApiService from '../ApiService'
import { MERCHANT_PAYMENT_API } from '@/constants/api.constant'
import type {

    PaymentOrder,
    PaymentListParams,
    PaginatedResponse,
} from '@/@types/payment'



export async function apiGetPayment(paymentId: string) {
    return ApiService.fetchData<PaymentOrder>({
        url: MERCHANT_PAYMENT_API.detail(paymentId),
        method: 'get',
    })
}

export async function apiGetPayments(params?: PaymentListParams) {
    return ApiService.fetchData<PaginatedResponse<PaymentOrder>>({
        url: MERCHANT_PAYMENT_API.LIST,
        method: 'get',
        params,
    })
}

export async function apiCancelPayment(paymentId: string) {
    return ApiService.fetchData<{ payment_id: string; message: string }>({
        url: MERCHANT_PAYMENT_API.cancel(paymentId),
        method: 'put',
    })
}

export async function apiClosePayment(paymentId: string) {
    return ApiService.fetchData<{ payment_id: string; message: string }>({
        url: MERCHANT_PAYMENT_API.close(paymentId),
        method: 'put',
    })
}
