import { lazy } from 'react'
import { useAppSelector } from '../store'

const WalletCard = lazy(
    () => import('@/views/merback/Dashboard/components/WalletCard')
)

const Wallet = () => {
    const data = useAppSelector(
        (state) => state.agentWallets?.data?.walletsData || []
    )

    return (
        <div className="grid lg:grid-cols-3 2xl:grid-cols-3 gap-4">
            <WalletCard title="Pay-in" data={data[0] || {}} />
            <WalletCard title="Pay-out" data={data[1] || {}} />
            <WalletCard title="Balance" data={data[2] || {}} />
        </div>
    )
}

export default Wallet
