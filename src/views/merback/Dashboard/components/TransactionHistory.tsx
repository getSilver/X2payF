import { useEffect, useRef, useMemo, useCallback, lazy } from 'react'
import {
    getTransctionHistoryData,
    setSelectedTab,
    setTableData,
    initialTableData,
    setTransactionHistoryData,
    toggleTradeDialog,
    clearTransactionHistoryCache,
    useAppDispatch,
    useAppSelector,
    Trade,
    TransactionDetails,
    Withdraw,
} from '../store'
import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import Button from '@/components/ui/Button'
import QueryInput from './QueryInput'
import cloneDeep from 'lodash/cloneDeep'
import { shallowEqual } from 'react-redux'
import { HiOutlineRefresh } from 'react-icons/hi'

// 懒加载表格组件 - 从transaction模块导入
const TradeTable = lazy(() => import('./transaction').then(mod => ({ default: mod.TradeTable })))
const DepositTable = lazy(() => import('./transaction').then(mod => ({ default: mod.DepositTable })))
const WithdrawalTable = lazy(() => import('./transaction').then(mod => ({ default: mod.WithdrawalTable })))

const { TabNav, TabList, TabContent } = Tabs

const TransactionHistory = () => {
    const dispatch = useAppDispatch()

    // 使用useMemo合并选择器，减少多次useAppSelector调用
    const { data, loading, selectedTab, tableData } = useAppSelector(
        (state) => ({
            data: state.appWallets?.data?.transactionHistoryData ?? [],
            loading: state.appWallets?.data?.transactionHistoryLoading ?? true,
            selectedTab: state.appWallets?.data?.selectedTab ?? 'trade',
            tableData: state.appWallets?.data?.tableData ?? initialTableData,
        }),
        shallowEqual // 使用浅比较优化性能
    )

    // 跟踪是否为首次渲染，首次渲染不发请求（由 Dashboard 初始化）
    const isFirstRenderRef = useRef(true)

    useEffect(() => {
        // 首次渲染跳过，由 Dashboard 的 initializeCryptoWallets 负责加载
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false
            return
        }
        
        // 后续参数变化时发起请求
        dispatch(getTransctionHistoryData({ tab: selectedTab, ...tableData }))
    }, [dispatch, selectedTab, tableData])

    const handleTabChange = useCallback((val: string) => {
        dispatch(clearTransactionHistoryCache()) // 清除缓存
        dispatch(setTransactionHistoryData([]))
        dispatch(setSelectedTab(val))
        dispatch(setTableData(initialTableData))
    }, [dispatch])

    const inputRef = useRef(null)

    const handleInputChange = useCallback((val: string) => {
        const newTableData = cloneDeep(tableData)
        newTableData.query = val
        newTableData.pageIndex = 1
        if (typeof val === 'string' && val.length > 1) {
            dispatch(setTableData(newTableData))
        }

        if (typeof val === 'string' && val.length === 0) {
            dispatch(setTableData(newTableData))
        }
    }, [dispatch, tableData])

    return (
        <Card>
            <h4 className="mb-4">Transaction History</h4>
            <Tabs value={selectedTab} variant="pill" onChange={handleTabChange}>
            <div className="flex lg:items-center justify-between flex-col lg:flex-row gap-4">
                <TabList>
                    <TabNav value="deposit">Deposit</TabNav>
                    <TabNav value="trade">Trade</TabNav>
                    <TabNav value="withdrawal">Withdraw</TabNav>
                </TabList>
                <div className="md:flex items-center gap-3">
                <div className="mb-4">
                    <Button size="sm" variant="solid" onClick={() => dispatch(toggleTradeDialog(true))}>
                        Trade
                    </Button>
                    </div>
                    <div className="mb-4">
                    <QueryInput
                        ref={inputRef}
                        onInputChange={handleInputChange}
                    />
                    </div>
                </div>
            </div>
                <div className="mt-4">
                    <TabContent value="deposit">
                        <DepositTable
                            data={data as TransactionDetails[]}
                            loading={loading}
                            tableData={tableData}
                        />
                    </TabContent>
                    <TabContent value="trade">
                        <TradeTable
                            data={data as Trade[]}
                            loading={loading}
                            tableData={tableData}
                        />
                    </TabContent>
                    <TabContent value="withdrawal">
                        <WithdrawalTable
                            data={data as Withdraw[]}
                            loading={loading}
                            tableData={tableData}
                        />
                    </TabContent>
                </div>
            </Tabs>
        </Card>
    )
}

export default TransactionHistory
