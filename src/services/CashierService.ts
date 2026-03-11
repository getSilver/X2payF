import ApiService from './ApiService'
import appConfig from '@/configs/app.config'

export type CashierDetail = {
    session_id: string
    payment_id: string
    merchant_tx_id: string
    amount: number
    currency: string
    payment_method: string
    status: string
    qr_code?: string
    qr_code_base64?: string
    payment_url?: string
    subject?: string
    expire_at: string
    return_url?: string
}

export type CashierEvent = {
    event_id: string
    payment_id: string
    session_id: string
    status: string
    updated_at: string
    message?: string
}

type ApiEnvelope<T> = {
    code?: number
    message?: string
    data?: T
}

function unwrapData<T>(payload: unknown): T {
    const wrapped = payload as ApiEnvelope<T>
    if (wrapped && wrapped.data) {
        return wrapped.data
    }
    return payload as T
}

function trimSlash(url: string): string {
    return url.endsWith('/') ? url.slice(0, -1) : url
}

export function buildCashierApiUrl(path: string): string {
    const rawBase = (import.meta.env.VITE_API_URL || '').trim()
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    if (!rawBase) {
        const prefix = trimSlash(appConfig.apiPrefix || '/api')
        return `${prefix}${normalizedPath}`
    }
    return `${trimSlash(rawBase)}${normalizedPath}`
}

export async function apiGetCashierDetail(token: string) {
    const response = await ApiService.fetchData<ApiEnvelope<CashierDetail>>({
        url: `/v1/public/cashier/${encodeURIComponent(token)}`,
        method: 'get',
    })
    return unwrapData<CashierDetail>(response.data)
}

export function createCashierEventSource(token: string): EventSource {
    const url = buildCashierApiUrl(
        `/v1/public/cashier/${encodeURIComponent(token)}/events`
    )
    return new EventSource(url, { withCredentials: true })
}
