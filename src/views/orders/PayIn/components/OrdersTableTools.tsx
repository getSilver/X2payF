import Button from '@/components/ui/Button'
import { HiArrowDownTray, HiOutlineTrash } from 'react-icons/hi2'
import OrderTableSearch from './OrderTableSearch'
import OrderFilter from './OrderFilter'
// import { setDeleteMode, useAppDispatch, useAppSelector } from '../store'
import { Link } from 'react-router-dom'


// const BatchDeleteButton = () => {
// const dispatch = useAppDispatch()

//     const onBatchDelete = () => {
//         dispatch(setDeleteMode('batch'))
//     }

//     return (
//         <Button
//             variant="solid"
//             color="red-600"
//             size="sm"
//             icon={<HiOutlineTrash />}
//             onClick={onBatchDelete}
//         >
//             Batch Delete
//         </Button>
//     )
// }

const OrdersTableTools = () => {
    // const selectedRows = useAppSelector(
    //     (state) => state.salesOrderList.data.selectedRows
    // )

    return (
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* {selectedRows.length > 0 && <BatchDeleteButton />} */}
            <OrderTableSearch />
            <OrderFilter />
            <Link download to="/data/order-list.csv" target="_blank">
                <Button block size="sm" icon={<HiArrowDownTray />}>
                    Export
                </Button>
            </Link>
        </div>
    )
}

export default OrdersTableTools
