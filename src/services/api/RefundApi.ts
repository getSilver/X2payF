/**
 * 退款 API 服务
 */
import ApiService from '../ApiService'
import type {
    CreateRefundRequest,
    CreateRefundResponse,
    Refund,
} from '@/@types/refund'

const REFUND_API = {
    // 管理后台接口
    ADMIN_REFUNDS: '/api/v1/admin/refunds',
    ADMIN_REFUND_DETAIL: (id: string) => `/api/v1/admin/refunds/${id}`,
    
    // 商户接口（后续对接）
    REFUNDS: '/api/v1/refunds',
    REFUND_DETAIL: (id: string) => `/api/v1/refunds/${id}`,

    // 商户后台接口
    MERCHANT_BACKEND_REFUNDS: '/api/v1/merchant/refunds',
    MERCHANT_BACKEND_REFUND_DETAIL: (id: string) => `/api/v1/merchant/refunds/${id}`,
}

/**
 * 创建退款（管理后台）
 */
export async function apiAdminCreateRefund(data: CreateRefundRequest) {
    return ApiService.fetchData<CreateRefundResponse, CreateRefundRequest>({
        url: REFUND_API.ADMIN_REFUNDS,
        method: 'post',
        data,
    })
}

/**
 * 查询退款详情（管理后台）
 */
export async function apiAdminGetRefund(refundId: string) {
    return ApiService.fetchData<Refund>({
        url: REFUND_API.ADMIN_REFUND_DETAIL(refundId),
        method: 'get',
    })
}

/**
 * 创建退款（商户API - 后续对接）
 */
export async function apiCreateRefund(data: CreateRefundRequest) {
    return ApiService.fetchData<CreateRefundResponse, CreateRefundRequest>({
        url: REFUND_API.REFUNDS,
        method: 'post',
        data,
    })
}

/**
 * 查询退款详情（商户API - 后续对接）
 */
export async function apiGetRefund(refundId: string) {
    return ApiService.fetchData<Refund>({
        url: REFUND_API.REFUND_DETAIL(refundId),
        method: 'get',
    })
}

/**
 * 创建退款（商户后台）
 */
export async function apiMerchantBackendCreateRefund(data: CreateRefundRequest) {
    return ApiService.fetchData<CreateRefundResponse, CreateRefundRequest>({
        url: REFUND_API.MERCHANT_BACKEND_REFUNDS,
        method: 'post',
        data,
    })
}

/**
 * 查询退款详情（商户后台）
 */
export async function apiMerchantBackendGetRefund(refundId: string) {
    return ApiService.fetchData<Refund>({
        url: REFUND_API.MERCHANT_BACKEND_REFUND_DETAIL(refundId),
        method: 'get',
    })
}
