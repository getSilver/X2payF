import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import {
    getCustomers,
    setTableData,
    setFilterData,
    useAppDispatch,
    useAppSelector,
} from '../store'
import CustomerTableSearch from './CustomerTableSearch'
import CustomerTableFilter from './CustomerTableFilter'
import cloneDeep from 'lodash/cloneDeep'
import type { TableQueries } from '@/@types/common'

const CustomersTableTools = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const inputRef = useRef<HTMLInputElement>(null)

    const tableData = useAppSelector(
        (state) => state.crmCustomers.data.tableData
    )

    const handleInputChange = (val: string) => {
        const newTableData = cloneDeep(tableData)
        newTableData.query = val
        newTableData.pageIndex = 1
        if (typeof val === 'string' && val.length > 1) {
            fetchData(newTableData)
        }

        if (typeof val === 'string' && val.length === 0) {
            fetchData(newTableData)
        }
    }

    const fetchData = (data: TableQueries) => {
        dispatch(setTableData(data))
        dispatch(getCustomers(data))
    }

    const onClearAll = () => {
        const newTableData = cloneDeep(tableData)
        newTableData.query = ''
        if (inputRef.current) {
            inputRef.current.value = ''
        }
        dispatch(setFilterData({ status: '' }))
        fetchData(newTableData)
    }

    const addUser = () => {
        navigate('/app/merchants/new')
    }

    return (
        <div className="md:flex items-center justify-between">
            <div className="md:flex items-center gap-4">
                <CustomerTableSearch
                    ref={inputRef}
                    onInputChange={handleInputChange}
                />
                <CustomerTableFilter />
            </div>
            <div className="flex items-center gap-3 mb-4">
                <Button size="sm" onClick={addUser}>
                    Add User
                </Button>
                <Button size="sm" variant="solid" onClick={onClearAll} className="ml-auto">
                    Clear All
                </Button>
            </div>
        </div>
    )
}

export default CustomersTableTools
