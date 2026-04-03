import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import IconText from '@/components/shared/IconText'
import { HiExternalLink } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { NumericFormat } from 'react-number-format'
import { getCurrencySymbol } from '@/utils/currencySymbols'

type CustomerInfoProps = {
    data?: {
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
}

const CustomerInfo = ({ data }: CustomerInfoProps) => {
    const { t } = useTranslation()
    const hasAmount =
        typeof data?.amount === 'number' && Number.isFinite(data.amount)
    const displayAmount = hasAmount && data?.amount ? data.amount / 100 : 0
    const currencySymbol = getCurrencySymbol(data?.currency, '$')
    const successTimeText = (() => {
        const value = data?.successTime
        if (!value || value === '-') {
            return '-'
        }

        // RFC3339 -> YYYY-MM-DD HH:mm:ss
        const matched = value.match(
            /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
        )
        if (matched) {
            const [year, month, day] = matched[1].split('-')
            return `${matched[2]} ${month}/${day}/${year}`
        }

        return value
    })()
    return (
        <Card>
            <div className="mb-4 flex items-center justify-between">
                <h5>{hasAmount ? (
                        <NumericFormat
                            displayType="text"
                            value={(Math.round(displayAmount * 100) / 100).toFixed(2)}
                            prefix={currencySymbol}
                            thousandSeparator={true}
                        />
                    ) : (
                        '-'
                    )}</h5>
                 <span className="font-semibold">{successTimeText}</span>
            </div>
            <Link
                className="group flex items-center justify-between"
                to="#"
            >
                <div className="flex items-center">
                    <Avatar shape="circle" src={data?.img} />
                    <div className="ltr:ml-2 rtl:mr-2">
                        <div className="font-semibold group-hover:text-gray-900 group-hover:dark:text-gray-100">
                            {data?.name}
                        </div>
                    </div>
                </div>
                <HiExternalLink className="text-xl hidden group-hover:block" />
            </Link>
            <hr className="my-5" />
            <h6 className="mb-4">{t('paymentDetails.customerInfo.payment')}</h6>
            <address className="not-italic">
                <div className="mb-1">{data?.paymentInfo?.line1}</div>
                <div className="mb-1">{data?.paymentInfo?.line2}</div>
                <div className="mb-1">{data?.paymentInfo?.line3}</div>
                <div>{data?.paymentInfo?.line4}</div>
            </address>
            <hr className="my-5" />
            <h6 className="mb-4">{t('paymentDetails.customerInfo.receipt')}</h6>
            <address className="not-italic">
                <div className="mb-1">{data?.receiptInfo?.line1}</div>
                <div className="mb-1">{data?.receiptInfo?.line2}</div>
                <div className="mb-1">{data?.receiptInfo?.line3}</div>
                <div>{data?.receiptInfo?.line4}</div>
            </address>
        </Card>
    )
}

export default CustomerInfo
