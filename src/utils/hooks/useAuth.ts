import {
    apiSignIn,
    apiSignOut,
    apiRequestMFAChallenge,
    apiVerifyMFA,
} from '@/services/AuthService'
import {
    setUser,
    clearUser,
    signInSuccess,
    signOutSuccess,
    setMFAPending,
    setMFAChallenge,
    clearMFAPending,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import useQuery from './useQuery'
import type { SignInCredential } from '@/@types/auth'

type Status = 'success' | 'failed' | 'mfa_required'

/**
 * 登录结果
 */
export interface SignInResult {
    status: Status
    message: string
    userId?: string
}

/**
 * MFA 验证结果
 */
export interface MFAVerifyResult {
    status: 'success' | 'failed'
    message: string
}

const normalizeRoles = (payload: any): string[] => {
    const pickRoleValue = () =>
        payload?.roles ??
        payload?.role ??
        payload?.account_type ??
        payload?.session?.roles ??
        payload?.session?.role ??
        payload?.session?.account_type ??
        payload?.user?.roles ??
        payload?.user?.role ??
        payload?.user?.account_type ??
        payload?.account?.roles ??
        payload?.account?.role ??
        payload?.account?.account_type

    const normalizeRoleName = (role: string): string => {
        const roleUpper = role.trim().toUpperCase()
        const mapped: Record<string, string> = {
            MERCHANT: 'APP_OWNER',
            AGENT: 'AGENT',
            CHANNEL_PARTNER: 'CHANNEL_PARTNER',
        }
        return mapped[roleUpper] || roleUpper
    }

    const rolesValue = pickRoleValue()

    if (Array.isArray(rolesValue)) {
        return rolesValue.filter(
            (item: unknown): item is string => typeof item === 'string'
        ).map(normalizeRoleName)
    }

    if (typeof rolesValue === 'string' && rolesValue.trim()) {
        return [normalizeRoleName(rolesValue)]
    }

    return []
}

const resolveHomePath = (userRoles: string[]): string => {
    const hasPlatformRole = userRoles.some((role: string) =>
        [
            'PLATFORM_SUPER_ADMIN',
            'PLATFORM_OPERATIONS_ADMIN',
            'PLATFORM_FINANCE_ADMIN',
        ].includes(role)
    )
    const hasAgentRole = userRoles.includes('AGENT')
    const hasMerchantRole = userRoles.some((role: string) =>
        ['APP_OWNER', 'APP_FINANCE', 'APP_CUSTOMER_SERVICE'].includes(role)
    )

    if (hasPlatformRole) {
        return '/app/payment/dashboard'
    }
    if (hasAgentRole) {
        return '/agent/dashboard'
    }
    if (hasMerchantRole) {
        return '/mer/dashboard'
    }
    return appConfig.unAuthenticatedEntryPath
}

function useAuth() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const query = useQuery()

    const { token, signedIn, requiresMFA, mfaPending } = useAppSelector(
        (state) => state.auth.session
    )

    /**
     * 用户登录
     * @param values 登录凭证
     * @returns 登录结果
     */
    const signIn = async (values: SignInCredential): Promise<SignInResult> => {
        try {
            const resp = await apiSignIn(values)

            // 后端返回格式: { code, message, data: { requires_mfa, session, ... } }
            // AxiosResponse.data 就是后端的整个响应体
            const responseData = resp.data as any

            // 检查后端返回的 data 字段
            if (responseData && responseData.data) {
                const loginData = responseData.data

                // 检查是否需要 MFA 验证
                if (loginData.requires_mfa) {
                    // 需要 MFA，保存用户 ID 等待验证
                    dispatch(
                        setMFAPending({
                            userId: loginData.user_id || '',
                        })
                    )
                    return {
                        status: 'mfa_required',
                        message: loginData.message || '需要进行 MFA 验证',
                        userId: loginData.user_id,
                    }
                }

                // 不需要 MFA，直接登录成功
                if (loginData.session) {
                    const { session_token, user_id, expires_at } =
                        loginData.session

                    dispatch(
                        signInSuccess({
                            token: session_token,
                            userId: user_id,
                            expiresAt: expires_at,
                        })
                    )

                    // 设置用户信息，使用后端返回的角色
                    const userRoles = normalizeRoles(loginData)
                    dispatch(
                        setUser({
                            userId: user_id,
                            userName: loginData.username || values.username,
                            email: loginData.email || '',
                            avatar: '',
                            authority: userRoles,
                        })
                    )

                    // 根据用户角色决定跳转路径
                    const redirectUrl = query.get(REDIRECT_URL_KEY)
                    if (redirectUrl) {
                        navigate(redirectUrl)
                    } else {
                        const homePath = resolveHomePath(userRoles)
                        navigate(homePath)
                    }

                    return {
                        status: 'success',
                        message: '',
                    }
                }
            }

            return {
                status: 'failed',
                message: '登录失败，请重试',
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    /**
     * 请求 MFA 验证码（邮件）
     * @param factorId MFA 因子 ID
     * @returns 请求结果
     */
    const requestMFAChallenge = async (
        factorId: string
    ): Promise<MFAVerifyResult> => {
        if (!mfaPending?.userId) {
            return {
                status: 'failed',
                message: '无效的 MFA 状态',
            }
        }

        try {
            const resp = await apiRequestMFAChallenge({
                user_id: mfaPending.userId,
                factor_id: factorId,
            })

            // 后端返回格式: { code, message, data: { challenge_id, ... } }
            const responseData = resp.data as any
            if (responseData && responseData.data) {
                const challengeData = responseData.data
                dispatch(
                    setMFAChallenge({
                        challengeId: challengeData.challenge_id,
                    })
                )
                return {
                    status: 'success',
                    message: challengeData.message || '验证码已发送',
                }
            }

            return {
                status: 'failed',
                message: '请求验证码失败',
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    /**
     * 验证 MFA 验证码
     * @param code 验证码
     * @param factorType 验证类型
     * @returns 验证结果
     */
    const verifyMFA = async (
        code: string,
        factorType: 'totp' | 'email' = 'totp'
    ): Promise<MFAVerifyResult> => {
        if (!mfaPending?.userId) {
            return {
                status: 'failed',
                message: '无效的 MFA 状态',
            }
        }

        try {
            const resp = await apiVerifyMFA({
                user_id: mfaPending.userId,
                factor_type: factorType,
                code,
                challenge_id: mfaPending.challengeId,
            })

            // 后端返回格式: { code, message, data: { session_token, ... } }
            const responseData = resp.data as any
            if (responseData && responseData.data) {
                const sessionData = responseData.data
                const { session_token, user_id, expires_at } = sessionData

                dispatch(
                    signInSuccess({
                        token: session_token,
                        userId: user_id,
                        expiresAt: expires_at,
                    })
                )

                // 设置用户信息，使用后端返回的角色
                const userRoles = normalizeRoles(sessionData)
                dispatch(
                    setUser({
                        userId: user_id,
                        userName: sessionData.username || '',
                        email: sessionData.email || '',
                        avatar: '',
                        authority: userRoles,
                    })
                )

                // 根据用户角色决定跳转路径
                const redirectUrl = query.get(REDIRECT_URL_KEY)
                if (redirectUrl) {
                    navigate(redirectUrl)
                } else {
                    const homePath = resolveHomePath(userRoles)
                    navigate(homePath)
                }

                return {
                    status: 'success',
                    message: '',
                }
            }

            return {
                status: 'failed',
                message: 'MFA 验证失败',
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    /**
     * 取消 MFA 验证，返回登录页
     */
    const cancelMFA = () => {
        dispatch(clearMFAPending())
    }

    /**
     * 处理登出
     */
    const handleSignOut = () => {
        dispatch(signOutSuccess())
        dispatch(clearUser())
        navigate(appConfig.unAuthenticatedEntryPath)
    }

    /**
     * 用户登出
     */
    const signOut = async () => {
        try {
            await apiSignOut()
        } catch {
            // 即使登出 API 失败，也清除本地状态
        }
        handleSignOut()
    }

    return {
        authenticated: token && signedIn,
        requiresMFA,
        mfaPending,
        signIn,
        signOut,
        requestMFAChallenge,
        verifyMFA,
        cancelMFA,
    }
}

export default useAuth
