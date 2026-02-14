// ==================== 账户相关 ====================

/**
 * 账户类型
 */
export type AccountType = 'MERCHANT' | 'AGENT' | 'CHANNEL_PARTNER'

/**
 * 账户状态
 */
export type AccountStatus =
    | 'Normal'
    | 'Locked'
    | 'Frozen'
    | 'Suspended'
    | 'Disabled'
    | 'Deleted'

/**
 * 账户基本信息
 */
export interface Account {
    id: string
    account_type: AccountType
    status: AccountStatus
    created_at: string
    created_by: string
    updated_at: string
}

// ==================== 商户相关 ====================

/**
 * 创建商户请求（与后端匹配）
 * 后端会同时创建商户和主账号用户
 */
export interface CreateMerchantRequest {
    request_id?: string      // 请求ID，用于幂等性控制（可选）
    name: string             // 商户名称（必填）
    username: string         // 用户名，3-100字符（必填）
    password: string         // 密码，6-128字符（必填）
    email: string            // 邮箱，用于登录和通知（必填）
}

/**
 * 商户信息
 */
export interface Merchant extends Account {
    name: string
    contact_email: string
    agent_id?: string
    withdrawal_address?: string
    withdrawal_fee_percent?: number
    ip_whitelist?: string[]
}

// ==================== 代理商相关 ====================

/**
 * 创建代理商请求
 */
export interface CreateAgentRequest {
    request_id: string
    name: string
    username?: string
    password?: string
    email?: string
}

/**
 * 代理商信息
 */
export interface Agent extends Account {
    name: string
    profit_balance: number
}

// ==================== 渠道合作商相关 ====================

/**
 * 创建渠道合作商请求
 */
export interface CreateChannelPartnerRequest {
    request_id: string
    name: string
    username?: string
    password?: string
    email?: string
    profit_share_rate: number
    fee_rate: number
    supported_currencies: string[]
}

/**
 * 渠道合作商信息
 */
export interface ChannelPartner extends Account {
    name: string
    profit_share_rate: number
    fee_rate: number
    profit_balance: number
    supported_currencies: string[]
}

// ==================== 账户操作相关 ====================

/**
 * 更新账户状态请求
 */
export interface UpdateAccountStatusRequest {
    status: AccountStatus
    reason: string
}

/**
 * 账户列表查询参数
 */
export interface AccountListParams {
    account_type?: AccountType
    status?: AccountStatus
    page?: number
    page_size?: number
}

/**
 * 商户列表查询参数
 */
export interface ListMerchantsParams {
    agent_id?: string // 代理商ID（可选，筛选指定代理商下的商户）
    status?: AccountStatus // 账户状态（可选）
    name?: string // 商户名称（模糊搜索）
    page?: number // 页码，默认1
    page_size?: number // 每页数量，默认20，最大100
}

/**
 * 商户列表响应
 */
export interface ListMerchantsResponse {
    total: number // 总数
    page: number // 当前页码
    page_size: number // 每页数量
    list: Merchant[] // 商户列表
}

/**
 * 商户应用状态
 */
export type MerchantAppStatus = 'active' | 'inactive' | 'suspended'

/**
 * 商户应用配置
 */
export interface MerchantAppConfig {
    in_fee_rate?: number // 代收百分比费率
    in_fixed_fee?: number // 代收固定费用（分）
    out_fee_rate?: number // 代付百分比费率
    out_fixed_fee?: number // 代付固定费用（分）
    channels?: string[] // 支付渠道列表
    payment_methods?: string[] // 支持的支付方式列表
    timezone?: string // 时区
    single_txn_min?: number // 单笔最小金额（分）
    single_txn_max?: number // 单笔最大金额（分）
    daily_limit?: number // 日累计限额（分）
}

/**
 * 商户应用信息
 */
export interface MerchantApplication {
    id: string // 应用ID
    merchant_id: string // 商户ID
    name: string // 应用名称
    api_key: string // API密钥
    status: MerchantAppStatus // 状态
    ip_whitelist: string // IP白名单（JSON数组）
    config: string | MerchantAppConfig // 应用配置（JSON或对象）
    balance: number // 总余额（分）
    frozen_amount: number // 冻结金额（分）
    available_amount: number // 可用余额（分）
    currency: string // 币种
    created_at: string // 创建时间
    updated_at: string // 更新时间
    version: number // 乐观锁版本号
}
