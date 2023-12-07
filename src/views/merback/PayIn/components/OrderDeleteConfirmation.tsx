import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    setDeleteMode,
    setSelectedRow,
    setSelectedRows,
    deleteOrders,
    getOrders,
    useAppDispatch,
    useAppSelector,
} from '../store'

const OrderDeleteConfirmation = () => {
    const dispatch = useAppDispatch()
    const selectedRows = useAppSelector(
        (state) => state.salesOrderList.data.selectedRows
    )
    const selectedRow = useAppSelector(
        (state) => state.salesOrderList.data.selectedRow
    )
    const deleteMode = useAppSelector(
        (state) => state.salesOrderList.data.deleteMode
    )
    const tableData = useAppSelector(
        (state) => state.salesOrderList.data.tableData
    )

    const onDialogClose = () => {
        dispatch(setDeleteMode(''))

        if (deleteMode === 'single') {
            dispatch(setSelectedRow([]))
        }
    }

    const onDelete = async () => {
        dispatch(setDeleteMode(''))

        if (deleteMode === 'single') {
            const success = await deleteOrders({ id: selectedRow })
            deleteSucceed(success)
            dispatch(setSelectedRow([]))
        }

        if (deleteMode === 'batch') {
            const success = await deleteOrders({ id: selectedRows })
            deleteSucceed(success, selectedRows.length)
            dispatch(setSelectedRows([]))
        }
    }

    const deleteSucceed = (success: boolean, orders = 0) => {
        if (success) {
            dispatch(getOrders(tableData))
            toast.push(
                <Notification
                    title={'Successfuly Deleted'}
                    type="success"
                    duration={2500}
                >
                    {deleteMode === 'single' && 'Order '}
                    {deleteMode === 'batch' && `${orders} orders `}
                    successfuly deleted
                </Notification>,
                {
                    placement: 'top-center',
                }
            )
        }
    }

    return (
        <ConfirmDialog
            isOpen={deleteMode === 'single' || deleteMode === 'batch'}
            type="danger"
            title="Delete Channel"
            confirmButtonColor="red-600"
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
            onCancel={onDialogClose}
            onConfirm={onDelete}
        >
            <p>
                想人家的时候叫人家小甜甜，现在叫人家牛夫人，无情的还要删除拉黑！你想清楚再点红色按钮删除拉黑！！！
            </p>
        </ConfirmDialog>
    )
}

export default OrderDeleteConfirmation
