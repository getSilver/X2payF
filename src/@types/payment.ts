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

export type PaymentStatusMeta = {
    label: string
    dotClass: string
    textClass: string
    tagClass: string
}

export const PAYMENT_STATUS_META: Record<PaymentStatus, PaymentStatusMeta> = {
    PENDING: {
        label: 'Pending',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-500',
        tagClass:
            'text-amber-600 bg-amber-100 dark:text-amber-100 dark:bg-amber-500/20',
    },
    PROCESSING: {
        label: 'Processing',
        dotClass: 'bg-blue-500',
        textClass: 'text-blue-500',
        tagClass:
            'text-blue-600 bg-blue-100 dark:text-blue-100 dark:bg-blue-500/20',
    },
    SUCCESS: {
        label: 'Paid',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-500',
        tagClass:
            'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100',
    },
    FAILED: {
        label: 'Failed',
        dotClass: 'bg-red-500',
        textClass: 'text-red-500',
        tagClass:
            'text-red-500 bg-red-100 dark:text-red-100 dark:bg-red-500/20',
    },
    CANCELLED: {
        label: 'Cancelled',
        dotClass: 'bg-gray-500',
        textClass: 'text-gray-500',
        tagClass:
            'text-gray-500 bg-gray-100 dark:text-gray-100 dark:bg-gray-500/20',
    },
    CLOSED: {
        label: 'Closed',
        dotClass: 'bg-gray-500',
        textClass: 'text-gray-500',
        tagClass:
            'text-gray-500 bg-gray-100 dark:text-gray-100 dark:bg-gray-500/20',
    },
    REFUNDED: {
        label: 'Refunded',
        dotClass: 'bg-orange-500',
        textClass: 'text-orange-500',
        tagClass:
            'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-100',
    },
}

export type PaymentTimelineStage =
    | 'ORDER_CREATED'
    | 'CHANNEL_REQUEST'
    | 'CHANNEL_RESPONSE'
    | 'PAYMENT_STATUS_CHANGED'
    | 'WEBHOOK_SENT'
    | 'WEBHOOK_RESPONSE'
    | 'RETRY_SCHEDULED'
    | 'TERMINAL_REACHED'

export interface PaymentTimelineEvent {
    time: string
    stage: PaymentTimelineStage | string
    status: string
    details?: unknown
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
    channel_id?: string
    channel_display_name?: string
    channel_name?: string
    end_to_end?: string
    status: PaymentStatus
    error_code?: string
    account_name?: string
    account_bank?: string
    account_number?: string
    account_type?: string
    progress_status?: number
    notify_url?: string
    return_url?: string
    subject?: string
    extra?: string
    merchant_fee?: number | null
    settlement_amount?: number | null
    settled_at?: string | null
    refund_count?: number
    successful_refund_amount?: number
    latest_refund_status?: string
    latest_refund_time?: string
    timeline?: PaymentTimelineEvent[]
    balance_before?: number
    balance_after?: number
    created_at: string
    updated_at?: string
    expired_at?: string
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
    payment_id?: string      // 按支付ID搜索
    merchant_tx_id?: string  // 按商户交易ID搜索
    query?: string           // 通用搜索（交易ID或渠道ID）
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
