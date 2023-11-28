import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Chart from '@/components/shared/Chart'

type OrdersReportProps = {
    data?: {
        series?: {
            name: string
            data: number[]
        }[]
        categories?: string[]
    }
    className?: string
}

const OrdersReport = ({ className, data = {} }: OrdersReportProps) => {
    return (
        <Card className={className}>
            <div className="flex items-center justify-between">
                <h4>Orders Report</h4>
                <Button size="sm">Export Report</Button>
            </div>
            <Chart
                series={data.series}
                xAxis={data.categories}
                height="380px"
                customOptions={{ legend: { show: false } }}
            />
        </Card>
    )
}

export default OrdersReport
