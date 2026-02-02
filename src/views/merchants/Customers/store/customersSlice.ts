import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiListAllAccounts,
    apiUpdateAccountStatus,
} from '@/services/api/AccountApi'
import type { TableQueries } from '@/@types/common'
import type {
    Merchant,
    AccountStatus,
} from '@/@types/account'
import type {
    ListAllAccountsParams,
    ListAllAccountsResponse,
    UnifiedAccount,
} from '@/services/api/AccountApi'

// ==================== 类型定义 ====================

type Filter = {
    status: string
}

type Statistic = {
    value: number
    growShrink: number
}

type CustomerStatistic = {
    totalCustomers: Statistic
    activeCustomers: Statistic
    newCustomers: Statistic
}

export type CustomersState = {
    loading: boolean
    statisticLoading: boolean
    customerList: UnifiedAccount[]
    statisticData: Partial<CustomerStatistic>
    tableData: TableQueries
    filterData: Filter
    drawerOpen: boolean
    selectedCustomer: Partial<UnifiedAccount>
}

export const SLICE_NAME = 'crmCustomers'

// ==================== 异步操作 ====================

/**
 * 后端响应包装格式
 * 后端返回格式: { code: "0", message: "success", request_id: "xxx", data: {...} }
 */
interface BackendResponse<T> {
    code: string
    message: string
    request_id: string
    data: T
}

/**
 * 获取商户统计数据
 * 注意：后端暂无统计接口，这里使用账户列表计算
 */
export const getCustomerStatistic = createAsyncThunk(
    'crmCustomers/data/getCustomerStatistic',
    async () => {
        // 获取所有账户来计算统计数据
        const response = await apiListAllAccounts({ page: 1, page_size: 1000 })
        // 后端响应格式: { code, message, request_id, data: { total, page, page_size, list } }
        const backendData = response.data as unknown as BackendResponse<ListAllAccountsResponse>
        const accounts = backendData.data?.list || []
        const total = backendData.data?.total || 0
        
        // 计算各状态数量
        const normalCount = accounts.filter(m => m.status === 'Normal').length
        
        // 返回统计数据格式
        return {
            totalCustomers: { value: total, growShrink: 0 },
            activeCustomers: { value: normalCount, growShrink: 0 },
            newCustomers: { value: 0, growShrink: 0 }, // 需要后端支持按时间筛选
        }
    }
)

/**
 * 获取账户列表
 */
export const getCustomers = createAsyncThunk(
    'crmCustomers/data/getCustomers',
    async (data: TableQueries & { filterData?: Filter }) => {
        // 构建查询参数
        const params: ListAllAccountsParams = {
            page: data.pageIndex,
            page_size: data.pageSize,
        }
        
        // 添加搜索关键词
        if (data.query) {
            params.name = data.query
        }
        
        // 添加状态筛选
        if (data.filterData?.status) {
            params.status = data.filterData.status
        }
        
        const response = await apiListAllAccounts(params)
        // 后端响应格式: { code, message, request_id, data: { total, page, page_size, list } }
        const backendData = response.data as unknown as BackendResponse<ListAllAccountsResponse>
        
        return {
            data: backendData.data?.list || [],
            total: backendData.data?.total || 0,
        }
    }
)

/**
 * 更新商户状态
 */
export const updateCustomerStatus = createAsyncThunk(
    'crmCustomers/data/updateCustomerStatus',
    async (data: { id: string; status: AccountStatus; reason: string }) => {
        const response = await apiUpdateAccountStatus(data.id, {
            status: data.status,
            reason: data.reason,
        })
        return response.data
    }
)

// ==================== 初始状态 ====================

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

export const initialFilterData = {
    status: '',
}

const initialState: CustomersState = {
    loading: false,
    statisticLoading: false,
    customerList: [],
    statisticData: {},
    tableData: initialTableData,
    filterData: initialFilterData,
    drawerOpen: false,
    selectedCustomer: {},
}

// ==================== Slice ====================

const customersSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        setTableData: (state, action) => {
            state.tableData = action.payload
        },
        setCustomerList: (state, action) => {
            state.customerList = action.payload
        },
        setFilterData: (state, action) => {
            state.filterData = action.payload
        },
        setSelectedCustomer: (state, action) => {
            state.selectedCustomer = action.payload
        },
        setDrawerOpen: (state) => {
            state.drawerOpen = true
        },
        setDrawerClose: (state) => {
            state.drawerOpen = false
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCustomers.fulfilled, (state, action) => {
                state.customerList = action.payload.data
                state.tableData.total = action.payload.total
                state.loading = false
            })
            .addCase(getCustomers.pending, (state) => {
                state.loading = true
            })
            .addCase(getCustomers.rejected, (state) => {
                state.loading = false
            })
            .addCase(getCustomerStatistic.fulfilled, (state, action) => {
                state.statisticData = action.payload
                state.statisticLoading = false
            })
            .addCase(getCustomerStatistic.pending, (state) => {
                state.statisticLoading = true
            })
            .addCase(getCustomerStatistic.rejected, (state) => {
                state.statisticLoading = false
            })
            .addCase(updateCustomerStatus.fulfilled, (state, action) => {
                // 更新成功后刷新列表中的状态
                const updatedId = action.meta.arg.id
                const newStatus = action.meta.arg.status
                const index = state.customerList.findIndex(c => c.id === updatedId)
                if (index !== -1) {
                    state.customerList[index].status = newStatus
                }
            })
    },
})

export const {
    setTableData,
    setCustomerList,
    setFilterData,
    setSelectedCustomer,
    setDrawerOpen,
    setDrawerClose,
} = customersSlice.actions

export default customersSlice.reducer
