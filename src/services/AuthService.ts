import ApiService from './ApiService'
import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    SignInResponse,
    SignUpResponse,
    RequestMFAChallengeRequest,
    RequestMFAChallengeResponse,
    VerifyMFARequest,
    VerifyMFAResponse,
} from '@/@types/auth'

export async function apiSignIn(data: SignInCredential) {
    return ApiService.fetchData<SignInResponse>({
        url: '/sign-in',
        method: 'post',
        data,
    })
}

export async function apiSignUp(data: SignUpCredential) {
    return ApiService.fetchData<SignUpResponse>({
        url: '/sign-up',
        method: 'post',
        data,
    })
}

export async function apiSignOut() {
    return ApiService.fetchData({
        url: '/sign-out',
        method: 'post',
    })
}

export async function apiForgotPassword(data: ForgotPassword) {
    return ApiService.fetchData({
        url: '/forgot-password',
        method: 'post',
        data,
    })
}

export async function apiResetPassword(data: ResetPassword) {
    return ApiService.fetchData({
        url: '/reset-password',
        method: 'post',
        data,
    })
}

// MFA 相关 API（Mock 版本）
export async function apiRequestMFAChallenge(data: RequestMFAChallengeRequest) {
    return ApiService.fetchData<RequestMFAChallengeResponse>({
        url: '/mfa/challenge',
        method: 'post',
        data,
    })
}

export async function apiVerifyMFA(data: VerifyMFARequest) {
    return ApiService.fetchData<VerifyMFAResponse>({
        url: '/mfa/verify',
        method: 'post',
        data,
    })
}
