import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

/**
 * 用户状态
 */
export type UserState = {
    /** 用户 ID */
    userId?: string
    /** 用户名 */
    userName?: string
    /** 邮箱 */
    email?: string
    /** 头像 */
    avatar?: string
    /** 权限列表 */
    authority?: string[]
}

const initialState: UserState = {
    userId: '',
    userName: '',
    email: '',
    avatar: '',
    authority: [],
}

const userSlice = createSlice({
    name: `${SLICE_BASE_NAME}/user`,
    initialState,
    reducers: {
        /**
         * 设置用户信息
         */
        setUser(state, action: PayloadAction<UserState>) {
            state.userId = action.payload?.userId || ''
            state.userName = action.payload?.userName || ''
            state.email = action.payload?.email || ''
            state.avatar = action.payload?.avatar || ''
            state.authority = action.payload?.authority || []
        },

        /**
         * 清除用户信息
         */
        clearUser(state) {
            state.userId = ''
            state.userName = ''
            state.email = ''
            state.avatar = ''
            state.authority = []
        },

        /**
         * 更新用户头像
         */
        setUserAvatar(state, action: PayloadAction<string>) {
            state.avatar = action.payload
        },
    },
})

export const { setUser, clearUser, setUserAvatar } = userSlice.actions
export default userSlice.reducer
