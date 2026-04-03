import { useState, useEffect } from 'react'
import classNames from 'classnames'
import Tag from '@/components/ui/Tag'
import Loading from '@/components/shared/Loading'
import Container from '@/components/shared/Container'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
// import OrderProducts from './components/OrderProducts'
import PaymentSummary from './components/PaymentSummary'
import PaymentInfo from './components/PaymentInfo'
import Activity from './components/Activity'
import CustomerInfo from './components/CustomerInfo'
import { HiOutlineCalendar } from 'react-icons/hi'
import { apiGetPaymentDetails } from '@/services/PaymentService'
import { useLocation } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import {
    PAYMENT_STATUS_META,
    type PaymentOrder,
    type PaymentStatus,
} from '@/@types/payment'

type OrderDetailsResponse = PaymentOrder &
    Partial<{
        customer: {
            name: string
            img: string
            amount?: number | null
            currency?: string
            successTime?: string
            paymentInfo: {
                line1: string
                line2: string
                line3: string
                line4: string
            }
            receiptInfo: {
                line1: string
                line2: string
                line3: string
                line4: string
            }
        }
    }>

type PayementStatus = {
    label: string
    class: string
}


const notifyStatus: Record<number, PayementStatus> = {
    0: {
        label: 'Done',
        class: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-100',
    },
    1: {
        label: 'Failed',
        class: 'text-amber-600 bg-amber-100 dark:text-amber-100 dark:bg-amber-500/20',
    },
}

const fallbackText = (value?: string) => {
    if (value && value.trim()) {
        return value
    }
    return '-'
}

const parseExtra = (extra?: string) => {
    if (!extra || !extra.trim()) {
        return {}
    }

    try {
        const parsed = JSON.parse(extra)
        if (parsed && typeof parsed === 'object') {
            return parsed as Record<string, string>
        }
    } catch {
    }

    return {}
}

const mapPaymentDetail = (detail: PaymentOrder): OrderDetailsResponse => {
    const paymentInfo = {
        line1: fallbackText(detail.account_name),
        line2: fallbackText(detail.account_bank),
        line3: fallbackText(detail.account_number),
        line4: fallbackText(detail.account_type),
    }
    const extra = parseExtra(detail.extra)
    const receiptInfo = {
        line1: fallbackText(extra.sender_name),
        line2: fallbackText(extra.sender_document),
        line3: fallbackText(extra.sender_bank),
        line4: '-',
    }
    const successTime =
        detail.status === 'SUCCESS'
            ? fallbackText(detail.settled_at || detail.updated_at)
            : '-'

    return {
        ...detail,
        customer: {
            name: fallbackText(detail.end_to_end),
            img: '',
            amount: detail.amount ?? null,
            currency: detail.currency,
            successTime,
            paymentInfo,
            receiptInfo,
        },
    }
}

const PaymentDetails = () => {
    const location = useLocation()

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<Partial<OrderDetailsResponse>>({})
    const currentStatusMeta =
        PAYMENT_STATUS_META[(data.status || 'PENDING') as PaymentStatus] ||
        PAYMENT_STATUS_META.PENDING

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchData = async () => {
        const id = location.pathname.substring(
            location.pathname.lastIndexOf('/') + 1
        )
        if (id) {
            setLoading(true)
            try {
                const response = await apiGetPaymentDetails(id)
                const paymentData = (response?.data as any)?.data
                
                if (paymentData && paymentData.payment_id) {
                    const mappedData = mapPaymentDetail(paymentData as PaymentOrder)
                    setData(mappedData)
                }
            } catch {
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <Container className="h-full">
            <Loading loading={loading}>
                {!isEmpty(data) && (
                    <>
                        <div className="mb-6">
                            <div className="flex items-center mb-2">
                                <h3>
                                    <span>Order</span>
                                    <span className="ltr:ml-2 rtl:mr-2">
                                        #{data.payment_id}
                                    </span>
                                </h3>
                                <Tag
                                    className={classNames(
                                        'border-0 rounded-md ltr:ml-2 rtl:mr-2',
                                        currentStatusMeta.tagClass
                                    )}
                                >
                                    {currentStatusMeta.label}
                                </Tag>
                                <Tag
                                    className={classNames(
                                        'border-0 rounded-md ltr:ml-2 rtl:mr-2',
                                        notifyStatus[data.progress_status || 0]
                                            .class
                                    )}
                                >
                                    {
                                        notifyStatus[data.progress_status || 0]
                                            .label
                                    }
                                </Tag>
                            </div>
                            <span className="flex items-center">
                                <HiOutlineCalendar className="text-lg" />
                                <span className="ltr:ml-1 rtl:mr-1">渠道单号：
                                    {data.end_to_end}
                                </span>
                                <span className="ltr:ml-1 rtl:mr-1">商户单号：
                                    {data.merchant_tx_id}
                                </span>
                            </span>
                        </div>
                        <div className="xl:flex gap-4">
                            <div className="w-full">
                                {/* <OrderProducts data={data.product} /> */}
                                <div className="xl:grid grid-cols-2 gap-4">
                                    <PaymentInfo data={data} onRefresh={fetchData} />
                                    <PaymentSummary data={data} />
                                </div>
                                <Activity data={data.timeline} />
                            </div>
                            <div className="xl:max-w-[360px] w-full">
                                <CustomerInfo data={data.customer} />
                            </div>
                        </div>
                    </>
                )}
            </Loading>
            {!loading && isEmpty(data) && (
                <div className="h-full flex flex-col items-center justify-center">
                    <DoubleSidedImage
                        src="/img/others/img-2.png"
                        darkModeSrc="/img/others/img-2-dark.png"
                        alt="No Payment found!"
                    />
                    <h3 className="mt-8">No Payment found!</h3>
                </div>
            )}
        </Container>
    )
}

export default PaymentDetails
