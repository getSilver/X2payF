import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
    apiGetMerchantDailyReport,
    apiGetMerchantOrders,
    apiGetMerchantWithdrawals,
    apiGetMerchantOverview,
    apiGetMerchantApplications,
} from '@/services/MerchantService'
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
}

export type Transaction = Trade[] | TransactionDetails[] | Withdraw[]

type GetTransctionHistoryDataResponse = {
    total: number
    data: Transaction
}

type GetWalletDataResponse = Wallet[]

export type CryptoWalletsState = {
    startDate: number | null
    endDate: number | null
    loading: boolean
    walletsData: Wallet[]
    transactionHistoryLoading: boolean
    transactionHistoryData: Transaction
    tableData: TableQueries
    selectedTab: string
    tradeDialogOpen: boolean
    selectedRow: any
    // 分页数据缓存
    transactionHistoryCache: Record<string, { data: GetTransctionHistoryDataResponse; timestamp: number }>
}

export const SLICE_NAME = 'appWallets'

export const getWalletData = createAsyncThunk(
    SLICE_NAME + '/getWalletData',
    async (_, { getState }) => {
        const state = getState() as { appWallets: { data: CryptoWalletsState } }
        
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
        
        if (applicationsRes?.data) {
            // 提取应用列表: applicationsRes.data.data
            const responseData = applicationsRes.data as any
            const applications = Array.isArray(responseData.data) ? responseData.data : []
            
            applications.forEach((app: any) => {
                // 将分转换为元（除以100）
                totalBalance += (app.balance ?? 0) / 100
                totalAvailable += (app.available_amount ?? 0) / 100
                totalFrozen += (app.frozen_amount ?? 0) / 100
                
                // 提取货币信息（优先从 config 中获取）
                if (!currency) {
                    // config 可能是对象或 JSON 字符串
                    const appConfig = typeof app.config === 'string' 
                        ? JSON.parse(app.config) 
                        : app.config
                    currency = appConfig?.currency || app.currency || ''
                }
            })
        }
        
        // 如果没有获取到币种，使用默认值 USD
        if (!currency) {
            currency = 'USD'
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
                fiatValue: 0,            // 待后端提供 API
                coinValue: 0,
                growshrink: 0,
            },
            {
                icon: '/img/others/pay-out.png',
                symbol: currencySymbol,
                name: '代付',
                fiatValue: 0,            // 待后端提供 API
                coinValue: 0,
                growshrink: 0,
            },
            {
                icon: '/img/others/wallet-icon.png',
                symbol: currencySymbol,
                name: '余额',
                fiatValue: totalAvailable,   // 可用余额
                coinValue: totalBalance,     // 总余额
                growshrink: totalFrozen,     // 冻结金额
            },
        ]
        
        return wallets
    }
)

export const getTransctionHistoryData = createAsyncThunk(
    SLICE_NAME + '/getTransctionHistoryData',
    async (data: { tab: string } & TableQueries, { getState, rejectWithValue }) => {
        const state = getState() as { appWallets: { data: CryptoWalletsState } }
        const { tab, pageIndex = 1, pageSize = 10, query = '', sort = { order: '', key: '' } } = data
        const { startDate, endDate } = state.appWallets.data

        // 创建缓存key（包含时间范围）
        const cacheKey = `${tab}_${pageIndex}_${pageSize}_${query}_${sort.order}_${sort.key}_${startDate ?? ''}_${endDate ?? ''}`
        const cachedData = state.appWallets.data.transactionHistoryCache[cacheKey]

        // 检查缓存是否有效（5分钟内有效）
        const CACHE_DURATION = 5 * 60 * 1000 // 5分钟
        if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
            return cachedData.data
        }

        try {
            // 构建查询参数
            const params = {
                page: pageIndex,
                page_size: pageSize,
                query: query || undefined,
                start_date: startDate ? new Date(startDate).toISOString() : undefined,
                end_date: endDate ? new Date(endDate).toISOString() : undefined,
            }

            let response
            // 根据 tab 调用不同的 API
            if (tab === 'deposit') {
                // 日报数据
                response = await apiGetMerchantDailyReport(params)
                // 后端响应结构: { code, message, data: { data: [...], total } }
                const outerData = (response.data as any).data || response.data
                return {
                    total: outerData.total || 0,
                    data: outerData.data || outerData || [],
                }
            } else if (tab === 'trade') {
                // 订单列表
                response = await apiGetMerchantOrders(params)
                // 后端响应结构: { code, message, data: { list: [...], total } }
                const responseData = (response.data as any).data || response.data
                return {
                    total: responseData.total || 0,
                    data: responseData.list || [],
                }
            } else if (tab === 'withdrawal') {
                // 提款记录 
               response = await apiGetMerchantWithdrawals(params)

                // 后端响应结构: { code, message, data: { list: [...], total } }
                const responseData = (response.data as any).data || response.data
                return {
                    total: responseData.total || 0,
                    data: responseData.list || [],
                }
            } else {
                throw new Error(`Unknown tab: ${tab}`)
            }
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)

    export const initializeCryptoWallets = createAsyncThunk(
        SLICE_NAME + '/initialize',
        async (_: void, { dispatch, getState }) => {
            const state = getState() as { appWallets: { data: CryptoWalletsState } }
            const { selectedTab, tableData } = state.appWallets.data

            // 每次都重新加载钱包数据（代收/代付/余额统计）
            await dispatch(getWalletData())

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
    startDate: null,
    endDate: null,
    loading: true,
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
        setStartDate: (state, action: PayloadAction<number | null>) => {
            state.startDate = action.payload
        },
        setEndDate: (state, action: PayloadAction<number | null>) => {
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
                // 明确类型标注
                const payload = action.payload as GetTransctionHistoryDataResponse
                state.tableData.total = payload.total
                state.transactionHistoryData = payload.data

                // 更新缓存 - 从state中获取tab信息
                const { pageIndex = 1, pageSize = 10, query = '', sort = { order: '', key: '' } } = state.tableData
                const cacheKey = `${state.selectedTab}_${pageIndex}_${pageSize}_${query}_${sort.order}_${sort.key}`
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
