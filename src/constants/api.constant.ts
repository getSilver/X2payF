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

// ==================== 商户后台端点（Bearer Token 认证） ====================

/** 构建商户后台 API 路径 */
export const merchantBackendPath = (...segments: (string | number)[]) => {
    const base = `${API_VERSION}/merchant`
    const tail = joinSegments(...segments)
    return tail ? `${base}/${tail}` : base
}

// 商户后台 - 支付管理
export const MERCHANT_BACKEND_PAYMENT_API = {
    LIST: merchantBackendPath('payments'),
    detail: (id: string) => merchantBackendPath('payments', id),
    cancel: (id: string) => merchantBackendPath('payments', id, 'cancel'),
    close: (id: string) => merchantBackendPath('payments', id, 'close'),
    notify: (id: string) => merchantBackendPath('payments', id, 'notify'),
} as const

// 商户后台 - 退款管理
export const MERCHANT_BACKEND_REFUND_API = {
    CREATE: merchantBackendPath('refunds'),
    detail: (id: string) => merchantBackendPath('refunds', id),
} as const

// 商户后台 - 应用管理
export const MERCHANT_BACKEND_APPLICATION_API = {
    LIST: merchantBackendPath('applications'),
    CREATE: merchantBackendPath('applications'),
    detail: (id: string) => merchantBackendPath('applications', id),
    update: (id: string) => merchantBackendPath('applications', id),
} as const

// 商户后台 - 统计分析
export const MERCHANT_BACKEND_STATISTICS_API = {
    OVERVIEW: merchantBackendPath('statistics', 'overview'),
    TRANSACTIONS: {
        SUMMARY: merchantBackendPath('statistics', 'transactions', 'summary'),
        BY_TYPE: merchantBackendPath('statistics', 'transactions', 'by-type'),
        BY_STATUS: merchantBackendPath('statistics', 'transactions', 'by-status'),
        TREND: merchantBackendPath('statistics', 'transactions', 'trend'),
        TIME_SLOT: merchantBackendPath('statistics', 'transactions', 'time-slot'),
        PEAK_ANALYSIS: merchantBackendPath('statistics', 'transactions', 'peak-analysis'),
        CYCLICAL_ANALYSIS: merchantBackendPath('statistics', 'transactions', 'cyclical-analysis'),
    },
    APPLICATIONS: merchantBackendPath('statistics', 'applications'),
    REPORTS: {
        DAILY: merchantBackendPath('statistics', 'reports', 'daily'),
        WEEKLY: merchantBackendPath('statistics', 'reports', 'weekly'),
        MONTHLY: merchantBackendPath('statistics', 'reports', 'monthly'),
    },
} as const

// 商户后台 - 风控查询
export const MERCHANT_BACKEND_RISK_API = {
    STATUS: merchantBackendPath('risk', 'status'),
    APPEAL: merchantBackendPath('risk', 'appeal'),
    HELP: merchantBackendPath('risk', 'help'),
    LEVEL: merchantBackendPath('risk', 'level'),
    SUGGESTIONS: merchantBackendPath('risk', 'suggestions'),
    LEVEL_HISTORY: merchantBackendPath('risk', 'level', 'history'),
    APPEALS: merchantBackendPath('risk', 'appeals'),
    appealStatus: (id: string) => merchantBackendPath('risk', 'appeal', id, 'status'),
} as const
