import {
    createSlice,
    createAsyncThunk,
    current,
    PayloadAction,
} from '@reduxjs/toolkit'
import {
    apiGetPayments,
    apiDeleteSalesOrders,
} from '@/services/PaymentService'
import type { TableQueries } from '@/@types/common'
import type { PaymentStatus, TransactionType } from '@/@types/payment'

type Order = {
    id: string      //交易ID
    cid: string     //渠道ID
    mid: string     //商户ID
    transaction_type: TransactionType
    currency?: string
    date: number    //提交时间
    succDate: number    //成功时间Successful time
    customer: string
    status: PaymentStatus
    paymentMetthod: string
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

type AdminPaymentsResponse = {
    code: number
    message: string
    data: {
        total: number
        page: number
        page_size: number
        list: Array<{
            payment_id: string
            merchant_id: string
            channel_id?: string
            transaction_type?: TransactionType
            created_at?: string
            updated_at?: string
            status: PaymentStatus
            payment_method?: string
            currency?: string
            amount: number
            settlement_amount?: number | null
            merchant_fee?: number | null
        }>
    }
}

export type SalesOrderListState = {
    loading: boolean
    orderList: Orders
    tableData: TableQueries
    deleteMode: 'single' | 'batch' | ''
    selectedRows: string[]
    selectedRow: string
}

export const SLICE_NAME = 'salesOrderList'

export const getOrders = createAsyncThunk(
    SLICE_NAME + '/getOrders',
    async (data: TableQueries) => {
        const query = String(data.query || '').trim()
        const isPaymentID = /^pay_/i.test(query)
        const response = await apiGetPayments({
            page: data.pageIndex,
            page_size: data.pageSize,
            payment_id: query ? (isPaymentID ? query : undefined) : undefined,
            merchant_tx_id: query ? (isPaymentID ? undefined : query) : undefined,
            query: query || undefined,
        })

        const payload = (response.data as unknown as AdminPaymentsResponse).data
        const list = Array.isArray(payload?.list) ? payload.list : []

        const mapped: Orders = list.map((item) => {
            const createdAt = item.created_at ? Date.parse(item.created_at) : 0
            const updatedAt = item.updated_at ? Date.parse(item.updated_at) : 0
            return {
                id: item.payment_id,
                cid: item.channel_id || '',
                mid: item.merchant_id || '',
                transaction_type: item.transaction_type || 'PAY_IN',
                currency: item.currency,
                date: createdAt > 0 ? Math.floor(createdAt / 1000) : 0,
                succDate: updatedAt > 0 ? Math.floor(updatedAt / 1000) : 0,
                customer: item.merchant_id || '',
                status: item.status,
                paymentMetthod: item.payment_method || '',
                paymentIdendifier: item.payment_id,
                totalAmount: (item.settlement_amount ?? 0) / 100,
                subAmount: item.amount / 100,
                fee: (item.merchant_fee ?? 0) / 100,
                amount: item.amount / 100,
                channel: item.channel_id || '',
            }
        })

        return {
            data: mapped,
            total: Number(payload?.total || 0),
        } as GetSalesOrdersResponse
    }
)

export const deleteOrders = async (data: { id: string | string[] }) => {
    const response = await apiDeleteSalesOrders<
        boolean,
        { id: string | string[] }
    >(data)
    return response.data
}

const initialState: SalesOrderListState = {
    loading: false,
    orderList: [],
    tableData: {
        total: 0,
        pageIndex: 1,
        pageSize: 10,
        query: '',
        sort: {
            order: '',
            key: '',
        },
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
    setSelectedRows,
    setSelectedRow,
    addRowItem,
    removeRowItem,
    setDeleteMode,
} = orderListSlice.actions

export default orderListSlice.reducer
