import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiGetChannelEditDetail,
    apiGetChannelAdapters,
    apiUpdateChannel,
    apiDeleteChannel,
    apiUpdateChannelAdapterBinding,
    apiSetAPIConfig,
    apiSetFeeConfig,
    apiSetLimitConfig,
    apiHotUpdateCredentials,
} from '@/services/api/ChannelApi'
import type {
    ChannelEditDetailResponse,
    ChannelAdapterInfo,
    UpdateChannelRequest,
    UpdateChannelAdapterBindingRequest,
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
    channelDetail: ChannelEditDetailResponse | null
    adapterOptions: ChannelAdapterInfo[]
}

export const SLICE_NAME = 'channelEdit'

/**
 * 获取渠道详情
 */
export const getChannelEditDetail = createAsyncThunk(
    SLICE_NAME + '/getChannelEditDetail',
    async (channelId: string) => {
        const response = await apiGetChannelEditDetail(channelId)
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

export const getChannelAdapters = createAsyncThunk(
    SLICE_NAME + '/getChannelAdapters',
    async () => {
        const response = await apiGetChannelAdapters()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseData = response.data as any
        return responseData.data || responseData
    },
)

export const updateChannelAdapterBinding = createAsyncThunk(
    SLICE_NAME + '/updateChannelAdapterBinding',
    async (data: { channelId: string; binding: UpdateChannelAdapterBindingRequest }) => {
        const response = await apiUpdateChannelAdapterBinding(data.channelId, data.binding)
        return response.data
    },
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
    channelDetail: null,
    adapterOptions: [],
}

const channelEditSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        resetChannelData: (state) => {
            state.channelDetail = null
            state.adapterOptions = []
            state.loading = true
        },
    },
    extraReducers: (builder) => {
        builder
            // 获取渠道详情
            .addCase(getChannelEditDetail.fulfilled, (state, action) => {
                state.channelDetail = action.payload
                state.loading = false
            })
            .addCase(getChannelEditDetail.pending, (state) => {
                state.loading = true
            })
            .addCase(getChannelEditDetail.rejected, (state) => {
                state.loading = false
                state.channelDetail = null
            })
            .addCase(getChannelAdapters.fulfilled, (state, action) => {
                state.adapterOptions = action.payload
            })
    },
})

export const { resetChannelData } = channelEditSlice.actions

export default channelEditSlice.reducer
