import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    closeEditCustomerDetailDialog,
    updateProfileData,
    putCustomer,
    bindMerchantAgent,
    unbindMerchantAgent,
    useAppDispatch,
    useAppSelector,
    Customer,
} from '../store'
import CustomerForm, { FormikRef, FormModel } from '@/views/merchants/CustomerForm'
import cloneDeep from 'lodash/cloneDeep'
import dayjs from 'dayjs'

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
            facebook,
            twitter,
            pinterest,
            linkedIn,
            agent,
        } = values

        // 处理代理商绑定/解绑逻辑
        const oldAgentId = customer.personalInfo?.agent || customer.agent_id || ''
        const newAgentId = agent || ''
        
        try {
            let agentChanged = false
            
            // 如果代理商ID发生变化，先处理绑定/解绑
            if (oldAgentId !== newAgentId) {
                if (newAgentId) {
                    // 绑定或更换代理商
                    await dispatch(bindMerchantAgent({
                        merchantId: customer.id || '',
                        agentId: newAgentId,
                    })).unwrap()
                    
                    agentChanged = true
                } else {
                    // 解绑代理商
                    await dispatch(unbindMerchantAgent({
                        merchantId: customer.id || '',
                    })).unwrap()
                    
                    agentChanged = true
                }
            }
            
            // 更新本地状态（使用合并而不是覆盖）
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
                    facebook,
                    twitter,
                    pinterest,
                    linkedIn,
                    agent: newAgentId,
                },
            }
            
            // 更新本地状态
            dispatch(updateProfileData(updatedData))
            dispatch(putCustomer(updatedData as Customer))
            
            // 显示成功提示
            if (agentChanged) {
                toast.push(
                    <Notification title="保存成功" type="success">
                        {newAgentId 
                            ? (oldAgentId ? '代理商更换成功' : '代理商绑定成功')
                            : '代理商解绑成功'
                        }
                    </Notification>
                )
            } else {
                toast.push(
                    <Notification title="保存成功" type="success">
                        信息已更新（注意：部分字段仅本地更新，后端暂无更新接口）
                    </Notification>
                )
            }
            
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
