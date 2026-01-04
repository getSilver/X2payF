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
            data: state.cryptoWallets?.data?.transactionHistoryData ?? [],
            loading: state.cryptoWallets?.data?.transactionHistoryLoading ?? true,
            selectedTab: state.cryptoWallets?.data?.selectedTab ?? 'trade',
            tableData: state.cryptoWallets?.data?.tableData ?? initialTableData,
        }),
        shallowEqual // 使用浅比较优化性能
    )

    useEffect(() => {
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
            <h4 className="mb-4">Transaction History 交易记录</h4>
            <Tabs value={selectedTab} variant="pill" onChange={handleTabChange}>
            <div className="flex lg:items-center justify-between flex-col lg:flex-row gap-4">
                <TabList>
                    <TabNav value="deposit">Deposit日报</TabNav>
                    <TabNav value="trade">Trade流水记录</TabNav>
                    <TabNav value="withdrawal">Withdraw提款记录</TabNav>
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
