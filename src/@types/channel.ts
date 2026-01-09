// ==================== 渠道相关 ====================

import type { TransactionType } from './payment'

/**
 * 支付方式
 */
export type PaymentMethod =
    | 'CREDIT_CARD'
    | 'DEBIT_CARD'
    | 'BANK_TRANSFER'
    | 'E_WALLET'
    | 'QR_CODE'
    | 'CRYPTO'

/**
 * 渠道状态
 */
export type ChannelStatus = 'enabled' | 'disabled' | 'maintenance'

/**
 * 创建渠道请求
 */
export interface CreateChannelRequest {
    code: string
    name: string
    display_name: string
    supported_currencies: string[]
    supported_payment_methods: PaymentMethod[]
    supported_transaction_types: TransactionType[]
}

/**
 * 更新渠道请求
 */
export interface UpdateChannelRequest {
    name?: string
    display_name?: string
    supported_currencies?: string[]
    supported_payment_methods?: PaymentMethod[]
    supported_transaction_types?: TransactionType[]
}

/**
 * 渠道信息
 */
export interface Channel {
    id: string
    code: string
    name: string
    display_name: string
    status: ChannelStatus
    supported_currencies: string[]
    supported_payment_methods: PaymentMethod[]
    supported_transaction_types: TransactionType[]
    created_at: string
    updated_at: string
}

/**
 * 渠道状态信息
 */
export interface ChannelStatusInfo {
    channel_id: string
    channel_code: string
    channel_name: string
    status: ChannelStatus
    is_available: boolean
    last_health_check: string
    health_status: string
}

/**
 * 渠道列表查询参数
 */
export interface ChannelListParams {
    status?: ChannelStatus
    payment_method?: PaymentMethod
    currency?: string
    transaction_type?: TransactionType
    include_inactive?: boolean
}

// ==================== 渠道配置相关 ====================

/**
 * 认证配置请求
 */
export interface SetAuthConfigRequest {
    merchant_id: string
    app_id: string
    secret_key: string
    certificate?: string
}

/**
 * API 配置请求
 */
export interface SetAPIConfigRequest {
    production_endpoint: string
    test_endpoint: string
    timeout: number
    retry_count: number
    retry_interval: number
    auth_config: SetAuthConfigRequest
}

/**
 * 阶梯费率规则
 */
export interface TieredFeeRule {
    min_amount: string
    max_amount: string
    percentage_fee: string
    fixed_fee: string
}

/**
 * 费率配置请求
 */
export interface SetFeeConfigRequest {
    percentage_fee: string
    fixed_fee: string
    tiered_rules?: TieredFeeRule[]
}

/**
 * 限额配置请求
 */
export interface SetLimitConfigRequest {
    min_amount: string
    max_amount: string
    daily_limit: string
}

/**
 * 更新渠道状态请求
 */
export interface UpdateChannelStatusRequest {
    status: ChannelStatus
    reason: string
}

/**
 * 热更新凭据请求
 */
export interface HotUpdateCredentialsRequest {
    secret_key: string
    certificate?: string
}

/**
 * 认证配置响应（不含敏感信息）
 */
export interface AuthConfigResponse {
    merchant_id: string
    app_id: string
    key_version: number
    updated_at: string
}

/**
 * API 配置响应
 */
export interface APIConfigResponse {
    production_endpoint: string
    test_endpoint: string
    timeout: number
    retry_count: number
    retry_interval: number
    auth_config: AuthConfigResponse
}

/**
 * 费率配置响应
 */
export interface FeeConfigResponse {
    percentage_fee: string
    fixed_fee: string
    tiered_rules: TieredFeeRule[]
}

/**
 * 限额配置响应
 */
export interface LimitConfigResponse {
    min_amount: string
    max_amount: string
    daily_limit: string
}

/**
 * 渠道配置响应
 */
export interface ChannelConfigResponse {
    id: string
    channel_id: string
    api_config: APIConfigResponse
    fee_config: FeeConfigResponse
    limit_config: LimitConfigResponse
    created_at: string
    updated_at: string
}
