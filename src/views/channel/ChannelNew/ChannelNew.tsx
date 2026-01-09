import ProductForm, {
    FormModel,
    SetSubmitting,
} from '@/views/channel/ChannelForm'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useNavigate } from 'react-router-dom'
import { apiCreateSalesProduct } from '@/services/PaymentService'
import ChannelForm from '@/views/channel/ChannelForm'

const ChannelNew = () => {
    const navigate = useNavigate()

    const addProduct = async (data: FormModel) => {
        const response = await apiCreateSalesProduct<boolean, FormModel>(data)
        return response.data
    }

    const handleFormSubmit = async (
        values: FormModel,
        setSubmitting: SetSubmitting
    ) => {
        setSubmitting(true)
        const success = await addProduct(values)
        setSubmitting(false)
        if (success) {
            toast.push(
                <Notification
                    title={'Successfuly added'}
                    type="success"
                    duration={2500}
                >
                    Channel successfuly added
                </Notification>,
                {
                    placement: 'top-center',
                }
            )
            navigate('/channel/product-list')
        }
    }

    const handleDiscard = () => {
        navigate('/channel/product-list')
    }

    return (
        <>
            <ChannelForm
                type="new"
                onFormSubmit={handleFormSubmit}
                onDiscard={handleDiscard}
            />
        </>
    )
}

export default ChannelNew
