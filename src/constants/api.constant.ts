/**
 * API 路径常量配置
 * 分层常量 + 路径构建器 + 强类型端点函数
 */

// ==================== 认证相关常量 ====================
export const TOKEN_TYPE = 'Bearer '
export const REQUEST_HEADER_AUTH_KEY = 'Authorization'

// ==================== 基础常量 ====================
export const API_VERSION = '/api/v1'
export const ADMIN_PREFIX = 'admin'
const AUTH_RESOURCE = 'auth' as const

// ==================== 资源分组 ====================
export const ADMIN_RESOURCES = {
    MFA: 'mfa',
    PAYMENTS: 'payments',
    USERS: 'users',
    ACCOUNTS: 'accounts',
    MERCHANTS: 'merchants',
    CHANNELS: 'channels',
} as const

export const MERCHANT_RESOURCES = {
    PAYMENTS: 'payments',
    REFUNDS: 'refunds',
} as const

// ==================== 类型定义（导出供外部使用） ====================
export type AdminResource = typeof ADMIN_RESOURCES[keyof typeof ADMIN_RESOURCES]
export type MerchantResource = typeof MERCHANT_RESOURCES[keyof typeof MERCHANT_RESOURCES]

// ==================== 路径构建器（类型约束） ====================
const joinSegments = (...segments: (string | number)[]) =>
    segments
        .map((s) => String(s).replace(/^\/+|\/+$/g, ''))
        .filter(Boolean)
        .join('/')

/** 构建管理后台 API 路径 */
export const adminPath = <T extends AdminResource>(
    resource: T,
    ...segments: (string | number)[]
) => {
    const base = `${API_VERSION}/${ADMIN_PREFIX}/${resource}`
    const tail = joinSegments(...segments)
    return tail ? `${base}/${tail}` : base
}

/** 构建商户 API 路径 */
export const merchantPath = <T extends MerchantResource>(
    resource: T,
    ...segments: (string | number)[]
) => {
    const base = `${API_VERSION}/${resource}`
    const tail = joinSegments(...segments)
    return tail ? `${base}/${tail}` : base
}

/** 构建认证 API 路径 */
export const authPath = (...segments: string[]) => {
    const base = `${API_VERSION}/${AUTH_RESOURCE}`
    const tail = joinSegments(...segments)
    return tail ? `${base}/${tail}` : base
}

// ==================== 认证端点 ====================
export const AUTH_API = {
    LOGIN: authPath('login'),
    LOGOUT: authPath('logout'),
    SESSION: authPath('session'),
    MFA_CHALLENGE: authPath('mfa', 'challenge'),
    MFA_VERIFY: authPath('mfa', 'verify'),
    MFA_SEND: authPath('mfa', 'send'),
    FORGOT_PASSWORD: authPath('forgot-password'),
    RESET_PASSWORD: authPath('reset-password'),
} as const

// ==================== 管理后台端点 ====================

// MFA 管理
export const MFA_ADMIN_API = {
    TOTP_ENROLL: adminPath(ADMIN_RESOURCES.MFA, 'totp', 'enroll'),
    TOTP_VERIFY: adminPath(ADMIN_RESOURCES.MFA, 'totp', 'verify'),
    EMAIL_ENROLL: adminPath(ADMIN_RESOURCES.MFA, 'email', 'enroll'),
    FACTORS: adminPath(ADMIN_RESOURCES.MFA, 'factors'),
    factor: (id: string) => adminPath(ADMIN_RESOURCES.MFA, 'factors', id),
} as const

// 支付管理
export const PAYMENT_ADMIN_API = {
    LIST: adminPath(ADMIN_RESOURCES.PAYMENTS),
    detail: (id: string) => adminPath(ADMIN_RESOURCES.PAYMENTS, id),
    cancel: (id: string) => adminPath(ADMIN_RESOURCES.PAYMENTS, id, 'cancel'),
    close: (id: string) => adminPath(ADMIN_RESOURCES.PAYMENTS, id, 'close'),
} as const

// 用户管理（管理员操作）
export const USER_ADMIN_API = {
    resetMfa: (userId: string) => adminPath(ADMIN_RESOURCES.USERS, userId, 'mfa'),
    mfaFactors: (userId: string) => adminPath(ADMIN_RESOURCES.USERS, userId, 'mfa', 'factors'),
} as const

// 账户管理（管理员操作）
export const ACCOUNT_ADMIN_API = {
    unlock: (id: string) => adminPath(ADMIN_RESOURCES.ACCOUNTS, id, 'unlock'),
} as const

// ==================== 商户 API 端点 ====================

// 商户支付 API（API Key 认证）
export const MERCHANT_PAYMENT_API = {
    CREATE: merchantPath(MERCHANT_RESOURCES.PAYMENTS),
    LIST: merchantPath(MERCHANT_RESOURCES.PAYMENTS),
    detail: (id: string) => merchantPath(MERCHANT_RESOURCES.PAYMENTS, id),
    cancel: (id: string) => merchantPath(MERCHANT_RESOURCES.PAYMENTS, id, 'cancel'),
    close: (id: string) => merchantPath(MERCHANT_RESOURCES.PAYMENTS, id, 'close'),
} as const

// 退款 API
export const REFUND_API = {
    CREATE: merchantPath(MERCHANT_RESOURCES.REFUNDS),
    detail: (id: string) => merchantPath(MERCHANT_RESOURCES.REFUNDS, id),
} as const
