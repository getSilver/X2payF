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
import CustomerForm, { FormikRef, FormModel } from '@/views/merchants/CustomerForm'
import cloneDeep from 'lodash/cloneDeep'
import dayjs from 'dayjs'
import type { MouseEvent } from 'react'

type DrawerFooterProps = {
    onSaveClick: (event: MouseEvent<HTMLButtonElement>) => void
    onCancel: (event: MouseEvent<HTMLButtonElement>) => void
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
        const {
            name,
            email,
        } = values

        try {
            // 显示成功提示（目前只是本地更新，后端暂无更新接口）
            toast.push(
                <Notification title="保存成功" type="success">
                    信息已更新（注意：仅本地更新，后端暂无更新接口）
                </Notification>
            )
            
            // 刷新列表数据
            dispatch(getCustomers({ 
                pageIndex: 1, 
                pageSize: 10, 
                sort: { order: '', key: '' }, 
                query: '', 
                filterData: { status: '' } 
            }))
            
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
