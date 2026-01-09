import { useEffect } from 'react'
import Loading from '@/components/shared/Loading'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import reducer, {
    getProduct,
    updateProduct,
    deleteProduct,
    useAppSelector,
    useAppDispatch,
} from './store'
import { injectReducer } from '@/store'
import { useLocation, useNavigate } from 'react-router-dom'

import ProductForm, {
    FormModel,
    SetSubmitting,
    OnDeleteCallback,
} from '@/views/channel/ChannelForm'
import isEmpty from 'lodash/isEmpty'

injectReducer('salesProductEdit', reducer)

const ChannelEdit = () => {
    const dispatch = useAppDispatch()

    const location = useLocation()
    const navigate = useNavigate()

    const channelData = useAppSelector(
        (state) => state.salesProductEdit.data.channelData
    )
    const loading = useAppSelector(
        (state) => state.salesProductEdit.data.loading
    )

    const fetchData = (data: { id: string }) => {
        dispatch(getProduct(data))
    }

    const handleFormSubmit = async (
        values: FormModel,
        setSubmitting: SetSubmitting
    ) => {
        setSubmitting(true)
        const success = await updateProduct(values)
        setSubmitting(false)
        if (success) {
            popNotification('updated')
        }
    }

    const handleDiscard = () => {
        navigate('/app/channel')
    }

    const handleDelete = async (setDialogOpen: OnDeleteCallback) => {
        setDialogOpen(false)
        const success = await deleteProduct({ id: channelData.id })
        if (success) {
            popNotification('deleted')
        }
    }

    const popNotification = (keyword: string) => {
        toast.push(
            <Notification
                title={`Successfuly ${keyword}`}
                type="success"
                duration={2500}
            >
                Product successfuly {keyword}
            </Notification>,
            {
                placement: 'top-center',
            }
        )
        navigate('/app/channel')
    }

    useEffect(() => {
        const path = location.pathname.substring(
            location.pathname.lastIndexOf('/') + 1
        )
        const rquestParam = { id: path }
        fetchData(rquestParam)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname])

    return (
        <>
            <Loading loading={loading}>
                {!isEmpty(channelData) && (
                    <>
                        <ProductForm
                            type="edit"
                            initialData={channelData}
                            onFormSubmit={handleFormSubmit}
                            onDiscard={handleDiscard}
                            onDelete={handleDelete}
                        />
                    </>
                )}
            </Loading>
            {!loading && isEmpty(channelData) && (
                <div className="h-full flex flex-col items-center justify-center">
                    <DoubleSidedImage
                        src="/img/others/img-2.png"
                        darkModeSrc="/img/others/img-2-dark.png"
                        alt="No channel found!"
                    />
                    <h3 className="mt-8">No channel found!</h3>
                </div>
            )}
        </>
    )
}

export default ChannelEdit
