import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Switcher from '@/components/ui/Switcher'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import isEmpty from 'lodash/isEmpty'
import { apiGetAccountSettingIntegrationData } from '@/services/AccountServices'
import type { MFAFactor } from '@/@types/mfa'
import { apiListMFAFactors, apiUnenrollFactor } from '@/services/MFAService'
import cloneDeep from 'lodash/cloneDeep'
import MFAIntegrationDialog from './MFAIntegrationDialog'

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

type GetAccountSettingIntegrationDataResponse = IntegrationType

const Integration = () => {
    const [data, setData] = useState<Partial<IntegrationType>>({})
    const [viewIntegration, setViewIntegration] = useState(false)
    const [intergrationDetails, setIntergrationDetails] = useState<
        Partial<IntegrationDetail>
    >({})
    const [installing, setInstalling] = useState(false)

    const fetchData = async () => {
        const response =
            await apiGetAccountSettingIntegrationData<GetAccountSettingIntegrationDataResponse>()
        setData(response.data)
    }

    useEffect(() => {
        if (isEmpty(data)) {
            fetchData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleToggle = async (
        currentActive: boolean,
        targetApp: IntegrationDetail,
        category: keyof IntegrationType
    ) => {
        const nextActive = !currentActive
        if (targetApp.name === 'MFA' && category === 'installed' && !nextActive) {
            let factorId = targetApp.factorId
            if (!factorId) {
                try {
                    const response = await apiListMFAFactors()
                    const factors = response.data as MFAFactor[]
                    const totpFactor = factors.find(
                        (factor) => factor.factor_type === 'totp'
                    )
                    if (totpFactor?.id) {
                        factorId = totpFactor.id
                        setData((prevState) => {
                            const nextState = cloneDeep(
                                prevState as IntegrationType
                            )
                            const nextInstalled = nextState.installed?.map(
                                (app) =>
                                    app.name === 'MFA'
                                        ? { ...app, factorId }
                                        : app
                            )
                            nextState.installed = nextInstalled
                            return nextState
                        })
                    }
                } catch (error) {
                    toast.push(
                        <Notification
                            title="Failed to load MFA factors"
                            type="danger"
                        />,
                        { placement: 'top-center' }
                    )
                }
            }
            if (!factorId) {
                toast.push(
                    <Notification
                        title="Missing MFA factor id"
                        type="danger"
                    />,
                    { placement: 'top-center' }
                )
                return
            }
            try {
                await apiUnenrollFactor(factorId)
            } catch (error) {
                toast.push(
                    <Notification
                        title="Failed to disable MFA"
                        type="danger"
                    />,
                    { placement: 'top-center' }
                )
                return
            }
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
        setViewIntegration(true)
        setIntergrationDetails({ ...details, installed })
    }

    const onViewIntegrationClose = () => {
        setViewIntegration(false)
    }

    const handleMfaBound = (factorId: string) => {
        setData((prevState) => {
            const nextState = cloneDeep(prevState as IntegrationType)
            const nextInstalled = nextState.installed?.map((app) => {
                if (app.name === 'MFA') {
                    return { ...app, factorId, active: true }
                }
                return app
            })
            nextState.installed = nextInstalled
            return nextState
        })
    }

    const handleMfaFactorLoaded = (factorId: string) => {
        setData((prevState) => {
            const nextState = cloneDeep(prevState as IntegrationType)
            const nextInstalled = nextState.installed?.map((app) => {
                if (app.name === 'MFA') {
                    return { ...app, factorId }
                }
                return app
            })
            nextState.installed = nextInstalled
            return nextState
        })
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

    const isMfa = intergrationDetails?.name === 'MFA'
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
            <h5>Installed</h5>
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
                                View Intergration
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
                <h5>Available</h5>
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
                                    View Intergration
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
            <Dialog
                width={650}
                isOpen={viewIntegration}
                onClose={onViewIntegrationClose}
                onRequestClose={onViewIntegrationClose}
            >
                {isMfa ? (
                    <MFAIntegrationDialog
                        isOpen={viewIntegration}
                        onClose={onViewIntegrationClose}
                        onBound={handleMfaBound}
                        onFactorLoaded={handleMfaFactorLoaded}
                        qrCodeUri={intergrationDetails.qrCodeUri}
                    />
                ) : (
                    <>
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
                                About {intergrationDetails.name}
                            </span>
                            <p className="mt-2 mb-4">{aboutText}</p>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                Key Features
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
                                Cancel
                            </Button>
                            {intergrationDetails?.installed ? (
                                <Button disabled variant="solid">
                                    Installed
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
                                    Install
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </Dialog>
        </>
    )
}

export default Integration
