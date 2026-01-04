import DatePicker from '@/components/ui/DatePicker'
import Button from '@/components/ui/Button'
import {
    setStartDate,
    setEndDate,
    getWalletData,
    useAppSelector,
} from '../store'
import { useAppDispatch } from '@/store'
import { HiOutlineFilter } from 'react-icons/hi'
import dayjs from 'dayjs'

const dateFormat = 'MMM DD, YYYY'

const { DatePickerRange } = DatePicker

const DashboardHeader = () => {
    const dispatch = useAppDispatch()

    const startDate = useAppSelector(
        (state) => state.cryptoWallets?.data?.startDate
    )
    const endDate = useAppSelector((state) => state.cryptoWallets?.data?.endDate)

    const handleDateChange = (value: [Date | null, Date | null]) => {
        dispatch(setStartDate(dayjs(value[0]).unix()))
        dispatch(setEndDate(dayjs(value[1]).unix()))
    }

    const onFilter = () => {
        dispatch(getWalletData())
    }

    return (
        <div className="lg:flex items-center justify-between mb-4 gap-3">
            <div className="mb-4 lg:mb-0">
                <h3>Overview</h3>
                <p>支付摘要</p>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <DatePickerRange
                    value={[
                        startDate ? dayjs.unix(startDate).toDate() : dayjs().subtract(3, 'month').toDate(),
                        endDate ? dayjs.unix(endDate).toDate() : dayjs().toDate(),
                    ]}
                    inputFormat={dateFormat}
                    size="sm"
                    onChange={handleDateChange}
                />
                <Button size="sm" icon={<HiOutlineFilter />} onClick={onFilter}>
                    Filter
                </Button>
            </div>
        </div>
    )
}

export default DashboardHeader
