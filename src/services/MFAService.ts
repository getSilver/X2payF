import ApiService from './ApiService'
import { SELF_MFA_API, USER_ADMIN_API } from '@/constants/api.constant'
import type {
    EnrollTOTPRequest,
    TOTPEnrollmentResponse,
    VerifyTOTPEnrollmentRequest,
    EnrollEmailRequest,
    MFAFactor,
    ResetUserMFARequest,
} from '@/@types/mfa'

// ==================== TOTP 管理 ====================

/**
 * 开始 TOTP 绑定
 * @param data 绑定请求参数
 * @returns TOTP 绑定信息（包含密钥和二维码）
 */
export async function apiEnrollTOTP(data: EnrollTOTPRequest) {
    return ApiService.fetchData<TOTPEnrollmentResponse, EnrollTOTPRequest>({
        url: SELF_MFA_API.TOTP_ENROLL,
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
        url: SELF_MFA_API.TOTP_VERIFY_ENROLLMENT,
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
        url: SELF_MFA_API.EMAIL_ENROLL,
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
        url: SELF_MFA_API.FACTORS,
        method: 'get',
    })
}

/**
 * 解绑 MFA 因子
 * @param factorId 因子 ID
 * @param code 验证码（6位数字）
 * @returns 操作结果
 */
export async function apiUnenrollFactor(factorId: string, code: string) {
    return ApiService.fetchData<{ message: string; factor_id: string }>({
        url: SELF_MFA_API.factor(factorId),
        method: 'delete',
        data: { code },
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
        url: USER_ADMIN_API.resetMfa(userId),
        method: 'delete',
        data,
    })
}
