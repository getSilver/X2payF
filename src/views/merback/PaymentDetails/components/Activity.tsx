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
        status?: string
        created_at?: string
        updated_at?: string
        expired_at?: string
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

    // 构建完整的订单响应数据作为 details
    const orderDetails = JSON.stringify(detail, null, 2)

    // 订单创建事件
    events.push({
        time: detail.created_at,
        action: '订单创建',
        details: orderDetails,
    })

    // 如果有更新时间且与创建时间不同，添加更新事件
    if (detail.updated_at && detail.updated_at !== detail.created_at) {
        events.push({
            time: detail.updated_at,
            action: '订单更新',
            details: `状态: ${detail.status || '-'}`,
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
