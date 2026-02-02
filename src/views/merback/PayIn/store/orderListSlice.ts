import {
    createSlice,
    createAsyncThunk,
    current,
    PayloadAction,
} from '@reduxjs/toolkit'
import {
    apiGetSalesOrders,
    apiDeleteSalesOrders,
} from '@/services/PaymentService'
import type { TableQueries } from '@/@types/common'
import type { PaymentStatus } from '@/@types/payment'

export type Order = {
    id: string          // 交易ID
    cid: string         // 渠道ID
    mid: string         // 商户ID
    date: number        // 创建时间/提交时间
    succDate: number    // 成功时间
    sdate: number       // 成功时间 (兼容组件)
    customer: string    // 客户信息
    status: PaymentStatus      // 订单状�?
    paymentMethod: string    // 支付方式
    paymentIdentifier: string // 支付标识�?
    totalAmount: number // 总金�?
    subAmount: number   // 提交金额
    amount: number      // 实际金额
    fee: number         // 手续�?
    channel: string     // 通道�?
    actionType: number  // 交易方向
    action: string      // 交易动作
}

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
        const response = await apiGetSalesOrders<
            GetSalesOrdersResponse,
            TableQueries
        >(data)
        return response.data
    }
)

export const deleteOrders = async (data: { id: string | string[] }) => {
    const response = await apiDeleteSalesOrders<
        boolean,
        { id: string | string[] }
    >(data)
    return response.data
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




