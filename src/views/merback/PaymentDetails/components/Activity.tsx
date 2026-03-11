import classNames from 'classnames'
import Timeline from '@/components/ui/Timeline'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card' 
import isLastChild from '@/utils/isLastChild'
import dayjs from 'dayjs'
import WebhookTip from '@/views/WebhookTip'

type Event = {
    time: string
    action: string
    details?: string
}

type ActivityData = {
    date: string
    events: Event[]
}

type ActivityProps = {
    data?: {
        payment_id?: string
        app_id?: string
        merchant_tx_id?: string
        transaction_type?: string
        amount?: number | null
        status?: string
        currency?: string
        payment_method?: string
        notify_url?: string
        return_url?: string
        subject?: string
        body?: string
        extra?: string
        progress_status?: number
        created_at?: string
        updated_at?: string
        expired_at?: string
        refund_count?: number
        successful_refund_amount?: number
        latest_refund_status?: string
        latest_refund_time?: string
    }
}

// 构建 Activity 时间线数据
const buildActivityData = (detail: ActivityProps['data']): ActivityData[] => {
    if (!detail?.created_at) {
        return []
    }

    const activity: ActivityData[] = []
    const createdDate = detail.created_at.split('T')[0]
    const events: Event[] = []

    const submitSnapshot = {
        app_id: detail.app_id || '-',
        merchant_tx_id: detail.merchant_tx_id || '-',
        transaction_type: detail.transaction_type || '-',
        amount: detail.amount ?? '-',
        currency: detail.currency || '-',
        payment_method: detail.payment_method || '-',
        subject: detail.subject || '-',
        notify_url: detail.notify_url || '-',
        return_url: detail.return_url || '-',
        extra: detail.extra || '-',
    }
    const orderDetails = JSON.stringify(submitSnapshot, null, 2)

    // 订单创建事件
    events.push({
        time: detail.created_at,
        action: 'Creation',
        details: orderDetails,
    })

    // 如果有更新时间且与创建时间不同，添加更新事件
    if (detail.updated_at && detail.updated_at !== detail.created_at) {
        const callbackContent = JSON.stringify(
            {
                notify_url: detail.notify_url || '-',
                callback_status: detail.progress_status === 0 ? 'Done' : 'Failed',
                payment_status: detail.status || '-',
            },
            null,
            2
        )
        events.push({
            time: detail.updated_at,
            action: `Status: ${detail.status || '-'}`,
            details: callbackContent,
        })
    }

    if (detail.latest_refund_status) {
        const refundedAmount =
            typeof detail.successful_refund_amount === 'number'
                ? (detail.successful_refund_amount / 100).toFixed(2)
                : '0.00'
        const refundDetails = [
            `退款状态: ${detail.latest_refund_status}`,
            `累计成功退款: ${refundedAmount} ${detail.currency || ''}`.trim(),
            `退款次数: ${detail.refund_count || 0}`,
        ].join('\n')
        events.push({
            time: detail.latest_refund_time || detail.updated_at || detail.created_at,
            action: 'Refund',
            details: refundDetails,
        })
    }

    activity.push({
        date: createdDate,
        events,
    })

    return activity
}

const Activity = ({ data }: ActivityProps) => {
    const activityData = buildActivityData(data)

    const formatIso = (value: string) => {
        const parsed = dayjs(value)
        return parsed.isValid() ? parsed.toISOString() : '-'
    }

    if (activityData.length === 0) {
        return null
    }

    return (
        <Card className="mb-4">
            <h5 className="mb-4">Activity</h5>
            {activityData.map((activity, i) => (
                <div
                    key={activity.date}
                    className={!isLastChild(activityData, i) ? 'mb-8' : ''}
                >
                    <div className="mb-2 font-semibold uppercase opacity-80">
                        {formatIso(activity.date)}
                    </div>
                    <Timeline>
                        {activity.events.map((event, j) => (
                            <Timeline.Item
                                key={event.time + j}
                                media={
                                    <div className="flex mt-1.5">
                                        <Badge
                                            innerClass={classNames(
                                                event.details
                                                    ? 'bg-emerald-500'
                                                    : 'bg-blue-500'
                                            )}
                                        />
                                    </div>
                                }
                            >
                                <div
                                    className={classNames(
                                        'font-semibold mb-1 text-base',
                                        event.details && 'text-emerald-500'
                                    )}
                                >
                                    {event.action}
                                </div>
                                {event.details && (
                                    <div className="mb-1">
                                        <WebhookTip code={event.details} />
                                    </div>
                                )}
                                <div>
                                    {formatIso(event.time)}
                                </div>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                </div>
            ))}
        </Card>
    )
}

export default Activity
