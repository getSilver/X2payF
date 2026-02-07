import { useEffect } from 'react'
import reducer from './store'
import merReducer from '@/views/merback/Dashboard/store'
import { injectReducer } from '@/store'
import { useAppDispatch, initializeAgentDashboard } from './store'

import Wallet from './components/Wallet'
import TransactionHistory from './components/TransactionHistory'
import DashboardHeader from './components/DashboardHeader'
import TradeDialog from '@/views/merback/Dashboard/components/TradeDialog'

injectReducer('agentWallets', reducer)
injectReducer('appWallets', merReducer)

const AgentDashboard = () => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(initializeAgentDashboard())
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

export default AgentDashboard
