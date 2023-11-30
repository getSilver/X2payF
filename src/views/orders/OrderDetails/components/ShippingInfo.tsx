import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { NumericFormat } from 'react-number-format'

type ShippingInfoProps = {
    data?: {
        deliveryFees: number
        estimatedMin: number
        estimatedMax: number
        shippingLogo: string
        shippingVendor: string
    }
}

const ShippingInfo = ({ data }: ShippingInfoProps) => {
    return (
        <Card className="mb-4">
            <h5 className="mb-4">订单功能</h5>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Avatar size={60} src={data?.shippingLogo} />
                    <div className="ltr:ml-2 rtl:mr-2">
                        <h6>{data?.shippingVendor}</h6>
                        <span>
                            带思考填充什么数据 {data?.estimatedMin} ~{' '}
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
            <Button className="mr-2 mb-2" variant="twoTone" color="yellow-500">驳回订单</Button>
            <Button className="mr-2 mb-2" variant="twoTone" color="blue-600">通知下游</Button>
            <Button className="mr-2 mb-2" variant="twoTone" color="red-600">设为已付</Button>
        </Card>
    )
}

export default ShippingInfo
