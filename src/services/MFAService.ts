import ApiService from './ApiService'
import type {
    EnrollTOTPRequest,
    TOTPEnrollmentResponse,
    VerifyTOTPEnrollmentRequest,
    EnrollEmailRequest,
    MFAFactor,
    ResetUserMFARequest,
} from '@/@types/mfa'

// ==================== API 路径配置 ====================

const MFA_API = {
    // TOTP 管理
    TOTP_ENROLL: '/api/v1/mfa/totp/enroll',
    TOTP_VERIFY: '/api/v1/mfa/totp/verify',
    // 邮箱管理
    EMAIL_ENROLL: '/api/v1/mfa/email/enroll',
    // 因子管理
    FACTORS: '/api/v1/mfa/factors',
    FACTOR_DETAIL: (id: string) => `/api/v1/mfa/factors/${id}`,
    // 管理员操作
    ADMIN_RESET_MFA: (userId: string) => `/api/v1/admin/users/${userId}/mfa`,
}

// ==================== TOTP 管理 ====================

/**
 * 开始 TOTP 绑定
 * @param data 绑定请求参数
 * @returns TOTP 绑定信息（包含密钥和二维码）
 */
export async function apiEnrollTOTP(data: EnrollTOTPRequest) {
    return ApiService.fetchData<TOTPEnrollmentResponse, EnrollTOTPRequest>({
        url: MFA_API.TOTP_ENROLL,
        method: 'post',
        data,
    })
}

/**
 * 验证 TOTP 绑定
 * @param data 验证请求参数
 * @returns 验证结果
 */
export async function apiVerifyTOTPEnrollment(
    data: VerifyTOTPEnrollmentRequest
) {
    return ApiService.fetchData<
        { message: string; factor_id: string },
        VerifyTOTPEnrollmentRequest
    >({
        url: MFA_API.TOTP_VERIFY,
        method: 'post',
        data,
    })
}

// ==================== 邮箱管理 ====================

/**
 * 绑定邮箱
 * @param data 邮箱绑定请求参数
 * @returns MFA 因子信息
 */
export async function apiEnrollEmail(data: EnrollEmailRequest) {
    return ApiService.fetchData<MFAFactor, EnrollEmailRequest>({
        url: MFA_API.EMAIL_ENROLL,
        method: 'post',
        data,
    })
}

// ==================== 因子管理 ====================

/**
 * 列出 MFA 因子
 * @returns MFA 因子列表
 */
export async function apiListMFAFactors() {
    return ApiService.fetchData<MFAFactor[]>({
        url: MFA_API.FACTORS,
        method: 'get',
    })
}

/**
 * 解绑 MFA 因子
 * @param factorId 因子 ID
 * @returns 操作结果
 */
export async function apiUnenrollFactor(factorId: string) {
    return ApiService.fetchData<{ message: string; factor_id: string }>({
        url: MFA_API.FACTOR_DETAIL(factorId),
        method: 'delete',
    })
}

// ==================== 管理员操作 ====================

/**
 * 管理员重置用户 MFA
 * @param userId 用户 ID
 * @param data 重置原因
 * @returns 操作结果
 */
export async function apiResetUserMFA(
    userId: string,
    data: ResetUserMFARequest
) {
    return ApiService.fetchData<
        { message: string; user_id: string },
        ResetUserMFARequest
    >({
        url: MFA_API.ADMIN_RESET_MFA(userId),
        method: 'delete',
        data,
    })
}
