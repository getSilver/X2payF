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
        (state) => state.agentWallets?.data?.startDate
    )
    const endDate = useAppSelector(
        (state) => state.agentWallets?.data?.endDate
    )

    const isRangeSelected = startDate != null && endDate != null

    const handleDateChange = (value: [Date | null, Date | null]) => {
        const [start, end] = value
        dispatch(setStartDate(start ? dayjs(start).unix() : null))
        dispatch(setEndDate(end ? dayjs(end).unix() : null))
    }

    const onFilter = () => {
        if (!isRangeSelected) {
            return
        }
        dispatch(getWalletData())
    }

    return (
        <div className="lg:flex items-center justify-between mb-4 gap-3">
            <div className="mb-4 lg:mb-0">
                <h3>Overview</h3>
                <p>Agent overview</p>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <DatePickerRange
                    value={[
                        startDate != null ? dayjs.unix(startDate).toDate() : null,
                        endDate != null ? dayjs.unix(endDate).toDate() : null,
                    ]}
                    inputFormat={dateFormat}
                    size="sm"
                    onChange={handleDateChange}
                />
                <Button
                    size="sm"
                    icon={<HiOutlineFilter />}
                    onClick={onFilter}
                    disabled={!isRangeSelected}
                >
                    Filter
                </Button>
            </div>
        </div>
    )
}

export default DashboardHeader
