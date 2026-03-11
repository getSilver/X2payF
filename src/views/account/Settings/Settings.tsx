import { useState, useEffect, Suspense, lazy } from 'react'
import Tabs from '@/components/ui/Tabs'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Container from '@/components/shared/Container'
import { useNavigate, useLocation } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'

type AccountSetting = {
    profile: {
        name: string
        email: string
        title: string
        avatar: string
        timeZone: string
        lang: string
        syncData: boolean
    }
    loginHistory: {
        type: string
        deviceName: string
        time: number
        location: string
    }[]
    notification: {
        news: string[]
        accountActivity: string[]
        signIn: string[]
        reminders: string[]
        mentioned: string[]
        replies: string[]
        taskUpdate: string[]
        assigned: string[]
        newProduct: string[]
        newOrder: string[]
    }
}

type GetAccountSettingData = AccountSetting

const Profile = lazy(() => import('./components/Profile'))
const Password = lazy(() => import('./components/Password'))
const NotificationSetting = lazy(
    () => import('./components/NotificationSetting')
)
const Integration = lazy(() => import('./components/Integration'))
const Billing = lazy(() => import('./components/Billing'))

const { TabNav, TabList } = Tabs

const settingsMenu: Record<
    string,
    {
        label: string
        path: string
    }
> = {
    profile: { label: 'Profile', path: 'profile' },
    password: { label: 'Password', path: 'password' },
    notification: { label: 'Notification', path: 'notification' },
    integration: { label: 'Integration', path: 'integration' },
    billing: { label: 'Billing', path: 'billing' },
}

const Settings = () => {
    const [currentTab, setCurrentTab] = useState('profile')
    const [data, setData] = useState<Partial<AccountSetting>>({})

    const navigate = useNavigate()

    const location = useLocation()

    const path = location.pathname.substring(
        location.pathname.lastIndexOf('/') + 1
    )

    // 根据当前路径获取基础路径，支持商户(/mer)和平台(/account)两种路由
    const getBasePath = () => {
        if (location.pathname.startsWith('/mer/')) {
            return '/mer/account/settings'
        }
        if (location.pathname.startsWith('/agent/')) {
            return '/agent/account/settings'
        }
        return '/account/settings'
    }

    const onTabChange = (val: string) => {
        setCurrentTab(val)
        navigate(`${getBasePath()}/${val}`)
    }

    useEffect(() => {
        setCurrentTab(path)
        // 使用静态数据，不调用后端接口
        // 如果后端实现了 /account/setting 接口，可以取消注释
        // if (isEmpty(data)) {
        //     fetchData()
        // }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Container>
            <AdaptableCard>
                <Tabs value={currentTab} onChange={(val) => onTabChange(val)}>
                    <TabList>
                        {Object.keys(settingsMenu).map((key) => (
                            <TabNav key={key} value={key}>
                                {settingsMenu[key].label}
                            </TabNav>
                        ))}
                    </TabList>
                </Tabs>
                <div className="px-4 py-6">
                    <Suspense fallback={<></>}>
                        {currentTab === 'profile' && (
                            <Profile data={data.profile} />
                        )}
                        {currentTab === 'password' && (
                            <Password data={data.loginHistory} />
                        )}
                        {currentTab === 'notification' && (
                            <NotificationSetting data={data.notification} />
                        )}
                        {currentTab === 'integration' && <Integration />}
                        {currentTab === 'billing' && <Billing />}
                    </Suspense>
                </div>
            </AdaptableCard>
        </Container>
    )
}

export default Settings
