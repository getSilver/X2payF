import { useEffect } from 'react'
import reducer from './store'
import { injectReducer } from '@/store'
import { useAppDispatch, initializeCryptoWallets } from './store'

// 直接导入组件
import Wallet from './components/wallet'
import { TransactionHistory } from './components/transaction'
import { DashboardHeader } from './components/shared'
import { TradeDialog } from './components/trade'

injectReducer('appWallets', reducer)

const Dashboard = () => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        // 初始化由 Redux 状态控制，防止重复调用
        dispatch(initializeCryptoWallets())
    }, [dispatch])

    return (
        <div className="flex flex-col gap-4">
            <DashboardHeader />
            <Wallet />
            <TransactionHistory />
            <TradeDialog />
        </div>
    )
}

export default Dashboard
