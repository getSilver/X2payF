import { lazy } from 'react'
import { useAppSelector } from '../store'

// WalletCard
const WalletCard = lazy(() => import('./WalletCard'))

const Wallet = () => {
    const data = useAppSelector((state) => state.appWallets?.data?.walletsData || [])

    return (
        <div className="grid lg:grid-cols-3 2xl:grid-cols-3 gap-4">
            <WalletCard title="PayIn" data={data[0] || {}} />
            <WalletCard title="PayOut" data={data[1] || {}} />
            <WalletCard title="Amount" data={data[2] || {}} />
        </div>
    )
}

export default Wallet
