/**
 * 错误类型枚举
 */
export enum ErrorType {
    /** 网络错误 */
    NETWORK_ERROR = 'NETWORK_ERROR',

    /** 认证错误 */
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',

    /** 验证错误 */
    VALIDATION_ERROR = 'VALIDATION_ERROR',

    /** 业务错误 */
    BUSINESS_ERROR = 'BUSINESS_ERROR',

    /** 系统错误 */
    SYSTEM_ERROR = 'SYSTEM_ERROR',
}

/**
 * API 错误基类
 */
export class ApiError extends Error {
    /** 错误类型 */
    public readonly type: ErrorType

    /** 错误代码 */
    public readonly code: string

    /** 错误详情 */
    public readonly details?: Record<string, unknown>

    /** HTTP 状态码 */
    public readonly status?: number

    /** 时间戳 */
    public readonly timestamp: number

    constructor(
        message: string,
        type: ErrorType,
        code: string,
        status?: number,
        details?: Record<string, unknown>
    ) {
        super(message)
        this.name = 'ApiError'
        this.type = type
        this.code = code
        this.status = status
        this.details = details
        this.timestamp = Date.now()
    }

    /** 是否为网络错误 */
    isNetworkError(): boolean {
        return this.type === ErrorType.NETWORK_ERROR
    }

    /** 是否为认证错误 */
    isAuthenticationError(): boolean {
        return this.type === ErrorType.AUTHENTICATION_ERROR
    }

    /** 是否为验证错误 */
    isValidationError(): boolean {
        return this.type === ErrorType.VALIDATION_ERROR
    }

    /** 是否为业务错误 */
    isBusinessError(): boolean {
        return this.type === ErrorType.BUSINESS_ERROR
    }

    /** 是否为可重试的错误 */
    isRetryable(): boolean {
        return (
            this.type === ErrorType.NETWORK_ERROR ||
            this.type === ErrorType.SYSTEM_ERROR ||
            this.code === 'RATE_LIMIT_EXCEEDED' ||
            this.code === 'SERVICE_UNAVAILABLE'
        )
    }

    /** 获取用户友好的错误消息 */
    getUserMessage(): string {
        switch (this.type) {
            case ErrorType.NETWORK_ERROR:
                return '网络连接异常，请检查网络后重试'
            case ErrorType.AUTHENTICATION_ERROR:
                return '认证失败，请重新登录'
            case ErrorType.VALIDATION_ERROR:
                return '请求参数错误，请检查输入'
            case ErrorType.BUSINESS_ERROR:
                return this.message || '业务处理失败'
            case ErrorType.SYSTEM_ERROR:
                return '系统异常，请稍后重试'
            default:
                return '操作失败，请稍后重试'
        }
    }
}

/**
 * 网络错误
 */
export class NetworkError extends ApiError {
    constructor(message: string, code = 'NETWORK_ERROR') {
        super(message, ErrorType.NETWORK_ERROR, code)
        this.name = 'NetworkError'
    }
}

/**
 * 认证错误
 */
export class AuthenticationError extends ApiError {
    constructor(message: string, code = 'AUTHENTICATION_ERROR', status = 401) {
        super(message, ErrorType.AUTHENTICATION_ERROR, code, status)
        this.name = 'AuthenticationError'
    }
}

/**
 * 验证错误
 */
export class ValidationError extends ApiError {
    constructor(
        message: string,
        code = 'VALIDATION_ERROR',
        details?: Record<string, unknown>
    ) {
        super(message, ErrorType.VALIDATION_ERROR, code, 400, details)
        this.name = 'ValidationError'
    }
}

/**
 * 业务错误
 */
export class BusinessError extends ApiError {
    constructor(
        message: string,
        code = 'BUSINESS_ERROR',
        status = 400,
        details?: Record<string, unknown>
    ) {
        super(message, ErrorType.BUSINESS_ERROR, code, status, details)
        this.name = 'BusinessError'
    }
}

/**
 * 系统错误
 */
export class SystemError extends ApiError {
    constructor(message: string, code = 'SYSTEM_ERROR', status = 500) {
        super(message, ErrorType.SYSTEM_ERROR, code, status)
        this.name = 'SystemError'
    }
}
