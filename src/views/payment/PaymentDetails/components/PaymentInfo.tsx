import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { NumericFormat } from 'react-number-format'

type PaymentInfoProps = {
    data?: {
        deliveryFees: number
        estimatedMin: number
        estimatedMax: number
        shippingLogo: string
        shippingVendor: string
    }
}

const PaymentInfo = ({ data }: PaymentInfoProps) => {
    return (
        <Card className="mb-4">
            <h5 className="mb-4">订单数</h5>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Avatar size={60} src={data?.shippingLogo} />
                    <div className="ltr:ml-2 rtl:mr-2">
                        <h6>{data?.shippingVendor}</h6>
                        <span>
                            商品数据{data?.estimatedMin} ~{' '}
                            {data?.estimatedMax} days
                        </span>
                    </div>
                </div>
                <span className="font-semibold">
                    <NumericFormat
                        displayType="text"
                        value={(
                            Math.round((data?.deliveryFees || 0) * 100) / 100
                        ).toFixed(3)}
                        prefix={'$'}
                        thousandSeparator={true}
                    />
                </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <Button className="w-full" variant="twoTone" color="yellow-500">回调</Button>
                <Button className="w-full" variant="twoTone" color="blue-600">refunds</Button>
                <Button className="w-full" variant="twoTone" color="red-600">手动成功</Button>
            </div>
        </Card>
    )
}

export default PaymentInfo
