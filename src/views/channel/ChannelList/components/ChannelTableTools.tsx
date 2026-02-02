import Button from '@/components/ui/Button'
import { HiPlusCircle } from 'react-icons/hi'
import ChannelTableSearch from './ChannelTableSearch'
import { Link } from 'react-router-dom'

const ChannelTableTools = () => {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center">
            <ChannelTableSearch />
            <Link
                className="block lg:inline-block md:mx-2 md:mb-0 mb-4"
                to="/app/channel/channel-new"
            >
                <Button block variant="solid" size="sm" icon={<HiPlusCircle />}>
                    新增渠道
                </Button>
            </Link>
        </div>
    )
}

export default ChannelTableTools
