import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

/**
 * MFA 待验证状态
 */
export interface MFAPendingState {
    userId: string
    factorId?: string
    challengeId?: string
    factorType?: 'totp' | 'email'
}

/**
 * 会话状态
 */
export interface SessionState {
    /** 是否已登录 */
    signedIn: boolean
    /** 会话令牌 */
    token: string | null
    /** 用户 ID */
    userId: string | null
    /** 会话过期时间 */
    expiresAt: string | null
    /** 是否需要 MFA 验证 */
    requiresMFA: boolean
    /** MFA 待验证状态 */
    mfaPending: MFAPendingState | null
}

const initialState: SessionState = {
    signedIn: false,
    token: null,
    userId: null,
    expiresAt: null,
    requiresMFA: false,
    mfaPending: null,
}

/**
 * 登录成功 payload
 */
interface SignInSuccessPayload {
    token: string
    userId: string
    expiresAt?: string
}

/**
 * MFA 待验证 payload
 */
interface MFAPendingPayload {
    userId: string
    factorId?: string
    factorType?: 'totp' | 'email'
}

/**
 * MFA 验证码已发送 payload
 */
interface MFAChallengePayload {
    challengeId: string
}

const sessionSlice = createSlice({
    name: `${SLICE_BASE_NAME}/session`,
    initialState,
    reducers: {
        /**
         * 登录成功（无需 MFA 或 MFA 验证通过后）
         */
        signInSuccess(state, action: PayloadAction<SignInSuccessPayload>) {
            state.signedIn = true
            state.token = action.payload.token
            state.userId = action.payload.userId
            state.expiresAt = action.payload.expiresAt || null
            state.requiresMFA = false
            state.mfaPending = null
        },

        /**
         * 登出成功
         */
        signOutSuccess(state) {
            state.signedIn = false
            state.token = null
            state.userId = null
            state.expiresAt = null
            state.requiresMFA = false
            state.mfaPending = null
        },

        /**
         * 需要 MFA 验证
         */
        setMFAPending(state, action: PayloadAction<MFAPendingPayload>) {
            state.requiresMFA = true
            state.mfaPending = {
                userId: action.payload.userId,
                factorId: action.payload.factorId,
                factorType: action.payload.factorType,
            }
        },

        /**
         * MFA 验证码已发送（保存 challengeId）
         */
        setMFAChallenge(state, action: PayloadAction<MFAChallengePayload>) {
            if (state.mfaPending) {
                state.mfaPending.challengeId = action.payload.challengeId
            }
        },

        /**
         * 清除 MFA 状态
         */
        clearMFAPending(state) {
            state.requiresMFA = false
            state.mfaPending = null
        },
    },
})

export const {
    signInSuccess,
    signOutSuccess,
    setMFAPending,
    setMFAChallenge,
    clearMFAPending,
} = sessionSlice.actions

export default sessionSlice.reducer
