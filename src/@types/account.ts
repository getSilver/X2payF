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
 * 创建商户请求
 */
export interface CreateMerchantRequest {
    request_id: string
    name: string
    contact_email: string
    agent_id?: string
}

/**
 * 商户信息
 */
export interface Merchant extends Account {
    name: string
    contact_email: string
    agent_id?: string
}

// ==================== 代理商相关 ====================

/**
 * 创建代理商请求
 */
export interface CreateAgentRequest {
    request_id: string
    name: string
    profit_share_rate: number
    fee_rate: number
    supported_currencies: string[]
}

/**
 * 代理商信息
 */
export interface Agent extends Account {
    name: string
    profit_share_rate: number
    fee_rate: number
    profit_balance: number
    supported_currencies: string[]
}

// ==================== 渠道合作商相关 ====================

/**
 * 创建渠道合作商请求
 */
export interface CreateChannelPartnerRequest {
    request_id: string
    name: string
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
