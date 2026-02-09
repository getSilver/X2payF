import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    setDrawerClose,
    setSelectedCustomer,
    useAppDispatch,
    useAppSelector,
    getCustomers,
} from '../store'
import {
    bindMerchantAgent,
    unbindMerchantAgent,
    putCustomer,
    Customer,
} from '@/views/merchants/CustomerDetail/store'
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

const CustomerEditDialog = () => {
    const dispatch = useAppDispatch()
    const drawerOpen = useAppSelector(
        (state) => state.crmCustomers.data.drawerOpen
    )
    const selectedCustomer = useAppSelector(
        (state) => state.crmCustomers.data.selectedCustomer
    )

    const formikRef = useRef<FormikRef>(null)

    const onDrawerClose = () => {
        dispatch(setDrawerClose())
        dispatch(setSelectedCustomer({}))
    }

    const formSubmit = () => {
        formikRef.current?.submitForm()
    }

    const onFormSubmit = async (values: FormModel) => {
        const clonedData = cloneDeep(selectedCustomer)
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
        const oldAgentId = (selectedCustomer as Customer).personalInfo?.agent || (selectedCustomer as Customer).agent_id || ''
        const newAgentId = agent || ''
        
        try {
            let agentChanged = false
            
            // 如果代理商ID发生变化，先处理绑定/解绑
            if (oldAgentId !== newAgentId) {
                if (newAgentId) {
                    // 绑定或更换代理商
                    await dispatch(bindMerchantAgent({
                        merchantId: selectedCustomer.id || '',
                        agentId: newAgentId,
                    })).unwrap()
                    
                    agentChanged = true
                } else {
                    // 解绑代理商
                    await dispatch(unbindMerchantAgent({
                        merchantId: selectedCustomer.id || '',
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
                    ...(clonedData as Customer).personalInfo, // 保留原有字段
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
            
            // 调用后端更新商户信息
            dispatch(putCustomer(updatedData as Customer))
            
            // 刷新列表数据
            dispatch(getCustomers({ 
                pageIndex: 1, 
                pageSize: 10, 
                sort: { order: '', key: '' }, 
                query: '', 
                filterData: { status: '' } 
            }))
            
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
                        信息已更新
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
            isOpen={drawerOpen}
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
                customer={selectedCustomer}
                onFormSubmit={onFormSubmit}
            />
        </Drawer>
    )
}

export default CustomerEditDialog
