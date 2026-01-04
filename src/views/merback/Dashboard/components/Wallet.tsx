import { lazy } from 'react'

// 懒加载WalletGrid组件
const WalletGrid = lazy(() => import('./WalletGrid'))

const Wallet = () => {
    return <WalletGrid />
}

export default Wallet
