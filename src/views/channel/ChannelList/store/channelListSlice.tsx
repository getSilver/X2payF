import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiGetSalesProducts,
    apiDeleteSalesProducts,
    apiPutSalesProduct,
} from '@/services/PaymentService'
import type { TableQueries } from '@/@types/common'

type Channel = {
    id: string
    name: string
    channelCode: string
    img: string
    category: string
    price: number
    stock: number
    status: number
}

type Channels = Channel[]

type GetSalesProductsResponse = {
    data: Channels
    total: number
}

type FilterQueries = {
    name: string
    category: string[]
    status: number[]
    channelStatus: number
}

export type SalesChannelListState = {
    loading: boolean
    deleteConfirmation: boolean
    selectedProduct: string
    tableData: TableQueries
    filterData: FilterQueries
    channelList: Channel[]
}

type GetSalesProductsRequest = TableQueries & { filterData?: FilterQueries }

export const SLICE_NAME = 'salesChannelList'

export const getProducts = createAsyncThunk(
    SLICE_NAME + '/getProducts',
    async (data: GetSalesProductsRequest) => {
        const response = await apiGetSalesProducts<
            GetSalesProductsResponse,
            GetSalesProductsRequest
        >(data)
        return response.data
    }
)

export const deleteProduct = async (data: { id: string | string[] }) => {
    const response = await apiDeleteSalesProducts<
        boolean,
        { id: string | string[] }
    >(data)
    return response.data
}

export const toggleChannelStatus = createAsyncThunk(
    SLICE_NAME + '/toggleChannelStatus',
    async (data: { id: string; status: number }) => {
        const nextStatus = data.status === 1 ? 0 : 1
        await apiPutSalesProduct<
            { id: string; status: number },
            { id: string; status: number }
        >({
            id: data.id,
            status: nextStatus,
        })
        return { id: data.id, status: nextStatus }
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

const initialState: SalesChannelListState = {
    loading: false,
    deleteConfirmation: false,
    selectedProduct: '',
    channelList: [],
    tableData: initialTableData,
    filterData: {
        name: '',
        category: ['宸磋タ', '缇庡浗', '鍗板害', '鏃ユ湰', '娌欑壒'],
        status: [0, 1],
        channelStatus: 0,
    },
}

const channelListSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        updateChannelList: (state, action) => {
            state.channelList = action.payload
        },
        setTableData: (state, action) => {
            state.tableData = action.payload
        },
        setFilterData: (state, action) => {
            state.filterData = action.payload
        },
        toggleDeleteConfirmation: (state, action) => {
            state.deleteConfirmation = action.payload
        },
        setSelectedChannel: (state, action) => {
            state.selectedProduct = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProducts.fulfilled, (state, action) => {
                state.channelList = action.payload.data
                state.tableData.total = action.payload.total
                state.loading = false
            })
            .addCase(getProducts.pending, (state) => {
                state.loading = true
            })
            .addCase(toggleChannelStatus.fulfilled, (state, action) => {
                const { id, status } = action.payload
                const target = state.channelList.find((item) => item.id === id)
                if (target) {
                    target.status = status
                }
            })
    },
})

export const {
    updateChannelList,
    setTableData,
    setFilterData,
    toggleDeleteConfirmation,
    setSelectedChannel,
} = channelListSlice.actions

export default channelListSlice.reducer

