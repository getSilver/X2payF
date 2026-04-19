import type { TableQueries } from '@/@types/common'
import type { PaymentStatus, TransactionType } from '@/@types/payment'

export type OrderFilterState = {
    direction: '' | TransactionType
    statuses: PaymentStatus[]
    notifyFailed: boolean
}

type OrderListTableData = Pick<TableQueries, 'pageIndex' | 'pageSize' | 'query'>

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000

export const buildOrderListParams = (
    tableData: OrderListTableData,
    filterData: OrderFilterState,
    now = new Date(),
) => {
    const params: Record<string, string | number | boolean> = {
        page: tableData.pageIndex,
        page_size: tableData.pageSize,
    }

    const keyword = tableData.query?.trim()
    if (keyword) {
        params.keyword = keyword
    }

    const hasDrawerFilters =
        Boolean(filterData.direction) ||
        filterData.statuses.length > 0 ||
        filterData.notifyFailed

    if (!hasDrawerFilters) {
        return params
    }

    if (filterData.direction) {
        params.transaction_type = filterData.direction
    }
    if (filterData.statuses.length > 0) {
        params.statuses = filterData.statuses.join(',')
    }
    if (filterData.notifyFailed) {
        params.notify_failed = true
    }

    if (keyword) {
        return params
    }

    params.start_time = new Date(now.getTime() - THIRTY_DAYS_IN_MS).toISOString()
    params.end_time = now.toISOString()

    return params
}
