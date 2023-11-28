import reducer from './store'
import { injectReducer } from '@/store'
import OrderDashboardHeader from './components/OrderDashboardHeader'
import OrderDashboardBody from './components/OrderDashboardBody'

injectReducer('salesDashboard', reducer)

const Dashboard = () => {
    return (
        <div className="flex flex-col gap-4 h-full">
            <OrderDashboardHeader />
            <OrderDashboardBody />
        </div>
    )
}

export default Dashboard
