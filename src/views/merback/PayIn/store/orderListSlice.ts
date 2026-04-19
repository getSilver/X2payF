import {
    createSlice,
    createAsyncThunk,
    current,
    PayloadAction,
} from '@reduxjs/toolkit'
import { apiGetMerchantBackendPayments } from '@/services/PaymentService'
import type { TableQueries } from '@/@types/common'
import type { PaymentOrder } from '@/@types/payment'
import type { RootState } from '@/store'
import {
    buildOrderListParams,
    type OrderFilterState,
} from './orderListParams'

export type Order = PaymentOrder

type Orders = Order[]

export type SalesOrderListState = {
    loading: boolean
    orderList: Orders
    tableData: TableQueries
    deleteMode: 'single' | 'batch' | ''
    selectedRows: string[]
    selectedRow: string
    filterData: OrderFilterState
}

export const SLICE_NAME = 'salesOrderList'

export const getOrders = createAsyncThunk(
    SLICE_NAME + '/getOrders',
    async (data: TableQueries, thunkApi) => {
        const state = thunkApi.getState() as RootState & {
            [SLICE_NAME]: {
                data: {
                    filterData: OrderFilterState
                }
            }
        }

        const params = buildOrderListParams(
            data,
            state[SLICE_NAME].data.filterData,
        )

        const response = await apiGetMerchantBackendPayments(params)

        return {
            data: response.data.data.list || [],
            total: response.data.data.total || 0,
        }
    },
)

export const deleteOrders = async () => {
    console.warn('商户后台不支持删除订单操作')
    return false
}

export const initialTableData: TableQueries = {
    total: 0,
    pageIndex: 1,
    pageSize: 25,
    query: '',
    sort: {
        order: '',
        key: '',
    },
}

export const initialFilterData: OrderFilterState = {
    direction: '',
    statuses: [],
    notifyFailed: false,
}

const initialState: SalesOrderListState = {
    loading: false,
    orderList: [],
    tableData: initialTableData,
    filterData: initialFilterData,
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
                    (id) => id !== payload,
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
