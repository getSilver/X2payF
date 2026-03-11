import CryptoJS from 'crypto-js'
import { secureRandomString } from '@/utils/secureRandom'

/**
 * 签名数据接口
 */
interface SignatureData {
    method: string
    path: string
    body: string
    timestamp: number
    apiSecret: string
}

/**
 * 生成 HMAC-SHA256 签名
 * @param data 签名数据
 * @returns 签名字符串
 */
export function generateSignature(data: SignatureData): string {
    const { method, path, body, timestamp, apiSecret } = data

    // 标准化路径（移除查询参数）
    const normalizedPath = normalizePath(path)

    // 标准化请求体
    const normalizedBody = normalizeBody(body)

    // 构建签名字符串: METHOD\nPATH\nBODY\nTIMESTAMP
    const signatureString = [
        method.toUpperCase(),
        normalizedPath,
        normalizedBody,
        timestamp.toString(),
    ].join('\n')

    // 使用 HMAC-SHA256 生成签名
    const signature = CryptoJS.HmacSHA256(signatureString, apiSecret)

    return signature.toString(CryptoJS.enc.Hex)
}

/**
 * 标准化路径
 */
function normalizePath(path: string): string {
    // 移除查询参数
    const pathWithoutQuery = path.split('?')[0]

    // 确保以 / 开头
    return pathWithoutQuery.startsWith('/')
        ? pathWithoutQuery
        : `/${pathWithoutQuery}`
}

/**
 * 标准化请求体
 */
function normalizeBody(body: string): string {
    if (!body || body.trim() === '') {
        return ''
    }

    try {
        // 如果是 JSON 字符串，先解析再重新序列化以确保格式一致
        const parsed = JSON.parse(body)
        return JSON.stringify(parsed)
    } catch {
        // 如果不是 JSON，直接返回原字符串
        return body.trim()
    }
}

/**
 * 生成随机 nonce
 */
export function generateNonce(length = 16): string {
    return secureRandomString(length)
}

/**
 * 创建认证请求头
 * @param method HTTP 方法
 * @param path 请求路径
 * @param body 请求体
 * @param apiKey API 密钥
 * @param apiSecret API 密钥对应的密钥
 * @returns 认证请求头
 */
export function createAuthHeaders(
    method: string,
    path: string,
    body: string,
    apiKey: string,
    apiSecret: string
): Record<string, string> {
    const timestamp = Date.now()
    const nonce = generateNonce()

    const signature = generateSignature({
        method: method.toUpperCase(),
        path,
        body,
        timestamp,
        apiSecret,
    })

    return {
        'X-API-Key': apiKey,
        'X-Timestamp': timestamp.toString(),
        'X-Nonce': nonce,
        'X-Signature': signature,
        'X-Signature-Version': 'v1',
    }
}
