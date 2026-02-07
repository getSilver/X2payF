import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import GrowShrinkTag from '@/components/shared/GrowShrinkTag'
import MediaSkeleton from '@/components/shared/loaders/MediaSkeleton'
import Loading from '@/components/shared/Loading'
import { useAppSelector } from '../store'
import {
    HiOutlineUserGroup,
    HiOutlineUserAdd,
    HiOutlineUsers,
} from 'react-icons/hi'
import { NumericFormat } from 'react-number-format'
import type { ReactNode } from 'react'
import type { AccountStatus } from '@/@types/account'

type StatisticCardProps = {
    icon: ReactNode
    avatarClass: string
    label: string
    value?: number
    growthRate?: number
    loading: boolean
}

const StatisticCard = (props: StatisticCardProps) => {
    const { icon, avatarClass, label, value, growthRate, loading } = props

    const avatarSize = 55

    return (
        <Card bordered>
            <Loading
                loading={loading}
                customLoader={
                    <MediaSkeleton
                        avatarProps={{
                            className: 'rounded',
                            width: avatarSize,
                            height: avatarSize,
                        }}
                    />
                }
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Avatar
                            className={avatarClass}
                            size={avatarSize}
                            icon={icon}
                        />
                        <div>
                            <span>{label}</span>
                            <h3>
                                <NumericFormat
                                    thousandSeparator
                                    displayType="text"
                                    value={value}
                                />
                            </h3>
                        </div>
                    </div>
                    <GrowShrinkTag value={growthRate} suffix="%" />
                </div>
            </Loading>
        </Card>
    )
}

const CustomerStatistic = () => {
    const customerList = useAppSelector(
        (state) => state.crmCustomers.data.customerList
    )
    const total = useAppSelector(
        (state) => state.crmCustomers.data.tableData.total
    )
    const loading = useAppSelector(
        (state) => state.crmCustomers.data.loading
    )

    const activeCount = customerList.filter(
        (customer) => customer.status === ('Normal' as AccountStatus)
    ).length

    const statisticData = {
        totalCustomers: { value: total, growShrink: 0 },
        activeCustomers: { value: activeCount, growShrink: 0 },
        newCustomers: { value: 0, growShrink: 0 },
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            <StatisticCard
                icon={<HiOutlineUserGroup />}
                avatarClass="!bg-indigo-600"
                label="Total Customers"
                value={statisticData?.totalCustomers?.value}
                growthRate={statisticData?.totalCustomers?.growShrink}
                loading={loading}
            />
            <StatisticCard
                icon={<HiOutlineUsers />}
                avatarClass="!bg-blue-500"
                label="Active Customers"
                value={statisticData?.activeCustomers?.value}
                growthRate={statisticData?.activeCustomers?.growShrink}
                loading={loading}
            />
            <StatisticCard
                icon={<HiOutlineUserAdd />}
                avatarClass="!bg-emerald-500"
                label="New Customers"
                value={statisticData?.newCustomers?.value}
                growthRate={statisticData?.newCustomers?.growShrink}
                loading={loading}
            />
        </div>
    )
}

export default CustomerStatistic
