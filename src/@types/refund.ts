// ==================== 退款相关 ====================

/**
 * 退款状态
 */
export type RefundStatus = 
    | 'PENDING'      // 待退款
    | 'PROCESSING'   // 退款中
    | 'SUCCESS'      // 退款成功
    | 'FAILED'       // 退款失败
    | 'CANCELLED'    // 已取消

/**
 * 退款类型
 */
export type RefundType = 
    | 'FULL'     // 全额退款
    | 'PARTIAL'  // 部分退款

/**
 * 创建退款请求
 */
export interface CreateRefundRequest {
    payment_id: string
    merchant_refund_id: string
    request_id: string
    refund_amount: number
    reason?: string
    notify_url?: string
    extra?: string
}

/**
 * 创建退款响应
 */
export interface CreateRefundResponse {
    refund_id: string
    payment_id: string
    merchant_refund_id: string
    refund_amount: number
    original_amount: number
    refund_type: RefundType
    status: RefundStatus
    created_at: string
    process_error?: string
}

/**
 * 退款信息
 */
export interface Refund {
    id: string
    payment_id: string
    merchant_id: string
    app_id: string
    merchant_refund_id: string
    refund_type: RefundType
    refund_amount: number
    original_amount: number
    currency: string
    channel_id?: string
    channel_refund_id?: string
    status: RefundStatus
    reason?: string
    notify_url?: string
    extra?: string
    created_at: string
    updated_at: string
    completed_at?: string
}
