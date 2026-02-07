import { useEffect, useRef, useCallback, lazy } from 'react'
import {
    getTransctionHistoryData,
    setSelectedTab,
    setSelectedMerchantId,
    setTableData,
    initialTableData,
    setTransactionHistoryData,
    clearTransactionHistoryCache,
    useAppDispatch,
    useAppSelector,
    AgentMerchantAppRow,
    TransactionDetails,
    Withdraw,
} from '../store'
import Card from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import QueryInput from '@/views/merback/Dashboard/components/QueryInput'
import { toggleTradeDialog } from '@/views/merback/Dashboard/store'
import cloneDeep from 'lodash/cloneDeep'
import { shallowEqual } from 'react-redux'

const MerchantTable = lazy(() =>
    import('./MerchantTable').then((mod) => ({ default: mod.default }))
)
const DepositTable = lazy(() =>
    import('./DepositTable').then((mod) => ({ default: mod.default }))
)
const WithdrawalTable = lazy(() =>
    import('./WithdrawalTable').then((mod) => ({ default: mod.default }))
)

const { TabNav, TabList, TabContent } = Tabs

const TransactionHistory = () => {
    const dispatch = useAppDispatch()

    const { data, loading, selectedTab, tableData, merchants, selectedMerchantId } = useAppSelector(
        (state) => ({
            data: state.agentWallets?.data?.transactionHistoryData ?? [],
            loading: state.agentWallets?.data?.transactionHistoryLoading ?? true,
            selectedTab: state.agentWallets?.data?.selectedTab ?? 'merchant',
            tableData: state.agentWallets?.data?.tableData ?? initialTableData,
            merchants: state.agentWallets?.data?.merchants ?? [],
            selectedMerchantId: state.agentWallets?.data?.selectedMerchantId ?? '',
        }),
        shallowEqual
    )

    const isFirstRenderRef = useRef(true)

    useEffect(() => {
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false
            return
        }

        dispatch(getTransctionHistoryData({ tab: selectedTab, ...tableData }))
    }, [dispatch, selectedTab, tableData])

    const handleTabChange = useCallback(
        (val: string) => {
            dispatch(clearTransactionHistoryCache())
            dispatch(setTransactionHistoryData([]))
            dispatch(setSelectedTab(val))
            dispatch(setTableData(initialTableData))
        },
        [dispatch]
    )

    const inputRef = useRef(null)

    const handleInputChange = useCallback(
        (val: string) => {
            const newTableData = cloneDeep(tableData)
            newTableData.query = val
            newTableData.pageIndex = 1
            if (typeof val === 'string' && val.length > 1) {
                dispatch(setTableData(newTableData))
            }

            if (typeof val === 'string' && val.length === 0) {
                dispatch(setTableData(newTableData))
            }
        },
        [dispatch, tableData]
    )

    const merchantOptions = merchants.map((merchant) => ({
        value: merchant.id,
        label: merchant.name || merchant.id,
    }))

    const handleMerchantChange = useCallback(
        (option?: { value?: string }) => {
            const merchantId = option?.value || ''
            dispatch(setSelectedMerchantId(merchantId))
            dispatch(clearTransactionHistoryCache())
            dispatch(setTransactionHistoryData([]))
            dispatch(setTableData(initialTableData))
        },
        [dispatch]
    )

    useEffect(() => {
        if (selectedTab !== 'deposit') {
            return
        }
        if (selectedMerchantId || merchants.length === 0) {
            return
        }
        const firstMerchantId = merchants[0]?.id || ''
        if (!firstMerchantId) {
            return
        }
        dispatch(setSelectedMerchantId(firstMerchantId))
        dispatch(clearTransactionHistoryCache())
        dispatch(setTransactionHistoryData([]))
        dispatch(setTableData(initialTableData))
        dispatch(
            getTransctionHistoryData({
                tab: 'deposit',
                ...initialTableData,
            })
        )
    }, [dispatch, merchants, selectedMerchantId, selectedTab])

    return (
        <Card>
            <h4 className="mb-4">Transaction History</h4>
            <Tabs value={selectedTab} variant="pill" onChange={handleTabChange}>
                <div className="flex lg:items-center justify-between flex-col lg:flex-row gap-4">
                    <TabList>
                        <TabNav value="merchant">Merchant</TabNav>
                        <TabNav value="deposit">Deposit</TabNav>
                        <TabNav value="withdrawal">Withdraw</TabNav>
                    </TabList>
                    <div className="md:flex items-center gap-3">
                        <div className="mb-4">
                            <Button
                                size="sm"
                                variant="solid"
                                onClick={() => dispatch(toggleTradeDialog(true))}
                            >
                                Trade
                            </Button>
                        </div>
                        {selectedTab === 'deposit' && (
                            <div className="mb-4 min-w-[220px]">
                                <Select
                                    size="sm"
                                    menuPlacement="top"
                                    isSearchable
                                    placeholder="Select merchant"
                                    options={merchantOptions}
                                    value={merchantOptions.find((option) => option.value === selectedMerchantId)}
                                    onChange={(option) => handleMerchantChange(option as { value?: string })}
                                />
                            </div>
                        )}
                        <div className="mb-4">
                            <QueryInput ref={inputRef} onInputChange={handleInputChange} />
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <TabContent value="merchant">
                        <MerchantTable
                            data={data as AgentMerchantAppRow[]}
                            loading={loading}
                            tableData={tableData}
                        />
                    </TabContent>
                    <TabContent value="deposit">
                        <DepositTable
                            data={data as TransactionDetails[]}
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
