// ==================== MFA 相关类型 ====================

/**
 * MFA 因子类型
 */
export type MFAFactorType = 'totp' | 'email'

/**
 * MFA 因子状态
 */
export type MFAFactorStatus = 'unverified' | 'verified' | 'disabled'

/**
 * TOTP 绑定请求
 */
export interface EnrollTOTPRequest {
    friendly_name: string
}

/**
 * TOTP 绑定响应
 */
export interface TOTPEnrollmentResponse {
    factor_id: string
    secret: string
    qr_code_uri: string
    friendly_name: string
}

/**
 * TOTP 绑定验证请求
 */
export interface VerifyTOTPEnrollmentRequest {
    factor_id: string
    code: string
}

/**
 * 邮箱绑定请求
 */
export interface EnrollEmailRequest {
    email: string
}

/**
 * MFA 因子信息
 */
export interface MFAFactor {
    id: string
    factor_type: MFAFactorType
    email?: string
    status: MFAFactorStatus
    friendly_name: string
    last_used_at?: string
    created_at: string
}

/**
 * 管理员重置用户 MFA 请求
 */
export interface ResetUserMFARequest {
    reason: string
}
