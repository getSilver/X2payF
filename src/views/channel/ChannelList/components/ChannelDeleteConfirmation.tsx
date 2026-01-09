import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    toggleDeleteConfirmation,
    deleteProduct,
    getProducts,
    useAppDispatch,
    useAppSelector,
} from '../store'

const ProductDeleteConfirmation = () => {
    const dispatch = useAppDispatch()
    const dialogOpen = useAppSelector(
        (state) => state.salesChannelList.data.deleteConfirmation
    )
    const selectedProduct = useAppSelector(
        (state) => state.salesChannelList.data.selectedProduct
    )
    const tableData = useAppSelector(
        (state) => state.salesChannelList.data.tableData
    )

    const onDialogClose = () => {
        dispatch(toggleDeleteConfirmation(false))
    }

    const onDelete = async () => {
        dispatch(toggleDeleteConfirmation(false))
        const success = await deleteProduct({ id: selectedProduct })

        if (success) {
            dispatch(getProducts(tableData))
            toast.push(
                <Notification
                    title={'Successfuly Deleted'}
                    type="success"
                    duration={2500}
                >
                    Product successfuly deleted
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
            title="Delete Channel"
            confirmButtonColor="red-600"
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
            onCancel={onDialogClose}
            onConfirm={onDelete}
        >
            <p>
                鎯充汉瀹剁殑鏃跺€欏彨浜哄灏忕敎鐢滐紝鐜板湪鍙汉瀹剁墰澶汉锛屾棤鎯呯殑杩樿鍒犻櫎鎷夐粦锛佷綘鎯虫竻妤氬啀鐐圭孩鑹叉寜閽垹闄ゆ媺榛戯紒锛侊紒
            </p>
        </ConfirmDialog>
    )
}

export default ProductDeleteConfirmation

