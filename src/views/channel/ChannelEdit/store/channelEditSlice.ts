import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiGetChannel,
    apiUpdateChannel,
    apiDeleteChannel,
    apiGetChannelConfig,
    apiSetAPIConfig,
    apiSetFeeConfig,
    apiSetLimitConfig,
    apiHotUpdateCredentials,
} from '@/services/api/ChannelApi'
import type {
    Channel,
    UpdateChannelRequest,
    ChannelConfigResponse,
    SetAPIConfigRequest,
    SetFeeConfigRequest,
    SetLimitConfigRequest,
    HotUpdateCredentialsRequest,
} from '@/@types/channel'

/**
 * 渠道编辑 State
 */
export type ChannelEditState = {
    loading: boolean
    configLoading: boolean
    channelData: Channel | null
    channelConfig: ChannelConfigResponse | null
}

export const SLICE_NAME = 'channelEdit'

/**
 * 获取渠道详情
 */
export const getChannel = createAsyncThunk(
    SLICE_NAME + '/getChannel',
    async (channelId: string) => {
        const response = await apiGetChannel(channelId)
        // 后端返回格式: { code, message, request_id, data: {...} }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseData = response.data as any
        return responseData.data || responseData
    }
)

/**
 * 更新渠道
 */
export const updateChannel = createAsyncThunk(
    SLICE_NAME + '/updateChannel',
    async (data: { channelId: string; updates: UpdateChannelRequest }) => {
        const response = await apiUpdateChannel(data.channelId, data.updates)
        return response.data
    }
)

/**
 * 删除渠道
 */
export const deleteChannel = createAsyncThunk(
    SLICE_NAME + '/deleteChannel',
    async (channelId: string) => {
        const response = await apiDeleteChannel(channelId)
        return response.data
    }
)

/**
 * 获取渠道配置
 */
export const getChannelConfig = createAsyncThunk(
    SLICE_NAME + '/getChannelConfig',
    async (channelId: string) => {
        const response = await apiGetChannelConfig(channelId)
        // 后端返回格式: { code, message, request_id, data: {...} }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseData = response.data as any
        return responseData.data || responseData
    }
)

/**
 * 设置 API 配置
 */
export const setAPIConfig = createAsyncThunk(
    SLICE_NAME + '/setAPIConfig',
    async (data: { channelId: string; config: SetAPIConfigRequest }) => {
        const response = await apiSetAPIConfig(data.channelId, data.config)
        return response.data
    }
)

/**
 * 设置费率配置
 */
export const setFeeConfig = createAsyncThunk(
    SLICE_NAME + '/setFeeConfig',
    async (data: { channelId: string; config: SetFeeConfigRequest }) => {
        const response = await apiSetFeeConfig(data.channelId, data.config)
        return response.data
    }
)

/**
 * 设置限额配置
 */
export const setLimitConfig = createAsyncThunk(
    SLICE_NAME + '/setLimitConfig',
    async (data: { channelId: string; config: SetLimitConfigRequest }) => {
        const response = await apiSetLimitConfig(data.channelId, data.config)
        return response.data
    }
)

/**
 * 热更新认证凭据
 */
export const hotUpdateCredentials = createAsyncThunk(
    SLICE_NAME + '/hotUpdateCredentials',
    async (data: { channelId: string; credentials: HotUpdateCredentialsRequest }) => {
        const response = await apiHotUpdateCredentials(data.channelId, data.credentials)
        return response.data
    }
)

const initialState: ChannelEditState = {
    loading: true,
    configLoading: false,
    channelData: null,
    channelConfig: null,
}

const channelEditSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        resetChannelData: (state) => {
            state.channelData = null
            state.channelConfig = null
            state.loading = true
            state.configLoading = false
        },
    },
    extraReducers: (builder) => {
        builder
            // 获取渠道详情
            .addCase(getChannel.fulfilled, (state, action) => {
                state.channelData = action.payload
                state.loading = false
            })
            .addCase(getChannel.pending, (state) => {
                state.loading = true
            })
            .addCase(getChannel.rejected, (state) => {
                state.loading = false
                state.channelData = null
            })
            // 获取渠道配置
            .addCase(getChannelConfig.fulfilled, (state, action) => {
                state.channelConfig = action.payload
                state.configLoading = false
            })
            .addCase(getChannelConfig.pending, (state) => {
                state.configLoading = true
            })
            .addCase(getChannelConfig.rejected, (state) => {
                state.configLoading = false
                state.channelConfig = null
            })
            // 更新渠道
            .addCase(updateChannel.fulfilled, (state) => {
                // 更新成功后可以重新获取数据或直接更新 state
            })
            // 设置配置成功后重新获取配置
            .addCase(setAPIConfig.fulfilled, (state) => {
                state.configLoading = false
            })
            .addCase(setFeeConfig.fulfilled, (state) => {
                state.configLoading = false
            })
            .addCase(setLimitConfig.fulfilled, (state) => {
                state.configLoading = false
            })
    },
})

export const { resetChannelData } = channelEditSlice.actions

export default channelEditSlice.reducer
