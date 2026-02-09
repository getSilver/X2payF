import wildCardSearch from '@/utils/wildCardSearch'
import sortBy, { Primer } from '@/utils/sortBy'
import paginate from '@/utils/paginate'
import type { Server } from 'miragejs'

type HistorySort = {
    order?: string
    key?: string
}

type HistoryParams = {
    tab?: string
    pageIndex?: number | string
    pageSize?: number | string
    sort?: HistorySort
}

type HistorySchema = {
    db: {
        transactionHistoryData: Array<Record<string, unknown>>
    }
}

const getHistoryResponse = (schema: HistorySchema, params: HistoryParams) => {
    const {
        tab = 'trade',
        pageIndex = 1,
        pageSize = 10,
        sort = { order: '', key: '' },
    } = params

    const normalizedPageIndex = Number(pageIndex) || 1
    const normalizedPageSize = Number(pageSize) || 10
    const { order = '', key = '' } = sort

    // Map tab names to data keys
    const tabKeyMap: Record<string, string> = {
        deposit: 'deposit',
        trade: 'trade',
        withdrawal: 'withdraw',
    }

    const dataKey = tabKeyMap[tab] || tab
    const historyData = schema.db.transactionHistoryData[0] as Record<string, unknown>
    let data = (historyData[dataKey] as unknown[]) || []

    if (!Array.isArray(data)) {
        console.error(`No data found for tab: ${tab}, dataKey: ${dataKey}`)
        data = []
    }

    const total = data.length

    if (key && order) {
        if (key != 'action') {
            data.sort(sortBy(key, order === 'desc', parseInt as Primer))
        } else {
            data.sort(
                sortBy(key, order === 'desc', (a) =>
                    (a as string).toUpperCase()
                )
            )
        }
    }

    data = paginate(data, normalizedPageSize, normalizedPageIndex)

    return {
        data,
        total,
    }
}

export default function cryptoFakeApi(server: Server, apiPrefix: string) {
    server.get(`${apiPrefix}/crypto/dashboard`, (schema) => {
        return schema.db.cryptoDashboardData[0]
    })

    server.get(`${apiPrefix}/crypto/portfolio`, (schema) => {
        return schema.db.portfolioData[0]
    })

    server.get(`${apiPrefix}/crypto/wallets`, (schema) => {
        return schema.db.walletsData
    })

    server.get(`${apiPrefix}/crypto/wallets/history`, (schema, request) => {
        const { tab, pageIndex, pageSize } = request.queryParams
        const sort = {
            order: request.queryParams['sort[order]'] || '',
            key: request.queryParams['sort[key]'] || '',
        }

        return getHistoryResponse(schema as unknown as HistorySchema, {
            tab,
            pageIndex,
            pageSize,
            sort,
        })
    })

    server.post(`${apiPrefix}/crypto/wallets/history`, (schema, { requestBody }) => {
        const { tab, pageIndex, pageSize, sort } = JSON.parse(requestBody)

        return getHistoryResponse(schema as unknown as HistorySchema, {
            tab,
            pageIndex,
            pageSize,
            sort,
        })
    })

    server.post(`${apiPrefix}/crypto/market`, (schema, { requestBody }) => {
        const { tab, pageIndex, pageSize, sort, query } =
            JSON.parse(requestBody)

        let data = schema.db.marketData[tab]

        if (!data) {
            console.error(`No market data found for tab: ${tab}`)
            data = []
        }

        let total = data.length
        const { order, key } = sort

        if (key && order) {
            if (key !== 'action') {
                data.sort(sortBy(key, order === 'desc', parseInt as Primer))
            } else {
                data.sort(
                    sortBy(key, order === 'desc', (a) =>
                        (a as string).toUpperCase()
                    )
                )
            }
        }

        if (query) {
            data = wildCardSearch(data, query)
            total = data.length
        }

        data = paginate(data, pageSize, pageIndex)

        return {
            data,
            total,
        }
    })
}
