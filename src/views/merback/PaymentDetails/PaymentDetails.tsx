import { useState, useEffect } from 'react'
import classNames from 'classnames'
import Tag from '@/components/ui/Tag'
import Loading from '@/components/shared/Loading'
import Container from '@/components/shared/Container'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import PaymentSummary from './components/PaymentSummary'
import PaymentInfo from './components/PaymentInfo'
import Activity from './components/Activity'
import CustomerInfo from './components/CustomerInfo'
import { HiOutlineCalendar } from 'react-icons/hi'
import { apiGetMerchantBackendPaymentDetails } from '@/services/PaymentService'
import { useLocation } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import type { PaymentStatus } from '@/@types/payment'

type OrderDetailsResponse = {
    payment_id?: string
    merchant_tx_id?: string
    status?: PaymentStatus
    progress_status?: number
    amount?: number | null
    settlement?: number | null
    fee?: number | null
    subject?: string
    currency?: string
    orderLogo?: string
    account_name?: string
    account_bank?: string
    account_number?: string
    account_type?: string
    created_at?: string
    updated_at?: string
    expired_at?: string
    customer?: {
        name: string
        img: string
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
}

type PayementStatus = {
    label: string
    class: string
}

const paymentStatus: Record<PaymentStatus, PayementStatus> = {
    SUCCESS: {
        label: 'Paid',
        class: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100',
    },
    PENDING: {
        label: 'Unpaid',
        class: 'text-red-500 bg-red-100 dark:text-red-100 dark:bg-red-500/20',
    },
    PROCESSING: {
        label: 'Processing',
        class: 'text-amber-600 bg-amber-100 dark:text-amber-100 dark:bg-amber-500/20',
    },
    FAILED: {
        label: 'Failed',
        class: 'text-red-500 bg-red-100 dark:text-red-100 dark:bg-red-500/20',
    },
    CANCELLED: {
        label: 'Cancelled',
        class: 'text-gray-500 bg-gray-100 dark:text-gray-100 dark:bg-gray-500/20',
    },
    CLOSED: {
        label: 'Closed',
        class: 'text-gray-500 bg-gray-100 dark:text-gray-100 dark:bg-gray-500/20',
    },
    REFUNDED: {
        label: 'Refund',
        class: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-100',
    },
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

const mapPaymentDetail = (detail: any): OrderDetailsResponse => {
    const paymentInfo = {
        line1: fallbackText(detail.account_name),
        line2: fallbackText(detail.account_bank),
        line3: fallbackText(detail.account_number),
        line4: fallbackText(detail.account_type),
    }

    return {
        ...detail,
        customer: {
            name: '-',
            img: '',
            paymentInfo,
            receiptInfo: paymentInfo,
        },
    }
}

const PaymentDetails = () => {
    const location = useLocation()

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<Partial<OrderDetailsResponse>>({})

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
                const response = await apiGetMerchantBackendPaymentDetails(id)
                console.log('商户订单详情 API Response:', response)
                const paymentData = (response?.data as any)?.data
                console.log('商户订单详情 Payment Data:', paymentData)
                
                if (paymentData && paymentData.payment_id) {
                    const mappedData = mapPaymentDetail(paymentData)
                    console.log('商户订单详情 Mapped Data:', mappedData)
                    setData(mappedData)
                } else {
                    console.warn('商户订单详情: No payment_id found in response data')
                }
            } catch (error) {
                console.error('获取订单详情失败:', error)
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
                                        paymentStatus[
                                            data.status || 'PENDING'
                                        ].class
                                    )}
                                >
                                    {
                                        paymentStatus[
                                            data.status || 'PENDING'
                                        ].label
                                    }
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
                                <span className="ltr:ml-1 rtl:mr-1">商户单号：
                                    {data.merchant_tx_id}
                                </span>
                            </span>
                        </div>
                        <div className="xl:flex gap-4">
                            <div className="w-full">
                                <div className="xl:grid grid-cols-2 gap-4">
                                    <PaymentInfo data={data} onRefresh={fetchData} />
                                    <PaymentSummary data={data} />
                                </div>
                                <Activity data={data} />
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
