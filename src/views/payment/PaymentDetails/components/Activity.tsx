import classNames from 'classnames'
import Timeline from '@/components/ui/Timeline'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import isLastChild from '@/utils/isLastChild'
import dayjs from 'dayjs'
import WebhookTip from '@/views/WebhookTip'
import type { PaymentTimelineEvent } from '@/@types/payment'

type ActivityProps = {
    data?: PaymentTimelineEvent[]
}

const Activity = ({ data = [] }: ActivityProps) => {
    const toJsonText = (value: unknown) => {
        if (value === null || value === undefined) {
            return ''
        }
        if (typeof value === 'string') {
            return value
        }
        try {
            return JSON.stringify(value, null, 2)
        } catch {
            return String(value)
        }
    }

    const timeline = [...data].sort((a, b) => {
        const left = dayjs(a.time).valueOf()
        const right = dayjs(b.time).valueOf()
        if (Number.isNaN(left) || Number.isNaN(right)) {
            return 0
        }
        return left - right
    })

    const groupedByDate = timeline.reduce<Record<string, PaymentTimelineEvent[]>>(
        (acc, event) => {
            const key = dayjs(event.time).isValid()
                ? dayjs(event.time).format('YYYY-MM-DD')
                : 'UNKNOWN'
            if (!acc[key]) {
                acc[key] = []
            }
            acc[key].push(event)
            return acc
        },
        {}
    )
    const grouped = Object.entries(groupedByDate).map(([date, events]) => ({
        date,
        events,
    }))

    const formatIso = (value: string) => {
        const parsed = dayjs(value)
        return parsed.isValid() ? parsed.toISOString() : '-'
    }

    if (grouped.length === 0) {
        return null
    }

    return (
        <Card className="mb-4">
            <h5 className="mb-4">Activity</h5>
            {grouped.map((activity, i) => (
                <div
                    key={activity.date}
                    className={!isLastChild(grouped, i) ? 'mb-8' : ''}
                >
                    <div className="mb-2 font-semibold uppercase opacity-80">
                        {formatIso(activity.date)}
                    </div>
                    <Timeline>
                        {activity.events.map((event, j) => {
                            const detailsText = toJsonText(event.details)
                            const hasDetails = detailsText.length > 0

                            return (
                                // Render exactly what backend emits: stage/status/details.
                                <Timeline.Item
                                    key={event.time + j}
                                    media={
                                        <div className="flex mt-1.5">
                                            <Badge
                                                innerClass={classNames(
                                                    hasDetails
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
                                            hasDetails && 'text-emerald-500'
                                        )}
                                    >
                                        {`${event.stage || '-'}: ${event.status || '-'}`}
                                    </div>
                                    {hasDetails && (
                                        <div className="mb-1">
                                            <WebhookTip code={detailsText} />
                                        </div>
                                    )}
                                    <div>
                                        {formatIso(event.time)}
                                    </div>
                                </Timeline.Item>
                            )
                        })}
                    </Timeline>
                </div>
            ))}
        </Card>
    )
}

export default Activity
