import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Chart from '@/components/shared/Chart'
import { COLORS } from '@/constants/chart.constant'

type OrderByCategoriesProps = {
    data?: {
        labels: string[]
        data: number[]
    }
}

const OrderByCategories = ({
    data = { labels: [], data: [] },
}: OrderByCategoriesProps) => {
    return (
        <Card>
            <h4>地区占比</h4>
            <div className="mt-6">
                {data.data.length > 0 && (
                    <>
                        <Chart
                            donutTitle={`${data.data.reduce(
                                (a, b) => a + b,
                                0
                            )}`}
                            donutText="Product Sold"
                            series={data.data}
                            customOptions={{ labels: data.labels }}
                            type="donut"
                        />
                        {data.data.length === data.labels.length && (
                            <div className="mt-6 grid grid-cols-2 gap-4 max-w-[180px] mx-auto">
                                {data.labels.map((value, index) => (
                                    <div
                                        key={value}
                                        className="flex items-center gap-1"
                                    >
                                        <Badge
                                            badgeStyle={{
                                                backgroundColor: COLORS[index],
                                            }}
                                        />
                                        <span className="font-semibold">
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    )
}

export default OrderByCategories
