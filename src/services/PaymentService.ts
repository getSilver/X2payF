/**
 * Payment services
 * 支付模块服务 - 对接后端 API
 */
import ApiService from './ApiService'
import { 
    MERCHANT_PAYMENT_API, 
    PAYMENT_ADMIN_API,
    MERCHANT_BACKEND_PAYMENT_API 
} from '@/constants/api.constant'
import type {
    PaymentOrder,
    PaymentListParams,
} from '@/@types/payment'

type AdminPaymentsResponse = {
    code: number
    message: string
    data: {
        total: number
        page: number
        page_size: number
        list: PaymentOrder[]
    }
}

// ==================== 支付订单管理 ====================

/**
 * 查询支付订单列表
 * @param params 查询参数
 * @returns 支付订单列表
 */
export async function apiGetPayments(params: PaymentListParams) {
    return ApiService.fetchData<AdminPaymentsResponse>({
        url: PAYMENT_ADMIN_API.LIST,
        method: 'get',
        params,
    })
}

/**
 * 查询支付订单详情（管理后台）
 * 使用用户会话认证（Bearer Token）
 * @param paymentId 支付订单 ID
 * @returns 支付订单详情（字段根据用户角色过滤）
 */
export async function apiGetPaymentDetails(paymentId: string) {
    return ApiService.fetchData<PaymentOrder>({
        url: PAYMENT_ADMIN_API.detail(paymentId),
        method: 'get',
    })
}

/**
 * 查询支付订单详情（商户 API）
 * 使用 API Key 认证
 * @param paymentId 支付订单 ID
 * @returns 支付订单详情
 */
export async function apiMerchantGetPaymentDetails(paymentId: string) {
    return ApiService.fetchData<PaymentOrder>({
        url: MERCHANT_PAYMENT_API.detail(paymentId),
        method: 'get',
    })
}

/**
 * 取消支付订单
 * @param paymentId 支付订单 ID
 * @returns 操作结果
 */
export async function apiCancelPayment(paymentId: string) {
    return ApiService.fetchData<{ message: string; payment_id: string }>({
        url: PAYMENT_ADMIN_API.cancel(paymentId),
        method: 'put',
    })
}

/**
 * 关闭支付订单
 * @param paymentId 支付订单 ID
 * @returns 操作结果
 */
export async function apiClosePayment(paymentId: string) {
    return ApiService.fetchData<{ message: string; payment_id: string }>({
        url: PAYMENT_ADMIN_API.close(paymentId),
        method: 'put',
    })
}

/**
 * 重新发送支付通知（管理后台）
 * 使用用户会话认证（Bearer Token）
 * @param paymentId 支付订单 ID
 * @returns 操作结果
 */
export async function apiAdminResendPaymentNotification(paymentId: string) {
    return ApiService.fetchData<{ message: string; payment_id: string }>({
        url: PAYMENT_ADMIN_API.notify(paymentId),
        method: 'post',
    })
}



// ==================== 商户后台 API（Bearer Token 认证） ====================

/**
 * 查询商户后台支付订单列表
 * 使用 Bearer Token 认证，后端自动根据用户角色过滤数据
 * @param params 查询参数
 * @returns 支付订单列表
 */
export async function apiGetMerchantBackendPayments(params: PaymentListParams) {
    return ApiService.fetchData<AdminPaymentsResponse>({
        url: MERCHANT_BACKEND_PAYMENT_API.LIST,
        method: 'get',
        params,
    })
}

/**
 * 查询商户后台支付订单详情
 * 使用 Bearer Token 认证
 * @param paymentId 支付订单 ID
 * @returns 支付订单详情
 */
export async function apiGetMerchantBackendPaymentDetails(paymentId: string) {
    return ApiService.fetchData<PaymentOrder>({
        url: MERCHANT_BACKEND_PAYMENT_API.detail(paymentId),
        method: 'get',
    })
}

/**
 * 重新发送支付通知
 * 使用 Bearer Token 认证
 * @param paymentId 支付订单 ID
 * @returns 操作结果
 */
export async function apiResendPaymentNotification(paymentId: string) {
    return ApiService.fetchData<{ message: string; payment_id: string }>({
        url: MERCHANT_BACKEND_PAYMENT_API.notify(paymentId),
        method: 'post',
    })
}
