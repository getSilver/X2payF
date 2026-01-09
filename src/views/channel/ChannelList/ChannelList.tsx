import reducer from './store'
import { injectReducer } from '@/store'
import AdaptableCard from '@/components/shared/AdaptableCard'
import ChannelTableTools from './components/ChannelTableTools'
import ChannelTable from './components/ChannelTable'

injectReducer('salesChannelList', reducer)

const ChannelList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Channels渠道</h3>
                <ChannelTableTools />
            </div>
            <ChannelTable />
        </AdaptableCard>
    )
}

export default ChannelList

