import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
    apiGetMerchantWithdrawals,
} from '@/services/MerchantService'
import {
    apiGetAgentMerchants,
    apiGetAgentApps,
    apiGetAgentDailyReport,
    apiGetAgentProfit,
} from '@/services/AgentMerchantService'
import type { TableQueries } from '@/@types/common'
import type { Merchant, MerchantApplication } from '@/@types/account'
import { getCurrencySymbol } from '@/utils/currencySymbols'

export type TransactionDetails = {
    id: string
    actionType?: number
    action?: string
    date: number | string
    symbol?: string
    subAmount?: number
    amount?: number
    fee?: number
    refund?: number
    feeRefund?: number
    refundNo?: number
    unitTotal?: number
    rate?: number
    total_amount?: number
    total_count?: number
    success_amount?: number
    success_count?: number
    failed_amount?: number
    failed_count?: number
    pending_amount?: number
    pending_count?: number
}

export type Withdraw = {
    id: string
    actionType?: number
    status: number | string
    action?: string
    date?: number
    symbol?: string
    amount: number
    refund?: number
    fee?: number
    note?: string
    withdrawal_id?: string
    currency?: string
    bank_account?: string
    created_at?: string
    processed_at?: string
    approval_note?: string
    completion_note?: string
    extra?:
        | string
        | {
              withdrawal_address?: string
          }
}

export type Wallet = {
    icon: string
    symbol: string
    name: string
    fiatValue: number
    coinValue: number
    growshrink: number
}

export type AgentMerchantAppRow = {
    merchant_id: string
    merchant_name?: string
    merchant_email?: string
    app_id?: string
    app_name?: string
    app_status?: string
    currency?: string
    balance?: number
    available_amount?: number
    frozen_amount?: number
    created_at?: string
}

export type Transaction = AgentMerchantAppRow[] | TransactionDetails[] | Withdraw[]

type GetTransctionHistoryDataResponse = {
    total: number
    data: Transaction
}

export type CryptoWalletsState = {
    startDate: number | null
    endDate: number | null
    loading: boolean
    walletsData: Wallet[]
    transactionHistoryLoading: boolean
    transactionHistoryData: Transaction
    tableData: TableQueries
    selectedTab: string
    selectedMerchantId: string
    selectedRow: any
    merchants: Merchant[]
    apps: MerchantApplication[]
    transactionHistoryCache: Record<
        string,
        { data: GetTransctionHistoryDataResponse; timestamp: number }
    >
}

export const SLICE_NAME = 'agentWallets'

const normalizeList = <T,>(value: unknown): T[] => {
    if (!value) {
        return []
    }
    if (Array.isArray(value)) {
        return value as T[]
    }
    const data = (value as { data?: T[] }).data
    if (Array.isArray(data)) {
        return data
    }
    const list = (value as { list?: T[] }).list
    if (Array.isArray(list)) {
        return list
    }
    return []
}

const mapMerchantApps = (
    merchants: Merchant[],
    apps: MerchantApplication[]
) => {
    const merchantMap = new Map<string, Merchant>()
    merchants.forEach((merchant) => merchantMap.set(merchant.id, merchant))

    const rows: AgentMerchantAppRow[] = []
    const appMerchantIds = new Set<string>()

    apps.forEach((app) => {
        appMerchantIds.add(app.merchant_id)
        const merchant = merchantMap.get(app.merchant_id)
        rows.push({
            merchant_id: app.merchant_id,
            merchant_name: merchant?.name,
            merchant_email: merchant?.contact_email,
            app_id: app.id,
            app_name: app.name,
            app_status: app.status,
            currency: app.currency,
            balance: app.balance ?? 0,
            available_amount: app.available_amount,
            frozen_amount: app.frozen_amount,
            created_at: app.created_at,
        })
    })

    merchants.forEach((merchant) => {
        if (!appMerchantIds.has(merchant.id)) {
            rows.push({
                merchant_id: merchant.id,
                merchant_name: merchant.name,
                merchant_email: merchant.contact_email,
            })
        }
    })

    return rows
}

export const getAgentMerchantsList = createAsyncThunk(
    SLICE_NAME + '/getAgentMerchantsList',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGetAgentMerchants()
            const list = normalizeList<Merchant>(
                (response.data as unknown) || []
            )
            return list
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to load agent merchants'
            return rejectWithValue(message)
        }
    }
)

export const getAgentAppsList = createAsyncThunk(
    SLICE_NAME + '/getAgentAppsList',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGetAgentApps()
            const list = normalizeList<MerchantApplication>(
                (response.data as unknown) || []
            )
            return list
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to load agent apps'
            return rejectWithValue(message)
        }
    }
)

export const getWalletData = createAsyncThunk(
    SLICE_NAME + '/getWalletData',
    async () => {
        // 获取代理商自己的分润余额
        let profitBalance = 0
        const currency = 'USD'

        try {
            const profitRes = await apiGetAgentProfit()
            const profitData = (profitRes.data as any)?.data || profitRes.data
            if (profitData) {
                // profit_balance 单位是分，转换为元
                profitBalance = (profitData.profit_balance ?? 0) / 100
            }
        } catch (error) {
            console.error('获取代理商分润信息失败:', error)
        }

        const currencySymbol = getCurrencySymbol(currency, currency)
        const wallets: Wallet[] = [
            {
                icon: '/img/others/pay-in.png',
                symbol: currencySymbol,
                name: 'Pay-in',
                fiatValue: 0,
                coinValue: 0,
                growshrink: 0,
            },
            {
                icon: '/img/others/pay-out.png',
                symbol: currencySymbol,
                name: 'Pay-out',
                fiatValue: 0,
                coinValue: 0,
                growshrink: 0,
            },
            {
                icon: '/img/others/wallet-icon.png',
                symbol: currencySymbol,
                name: 'Balance',
                fiatValue: profitBalance,  // 代理商分润余额
                coinValue: profitBalance,  // 总余额也是分润余额
                growshrink: 0,             // 代理商没有冻结金额概念
            },
        ]

        return wallets
    }
)

export const getTransctionHistoryData = createAsyncThunk(
    SLICE_NAME + '/getTransctionHistoryData',
    async (data: { tab: string } & TableQueries, { getState, dispatch, rejectWithValue }) => {
        const state = getState() as {
            agentWallets: { data: CryptoWalletsState }
        }
        const {
            tab,
            pageIndex = 1,
            pageSize = 10,
            query = '',
            sort = { order: '', key: '' },
        } = data
        const { startDate, endDate } = state.agentWallets.data

        const merchantKey = state.agentWallets.data.selectedMerchantId || ''
        const cacheKey = `${tab}_${pageIndex}_${pageSize}_${query}_${sort.order}_${sort.key}_${startDate ?? ''}_${endDate ?? ''}_${merchantKey}`
        const cachedData = state.agentWallets.data.transactionHistoryCache[cacheKey]

        const CACHE_DURATION = 5 * 60 * 1000
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            return cachedData.data
        }

        try {
            const params = {
                page: pageIndex,
                page_size: pageSize,
                query: query || undefined,
                start_date: startDate ? new Date(startDate).toISOString() : undefined,
                end_date: endDate ? new Date(endDate).toISOString() : undefined,
            }

            let response
            if (tab === 'merchant') {
                let merchants = state.agentWallets.data.merchants
                let apps = state.agentWallets.data.apps
                if (!merchants.length) {
                    const merchantsRes = await dispatch(getAgentMerchantsList())
                    if (getAgentMerchantsList.fulfilled.match(merchantsRes)) {
                        merchants = merchantsRes.payload
                    }
                }
                if (!apps.length) {
                    const appsRes = await dispatch(getAgentAppsList())
                    if (getAgentAppsList.fulfilled.match(appsRes)) {
                        apps = appsRes.payload
                    }
                }
                const rows = mapMerchantApps(merchants, apps)
                const normalizedQuery = query.trim().toLowerCase()
                const filtered = normalizedQuery
                    ? rows.filter((row) => {
                          const haystack = [
                              row.merchant_id,
                              row.merchant_name,
                              row.merchant_email,
                              row.app_id,
                              row.app_name,
                              row.app_status,
                              row.currency,
                          ]
                              .filter(Boolean)
                              .join(' ')
                              .toLowerCase()
                          return haystack.includes(normalizedQuery)
                      })
                    : rows
                const start = (pageIndex - 1) * pageSize
                const paged = filtered.slice(start, start + pageSize)
                return {
                    total: filtered.length,
                    data: paged,
                }
            } else if (tab === 'deposit') {
                const merchantId = state.agentWallets.data.selectedMerchantId
                if (!merchantId) {
                    return { total: 0, data: [] }
                }
                response = await apiGetAgentDailyReport({
                    ...params,
                    merchant_id: merchantId,
                })
                const outerData = (response.data as any).data || response.data
                return {
                    total: outerData.total || 0,
                    data: outerData.data || outerData || [],
                }
            } else if (tab === 'withdrawal') {
                response = await apiGetMerchantWithdrawals(params)
                const responseData = (response.data as any).data || response.data
                return {
                    total: responseData.total || 0,
                    data: responseData.list || [],
                }
            }

            throw new Error(`Unknown tab: ${tab}`)
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to load transaction history'
            return rejectWithValue(message)
        }
    }
)

export const initializeAgentDashboard = createAsyncThunk(
    SLICE_NAME + '/initialize',
    async (_: void, { dispatch, getState }) => {
        const state = getState() as { agentWallets: { data: CryptoWalletsState } }
        const { selectedTab, tableData } = state.agentWallets.data

        await dispatch(getAgentMerchantsList())
        await dispatch(getAgentAppsList())
        await dispatch(getWalletData())
        await dispatch(
            getTransctionHistoryData({
                tab: selectedTab || 'merchant',
                ...(tableData || initialTableData),
            })
        )
    }
)

export const initialTableData: TableQueries = {
    total: 0,
    pageIndex: 1,
    pageSize: 10,
    query: '',
    sort: {
        order: '',
        key: '',
    },
}

const initialState: CryptoWalletsState = {
    startDate: null,
    endDate: null,
    loading: true,
    walletsData: [],
    transactionHistoryLoading: true,
    transactionHistoryData: [],
    tableData: initialTableData,
    selectedTab: 'merchant',
    selectedMerchantId: '',
    selectedRow: {},
    merchants: [],
    apps: [],
    transactionHistoryCache: {},
}

const walletsSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        setStartDate: (state, action: PayloadAction<number | null>) => {
            state.startDate = action.payload
        },
        setEndDate: (state, action: PayloadAction<number | null>) => {
            state.endDate = action.payload
        },
        setSelectedTab: (state, action) => {
            state.selectedTab = action.payload
        },
        setSelectedMerchantId: (state, action: PayloadAction<string>) => {
            state.selectedMerchantId = action.payload
        },
        setTableData: (state, action) => {
            state.tableData = action.payload
        },
        setTransactionHistoryData: (state, action) => {
            state.transactionHistoryData = action.payload
        },
        setSelectedRow: (state, action: PayloadAction<any>) => {
            state.selectedRow = action.payload
        },
        clearTransactionHistoryCache: (state) => {
            state.transactionHistoryCache = {}
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getWalletData.fulfilled, (state, action) => {
                state.loading = false
                state.walletsData = action.payload
            })
            .addCase(getWalletData.pending, (state) => {
                state.loading = true
            })
            .addCase(getWalletData.rejected, (state) => {
                state.loading = false
            })
            .addCase(getTransctionHistoryData.fulfilled, (state, action) => {
                state.transactionHistoryLoading = false
                const payload = action.payload as GetTransctionHistoryDataResponse
                state.tableData.total = payload.total
                state.transactionHistoryData = payload.data

                const {
                    pageIndex = 1,
                    pageSize = 10,
                    query = '',
                    sort = { order: '', key: '' },
                } = state.tableData
                const merchantKey = state.selectedMerchantId || ''
                const cacheKey = `${state.selectedTab}_${pageIndex}_${pageSize}_${query}_${sort.order}_${sort.key}_${merchantKey}`
                state.transactionHistoryCache[cacheKey] = {
                    data: payload,
                    timestamp: Date.now(),
                }

                const cacheKeys = Object.keys(state.transactionHistoryCache)
                if (cacheKeys.length > 10) {
                    const sortedKeys = cacheKeys.sort(
                        (a, b) =>
                            state.transactionHistoryCache[b].timestamp -
                            state.transactionHistoryCache[a].timestamp
                    )
                    const keysToDelete = sortedKeys.slice(10)
                    keysToDelete.forEach((key) => delete state.transactionHistoryCache[key])
                }
            })
            .addCase(getTransctionHistoryData.pending, (state) => {
                state.transactionHistoryLoading = true
            })
            .addCase(getTransctionHistoryData.rejected, (state) => {
                state.transactionHistoryLoading = false
            })
            .addCase(getAgentMerchantsList.fulfilled, (state, action) => {
                state.merchants = action.payload
            })
            .addCase(getAgentAppsList.fulfilled, (state, action) => {
                state.apps = action.payload
            })
    },
})

export const {
    setStartDate,
    setEndDate,
    setSelectedTab,
    setSelectedMerchantId,
    setTableData,
    setTransactionHistoryData,
    setSelectedRow,
    clearTransactionHistoryCache,
} = walletsSlice.actions

export default walletsSlice.reducer
