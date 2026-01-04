import { memo } from 'react'
import Avatar from '@/components/ui/Avatar'
import {
    HiOutlineArrowsRightLeft,
    HiOutlineArrowUp,
    HiOutlineArrowDown,
} from 'react-icons/hi2'

const SharedActionIcon = memo(({ type }: { type: number }) => {
    switch (type) {
        case 0:
            return (
                <Avatar
                    size="sm"
                    className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100"
                    icon={
                        <HiOutlineArrowDown
                            style={{ transform: 'rotate(45deg)' }}
                        />
                    }
                />
            )
        case 1:
            return (
                <Avatar
                    size="sm"
                    className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100"
                    icon={
                        <HiOutlineArrowUp
                            style={{ transform: 'rotate(45deg)' }}
                        />
                    }
                />
            )
        case 2:
            return (
                <Avatar
                    size="sm"
                    className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100"
                    icon={<HiOutlineArrowsRightLeft />}
                />
            )
        default:
            return <Avatar />
    }
})

export default SharedActionIcon
