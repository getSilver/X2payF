import { useEffect } from 'react'
import reducer from './store'
import { injectReducer } from '@/store'
import { getWalletData, getTransctionHistoryData, useAppSelector, initialTableData, useAppDispatch, initializeCryptoWallets } from './store'

// 直接导入组件（移除懒加载）
import Wallet from './components/wallet'
import { TransactionHistory } from './components/transaction'
import { DashboardHeader } from './components/shared'
import { TradeDialog } from './components/trade'

injectReducer('cryptoWallets', reducer)

const Dashboard = () => {
    const dispatch = useAppDispatch()
    const walletData = useAppSelector((state) => state.cryptoWallets?.data?.walletsData)
    const transactionData = useAppSelector((state) => state.cryptoWallets?.data?.transactionHistoryData)
    const selectedTab = useAppSelector((state) => state.cryptoWallets?.data?.selectedTab)
    const tableData = useAppSelector((state) => state.cryptoWallets?.data?.tableData)


    useEffect(() => {
        // 更鲁棒的初始加载：按需派发请求（在 slice 中封装）
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
