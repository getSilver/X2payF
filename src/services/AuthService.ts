import ApiService from './ApiService'
import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    ChangePassword,
    SignInResponse,
    SignUpResponse,
    RequestMFAChallengeRequest,
    RequestMFAChallengeResponse,
    VerifyMFARequest,
    VerifyMFAResponse,
} from '@/@types/auth'

// ==================== 认证 API ====================

/**
 * 用户登录
 * 后端接口: POST /api/v1/auth/login
 */
export async function apiSignIn(data: SignInCredential) {
    return ApiService.fetchData<SignInResponse>({
        url: '/api/v1/auth/login',
        method: 'post',
        data,
    })
}

/**
 * 用户登出
 * 后端接口: POST /api/v1/auth/logout
 */
export async function apiSignOut() {
    return ApiService.fetchData({
        url: '/api/v1/auth/logout',
        method: 'post',
    })
}

/**
 * 会话验证
 * 后端接口: GET /api/v1/auth/session
 */
export async function apiValidateSession() {
    return ApiService.fetchData({
        url: '/api/v1/auth/session',
        method: 'get',
    })
}

/**
 * 忘记密码（暂未实现）
 */
export async function apiForgotPassword(data: ForgotPassword) {
    return ApiService.fetchData({
        url: '/api/v1/auth/forgot-password',
        method: 'post',
        data,
    })
}

/**
 * 重置密码（暂未实现）
 */
export async function apiResetPassword(data: ResetPassword) {
    return ApiService.fetchData({
        url: '/api/v1/auth/reset-password',
        method: 'post',
        data,
    })
}

/**
 * 当前登录用户修改密码
 * 后端接口: POST /api/v1/auth/change-password
 */
export async function apiChangePassword(data: ChangePassword) {
    return ApiService.fetchData({
        url: '/api/v1/auth/change-password',
        method: 'post',
        data,
    })
}

/**
 * 注册（已废弃，不再支持）
 * @deprecated
 */
export async function apiSignUp(data: SignUpCredential) {
    return ApiService.fetchData<SignUpResponse>({
        url: '/api/v1/auth/register',
        method: 'post',
        data,
    })
}

// ==================== MFA API ====================

/**
 * 发送 MFA 验证码（邮件）
 * 后端接口: POST /api/v1/auth/mfa/send
 */
export async function apiSendMFA(data: { user_id: string; factor_id: string }) {
    return ApiService.fetchData({
        url: '/api/v1/auth/mfa/send',
        method: 'post',
        data,
    })
}

/**
 * 请求 MFA 挑战（TOTP）
 * 后端接口: POST /api/v1/auth/mfa/challenge
 */
export async function apiRequestMFAChallenge(data: RequestMFAChallengeRequest) {
    return ApiService.fetchData<RequestMFAChallengeResponse>({
        url: '/api/v1/auth/mfa/challenge',
        method: 'post',
        data,
    })
}

/**
 * 验证 MFA 验证码
 * 后端接口: POST /api/v1/auth/mfa/verify
 */
export async function apiVerifyMFA(data: VerifyMFARequest) {
    return ApiService.fetchData<VerifyMFAResponse>({
        url: '/api/v1/auth/mfa/verify',
        method: 'post',
        data,
    })
}
