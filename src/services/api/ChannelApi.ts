/**
 * 后端渠道 API 服务
 * 等后端 API 准备好后切换使用
 */
import ApiService from '../ApiService'
import type {
    Channel,
    ChannelListParams,
    CreateChannelRequest,
    UpdateChannelRequest,
    UpdateChannelStatusRequest,
    SetAPIConfigRequest,
    SetFeeConfigRequest,
    SetLimitConfigRequest,
    HotUpdateCredentialsRequest,
    ChannelConfigResponse,
    ChannelStatusInfo,
} from '@/@types/channel'

const CHANNEL_API = {
    CHANNELS: '/api/v1/admin/channels',
    CHANNEL_DETAIL: (id: string) => `/api/v1/admin/channels/${id}`,
    CHANNEL_STATUS: (id: string) => `/api/v1/admin/channels/${id}/status`,
    CHANNEL_CONFIG: (id: string) => `/api/v1/admin/channels/${id}/config`,
    CHANNEL_API_CONFIG: (id: string) => `/api/v1/admin/channels/${id}/api-config`,
    CHANNEL_FEE_CONFIG: (id: string) => `/api/v1/admin/channels/${id}/fee-config`,
    CHANNEL_LIMIT_CONFIG: (id: string) => `/api/v1/admin/channels/${id}/limit-config`,
    CHANNEL_CREDENTIALS: (id: string) => `/api/v1/admin/channels/${id}/credentials`,
    CHANNEL_METRICS: (id: string) => `/api/v1/admin/channels/${id}/metrics`,
}

const SENSITIVE_OPERATION_HEADERS = {
    'X-Confirmation-Token': 'confirm-1',
}

export async function apiCreateChannel(data: CreateChannelRequest) {
    return ApiService.fetchData<Channel, CreateChannelRequest>({
        url: CHANNEL_API.CHANNELS,
        method: 'post',
        data,
    })
}

export async function apiGetChannel(channelId: string) {
    return ApiService.fetchData<Channel>({
        url: CHANNEL_API.CHANNEL_DETAIL(channelId),
        method: 'get',
    })
}

export async function apiGetChannels(params?: ChannelListParams) {
    return ApiService.fetchData<Channel[]>({
        url: CHANNEL_API.CHANNELS,
        method: 'get',
        params,
    })
}

export async function apiUpdateChannel(channelId: string, data: UpdateChannelRequest) {
    return ApiService.fetchData<{ channel_id: string; message: string }, UpdateChannelRequest>({
        url: CHANNEL_API.CHANNEL_DETAIL(channelId),
        method: 'put',
        data,
    })
}

export async function apiDeleteChannel(channelId: string) {
    return ApiService.fetchData<{ channel_id: string; message: string }>({
        url: CHANNEL_API.CHANNEL_DETAIL(channelId),
        method: 'delete',
        headers: SENSITIVE_OPERATION_HEADERS,
    })
}

export async function apiUpdateChannelStatus(channelId: string, data: UpdateChannelStatusRequest) {
    return ApiService.fetchData<{ channel_id: string; message: string }, UpdateChannelStatusRequest>({
        url: CHANNEL_API.CHANNEL_STATUS(channelId),
        method: 'put',
        data,
    })
}

export async function apiGetChannelConfig(channelId: string) {
    return ApiService.fetchData<ChannelConfigResponse>({
        url: CHANNEL_API.CHANNEL_CONFIG(channelId),
        method: 'get',
    })
}

export async function apiSetAPIConfig(channelId: string, data: SetAPIConfigRequest) {
    return ApiService.fetchData<{ channel_id: string; message: string }, SetAPIConfigRequest>({
        url: CHANNEL_API.CHANNEL_API_CONFIG(channelId),
        method: 'post',
        data,
        headers: SENSITIVE_OPERATION_HEADERS,
    })
}

export async function apiSetFeeConfig(channelId: string, data: SetFeeConfigRequest) {
    return ApiService.fetchData<{ channel_id: string; message: string }, SetFeeConfigRequest>({
        url: CHANNEL_API.CHANNEL_FEE_CONFIG(channelId),
        method: 'post',
        data,
    })
}

export async function apiSetLimitConfig(channelId: string, data: SetLimitConfigRequest) {
    return ApiService.fetchData<{ channel_id: string; message: string }, SetLimitConfigRequest>({
        url: CHANNEL_API.CHANNEL_LIMIT_CONFIG(channelId),
        method: 'post',
        data,
    })
}

export async function apiHotUpdateCredentials(channelId: string, data: HotUpdateCredentialsRequest) {
    return ApiService.fetchData<{ channel_id: string; message: string }, HotUpdateCredentialsRequest>({
        url: CHANNEL_API.CHANNEL_CREDENTIALS(channelId),
        method: 'put',
        data,
        headers: SENSITIVE_OPERATION_HEADERS,
    })
}

export async function apiGetChannelMetrics(channelId: string) {
    return ApiService.fetchData<ChannelStatusInfo>({
        url: CHANNEL_API.CHANNEL_METRICS(channelId),
        method: 'get',
    })
}
