import { lazy } from 'react'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import type { Routes } from '@/@types/routes'
import { PLATFORM_ROLES} from '@/constants/roles.constant'

const appsRoute: Routes = [
    //订单管理面板路由
    {
        key: 'appsOrders.dashboard',
        path: `${APP_PREFIX_PATH}/payment/dashboard`,
        component: lazy(() => import('@/views/payment/Dashboard')),
        authority: PLATFORM_ROLES,
    },
    {
        key: 'appsOrders.payIn',
        path: `${APP_PREFIX_PATH}/payment`,
        component: lazy(() => import('@/views/payment/PayIn')),
        authority: PLATFORM_ROLES,
    },
    {
        key: 'appsOrders.orderDetails',
        path: `${APP_PREFIX_PATH}/payment/order-details/:orderId`,
        component: lazy(() => import('@/views/payment/PaymentDetails')),
        authority: PLATFORM_ROLES,
    },
    //商户管理面板路由
    {
        key: 'appsMerchants.dashboard',
        path: `${APP_PREFIX_PATH}/merchants/dashboard`,
        component: lazy(() => import('@/views/merchants/Dashboard')),
        authority: PLATFORM_ROLES,
    },
    {
        key: 'appsMerchants.mgmt',
        path: `${APP_PREFIX_PATH}/merchants/mgmt`,
        component: lazy(() => import('@/views/merchants/Customers')),
        authority: PLATFORM_ROLES,
    },
    {
        key: 'appsMerchants.merDetails',
        path: `${APP_PREFIX_PATH}/merchants/mer-details`,
        component: lazy(() => import('@/views/merchants/CustomerDetail')),
        authority: PLATFORM_ROLES,
        meta: {
            header: 'Customer Details',
            headerContainer: true,
        },
    },
    {
        key: 'appsMerchants.new',
        path: `${APP_PREFIX_PATH}/merchants/new`,
        component: lazy(() => import('@/views/merchants/CustomerNew')),
        authority: PLATFORM_ROLES,
        meta: {
            header: 'New Customer',
            headerContainer: true,
        },
    },

    //通道管理面板路由
    {
        key: 'appsChannel.dashboard',
        path: `${APP_PREFIX_PATH}/channel/dashboard`,
        component: lazy(() => import('@/views/channel/Dashboard')),
        authority: PLATFORM_ROLES,
    },
    //渠道设置
    {
        key: 'appsChannel.channel',
        path: `${APP_PREFIX_PATH}/channel/`,
        component: lazy(() => import('@/views/channel/ChannelList')),
        authority: PLATFORM_ROLES,
    },
    {
        key: 'appsChannel.channelSet',
        path: `${APP_PREFIX_PATH}/channel/channel-edit/:channelId`,
        component: lazy(() => import('@/views/channel/ChannelEdit')),
        authority: PLATFORM_ROLES,
    },
    {
        key: 'appsChannel.channelNew',
        path: `${APP_PREFIX_PATH}/channel/channel-new`,
        component: lazy(() => import('@/views/channel/ChannelNew')),
        authority: PLATFORM_ROLES,
    },

    //支付设置
    {
        key: 'appsChannel.payment',
        path: `${APP_PREFIX_PATH}/channel/payment`,
        component: lazy(() => import('@/views/channel/PaymentList')),
        authority: PLATFORM_ROLES,
    },
    {
        key: 'appsChannel.paymentSet',
        path: `${APP_PREFIX_PATH}/channel/payment-edit/:paymentId`,
        component: lazy(() => import('@/views/channel/PaymentEdit')),
        authority: PLATFORM_ROLES,
    },
    {
        key: 'appsChannel.paymentNew',
        path: `${APP_PREFIX_PATH}/channel/Payment-new`,
        component: lazy(() => import('@/views/channel/PaymentNew')),
        authority: PLATFORM_ROLES,
    },
    //财务面板路由
    {
        key: 'appsFinances.dashboard',
        path: `${APP_PREFIX_PATH}/finances/dashboard`,
        component: lazy(() => import('@/views/finances/Dashboard/Dashboard')),
        authority: PLATFORM_ROLES,
    },
    {
        key: 'appsFinances.withdraw',
        path: `${APP_PREFIX_PATH}/finances/withdraw`,
        component: lazy(() => import('@/views/finances/Withdraw')),
        authority: PLATFORM_ROLES,
    },
     {
        key: 'appsFinances.financialFlow',
        path: `${APP_PREFIX_PATH}/finances/financial-flow`,
        component: lazy(() => import('@/views/finances/FinancialFlow')),
        authority: PLATFORM_ROLES,
    },

    {
        key: 'appsAccount.settings',
        path: `/account/settings/:tab`,
        component: lazy(() => import('@/views/account/Settings')),
        authority: [...PLATFORM_ROLES],
        meta: {
            header: 'Settings',
            headerContainer: true,
        },
    },
    {
        key: 'appsPlatform.settings',
        path: `${APP_PREFIX_PATH}/platform/settings`,
        component: lazy(() => import('@/views/platform/Settings')),
        authority: PLATFORM_ROLES,
        meta: {
            header: 'Settings',
            headerContainer: true,
        },
    },
    {
        key: 'appsRisk.rules',
        path: `${APP_PREFIX_PATH}/risk/rules`,
        component: lazy(() => import('@/views/risk/Rules')),
        authority: PLATFORM_ROLES,
        meta: {
            header: '',
            headerContainer: true,
        },
    },
    


]

export default appsRoute
