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

            if (resp.data) {
                // 检查是否需要 MFA 验证
                if (resp.data.requires_mfa) {
                    // 需要 MFA，保存用户 ID 等待验证
                    dispatch(
                        setMFAPending({
                            userId: resp.data.user_id || '',
                        })
                    )
                    return {
                        status: 'mfa_required',
                        message: resp.data.message || '需要进行 MFA 验证',
                        userId: resp.data.user_id,
                    }
                }

                // 不需要 MFA，直接登录成功
                if (resp.data.session) {
                    const { session_token, user_id, expires_at } =
                        resp.data.session

                    dispatch(
                        signInSuccess({
                            token: session_token,
                            userId: user_id,
                            expiresAt: expires_at,
                        })
                    )

                    // 设置用户信息
                    dispatch(
                        setUser({
                            userId: user_id,
                            userName: values.username,
                            avatar: '',
                            authority: ['ADMIN', 'USER'],
                        })
                    )

                    // 跳转到目标页面
                    const redirectUrl = query.get(REDIRECT_URL_KEY)
                    navigate(
                        redirectUrl
                            ? redirectUrl
                            : appConfig.authenticatedEntryPath
                    )

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

            if (resp.data) {
                dispatch(
                    setMFAChallenge({
                        challengeId: resp.data.challenge_id,
                    })
                )
                return {
                    status: 'success',
                    message: resp.data.message || '验证码已发送',
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

            if (resp.data) {
                const { session_token, user_id, expires_at } = resp.data

                dispatch(
                    signInSuccess({
                        token: session_token,
                        userId: user_id,
                        expiresAt: expires_at,
                    })
                )

                // 设置用户信息
                dispatch(
                    setUser({
                        userId: user_id,
                        userName: '',
                        avatar: '',
                        authority: ['ADMIN', 'USER'],
                    })
                )

                // 跳转到目标页面
                const redirectUrl = query.get(REDIRECT_URL_KEY)
                navigate(
                    redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath
                )

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
