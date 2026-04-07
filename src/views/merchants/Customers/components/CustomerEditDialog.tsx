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
    putCustomer,
    Customer,
} from '@/views/merchants/CustomerDetail/store'
import CustomerForm, { FormikRef, FormModel } from '@/views/merchants/CustomerForm'
import cloneDeep from 'lodash/cloneDeep'
import dayjs from 'dayjs'
import {
    apiGetMerchantApplications,
    apiUpdateApplicationConfig,
} from '@/services/api/AccountApi'

const isStrictIanaTimezoneCode = (value: string) => {
    const timezone = value.trim()
    if (!timezone) return false
    return /^[A-Za-z_]+(?:\/[A-Za-z0-9_\-+]+)+$/.test(timezone)
}

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
            withdrawal_address,
            withdrawal_fee_percent,
            ip_whitelist,
            cashier_return_url_whitelist,
        } = values

        const oldLocation = ((selectedCustomer as Customer).personalInfo?.location || '').trim()
        const nextLocation = (location || '').trim()

        if (nextLocation && nextLocation !== oldLocation && !isStrictIanaTimezoneCode(nextLocation)) {
            toast.push(
                <Notification title="时区格式错误" type="warning">
                    仅允许 timezone.code（IANA），例如 America/Sao_Paulo
                </Notification>,
                { placement: 'top-center' }
            )
            return
        }
        
        try {
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
                    withdrawal_address,
                    withdrawal_fee_percent,
                    ip_whitelist,
                    cashier_return_url_whitelist,
                },
            }
            
            // 调用后端更新商户信息
            await dispatch(putCustomer(updatedData as Customer)).unwrap()

            if (nextLocation && nextLocation !== oldLocation && selectedCustomer.id) {
                const applicationsResponse = await apiGetMerchantApplications(
                    selectedCustomer.id
                )
                const applicationsRaw = applicationsResponse.data as unknown as
                    | { data?: Array<{ id?: string }> }
                    | Array<{ id?: string }>
                const applications = Array.isArray(applicationsRaw)
                    ? applicationsRaw
                    : applicationsRaw?.data || []
                const appId = applications[0]?.id
                if (appId) {
                    await apiUpdateApplicationConfig(appId, {
                        config: {
                            timezone: nextLocation,
                        },
                    })
                }
            }
            
            // 刷新列表数据
            dispatch(getCustomers({ 
                pageIndex: 1, 
                pageSize: 10, 
                sort: { order: '', key: '' }, 
                query: '', 
                filterData: { status: '' } 
            }))
            
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
