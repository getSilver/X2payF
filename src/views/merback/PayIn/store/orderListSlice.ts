import {
    createSlice,
    createAsyncThunk,
    current,
    PayloadAction,
} from '@reduxjs/toolkit'
import {
    apiGetMerchantBackendPayments,
} from '@/services/PaymentService'
import type { TableQueries } from '@/@types/common'
import type { PaymentStatus, PaymentOrder } from '@/@types/payment'

// 使用后端的 PaymentOrder 类型
export type Order = PaymentOrder

type Orders = Order[]

type GetSalesOrdersResponse = {
    data: Orders
    total: number
}

type FilterQueries = {
    name: string
    category: string[]
    status: PaymentStatus[]
    productStatus: number
}

export type SalesOrderListState = {
    loading: boolean
    orderList: Orders
    tableData: TableQueries
    deleteMode: 'single' | 'batch' | ''
    selectedRows: string[]
    selectedRow: string
    filterData: FilterQueries
}

export const SLICE_NAME = 'salesOrderList'

export const getOrders = createAsyncThunk(
    SLICE_NAME + '/getOrders',
    async (data: TableQueries) => {
        // 转换前端分页参数为后端格式
        const params: Record<string, any> = {
            page: data.pageIndex,
            page_size: data.pageSize,
        }
        
        // 如果有搜索关键词，尝试作为 payment_id 搜索
        if (data.query) {
            params.payment_id = data.query
        }
        
        const response = await apiGetMerchantBackendPayments(params)
        
        // 转换后端响应格式为前端格式
        return {
            data: response.data.data.list || [],
            total: response.data.data.total || 0,
        }
    }
)

// 删除订单功能暂时保留（商户后台可能不需要）
export const deleteOrders = async (data: { id: string | string[] }) => {
    // 商户后台暂不支持删除订单
    console.warn('商户后台不支持删除订单操作')
    return false
}

export const initialTableData: TableQueries = {
    total: 0,
    pageIndex: 1,
    pageSize: 25, // 默认每页显示25条记�?
    query: '',
    sort: {
        order: '',
        key: '',
    },
}

const initialState: SalesOrderListState = {
    loading: false,
    orderList: [],
    tableData: initialTableData,
    filterData: {
        name: '',
        category: ['bags', 'cloths', 'devices', 'shoes', 'watches'],
        status: ['SUCCESS', 'PENDING', 'FAILED'],
        productStatus: 0,
    },
    selectedRows: [],
    selectedRow: '',
    deleteMode: '',
}

const orderListSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        setOrderList: (state, action) => {
            state.orderList = action.payload
        },
        setTableData: (state, action) => {
            state.tableData = action.payload
        },
        setFilterData: (state, action) => {
            state.filterData = action.payload
        },
        setSelectedRows: (state, action) => {
            state.selectedRows = action.payload
        },
        setSelectedRow: (state, action) => {
            state.selectedRow = action.payload
        },
        addRowItem: (state, { payload }) => {
            const currentState = current(state)
            if (!currentState.selectedRows.includes(payload)) {
                state.selectedRows = [...currentState.selectedRows, ...payload]
            }
        },
        removeRowItem: (state, { payload }: PayloadAction<string>) => {
            const currentState = current(state)
            if (currentState.selectedRows.includes(payload)) {
                state.selectedRows = currentState.selectedRows.filter(
                    (id) => id !== payload
                )
            }
        },
        setDeleteMode: (state, action) => {
            state.deleteMode = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getOrders.fulfilled, (state, action) => {
                state.orderList = action.payload.data
                state.tableData.total = action.payload.total
                state.loading = false
            })
            .addCase(getOrders.pending, (state) => {
                state.loading = true
            })
    },
})

export const {
    setOrderList,
    setTableData,
    setFilterData,
    setSelectedRows,
    setSelectedRow,
    addRowItem,
    removeRowItem,
    setDeleteMode,
} = orderListSlice.actions

export default orderListSlice.reducer




