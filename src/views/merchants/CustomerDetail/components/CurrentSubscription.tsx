import { useState, useCallback } from 'react'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import { HiFire } from 'react-icons/hi2'
import { NumericFormat } from 'react-number-format'
import { useAppSelector } from '../store'
// import dayjs from 'dayjs'

const CurrentSubscription = () => {
    const [subscribed, setSubscribed] = useState(true)

    const data = useAppSelector(
        (state) => state.crmCustomerDetails.data.subscriptionData
    )

    const unsubscribe = useCallback(() => {
        setSubscribed(false)
    }, [])

    const subscribe = useCallback(() => {
        setSubscribed(true)
    }, [])

    return (
        <div className="mb-8">
            <h6 className="mb-4">Sub说明：账户注册后是非激活关闭状态，点击激活，激活。点击沙箱是沙箱，点击运营进入运营，再点激活关闭账户</h6>
            {data.map((sub) => (
                <Card key={sub.plan} bordered className="mb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div>
                                <Avatar
                                    className="bg-emerald-500"
                                    shape="circle"
                                    icon={<HiFire />}
                                ></Avatar>
                            </div>
                            <div>
                                <div className="flex items-center">
                                    <h6>{sub.plan}</h6>
                                    <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 rounded-md border-0 mx-2">
                                        <span className="capitalize">
                                            {sub.status}
                                        </span>
                                    </Tag>
                                </div>
                                <div>
                                    <span>
                                        <span className="mx-1"> 待结算</span><NumericFormat
                                            className="font-semibold text-gray-900 dark:text-gray-100"
                                            displayType="text"
                                            value={(
                                                Math.round(sub.amount * 100) /
                                                100
                                            ).toFixed(3)}
                                            prefix={'$'}
                                            thousandSeparator={true}
                                        /></span>
                                    <span> | </span>
                                    <span>
                                        <span className="mx-1"> 冻结金额</span>
                                        <NumericFormat
                                            className="font-semibold text-gray-900 dark:text-gray-100"
                                            displayType="text"
                                            value={(
                                                Math.round(sub.amount * 100) /
                                                100
                                            ).toFixed(3)}
                                            prefix={'$'}
                                            thousandSeparator={true}
                                        />
                                    </span>
                                    <span>
                                        <span className="mx-1">金额</span>
                                        <NumericFormat
                                            className="font-semibold text-gray-900 dark:text-gray-100"
                                            displayType="text"
                                            value={(
                                                Math.round(sub.amount * 100) /
                                                100
                                            ).toFixed(3)}
                                            prefix={'$'}
                                            thousandSeparator={true}
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex">
                            {subscribed && (
                                <Button
                                    size="sm"
                                    variant="plain"
                                    onClick={unsubscribe}
                                >
                                    沙箱
                                </Button>
                            )}
                            <Button
                                size="sm"
                                className="ml-2 rtl:mr-2"
                                onClick={subscribe}
                            >
                                {subscribed ? '激活' : '正式环境'} Plan
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default CurrentSubscription
