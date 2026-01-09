/**
 * 后端认证 API 服务
 * 等后端 API 准备好后切换使用
 */
import ApiService from '../ApiService'
import type {
    SignInCredential,
    SignInResponse,
    ForgotPassword,
    ResetPassword,
    RequestMFAChallengeRequest,
    RequestMFAChallengeResponse,
    VerifyMFARequest,
    VerifyMFAResponse,
    SessionValidationResponse,
} from '@/@types/auth'

const AUTH_API = {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    VALIDATE_SESSION: '/api/v1/auth/session',
    MFA_CHALLENGE: '/api/v1/auth/mfa/challenge',
    MFA_VERIFY: '/api/v1/auth/mfa/verify',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
}

export async function apiSignIn(data: SignInCredential) {
    return ApiService.fetchData<SignInResponse>({
        url: AUTH_API.LOGIN,
        method: 'post',
        data,
    })
}

export async function apiSignOut() {
    return ApiService.fetchData<{ message: string }>({
        url: AUTH_API.LOGOUT,
        method: 'post',
    })
}

export async function apiValidateSession() {
    return ApiService.fetchData<SessionValidationResponse>({
        url: AUTH_API.VALIDATE_SESSION,
        method: 'get',
    })
}

export async function apiRequestMFAChallenge(data: RequestMFAChallengeRequest) {
    return ApiService.fetchData<RequestMFAChallengeResponse>({
        url: AUTH_API.MFA_CHALLENGE,
        method: 'post',
        data,
    })
}

export async function apiVerifyMFA(data: VerifyMFARequest) {
    return ApiService.fetchData<VerifyMFAResponse>({
        url: AUTH_API.MFA_VERIFY,
        method: 'post',
        data,
    })
}

export async function apiForgotPassword(data: ForgotPassword) {
    return ApiService.fetchData<{ message: string }>({
        url: AUTH_API.FORGOT_PASSWORD,
        method: 'post',
        data,
    })
}

export async function apiResetPassword(data: ResetPassword) {
    return ApiService.fetchData<{ message: string }>({
        url: AUTH_API.RESET_PASSWORD,
        method: 'post',
        data,
    })
}
