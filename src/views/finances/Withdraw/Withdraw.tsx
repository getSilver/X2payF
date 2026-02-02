import AdaptableCard from '@/components/shared/AdaptableCard'
import WithdrawTable from './components/WithdrawTable'

const Withdraw = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Withdraw</h3>
            </div>
            <WithdrawTable />
        </AdaptableCard>
    )
}

export default Withdraw
