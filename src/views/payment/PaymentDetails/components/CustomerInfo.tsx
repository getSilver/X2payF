import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import IconText from '@/components/shared/IconText'
import { HiExternalLink } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type CustomerInfoProps = {
    data?: {
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

const CustomerInfo = ({ data }: CustomerInfoProps) => {
    const { t } = useTranslation()

    return (
        <Card>
            <h5 className="mb-4">
                {t('paymentDetails.customerInfo.title')}
            </h5>
            <Link
                className="group flex items-center justify-between"
                to="/app/crm/customer-details?id=11"
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
