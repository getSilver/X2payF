import { ApiError, ErrorType, NetworkError, SystemError } from '../errors'
import { secureRandomFloat } from '@/utils/secureRandom'

/**
 * 重试配置
 */
export interface RetryConfig {
    /** 最大重试次数 */
    maxAttempts: number
    /** 基础延迟时间（毫秒） */
    baseDelay: number
    /** 最大延迟时间（毫秒） */
    maxDelay: number
    /** 延迟倍数 */
    backoffFactor: number
    /** 是否启用随机抖动 */
    enableJitter: boolean
}

/**
 * 默认重试配置
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    enableJitter: true,
}

/**
 * 重试管理器
 * 负责处理请求重试逻辑，使用指数退避策略
 */
export class RetryManager {
    private config: RetryConfig

    constructor(config: Partial<RetryConfig> = {}) {
        this.config = { ...DEFAULT_RETRY_CONFIG, ...config }
    }

    /**
     * 执行带重试的操作
     */
    async executeWithRetry<T>(
        operation: () => Promise<T>,
        onRetry?: (error: ApiError, attempt: number, delay: number) => void
    ): Promise<T> {
        let lastError: ApiError | null = null

        for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
            try {
                return await operation()
            } catch (error) {
                lastError = this.normalizeError(error)

                // 如果是最后一次尝试，直接抛出错误
                if (attempt === this.config.maxAttempts) {
                    throw lastError
                }

                // 检查是否应该重试
                if (!this.shouldRetry(lastError)) {
                    throw lastError
                }

                // 计算延迟时间
                const delay = this.calculateDelay(attempt)

                // 回调通知
                if (onRetry) {
                    onRetry(lastError, attempt, delay)
                }

                // 等待后重试
                await this.sleep(delay)
            }
        }

        // 不应该到达这里
        throw lastError || new SystemError('重试失败', 'RETRY_EXHAUSTED')
    }

    /**
     * 判断是否应该重试
     */
    private shouldRetry(error: ApiError): boolean {
        // 网络错误和系统错误可以重试
        if (
            error.type === ErrorType.NETWORK_ERROR ||
            error.type === ErrorType.SYSTEM_ERROR
        ) {
            return true
        }

        // 特定的业务错误可以重试
        const retryableCodes = [
            'RATE_LIMIT_EXCEEDED',
            'SERVICE_UNAVAILABLE',
            'TEMPORARY_ERROR',
            'TIMEOUT',
        ]

        return retryableCodes.includes(error.code)
    }

    /**
     * 标准化错误对象
     */
    private normalizeError(error: unknown): ApiError {
        if (error instanceof ApiError) {
            return error
        }

        if (error instanceof Error) {
            const message = error.message.toLowerCase()

            // 根据错误消息判断错误类型
            if (
                message.includes('network') ||
                message.includes('timeout') ||
                message.includes('enotfound') ||
                message.includes('econnrefused')
            ) {
                return new NetworkError(error.message, 'NETWORK_ERROR')
            }

            return new SystemError(error.message, 'SYSTEM_ERROR')
        }

        return new SystemError(String(error), 'UNKNOWN_ERROR')
    }

    /**
     * 计算延迟时间（指数退避 + 随机抖动）
     */
    private calculateDelay(attempt: number): number {
        // 指数退避
        let delay =
            this.config.baseDelay *
            Math.pow(this.config.backoffFactor, attempt - 1)

        // 添加随机抖动（±10%）
        if (this.config.enableJitter) {
            const jitter = delay * 0.1 * secureRandomFloat()
            delay += jitter
        }

        // 确保不超过最大延迟
        return Math.min(delay, this.config.maxDelay)
    }

    /**
     * 睡眠指定时间
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    /**
     * 更新配置
     */
    updateConfig(config: Partial<RetryConfig>): void {
        this.config = { ...this.config, ...config }
    }
}

// 导出默认实例
export const retryManager = new RetryManager()
