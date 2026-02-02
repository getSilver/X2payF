import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
    apiGetChannels,
    apiDeleteChannel,
    apiUpdateChannelStatus,
} from '@/services/api/ChannelApi'
import type { TableQueries } from '@/@types/common'
import type {
    Channel,
    ChannelStatus,
    ChannelListParams,
} from '@/@types/channel'

/**
 * 渠道列表筛选参数
 */
type FilterQueries = {
    name: string
    status: ChannelStatus[]
    currency: string
}

/**
 * 渠道列表 State
 */
export type ChannelListState = {
    loading: boolean
    deleteConfirmation: boolean
    selectedChannelId: string
    tableData: TableQueries
    filterData: FilterQueries
    channelList: Channel[]
}

export const SLICE_NAME = 'channelList'

/**
 * 获取渠道列表
 */
export const getChannels = createAsyncThunk(
    SLICE_NAME + '/getChannels',
    async (params?: ChannelListParams) => {
        const response = await apiGetChannels(params)
        // 后端返回格式: { code, message, request_id, data: [...] }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseData = response.data as any
        return responseData.data || []
    }
)

/**
 * 删除渠道
 */
export const deleteChannel = createAsyncThunk(
    SLICE_NAME + '/deleteChannel',
    async (channelId: string) => {
        await apiDeleteChannel(channelId)
        return channelId
    }
)

/**
 * 更新渠道状态
 */
export const updateChannelStatus = createAsyncThunk(
    SLICE_NAME + '/updateChannelStatus',
    async (data: { channelId: string; status: ChannelStatus; reason: string }) => {
        await apiUpdateChannelStatus(data.channelId, {
            status: data.status,
            reason: data.reason,
        })
        return { channelId: data.channelId, status: data.status }
    }
)

export const initialTableData: TableQueries = {
    total: 0,
    pageIndex: 1,
    pageSize: 10,
    query: '',
    sort: {
        order: '',
        key: '',
    },
}

const initialState: ChannelListState = {
    loading: false,
    deleteConfirmation: false,
    selectedChannelId: '',
    channelList: [],
    tableData: initialTableData,
    filterData: {
        name: '',
        status: [],
        currency: '',
    },
}

const channelListSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        updateChannelList: (state, action: PayloadAction<Channel[]>) => {
            state.channelList = action.payload
        },
        setTableData: (state, action: PayloadAction<TableQueries>) => {
            state.tableData = action.payload
        },
        setFilterData: (state, action: PayloadAction<FilterQueries>) => {
            state.filterData = action.payload
        },
        toggleDeleteConfirmation: (state, action: PayloadAction<boolean>) => {
            state.deleteConfirmation = action.payload
        },
        setSelectedChannel: (state, action: PayloadAction<string>) => {
            state.selectedChannelId = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            // 获取渠道列表
            .addCase(getChannels.fulfilled, (state, action) => {
                state.channelList = action.payload || []
                state.tableData.total = action.payload?.length || 0
                state.loading = false
            })
            .addCase(getChannels.pending, (state) => {
                state.loading = true
            })
            .addCase(getChannels.rejected, (state) => {
                state.loading = false
                state.channelList = []
            })
            // 删除渠道
            .addCase(deleteChannel.fulfilled, (state, action) => {
                state.channelList = state.channelList.filter(
                    (channel) => channel.id !== action.payload
                )
                state.tableData.total = state.channelList.length
                state.deleteConfirmation = false
                state.selectedChannelId = ''
            })
            // 更新渠道状态
            .addCase(updateChannelStatus.fulfilled, (state, action) => {
                const { channelId, status } = action.payload
                const target = state.channelList.find(
                    (channel) => channel.id === channelId
                )
                if (target) {
                    target.status = status
                }
            })
    },
})

export const {
    updateChannelList,
    setTableData,
    setFilterData,
    toggleDeleteConfirmation,
    setSelectedChannel,
} = channelListSlice.actions

export default channelListSlice.reducer
