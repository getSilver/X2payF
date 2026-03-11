import { useEffect, useState } from 'react'
import DatePicker from '@/components/ui/DatePicker'
import Button from '@/components/ui/Button'
import {
    setStartDate,
    setEndDate,
    getWalletData,
    getTransctionHistoryData,
    useAppSelector,
} from '../store'
import { useAppDispatch } from '@/store'
import { HiOutlineFilter } from 'react-icons/hi'
import dayjs from 'dayjs'

const dateFormat = 'MMM DD, YYYY'
const DEBUG_TRADE = import.meta.env.VITE_API_DEBUG === 'true'

const { DatePickerRange } = DatePicker

const DashboardHeader = () => {
    const dispatch = useAppDispatch()

    const startDate = useAppSelector(
        (state) => state.appWallets?.data?.startDate
    )
    const endDate = useAppSelector((state) => state.appWallets?.data?.endDate)
    const selectedTab = useAppSelector((state) => state.appWallets?.data?.selectedTab)
    const tableData = useAppSelector((state) => state.appWallets?.data?.tableData)
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
        dayjs.unix(startDate).toDate(),
        dayjs.unix(endDate).toDate(),
    ])

    useEffect(() => {
        setDateRange([dayjs.unix(startDate).toDate(), dayjs.unix(endDate).toDate()])
    }, [startDate, endDate])

    const handleDateChange = (value: [Date | null, Date | null]) => {
        setDateRange(value)
        if (DEBUG_TRADE) {
            console.debug('[MerchantDashboard][DateChange]', {
                start: value[0] ? dayjs(value[0]).toISOString() : null,
                end: value[1] ? dayjs(value[1]).toISOString() : null,
            })
        }
        if (!value[0] || !value[1]) {
            return
        }
        dispatch(setStartDate(dayjs(value[0]).unix()))
        dispatch(setEndDate(dayjs(value[1]).unix()))
    }

    const onFilter = () => {
        const isCleared = !dateRange[0] && !dateRange[1]
        const hasFullRange = !!dateRange[0] && !!dateRange[1]
        const queryOverrides = isCleared
            ? {
                  startDateOverride: dayjs().subtract(30, 'day').startOf('day').unix(),
                  endDateOverride: dayjs().endOf('day').unix(),
              }
            : hasFullRange
              ? {
                    startDateOverride: dayjs(dateRange[0]).startOf('day').unix(),
                    endDateOverride: dayjs(dateRange[1]).endOf('day').unix(),
                }
            : undefined
        if (DEBUG_TRADE) {
            console.debug('[MerchantDashboard][Filter]', {
                isCleared,
                hasFullRange,
                selectedTab,
                dateRangeStart: dateRange[0]
                    ? dayjs(dateRange[0]).toISOString()
                    : null,
                dateRangeEnd: dateRange[1]
                    ? dayjs(dateRange[1]).toISOString()
                    : null,
                queryOverrides,
                storeStartDate: startDate,
                storeEndDate: endDate,
            })
        }

        if (hasFullRange) {
            dispatch(setStartDate(dayjs(dateRange[0]).startOf('day').unix()))
            dispatch(setEndDate(dayjs(dateRange[1]).endOf('day').unix()))
        }

        dispatch(getWalletData(queryOverrides))
        if (selectedTab === 'deposit' || selectedTab === 'trade') {
            dispatch(
                getTransctionHistoryData({
                    tab: selectedTab,
                    ...tableData,
                    ...queryOverrides,
                })
            )
        }
    }

    return (
        <div className="lg:flex items-center justify-between mb-4 gap-3">
            <div className="mb-4 lg:mb-0">
                <h3>Overview</h3>
                <p>Payment Summary</p>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <DatePickerRange
                    value={dateRange}
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
