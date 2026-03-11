import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Switcher from '@/components/ui/Switcher'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import cloneDeep from 'lodash/cloneDeep'
import MFAIntegrationDialog from './MFAIntegrationDialog'
import { apiListMFAFactors } from '@/services/MFAService'

type IntegrationDetail = {
    name: string
    desc: string
    img: string
    type: string
    active: boolean
    installed?: boolean
    factorId?: string
    about?: string
    features?: string[]
    qrCodeUri?: string
}

type IntegrationType = {
    installed: IntegrationDetail[]
    available: IntegrationDetail[]
}

const Integration = () => {
    // 静态数据：MFA 集成配置
    const initialData: IntegrationType = {
        installed: [
            {
                name: 'MFA',
                desc: '多因子认证，为您的账户提供额外的安全保护',
                img: '/img/others/img-8.png',
                type: '安全',
                active: true,
                installed: true,
            },
        ],
        available: [],
    }

    const [data, setData] = useState<Partial<IntegrationType>>(initialData)
    const [viewIntegration, setViewIntegration] = useState(false)
    const [intergrationDetails, setIntergrationDetails] = useState<
        Partial<IntegrationDetail>
    >({})
    const [installing, setInstalling] = useState(false)
    const [showMFADialog, setShowMFADialog] = useState(false)

    const fetchData = async () => {
        try {
            const response = await apiListMFAFactors()
            const responseData = response.data as {
                data?: { id: string }[]
            }
            const factorCount = responseData?.data?.length || 0

            setData({
                installed: [
                    {
                        ...initialData.installed[0],
                        active: factorCount > 0,
                        desc:
                            factorCount > 0
                                ? `已绑定 ${factorCount} 个 MFA 验证方式`
                                : '多因子认证尚未启用',
                    },
                ],
                available: [],
            })
        } catch {
            setData({
                installed: [
                    {
                        ...initialData.installed[0],
                        active: false,
                        desc: '无法获取 MFA 状态，请打开查看集成进行检查',
                    },
                ],
                available: [],
            })
        }
    }

    useEffect(() => {
        void fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleToggle = async (
        currentActive: boolean,
        targetApp: IntegrationDetail,
        category: keyof IntegrationType
    ) => {
        const nextActive = !currentActive
        
        // MFA 特殊处理：打开 MFA 管理对话框
        if (targetApp.name === 'MFA') {
            setShowMFADialog(true)
            return
        }
        
        setData((prevState) => {
            const nextState = cloneDeep(prevState as IntegrationType)
            const nextCategoryValue = (prevState as IntegrationType)[
                category
            ].map((app) => {
                if (app?.name === targetApp.name) {
                    app.active = nextActive
                }
                return app
            })
            nextState[category] = nextCategoryValue
            return nextState
        })
    }

    const onViewIntegrationOpen = (
        details: IntegrationDetail,
        installed: boolean
    ) => {
        // MFA 特殊处理：直接打开 MFA 管理对话框
        if (details.name === 'MFA') {
            setShowMFADialog(true)
            return
        }
        
        setViewIntegration(true)
        setIntergrationDetails({ ...details, installed })
    }

    const onViewIntegrationClose = () => {
        setViewIntegration(false)
    }

    const handleMFASuccess = () => {
        // MFA 操作成功后刷新数据
        void fetchData()
    }


    const handleInstall = (details: IntegrationDetail) => {
        setInstalling(true)
        setTimeout(() => {
            setData((prevState) => {
                const nextState = cloneDeep(prevState)
                const nextAvailableApp = prevState?.available?.filter(
                    (app) => app.name !== details.name
                )
                nextState.available = nextAvailableApp
                nextState?.installed?.push(details)
                return nextState
            })
            setInstalling(false)
            onViewIntegrationClose()
            toast.push(<Notification title="App installed" type="success" />, {
                placement: 'top-center',
            })
        }, 1000)
    }

    const aboutText =
        intergrationDetails?.about ||
        intergrationDetails?.desc ||
        'Connect this integration to unlock more workflows and automation.'
    const featureList =
        intergrationDetails?.features || [
            'Real-time notifications and sync.',
            'Secure access and permission control.',
            'Granular activity tracking.',
            'Easy setup and maintenance.',
        ]

    return (
        <>
            <h5>已安装</h5>
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-4">
                {data?.installed?.map((app) => (
                    <Card
                        key={app.name}
                        bodyClass="p-0"
                        footerClass="flex justify-end p-2"
                        footer={
                            <Button
                                variant="plain"
                                size="sm"
                                onClick={() => onViewIntegrationOpen(app, true)}
                            >
                                查看集成
                            </Button>
                        }
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Avatar
                                        className="bg-transparent dark:bg-transparent"
                                        src={app.img}
                                    />
                                    <div className="ltr:ml-2 rtl:mr-2">
                                        <h6>{app.name}</h6>
                                    </div>
                                </div>
                                <Switcher
                                    checked={app.active}
                                    onChange={(val) =>
                                        handleToggle(val, app, 'installed')
                                    }
                                />
                            </div>
                            <p className="mt-6">{app.desc}</p>
                        </div>
                    </Card>
                ))}
            </div>
            <div className="mt-10">
                <h5>可用集成</h5>
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-4">
                    {data?.available?.map((app) => (
                        <Card
                            key={app.name}
                            bodyClass="p-0"
                            footerClass="flex justify-end p-2"
                            footer={
                                <Button
                                    variant="plain"
                                    size="sm"
                                    onClick={() =>
                                        onViewIntegrationOpen(app, false)
                                    }
                                >
                                    查看集成
                                </Button>
                            }
                        >
                            <div className="p-6">
                                <div className="flex items-center">
                                    <Avatar
                                        className="bg-transparent dark:bg-transparent"
                                        src={app.img}
                                    />
                                    <div className="ltr:ml-2 rtl:mr-2">
                                        <h6>{app.name}</h6>
                                    </div>
                                </div>
                                <p className="mt-6">{app.desc}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
            
            {/* MFA 管理对话框 */}
            <MFAIntegrationDialog
                isOpen={showMFADialog}
                onClose={() => setShowMFADialog(false)}
                onSuccess={handleMFASuccess}
            />
            
            {/* 其他集成详情对话框 */}
            <Dialog
                width={650}
                isOpen={viewIntegration}
                onClose={onViewIntegrationClose}
                onRequestClose={onViewIntegrationClose}
            >
                <div className="flex items-center">
                    <Avatar
                        className="bg-transparent dark:bg-transparent"
                        src={intergrationDetails.img}
                    />
                    <div className="ltr:ml-3 rtl:mr-3">
                        <h6>{intergrationDetails.name}</h6>
                        <span>{intergrationDetails.type}</span>
                    </div>
                </div>
                <div className="mt-6">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        关于 {intergrationDetails.name}
                    </span>
                    <p className="mt-2 mb-4">{aboutText}</p>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        主要功能
                    </span>
                    <ul className="list-disc mt-2 ltr:ml-4 rtl:mr-4">
                        {featureList.map((feature) => (
                            <li key={feature} className="mb-1">
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        variant="plain"
                        onClick={onViewIntegrationClose}
                    >
                        取消
                    </Button>
                    {intergrationDetails?.installed ? (
                        <Button disabled variant="solid">
                            已安装
                        </Button>
                    ) : (
                        <Button
                            variant="solid"
                            loading={installing}
                            onClick={() =>
                                handleInstall(
                                    intergrationDetails as IntegrationDetail
                                )
                            }
                        >
                            安装
                        </Button>
                    )}
                </div>
            </Dialog>
        </>
    )
}

export default Integration
