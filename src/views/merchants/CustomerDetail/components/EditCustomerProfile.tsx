import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    closeEditCustomerDetailDialog,
    updatePaymentMethodData,
    putCustomer,
    getCustomer,
    useAppDispatch,
    useAppSelector,
    Customer,
} from '../store'
import CustomerForm, { FormikRef, FormModel } from '@/views/merchants/CustomerForm'
import cloneDeep from 'lodash/cloneDeep'
import dayjs from 'dayjs'
import {
    apiUpdateApplicationConfig,
    apiUpdateMerchantOwnerUser,
} from '@/services/api/AccountApi'

type DrawerFooterProps = {
    onSaveClick?: () => void
    onCancel?: () => void
}

const DrawerFooter = ({ onSaveClick, onCancel }: DrawerFooterProps) => {
    return (
        <div className="text-right w-full">
            <Button size="sm" className="mr-2" onClick={onCancel}>
                Cancel
            </Button>
            <Button size="sm" variant="solid" onClick={onSaveClick}>
                Save
            </Button>
        </div>
    )
}

const EditCustomerProfile = () => {
    const dispatch = useAppDispatch()

    const formikRef = useRef<FormikRef>(null)

    const dialogOpen = useAppSelector(
        (state) => state.crmCustomerDetails.data.editCustomerDetailDialog
    )
    const customer = useAppSelector(
        (state) => state.crmCustomerDetails.data.profileData
    )
    const paymentMethodData = useAppSelector(
        (state) => state.crmCustomerDetails.data.paymentMethodData
    )
    const selectedCard = useAppSelector(
        (state) => state.crmCustomerDetails.data.selectedCard
    )

    const onDrawerClose = () => {
        dispatch(closeEditCustomerDetailDialog())
    }

    const formSubmit = () => {
        formikRef.current?.submitForm()
    }

    const onFormSubmit = async (values: FormModel) => {
        const clonedData = cloneDeep(customer)
        const {
            name,
            birthday,
            email,
            img,
            location,
            title,
            withdrawal_address,
            withdrawal_fee_percent,
            ip_whitelist,
            cashier_return_url_whitelist,
        } = values

        const oldLocation = customer.personalInfo?.location || ''
        const targetAppId =
            selectedCard?.configType === 'application' && selectedCard?.id
                ? selectedCard.id
                : paymentMethodData.find(
                      (item) => item.configType === 'application'
                  )?.id || ''
        
        try {
            const updatedData = {
                ...clonedData,
                name,
                email,
                img,
                personalInfo: {
                    ...clonedData.personalInfo, // 保留原有字段
                    location,
                    title,
                    birthday: dayjs(birthday).format('DD/MM/YYYY'),
                    withdrawal_address,
                    withdrawal_fee_percent,
                    ip_whitelist,
                    cashier_return_url_whitelist,
                },
            }

            const merchantUpdateRequired =
                withdrawal_address !==
                    (customer.personalInfo?.withdrawal_address || '') ||
                String(withdrawal_fee_percent) !==
                    String(customer.personalInfo?.withdrawal_fee_percent || '0') ||
                ip_whitelist !== (customer.personalInfo?.ip_whitelist || '') ||
                cashier_return_url_whitelist !==
                    (customer.personalInfo?.cashier_return_url_whitelist || '')

            const ownerUserUpdateRequired =
                name !== (customer.name || '') || email !== (customer.email || '')

            if (ownerUserUpdateRequired) {
                await apiUpdateMerchantOwnerUser(customer.id || '', {
                    username: name,
                    email,
                })
            }

            if (merchantUpdateRequired) {
                await dispatch(putCustomer(updatedData as Customer)).unwrap()
            }

            if (location && location !== oldLocation && targetAppId) {
                await apiUpdateApplicationConfig(targetAppId, {
                    config: {
                        timezone: location,
                    },
                })
                dispatch(
                    updatePaymentMethodData(
                        paymentMethodData.map((item) =>
                            item.id === targetAppId
                                ? { ...item, timezone: location }
                                : item
                        )
                    )
                )
            }

            await dispatch(getCustomer({ id: customer.id || '' })).unwrap()
            
            toast.push(
                <Notification title="保存成功" type="success">
                    信息已更新
                </Notification>
            )
            
            onDrawerClose()
        } catch (error) {
            // 处理错误
            const errorMessage = error instanceof Error ? error.message : '操作失败'
            toast.push(
                <Notification title="错误" type="danger">
                    {errorMessage}
                </Notification>
            )
        }
    }

    return (
        <Drawer
            isOpen={dialogOpen}
            closable={false}
            width={600}
            bodyClass="p-0"
            footer={
                <DrawerFooter
                    onCancel={onDrawerClose}
                    onSaveClick={formSubmit}
                />
            }
            onClose={onDrawerClose}
            onRequestClose={onDrawerClose}
        >
            <CustomerForm
                ref={formikRef}
                customer={customer}
                onFormSubmit={onFormSubmit}
            />
        </Drawer>
    )
}

export default EditCustomerProfile
