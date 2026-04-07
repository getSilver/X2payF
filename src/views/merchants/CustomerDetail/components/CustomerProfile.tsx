import { useState } from 'react'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    FaFacebookF,
    FaTwitter,
    FaLinkedinIn,
    FaPinterestP,
} from 'react-icons/fa'
import { HiPencilSquare, HiOutlineTrash, HiOutlineCheckCircle } from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import {
    deleteCustomer,
    updateCustomerStatus,
    getCustomer,
    openEditCustomerDetailDialog,
    useAppDispatch,
    Customer,
} from '../store'
import EditCustomerProfile from './EditCustomerProfile'


type CustomerInfoFieldProps = {
    title?: string
    value?: string
}

type CustomerProfileProps = {
    data?: Partial<Customer>
}

const CustomerInfoField = ({ title, value }: CustomerInfoFieldProps) => {
    return (
        <div>
            <span>{title}</span>
            <p className="text-gray-700 dark:text-gray-200 font-semibold">
                {value}
            </p>
        </div>
    )
}

const CustomerProfileAction = ({ id, status }: { id?: string; status?: string }) => {
    const dispatch = useAppDispatch()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [actionType, setActionType] = useState<'disable' | 'enable'>('disable')

    const navigate = useNavigate()

    const onDialogClose = () => {
        setDialogOpen(false)
    }

    const onDialogOpen = (type: 'disable' | 'enable') => {
        setActionType(type)
        setDialogOpen(true)
    }

    const onStatusChange = async () => {
        setDialogOpen(false)
        if (id) {
            try {
                if (actionType === 'disable') {
                    await dispatch(deleteCustomer({ id })).unwrap()
                    toast.push(
                        <Notification title={'禁用成功'} type="success">
                            账户已成功禁用
                        </Notification>
                    )
                } else {
                    await dispatch(
                        updateCustomerStatus({
                            id,
                            status: 'Normal',
                            reason: '管理员启用账户',
                        })
                    ).unwrap()
                    toast.push(
                        <Notification title={'启用成功'} type="success">
                            账户已成功启用
                        </Notification>
                    )
                }
                // 状态更新成功，Redux 会自动更新 profileData.status
                // 不需要重新获取数据，避免覆盖应用配置
            } catch (error: any) {
                toast.push(
                    <Notification
                        title={actionType === 'disable' ? '禁用失败' : '启用失败'}
                        type="danger"
                    >
                        {error?.message ||
                            `${actionType === 'disable' ? '禁用' : '启用'}账户失败，请稍后重试`}
                    </Notification>
                )
            }
        }
    }

    const onEdit = () => {
        dispatch(openEditCustomerDetailDialog())
    }

    const isDisabled = status === 'Disabled'

    return (
        <>
            {isDisabled ? (
                <Button
                    block
                    icon={<HiOutlineCheckCircle />}
                    onClick={() => onDialogOpen('enable')}
                    variant="solid"
                    className="bg-green-600 hover:bg-green-700"
                >
                    Enable
                </Button>
            ) : (
                <Button
                    block
                    icon={<HiOutlineTrash />}
                    onClick={() => onDialogOpen('disable')}
                >
                    Disable
                </Button>
            )}
            <Button
                block
                icon={<HiPencilSquare />}
                variant="solid"
                onClick={onEdit}
            >
                Edit
            </Button>
            <ConfirmDialog
                isOpen={dialogOpen}
                type={actionType === 'disable' ? 'danger' : 'info'}
                title={actionType === 'disable' ? 'Disable customer' : 'Enable customer'}
                confirmButtonColor={actionType === 'disable' ? 'red-600' : 'green-600'}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
                onCancel={onDialogClose}
                onConfirm={onStatusChange}
            >
                <p>
                    {actionType === 'disable'
                        ? 'Are you sure you want to disable this customer? The customer will not be able to use the system, but all records will be preserved. You can re-enable the customer later if needed.'
                        : 'Are you sure you want to enable this customer? The customer will be able to use the system again.'}
                </p>
            </ConfirmDialog>
            <EditCustomerProfile />
        </>
    )
}

const CustomerProfile = ({ data = {} }: CustomerProfileProps) => {
    return (
        <Card>
            <div className="flex flex-col xl:justify-between h-full 2xl:min-w-[360px] mx-auto">
                <div className="flex xl:flex-col items-center gap-4">
                    <Avatar size={90} shape="circle" src={data.img} />
                    <h4 className="font-bold">{data.name}</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-y-7 gap-x-4 mt-8">
                    <CustomerInfoField title="Email" value={data.contact_email} />
                    <CustomerInfoField
                        title="商户ID"
                        value={data.personalInfo?.merchantID}
                    />
                    <CustomerInfoField
                        title="Location时区"
                        value={data.personalInfo?.location}
                    />
                    <CustomerInfoField
                        title="birthday注册时间"
                        value={data.personalInfo?.birthday}
                    />
                    <div className="mb-7">
                        <span>Social</span>
                        <div className="flex mt-4">
                            <Button
                                className="mr-2"
                                shape="circle"
                                size="sm"
                                icon={
                                    <FaFacebookF className="text-[#1773ea]" />
                                }
                            />
                            <Button
                                className="mr-2"
                                shape="circle"
                                size="sm"
                                icon={<FaTwitter className="text-[#1da1f3]" />}
                            />
                            <Button
                                className="mr-2"
                                shape="circle"
                                size="sm"
                                icon={
                                    <FaLinkedinIn className="text-[#0077b5]" />
                                }
                            />
                            <Button
                                className="mr-2"
                                shape="circle"
                                size="sm"
                                icon={
                                    <FaPinterestP className="text-[#df0018]" />
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-col xl:flex-row gap-2">
                    <CustomerProfileAction id={data.id} status={data.status} />
                </div>
            </div>
        </Card>
    )
}

export default CustomerProfile
