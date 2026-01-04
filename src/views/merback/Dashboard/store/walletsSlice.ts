import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import {
    apiGetWalletData,
    apiGetTransctionHistoryData,
} from '@/services/CryptoService'
import type { TableQueries } from '@/@types/common'

export type Trade = {
    id: string
    actionType: number
    status: number
    action: string
    date: number
    sdate: number    //成功时间Successful time
    symbol: string
    price: number
    amount: number
}

export type TransactionDetails = {
    id: string
    actionType: number
    action: string
    date: number
    symbol: string
    subAmount: number
    amount: number
    fee: number
    refund: number
    feeRefund: number
    refundNo: number
    unitTotal: number
    rate: number
}

export type Withdraw = {
    id: string
    actionType: number
    status: number
    action: string
    date: number
    symbol: string
    subAmount: number
    amount: number
    refund: number
    fee: number
    note: string
}

export type Wallet = {
    icon: string
    symbol: string
    name: string
    fiatValue: number
    coinValue: number
    growshrink: number
}

export type Transaction = Trade[] | TransactionDetails[] | Withdraw[]

type GetTransctionHistoryDataResponse = {
    total: number
    data: Transaction
}

type GetWalletDataResponse = Wallet[]

export type CryptoWalletsState = {
    startDate: number
    endDate: number
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

export const SLICE_NAME = 'cryptoWallets'

export const getWalletData = createAsyncThunk(
    SLICE_NAME + '/getWalletData',
    async (_, { getState }) => {
        const state = getState() as { cryptoWallets: { data: CryptoWalletsState } }
        const { startDate, endDate } = state.cryptoWallets.data
        const response = await apiGetWalletData<GetWalletDataResponse>({ startDate, endDate })
        return response.data
    }
)

export const getTransctionHistoryData = createAsyncThunk(
    SLICE_NAME + '/getTransctionHistoryData',
    async (data: { tab: string } & TableQueries, { getState, rejectWithValue }) => {
        const state = getState() as { cryptoWallets: { data: CryptoWalletsState } }
        const { tab, pageIndex = 1, pageSize = 10, query = '', sort = { order: '', key: '' } } = data
        const { startDate, endDate } = state.cryptoWallets.data

        // 创建缓存key（包含时间范围）
        const cacheKey = `${tab}_${pageIndex}_${pageSize}_${query}_${sort.order}_${sort.key}_${startDate || ''}_${endDate || ''}`
        const cachedData = state.cryptoWallets.data.transactionHistoryCache[cacheKey]

        // 检查缓存是否有效（5分钟内有效）
        const CACHE_DURATION = 5 * 60 * 1000 // 5分钟
        if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
            return cachedData.data
        }

        try {
            const requestData = { ...data, startDate, endDate }
            const response = await apiGetTransctionHistoryData<
                GetTransctionHistoryDataResponse,
                typeof requestData
            >(requestData)
            return response.data
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)

    export const initializeCryptoWallets = createAsyncThunk(
        SLICE_NAME + '/initialize',
        async (_: void, { dispatch, getState }) => {
            const state = getState() as { cryptoWallets: { data: CryptoWalletsState } }
            const { walletsData, transactionHistoryData, selectedTab, tableData } = state.cryptoWallets.data

            if (!walletsData || walletsData.length === 0) {
                // 等待完成以避免并发问题
                // eslint-disable-next-line @typescript-eslint/return-await
                await dispatch(getWalletData())
            }

            if (!transactionHistoryData || transactionHistoryData.length === 0) {
                await dispatch(
                    getTransctionHistoryData({ tab: selectedTab || 'trade', ...(tableData || initialTableData) })
                )
            }
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
    startDate: dayjs(
        dayjs().subtract(3, 'month').format('DD-MMM-YYYY, hh:mm A')
    ).unix(),
    endDate: dayjs(new Date()).unix(),
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
