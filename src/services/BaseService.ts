import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import appConfig from '@/configs/app.config'
import { TOKEN_TYPE, REQUEST_HEADER_AUTH_KEY } from '@/constants/api.constant'
import { PERSIST_STORE_NAME } from '@/constants/app.constant'
import deepParseJson from '@/utils/deepParseJson'
import store, { signOutSuccess } from '../store'
import { createAuthHeaders } from './auth'
import { RetryManager } from './retry'
import {
    ApiError,
    NetworkError,
    AuthenticationError,
    ValidationError,
    BusinessError,
    SystemError,
} from './errors'

// ==================== 配置 ====================

/**
 * 判断是否启用 Mock
 * 环境变量优先，否则使用 app.config
 */
const isMockEnabled = import.meta.env.VITE_ENABLE_MOCK !== undefined 
    ? import.meta.env.VITE_ENABLE_MOCK === 'true' 
    : appConfig.enableMock

/**
 * API 配置
 * 优先使用环境变量，否则使用默认值
 */
const API_CONFIG = {
    // API 基础 URL
    // Mock 模式下使用相对路径，否则使用环境变量配置的 URL
    baseURL: isMockEnabled ? appConfig.apiPrefix : (import.meta.env.VITE_API_URL || appConfig.apiPrefix),
    // API 密钥（用于签名认证）
    apiKey: import.meta.env.VITE_API_KEY || '',
    // API 密钥对应的密钥
    apiSecret: import.meta.env.VITE_API_SECRET || '',
    // 请求超时时间
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 60000,
    // 是否启用签名认证
    enableSignature: import.meta.env.VITE_ENABLE_SIGNATURE === 'true',
    // 是否启用 Mock
    enableMock: isMockEnabled,
    // 是否启用调试模式
    debug: import.meta.env.VITE_API_DEBUG === 'true',
}

// 需要签名的 API 路径前缀
const SIGNATURE_REQUIRED_PATHS = ['/api/v1/']

// 不需要 Token 的 API 路径
const NO_TOKEN_PATHS = ['/sign-in', '/sign-up', '/forgot-password', '/api/v1/auth/']

// 401 状态码
const UNAUTHORIZED_CODES = [401]

// ==================== 重试管理器 ====================

const retryManager = new RetryManager({
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    enableJitter: true,
})

// ==================== 创建 Axios 实例 ====================

const BaseService: AxiosInstance = axios.create({
    timeout: API_CONFIG.timeout,
    baseURL: API_CONFIG.baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// ==================== 请求拦截器 ====================

BaseService.interceptors.request.use(
    (config) => {
        const url = config.url || ''

        // 1. 添加 Bearer Token（如果需要）
        if (!isNoTokenPath(url)) {
            const accessToken = getAccessToken()
            if (accessToken) {
                config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${accessToken}`
            }
        }

        // 2. 添加 API 签名（如果需要且已配置）
        if (shouldAddSignature(url) && API_CONFIG.apiKey && API_CONFIG.apiSecret) {
            const method = config.method?.toUpperCase() || 'GET'
            const path = url
            const body = config.data ? JSON.stringify(config.data) : ''

            const authHeaders = createAuthHeaders(
                method,
                path,
                body,
                API_CONFIG.apiKey,
                API_CONFIG.apiSecret
            )

            // 合并认证头
            Object.assign(config.headers, authHeaders)
        }

        // 3. 调试日志
        if (API_CONFIG.debug) {
            console.log('[API Request]', {
                method: config.method?.toUpperCase(),
                url: config.url,
                headers: config.headers,
                data: config.data,
            })
        }

        return config
    },
    (error) => {
        if (API_CONFIG.debug) {
            console.error('[API Request Error]', error)
        }
        return Promise.reject(error)
    }
)

// ==================== 响应拦截器 ====================

BaseService.interceptors.response.use(
    (response) => {
        if (API_CONFIG.debug) {
            console.log('[API Response]', {
                status: response.status,
                url: response.config.url,
                data: response.data,
            })
        }
        return response
    },
    (error: AxiosError) => {
        if (API_CONFIG.debug) {
            console.error('[API Response Error]', error)
        }

        // 转换为统一的 ApiError
        const apiError = transformError(error)

        // 401 自动登出
        if (apiError.status && UNAUTHORIZED_CODES.includes(apiError.status)) {
            store.dispatch(signOutSuccess())
        }

        return Promise.reject(apiError)
    }
)

// ==================== 辅助函数 ====================

/**
 * 获取访问令牌
 */
function getAccessToken(): string | null {
    // 优先从 localStorage 获取
    const rawPersistData = localStorage.getItem(PERSIST_STORE_NAME)
    if (rawPersistData) {
        try {
            const persistData = deepParseJson(rawPersistData)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const token = (persistData as any)?.auth?.session?.token
            if (token) return token
        } catch {
            // 忽略解析错误
        }
    }

    // 备选：从 Redux store 获取
    try {
        const { auth } = store.getState()
        return auth?.session?.token || null
    } catch {
        return null
    }
}

/**
 * 判断是否为不需要 Token 的路径
 */
function isNoTokenPath(url: string): boolean {
    return NO_TOKEN_PATHS.some((path) => url.includes(path))
}

/**
 * 判断是否需要添加签名
 */
function shouldAddSignature(url: string): boolean {
    if (!API_CONFIG.enableSignature) return false
    if (API_CONFIG.enableMock) return false // Mock 模式不需要签名
    return SIGNATURE_REQUIRED_PATHS.some((path) => url.includes(path))
}

/**
 * 转换 Axios 错误为统一的 ApiError
 */
function transformError(error: AxiosError): ApiError {
    // 网络错误（无响应）
    if (!error.response) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            return new NetworkError('请求超时，请稍后重试', 'TIMEOUT')
        }
        return new NetworkError('网络连接失败，请检查网络', 'NETWORK_ERROR')
    }

    const { status, data } = error.response

    // 尝试从响应中提取错误信息
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseData = data as any
    const message = responseData?.message || responseData?.error || error.message
    const code = responseData?.code || `HTTP_${status}`
    const details = responseData?.details

    // 根据状态码分类错误
    switch (status) {
        case 400:
            return new ValidationError(message, code, details)
        case 401:
            return new AuthenticationError(message, code, status)
        case 403:
            return new AuthenticationError('没有权限访问', 'FORBIDDEN', status)
        case 404:
            return new BusinessError('资源不存在', 'NOT_FOUND', status)
        case 422:
            return new ValidationError(message, code, details)
        case 429:
            return new BusinessError('请求过于频繁，请稍后重试', 'RATE_LIMIT_EXCEEDED', status)
        case 500:
        case 502:
        case 503:
        case 504:
            return new SystemError(message || '服务器错误', code, status)
        default:
            return new BusinessError(message, code, status, details)
    }
}

// ==================== 导出 ====================

export default BaseService

// 导出配置（供其他模块使用）
export { API_CONFIG, retryManager }

// 导出错误类型
export * from './errors'
