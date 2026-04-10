import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import {
    apiGetMerchantDailyReport,
    apiGetMerchantOrders,
    apiGetMerchantApplications,
    apiGetMerchantTransactionByType,
} from '@/services/MerchantService'
import { getTradeWithdrawProvider } from '@/services/tradeWithdrawProvider'
import type { TableQueries } from '@/@types/common'
import { getCurrencySymbol } from '@/utils/currencySymbols'

// 商户订单数据类型（Trade）
export type Trade = {
    // 前端字段（兼容旧数据）
    id: string
    actionType?: number
    status: number | string // 支持数字状态码或字符串状态
    action?: string
    date?: number
    sdate?: number
    symbol?: string
    fee?: number
    amount: number
    settlement?: number
    
    // 后端字段映射
    payment_id?: string
    merchant_tx_id?: string
    currency?: string
    transaction_type?: string
    created_at?: string
    updated_at?: string
}

// 商户日报数据类型（TransactionDetails）
export type TransactionDetails = {
    // 前端字段（兼容旧数据）
    id: string
    actionType?: number
    action?: string
    date: number
    symbol?: string
    subAmount?: number
    amount?: number
    fee?: number
    refund?: number
    feeRefund?: number
    refundNo?: number
    unitTotal?: number
    rate?: number
    
    // 后端字段映射
    total_amount?: number
    total_count?: number
    success_amount?: number
    success_count?: number
    failed_amount?: number
    failed_count?: number
    pending_amount?: number
    pending_count?: number
}

// 商户提款数据类型（Withdraw）
export type Withdraw = {
    // 前端字段（兼容旧数据）
    id: string
    actionType?: number
    status: number | string // 支持数字状态码或字符串状态
    action?: string
    date?: number
    symbol?: string
    amount: number
    refund?: number
    fee?: number
    note?: string
    
    // 后端字段映射
    withdrawal_id?: string
    currency?: string
    bank_account?: string
    created_at?: string
    processed_at?: string
    approval_note?: string      // 审核备注
    completion_note?: string    // 完成备注
    extra?: string | {          // 扩展信息（JSON 格式）
        withdrawal_address?: string  // 提款收款地址
    }
}

// 钱包数据类型（用于Dashboard卡片显示）
export type Wallet = {
    icon: string
    symbol: string      // 币种
    name: string        // 卡片标题
    fiatValue: number   // 主要显示金额
    coinValue: number   // 次要显示金额
    growshrink: number  // 增长/冻结金额
    secondaryType?: 'amount' | 'count'
    secondarySuffix?: string
    metaType?: 'percent' | 'amount' | 'none'
    metaLabel?: string
    metaValue?: number
    extraBalances?: Array<{
        symbol: string
        value: number
        currency?: string
    }>
}

export type Transaction = Trade[] | TransactionDetails[] | Withdraw[]

type GetTransctionHistoryDataResponse = {
    total: number
    data: Transaction
}

type DashboardSelection = Record<string, unknown>

type MerchantApplicationsApiPayload = {
    data?: Array<{
        id?: string
        balance?: number
        available_amount?: number
        frozen_amount?: number
        currency?: string
        config?: unknown
    }>
}

type TransactionByTypeApiPayload = {
    amount?: Record<string, unknown>
    count?: number | string
}

type ListResponsePayload<T> = {
    total?: number
    list?: T[]
}

type DailyReportPayload = {
    total?: number
    data?: TransactionDetails[]
}

const unwrapDataEnvelope = <T>(payload: { data?: T } | T): T => {
    if (
        typeof payload === 'object' &&
        payload !== null &&
        'data' in payload &&
        (payload as { data?: T }).data !== undefined
    ) {
        return (payload as { data: T }).data
    }

    return payload as T
}

export type CryptoWalletsState = {
    startDate: number
    endDate: number
    loading: boolean
    currentAppId: string
    walletsData: Wallet[]
    transactionHistoryLoading: boolean
    transactionHistoryData: Transaction
    tableData: TableQueries
    selectedTab: string
    tradeDialogOpen: boolean
    selectedRow: DashboardSelection
    // 分页数据缓存
    transactionHistoryCache: Record<string, { data: GetTransctionHistoryDataResponse; timestamp: number }>
}

export const SLICE_NAME = 'appWallets'
const DEBUG_TRADE = import.meta.env.VITE_API_DEBUG === 'true'

type WalletDataQuery = {
    startDateOverride?: number
    endDateOverride?: number
}

type CurrencyBalanceSummary = {
    currency: string
    totalBalance: number
    totalAvailable: number
    totalFrozen: number
}

type TransactionHistoryQuery = ({ tab: string } & TableQueries) & {
    startDateOverride?: number
    endDateOverride?: number
}

export const getWalletData = createAsyncThunk(
    SLICE_NAME + '/getWalletData',
    async (query: WalletDataQuery | undefined, { getState }) => {
        const state = getState() as { appWallets: { data: CryptoWalletsState } }
        const { startDate, endDate } = state.appWallets.data
        const effectiveStartDate = query?.startDateOverride ?? startDate
        const effectiveEndDate = query?.endDateOverride ?? endDate

        // 获取应用余额数据
        const applicationsRes = await apiGetMerchantApplications().catch(() => null)
        
        // 解析应用余额数据（汇总所有应用的余额）
        // 后端响应格式: { code, message, request_id, data: [...应用列表] }
        // Axios 会将响应包装在 response.data 中
        // 注意：后端返回的金额单位是"分"，需要转换为"元"显示
        let totalBalance = 0
        let totalAvailable = 0
        let totalFrozen = 0
        let currency = ''
        let appId = ''
        let payInAmount = 0
        let payInCount = 0
        let payOutAmount = 0
        let payOutCount = 0
        let extraBalances: Wallet['extraBalances'] = []

        const parseAmountMap = (amountMap: unknown, targetCurrency: string): number => {
            if (!amountMap || typeof amountMap !== 'object') {
                return 0
            }
            const record = amountMap as Record<string, unknown>
            const normalize = (value: unknown): number => {
                if (typeof value === 'number') {
                    return Number.isFinite(value) ? value : 0
                }
                if (typeof value === 'string') {
                    const parsed = Number(value)
                    return Number.isFinite(parsed) ? parsed : 0
                }
                return 0
            }

            if (targetCurrency && record[targetCurrency] !== undefined) {
                return normalize(record[targetCurrency])
            }

            const firstValue = Object.values(record)[0]
            return normalize(firstValue)
        }
        
        if (applicationsRes?.data) {
            // 提取应用列表: applicationsRes.data.data
            const responseData = applicationsRes.data as MerchantApplicationsApiPayload
            const applications = Array.isArray(responseData.data)
                ? responseData.data
                : []
            const balanceByCurrency = new Map<string, CurrencyBalanceSummary>()
            
            applications.forEach((app) => {
                if (!appId && typeof app.id === 'string' && app.id.trim()) {
                    appId = app.id
                }

                // 提取货币信息（优先从 config 中获取）
                let appCurrency = ''
                if (!currency) {
                    // config 可能是对象或 JSON 字符串
                    let appConfig: Record<string, unknown> = {}
                    if (typeof app.config === 'string') {
                        try {
                            appConfig = JSON.parse(app.config)
                        } catch {
                            appConfig = {}
                        }
                    } else if (app.config && typeof app.config === 'object') {
                        appConfig = app.config as Record<string, unknown>
                    }
                    const configCurrency = typeof appConfig.currency === 'string' ? appConfig.currency : ''
                    appCurrency = (configCurrency || app.currency || '').toUpperCase()
                    currency = appCurrency
                } else {
                    let appConfig: Record<string, unknown> = {}
                    if (typeof app.config === 'string') {
                        try {
                            appConfig = JSON.parse(app.config)
                        } catch {
                            appConfig = {}
                        }
                    } else if (app.config && typeof app.config === 'object') {
                        appConfig = app.config as Record<string, unknown>
                    }
                    const configCurrency = typeof appConfig.currency === 'string' ? appConfig.currency : ''
                    appCurrency = (configCurrency || app.currency || '').toUpperCase()
                }

                if (!appCurrency) {
                    appCurrency = 'USD'
                }

                const balance = Number(app.balance ?? 0) / 100
                const available = Number(app.available_amount ?? 0) / 100
                const frozen = Number(app.frozen_amount ?? 0) / 100
                const existing = balanceByCurrency.get(appCurrency)

                if (existing) {
                    existing.totalBalance += balance
                    existing.totalAvailable += available
                    existing.totalFrozen += frozen
                } else {
                    balanceByCurrency.set(appCurrency, {
                        currency: appCurrency,
                        totalBalance: balance,
                        totalAvailable: available,
                        totalFrozen: frozen,
                    })
                }
            })

            const groupedBalances = Array.from(balanceByCurrency.values())
            const primaryBalance = groupedBalances[0]

            if (primaryBalance) {
                currency = primaryBalance.currency
                totalBalance = primaryBalance.totalBalance
                totalAvailable = primaryBalance.totalAvailable
                totalFrozen = primaryBalance.totalFrozen
                extraBalances = groupedBalances
                    .slice(1)
                    .map((item) => ({
                        currency: item.currency,
                        symbol: getCurrencySymbol(item.currency, item.currency),
                        value: item.totalAvailable,
                    }))
            }
        }
        
        // 如果没有获取到币种，使用默认值 USD
        if (!currency) {
            currency = 'USD'
        }

        if (appId) {
            const endTime = dayjs.unix(effectiveEndDate)
            const startTime = dayjs.unix(effectiveStartDate)

            const rangeParams = {
                app_id: appId,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                currency,
            } as const

            const [payInRes, payOutRes] = await Promise.all([
                apiGetMerchantTransactionByType({
                    ...rangeParams,
                    transaction_type: 'PAY_IN',
                }).catch(() => null),
                apiGetMerchantTransactionByType({
                    ...rangeParams,
                    transaction_type: 'PAY_OUT',
                }).catch(() => null),
            ])

            const payInData = payInRes?.data
                ? unwrapDataEnvelope<TransactionByTypeApiPayload>(
                      payInRes.data as
                          | { data?: TransactionByTypeApiPayload }
                          | TransactionByTypeApiPayload
                  )
                : undefined
            const payOutData = payOutRes?.data
                ? unwrapDataEnvelope<TransactionByTypeApiPayload>(
                      payOutRes.data as
                          | { data?: TransactionByTypeApiPayload }
                          | TransactionByTypeApiPayload
                  )
                : undefined

            payInAmount = parseAmountMap(payInData?.amount, currency)
            payInCount = Number(payInData?.count || 0)
            payOutAmount = parseAmountMap(payOutData?.amount, currency)
            payOutCount = Number(payOutData?.count || 0)
        }
        
        // 构建三张卡片的数据：代收、代付、余额
        // 注意：代收和代付数据暂时设为 0，等后端提供正确的 API
        // 使用 getCurrencySymbol 将货币代码转换为符号（如 BRL -> R$）
        const currencySymbol = getCurrencySymbol(currency, currency)
        const wallets: Wallet[] = [
            {
                icon: '/img/others/pay-in.png',
                symbol: currencySymbol,
                name: '代收',
                fiatValue: payInAmount / 100,
                coinValue: payInCount,
                growshrink: 0,
                secondaryType: 'count',
                secondarySuffix: ' txns',
                metaType: 'none',
            },
            {
                icon: '/img/others/pay-out.png',
                symbol: currencySymbol,
                name: '代付',
                fiatValue: payOutAmount / 100,
                coinValue: payOutCount,
                growshrink: 0,
                secondaryType: 'count',
                secondarySuffix: ' txns',
                metaType: 'none',
            },
            {
                icon: '/img/others/wallet-icon.png',
                symbol: currencySymbol,
                name: '余额',
                fiatValue: totalAvailable,   // 可用余额
                coinValue: totalBalance,     // 总余额
                growshrink: totalFrozen,     // 冻结金额
                metaType: 'amount',
                metaLabel: 'Frozen',
                metaValue: totalFrozen,
                extraBalances,
            },
        ]
        
        return {
            wallets,
            appId,
        }
    }
)

export const getTransctionHistoryData = createAsyncThunk(
    SLICE_NAME + '/getTransctionHistoryData',
    async (data: TransactionHistoryQuery, { getState, rejectWithValue }) => {
        const state = getState() as { appWallets: { data: CryptoWalletsState } }
        const {
            tab,
            pageIndex = 1,
            pageSize = 10,
            query = '',
            sort = { order: '', key: '' },
            startDateOverride,
            endDateOverride,
        } = data
        const { startDate, endDate, currentAppId } = state.appWallets.data
        const effectiveStartDate = startDateOverride ?? startDate
        const effectiveEndDate = endDateOverride ?? endDate

        // 创建缓存key（包含时间范围）
        const cacheKey = `${tab}_${pageIndex}_${pageSize}_${query}_${sort.order}_${sort.key}_${effectiveStartDate}_${effectiveEndDate}`
        const cachedData = state.appWallets.data.transactionHistoryCache[cacheKey]

        // 检查缓存是否有效（5分钟内有效）
        const CACHE_DURATION = 5 * 60 * 1000 // 5分钟
        if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
            return cachedData.data
        }

        try {
            const appId = currentAppId?.trim()
            const keyword = (query || '').trim()
            if (DEBUG_TRADE) {
                console.debug('[MerchantDashboard][HistoryRequest]', {
                    tab,
                    pageIndex,
                    pageSize,
                    query: keyword,
                    currentAppId: appId,
                    effectiveStartDate,
                    effectiveEndDate,
                    effectiveStartISO: dayjs.unix(effectiveStartDate).toISOString(),
                    effectiveEndISO: dayjs.unix(effectiveEndDate).toISOString(),
                })
            }

            // 构建查询参数
            const params = {
                page: pageIndex,
                page_size: pageSize,
                start_date: dayjs.unix(effectiveStartDate).format('YYYY-MM-DD'),
                end_date: dayjs.unix(effectiveEndDate).format('YYYY-MM-DD'),
            }

            let response
            // 根据 tab 调用不同的 API
            if (tab === 'deposit') {
                if (!appId) {
                    throw new Error('app_id is required for merchant daily report')
                }
                // 日报数据
                response = await apiGetMerchantDailyReport({
                    ...params,
                    app_id: appId,
                })
                // 后端响应结构: { code, message, data: { data: [...], total } }
                const outerData = unwrapDataEnvelope<DailyReportPayload>(
                    response.data as { data?: DailyReportPayload } | DailyReportPayload
                )
                return {
                    total: outerData.total || 0,
                    data: outerData.data || [],
                }
            } else if (tab === 'trade') {
                const tradeParams = {
                    page: pageIndex,
                    page_size: pageSize,
                    start_time: dayjs.unix(effectiveStartDate).toISOString(),
                    end_time: dayjs.unix(effectiveEndDate).toISOString(),
                }
                if (DEBUG_TRADE) {
                    console.debug('[MerchantDashboard][TradeParams]', tradeParams)
                }
                // 订单列表
                const isPaymentID = /^pay_/i.test(keyword)

                const buildTradeSearchParams = (searchAs: 'payment_id' | 'merchant_tx_id') => ({
                    ...tradeParams,
                    ...(searchAs === 'payment_id'
                        ? { payment_id: keyword || undefined }
                        : { merchant_tx_id: keyword || undefined }),
                })

                if (!keyword) {
                    response = await apiGetMerchantOrders(tradeParams)
                } else {
                    const primarySearchField: 'payment_id' | 'merchant_tx_id' = isPaymentID
                        ? 'payment_id'
                        : 'merchant_tx_id'
                    const fallbackSearchField: 'payment_id' | 'merchant_tx_id' = isPaymentID
                        ? 'merchant_tx_id'
                        : 'payment_id'

                    response = await apiGetMerchantOrders(buildTradeSearchParams(primarySearchField))
                    const primaryData = unwrapDataEnvelope<ListResponsePayload<Trade>>(
                        response.data as
                            | { data?: ListResponsePayload<Trade> }
                            | ListResponsePayload<Trade>
                    )
                    const primaryList = primaryData.list || []
                    const primaryTotal = Number(primaryData.total || 0)

                    // 主搜索无结果时，用另一个字段再查一次
                    if (!primaryList.length && primaryTotal === 0) {
                        response = await apiGetMerchantOrders(buildTradeSearchParams(fallbackSearchField))
                    }
                }
                // 后端响应结构: { code, message, data: { list: [...], total } }
                const responseData = unwrapDataEnvelope<ListResponsePayload<Trade>>(
                    response.data as
                        | { data?: ListResponsePayload<Trade> }
                        | ListResponsePayload<Trade>
                )
                if (DEBUG_TRADE) {
                    console.debug('[MerchantDashboard][TradeResponse]', {
                        total: responseData.total || 0,
                        listLength: Array.isArray(responseData.list)
                            ? responseData.list.length
                            : 0,
                    })
                }
                return {
                    total: responseData.total || 0,
                    data: responseData.list || [],
                }
            } else if (tab === 'withdrawal') {
                const provider = getTradeWithdrawProvider('merchant')
                if (provider.requiresAppId && !appId) {
                    throw new Error('app_id is required for merchant withdrawals')
                }
                // 提款记录
                response = await provider.listWithdrawals({
                    ...params,
                    app_id: appId,
                })

                // 后端响应结构: { code, message, data: { list: [...], total } }
                const responseData = unwrapDataEnvelope<ListResponsePayload<Withdraw>>(
                    response.data as
                        | { data?: ListResponsePayload<Withdraw> }
                        | ListResponsePayload<Withdraw>
                )
                return {
                    total: responseData.total || 0,
                    data: responseData.list || [],
                }
            } else {
                throw new Error(`Unknown tab: ${tab}`)
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to load transaction history'
            return rejectWithValue(message)
        }
    }
)

    export const initializeCryptoWallets = createAsyncThunk(
        SLICE_NAME + '/initialize',
        async (_: void, { dispatch, getState }) => {
            const state = getState() as { appWallets: { data: CryptoWalletsState } }
            const { selectedTab, tableData } = state.appWallets.data

            // 每次都重新加载钱包数据（代收/代付/余额统计）
            await dispatch(getWalletData(undefined))

            // 加载交易历史数据
            await dispatch(
                getTransctionHistoryData({ tab: selectedTab || 'trade', ...(tableData || initialTableData) })
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
    startDate: dayjs().subtract(7, 'day').unix(),
    endDate: dayjs().unix(),
    loading: true,
    currentAppId: '',
    walletsData: [],
    transactionHistoryLoading: true,
    transactionHistoryData: [],
    tableData: initialTableData,
    selectedTab: 'trade',
    tradeDialogOpen: false,
    selectedRow: {},
    transactionHistoryCache: {},
}

const walletsSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        setStartDate: (state, action: PayloadAction<number>) => {
            state.startDate = action.payload
        },
        setEndDate: (state, action: PayloadAction<number>) => {
            state.endDate = action.payload
        },
        setSelectedTab: (state, action) => {
            state.selectedTab = action.payload
        },
        setTableData: (state, action) => {
            state.tableData = action.payload
        },
        setTransactionHistoryData: (state, action) => {
            state.transactionHistoryData = action.payload
        },
        toggleTradeDialog: (state, action: PayloadAction<boolean>) => {
            state.tradeDialogOpen = action.payload
        },
        setSelectedRow: (state, action: PayloadAction<DashboardSelection>) => {
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
                state.walletsData = action.payload.wallets
                state.currentAppId = action.payload.appId
            })
            .addCase(getWalletData.pending, (state) => {
                state.loading = true
            })
            .addCase(getWalletData.rejected, (state) => {
                state.loading = false
            })
            .addCase(getTransctionHistoryData.fulfilled, (state, action) => {
                state.transactionHistoryLoading = false
                // 明确类型标注
                const payload = action.payload as GetTransctionHistoryDataResponse
                state.tableData.total = payload.total
                state.transactionHistoryData = payload.data

                // 更新缓存：与读取缓存使用完全一致的 key（包含时间窗口）
                const arg = action.meta.arg as TransactionHistoryQuery | undefined
                const tab = arg?.tab || state.selectedTab
                const pageIndex = arg?.pageIndex ?? state.tableData.pageIndex ?? 1
                const pageSize = arg?.pageSize ?? state.tableData.pageSize ?? 10
                const query = arg?.query ?? state.tableData.query ?? ''
                const sort = arg?.sort ?? state.tableData.sort ?? { order: '', key: '' }
                const effectiveStartDate = arg?.startDateOverride ?? state.startDate
                const effectiveEndDate = arg?.endDateOverride ?? state.endDate
                const cacheKey = `${tab}_${pageIndex}_${pageSize}_${query}_${sort.order}_${sort.key}_${effectiveStartDate}_${effectiveEndDate}`
                state.transactionHistoryCache[cacheKey] = {
                    data: payload,
                    timestamp: Date.now()
                }

                // 清理过期缓存（保留最近10个缓存项）
                const cacheKeys = Object.keys(state.transactionHistoryCache)
                if (cacheKeys.length > 10) {
                    const sortedKeys = cacheKeys.sort((a, b) =>
                        state.transactionHistoryCache[b].timestamp - state.transactionHistoryCache[a].timestamp
                    )
                    const keysToDelete = sortedKeys.slice(10)
                    keysToDelete.forEach(key => delete state.transactionHistoryCache[key])
                }
            })
            .addCase(getTransctionHistoryData.pending, (state) => {
                state.transactionHistoryLoading = true
            })
            .addCase(getTransctionHistoryData.rejected, (state) => {
                state.transactionHistoryLoading = false
            })
    },
})

export const { setStartDate, setEndDate, setSelectedTab, setTableData, setTransactionHistoryData, toggleTradeDialog, setSelectedRow, clearTransactionHistoryCache } =
    walletsSlice.actions

export default walletsSlice.reducer
