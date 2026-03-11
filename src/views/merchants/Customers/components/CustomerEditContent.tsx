import { forwardRef } from 'react'
import {
    setDrawerClose,
    useAppDispatch,
    useAppSelector,
} from '../store'
import CustomerForm, { FormikRef, FormModel } from '@/views/merchants/CustomerForm'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const CustomerEditContent = forwardRef<FormikRef>((_, ref) => {
    const dispatch = useAppDispatch()

    const customer = useAppSelector(
        (state) => state.crmCustomers.data.selectedCustomer
    )

    const onFormSubmit = async (_values: FormModel) => {
        // 注意：后端目前只支持状态更新，不支持修改商户基本信息
        // 商户基本信息（名称、邮箱等）在创建时确定，后续不可修改
        // 如需修改状态，请使用商户详情页的状态管理功能
        
        toast.push(
            <Notification title="提示" type="info">
                商户基本信息暂不支持修改，如需更改状态请前往商户详情页
            </Notification>
        )
        
        dispatch(setDrawerClose())
    }

    // 将 Merchant 类型转换为 CustomerForm 需要的格式
    const customerData = {
        name: customer.name || '',
        email: customer.contact_email || '',
        img: '',
        personalInfo: {
            location: '',
            title: customer.account_type || '',
            birthday: customer.created_at || '',
            withdrawal_address: '',
            withdrawal_fee_percent: '0',
            ip_whitelist: '',
            cashier_return_url_whitelist: '',
            agent: '', // UnifiedAccount 类型不包含 agent_id，此页面不支持编辑代理商
        },
    }

    return (
        <CustomerForm
            ref={ref}
            customer={customerData}
            onFormSubmit={onFormSubmit}
        />
    )
})

CustomerEditContent.displayName = 'CustomerEditContent'

export type { FormikRef }

export default CustomerEditContent
