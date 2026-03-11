import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { HiOutlineClipboardCopy } from 'react-icons/hi'
import {
    apiGetCashierDetail,
    createCashierEventSource,
    type CashierDetail,
    type CashierEvent,
} from '@/services/CashierService'
import './Cashier.css'

const TERMINAL_STATUSES = new Set([
    'SUCCESS',
    'FAILED',
    'CANCELLED',
    'CLOSED',
    'REFUNDED',
    'EXPIRED',
])

const CASHIER_EVENT_NAMES = [
    'session_ready',
    'payment_processing',
    'payment_success',
    'payment_failed',
    'payment_cancelled',
    'payment_closed',
    'session_expired',
    'heartbeat',
    'payment_status_changed',
]

function formatAmount(amount: number, currency: string) {
    const value = Number.isFinite(amount) ? amount / 100 : 0
    const fixed = value.toFixed(2)
    return {
        currency: currency || 'USD',
        amount: fixed,
    }
}

function formatExpireAt(expireAt: string) {
    const date = new Date(expireAt)
    if (Number.isNaN(date.getTime())) {
        return '--:--:--'
    }
    return date.toLocaleTimeString('en-GB', { hour12: false })
}

function toImageSrc(raw?: string) {
    if (!raw) {
        return ''
    }
    const val = raw.trim()
    if (!val) {
        return ''
    }
    if (
        val.startsWith('data:image/') ||
        val.startsWith('http://') ||
        val.startsWith('https://')
    ) {
        return val
    }
    if (/^[A-Za-z0-9+/=]+$/.test(val) && val.length > 120) {
        return `data:image/png;base64,${val}`
    }
    return ''
}

function parseEventPayload(raw: string): CashierEvent | null {
    try {
        return JSON.parse(raw) as CashierEvent
    } catch {
        return null
    }
}

const Cashier = () => {
    const { token = '' } = useParams()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)
    const [detail, setDetail] = useState<CashierDetail | null>(null)
    const [status, setStatus] = useState('')

    useEffect(() => {
        if (!token) {
            setError('Invalid cashier token')
            setLoading(false)
            return
        }

        let active = true
        let source: EventSource | null = null

        const connect = async () => {
            setLoading(true)
            setError('')

            try {
                const data = await apiGetCashierDetail(token)
                if (!active) {
                    return
                }
                setDetail(data)
                setStatus((data.status || '').toUpperCase())
                setLoading(false)

                source = createCashierEventSource(token)
                const handleSSE = (evt: MessageEvent) => {
                    const payload = parseEventPayload(evt.data)
                    if (!payload) {
                        return
                    }
                    const nextStatus = (payload.status || '').toUpperCase()
                    if (nextStatus) {
                        setStatus(nextStatus)
                    }
                    if (TERMINAL_STATUSES.has(nextStatus)) {
                        source?.close()
                    }
                }
                source.onmessage = handleSSE
                CASHIER_EVENT_NAMES.forEach((name) => {
                    source?.addEventListener(name, handleSSE as EventListener)
                })
                source.onerror = () => {
                    // Let EventSource perform built-in reconnect.
                }
            } catch {
                if (!active) {
                    return
                }
                setLoading(false)
                setError('Failed to load cashier data')
            }
        }

        connect()

        return () => {
            active = false
            source?.close()
        }
    }, [token])

    const amount = useMemo(() => {
        if (!detail) {
            return { currency: 'USD', amount: '0.00' }
        }
        return formatAmount(detail.amount, detail.currency)
    }, [detail])

    const expireText = useMemo(() => {
        return detail ? formatExpireAt(detail.expire_at) : '--:--:--'
    }, [detail])

    const qrSrc = useMemo(() => {
        return toImageSrc(detail?.qr_code_base64) || toImageSrc(detail?.qr_code)
    }, [detail?.qr_code_base64, detail?.qr_code])

    const copyText = useMemo(() => {
        if (!detail) {
            return ''
        }
        return detail.qr_code || ''
    }, [detail])

    const copyCode = async () => {
        if (!copyText) {
            return
        }
        try {
            await navigator.clipboard.writeText(copyText)
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
        } catch {
            setCopied(false)
        }
    }

    if (loading) {
        return <main className="cashier-page">Loading...</main>
    }

    if (error || !detail) {
        return <main className="cashier-page">{error || 'Cashier unavailable'}</main>
    }

    return (
        <main className="cashier-page">
            <div className="cashier-wrap">
                <p className="cashier-expire">Expire: {expireText}</p>

                <section className="cashier-order">
                    <div className="cashier-row cashier-row-top">
                        <span className="cashier-brand">Valor</span>
                        <span className="cashier-money">
                            <span className="cashier-money-ccy">{amount.currency}</span>
                            {amount.amount}
                        </span>
                    </div>
                    <div className="cashier-row cashier-row-bottom">
                        {detail.merchant_tx_id || detail.payment_id}
                    </div>
                </section>

                <section className="cashier-panel">
                    <p className="cashier-tips">
                        Abra o app com sua chave PIX cadastrada,
                        escolha Pagar com Pix e escaneie o QR Code ou
                        copie e cole o codigo.
                    </p>

                    <div className="cashier-qr-wrap">
                        {qrSrc ? (
                            <img className="cashier-qr" src={qrSrc} alt="PIX QR Code" />
                        ) : (
                            <div className="cashier-qr-fallback">
                                {detail.qr_code || 'QR code unavailable'}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className="cashier-copy-btn"
                        onClick={copyCode}
                        disabled={!copyText}
                    >
                        PIX COPIA E COLA
                        <HiOutlineClipboardCopy className="cashier-copy-icon" />
                    </button>

                    <img className="cashier-logo" src="/pixogo.jpg" alt="PIX logo" />

                    <p className="cashier-status">
                        Status: {status || (detail.status || '').toUpperCase()}
                        {copied ? ' | Copied' : ''}
                    </p>
                </section>
            </div>
        </main>
    )
}

export default Cashier
