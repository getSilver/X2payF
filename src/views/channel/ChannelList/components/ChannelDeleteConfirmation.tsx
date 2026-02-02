import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    toggleDeleteConfirmation,
    deleteChannel,
    useAppDispatch,
    useAppSelector,
} from '../store'

const ChannelDeleteConfirmation = () => {
    const dispatch = useAppDispatch()
    const dialogOpen = useAppSelector(
        (state) => state.channelList.data.deleteConfirmation
    )
    const selectedChannelId = useAppSelector(
        (state) => state.channelList.data.selectedChannelId
    )

    const onDialogClose = () => {
        dispatch(toggleDeleteConfirmation(false))
    }

    const onDelete = async () => {
        dispatch(toggleDeleteConfirmation(false))
        
        try {
            await dispatch(deleteChannel(selectedChannelId)).unwrap()
            toast.push(
                <Notification
                    title="删除成功"
                    type="success"
                    duration={2500}
                >
                    渠道已成功删除
                </Notification>,
                {
                    placement: 'top-center',
                }
            )
        } catch (error) {
            toast.push(
                <Notification
                    title="删除失败"
                    type="danger"
                    duration={2500}
                >
                    删除渠道时发生错误
                </Notification>,
                {
                    placement: 'top-center',
                }
            )
        }
    }

    return (
        <ConfirmDialog
            isOpen={dialogOpen}
            type="danger"
            title="删除渠道"
            confirmButtonColor="red-600"
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
            onCancel={onDialogClose}
            onConfirm={onDelete}
        >
            <p>
                确定要删除此渠道吗？删除后将无法恢复，请谨慎操作。
            </p>
        </ConfirmDialog>
    )
}

export default ChannelDeleteConfirmation
