// ==================== 登录相关 ====================

/**
 * 登录请求参数
 */
export type SignInCredential = {
    username: string
    password: string
}

/**
 * 登录会话信息
 */
export type LoginSession = {
    session_token: string
    expires_at: string
    user_id: string
}

/**
 * 登录响应
 */
export type SignInResponse = {
    requires_mfa: boolean
    session?: LoginSession
    user_id?: string
    message: string
}

// ==================== MFA 相关 ====================

/**
 * 请求 MFA 验证码请求参数
 */
export type RequestMFAChallengeRequest = {
    user_id: string
    factor_id: string
}

/**
 * 请求 MFA 验证码响应
 */
export type RequestMFAChallengeResponse = {
    message: string
    challenge_id: string
    expires_at: string
}

/**
 * 验证 MFA 请求参数
 */
export type VerifyMFARequest = {
    user_id: string
    factor_type: 'totp' | 'email'
    code: string
    challenge_id?: string // 邮件验证码需要
}

/**
 * 验证 MFA 响应（返回会话信息）
 */
export type VerifyMFAResponse = LoginSession

// ==================== 会话相关 ====================

/**
 * 会话验证响应
 */
export type SessionValidationResponse = {
    valid: boolean
    user_id?: string
    username?: string
    email?: string
}

// ==================== 忘记密码相关 ====================

/**
 * 忘记密码请求参数
 */
export type ForgotPassword = {
    email: string
}

/**
 * 重置密码请求参数
 */
export type ResetPassword = {
    token: string
    password: string
}

// ==================== 兼容旧代码的类型别名 ====================

/**
 * @deprecated 使用 SignInResponse 替代
 */
export type SignUpResponse = SignInResponse

/**
 * @deprecated 不再支持注册功能
 */
export type SignUpCredential = {
    userName: string
    email: string
    password: string
}

// ==================== 用户信息（用于 Redux Store） ====================

/**
 * 用户信息
 */
export type User = {
    userId: string
    userName: string
    email?: string
    avatar?: string
    authority?: string[]
}
