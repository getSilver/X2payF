// ==================== 支付订单相关 ====================

/**
 * 交易类型
 */
export type TransactionType = 'PAY_IN' | 'PAY_OUT'

/**
 * 支付状态
 */
export type PaymentStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'SUCCESS'
    | 'FAILED'
    | 'CANCELLED'
    | 'CLOSED'
    | 'REFUNDED'

/**
 * 创建支付请求参数
 */
export interface CreatePaymentRequest {
    app_id: string
    merchant_tx_id: string
    transaction_type: TransactionType
    amount: number
    currency: string
    payment_method?: string
    notify_url?: string
    return_url?: string
    subject: string
    extra?: string
    expire_minutes?: number
}

/**
 * 创建支付响应
 */
export interface CreatePaymentResponse {
    payment_id: string
    merchant_tx_id: string
    status: PaymentStatus
    amount: number
    currency: string
    transaction_type: TransactionType
    created_at: string
    expired_at: string
}

/**
 * 支付订单详情
 */
export interface PaymentOrder {
    payment_id: string
    merchant_id: string
    app_id: string
    merchant_tx_id: string
    transaction_type: TransactionType
    amount: number
    currency: string
    payment_method: string
    end_to_end?: string
    status: PaymentStatus
    notify_url?: string
    return_url?: string
    subject: string
    extra?: string
    created_at: string
    updated_at: string
    expired_at: string
}

/**
 * 支付列表查询参数
 */
export interface PaymentListParams {
    app_id?: string
    status?: PaymentStatus
    transaction_type?: TransactionType
    start_date?: string
    end_date?: string
    page?: number
    page_size?: number
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    page_size: number
}
