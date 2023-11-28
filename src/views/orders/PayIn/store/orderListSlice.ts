import {
    createSlice,
    createAsyncThunk,
    current,
    PayloadAction,
} from '@reduxjs/toolkit'
import {
    apiGetSalesOrders,
    // apiDeleteSalesOrders,
} from '@/services/SalesService'
import type { TableQueries } from '@/@types/common'

type Order = {
    id: string      //交易ID
    cid: string     //渠道ID
    mid: string     //商户ID
    date: number    //提交时间
    succDate: number    //成功时间Successful time
    customer: string
    status: number
    paymentMehod: string
    paymentIdendifier: string
    totalAmount: number     //结算金额
    subAmount: number      //提交金额
    fee: number         //手续费
    amount: number    //实际收金额
    channel: string     //通道名
}

type Orders = Order[]

type GetSalesOrdersResponse = {
    data: Orders
    total: number
}

type FilterQueries = {
    name: string
    category: string[]
    status: number[]
    productStatus: number
}

export type SalesOrderListState = {
    loading: boolean
    orderList: Orders
    tableData: TableQueries
    // deleteMode: 'single' | 'batch' | ''
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

// export const deleteOrders = async (data: { id: string | string[] }) => {
//     const response = await apiDeleteSalesOrders<
//         boolean,
//         { id: string | string[] }
//     >(data)
//     return response.data
// }

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

const initialState: SalesOrderListState = {
    loading: false,
    orderList: [],
    tableData: initialTableData,
    filterData: {
        name: '',
        category: ['bags', 'cloths', 'devices', 'shoes', 'watches'],
        status: [0, 1, 2],
        productStatus: 0,
    },
    selectedRows: [],
    selectedRow: '',
    // deleteMode: '',
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
        // setDeleteMode: (state, action) => {
        //     state.deleteMode = action.payload
        // },
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
    // setDeleteMode,
} = orderListSlice.actions

export default orderListSlice.reducer
