import {
    closeDeletePaymentMethodDialog,
    deleteApplication,
    useAppDispatch,
    useAppSelector,
} from '../store'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const DeletePaymentMethod = () => {
    const dispatch = useAppDispatch()
    const dialogOpen = useAppSelector(
        (state) => state.crmCustomerDetails.data.deletePaymentMethodDialog
    )
    const selectedCard = useAppSelector(
        (state) => state.crmCustomerDetails.data.selectedCard
    )

    const onDelete = async () => {
        if (selectedCard.id) {
            // 调用后端 API 删除应用
            try {
                await dispatch(deleteApplication({ appId: selectedCard.id }))
            } catch (error) {
                console.error('删除应用失败:', error)
            }
        }
        dispatch(closeDeletePaymentMethodDialog())
    }

    const onDialogClose = () => {
        dispatch(closeDeletePaymentMethodDialog())
    }

    return (
        <ConfirmDialog
            isOpen={dialogOpen}
            type="danger"
            title="删除应用"
            confirmButtonColor="red-600"
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
            onCancel={onDialogClose}
            onConfirm={onDelete}
        >
            <p>确定要删除该应用吗？删除后数据将无法恢复。</p>
        </ConfirmDialog>
    )
}

export default DeletePaymentMethod
