import {
    closeDeletePaymentMethodDialog,
    deleteApplication,
    deleteAgentRateConfig,
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
    const profileData = useAppSelector(
        (state) => state.crmCustomerDetails.data.profileData
    )

    const isAgentAccount = String(profileData.id || '').startsWith('agent_')

    const onDelete = async () => {
        if (isAgentAccount) {
            const relationId =
                (selectedCard.entityId as string) ||
                (typeof selectedCard.id === 'string' &&
                !selectedCard.id.endsWith('_rate_config')
                    ? selectedCard.id
                    : '')

            if (!relationId) {
                dispatch(closeDeletePaymentMethodDialog())
                return
            }

            try {
                await dispatch(deleteAgentRateConfig({ relationId })).unwrap()
            } catch (error) {
                console.error('删除分润关联失败:', error)
            }
        } else if (selectedCard.id) {
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
            title={isAgentAccount ? '删除分润关联' : '删除应用'}
            confirmButtonColor="red-600"
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
            onCancel={onDialogClose}
            onConfirm={onDelete}
        >
            <p>
                {isAgentAccount
                    ? '确定要删除该分润关联吗？删除后不可恢复。'
                    : '确定要删除该应用吗？删除后数据将无法恢复。'}
            </p>
        </ConfirmDialog>
    )
}

export default DeletePaymentMethod
