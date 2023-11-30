import { lazy } from 'react'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import type { Routes } from '@/@types/routes'
import { ADMIN, USER } from '@/constants/roles.constant'  //虚拟权限demo

const appsRoute: Routes = [
    //订单管理面板路由
    {
        key: 'appsOrders.dashboard',
        path: `${APP_PREFIX_PATH}/orders/dashboard`,
        component: lazy(() => import('@/views/orders/Dashboard')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsOrders.payIn',
        path: `${APP_PREFIX_PATH}/orders/pay-in`,
        component: lazy(() => import('@/views/orders/PayIn')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsOrders.payOut',
        path: `${APP_PREFIX_PATH}/orders/pay-out`,
        component: lazy(() => import('@/views/orders/PayOut')),
        authority: [ADMIN, USER],

    },
    {
        key: 'appsOrders.orderFlow',
        path: `${APP_PREFIX_PATH}/orders/order-flow`,
        component: lazy(() => import('@/views/orders/OrderFlow')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsOrders.orderDetails',
        path: `${APP_PREFIX_PATH}/orders/order-details/:orderId`,
        component: lazy(() => import('@/views/orders/OrderDetails')),
        authority: [ADMIN, USER],
    },
    //商户管理面板路由
    {
        key: 'appsMerchants.dashboard',
        path: `${APP_PREFIX_PATH}/merchants/dashboard`,
        component: lazy(() => import('@/views/merchants/Dashboard')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsMerchants.mgmt',
        path: `${APP_PREFIX_PATH}/merchants/mgmt`,
        component: lazy(() => import('@/views/merchants/Customers')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsMerchants.merDetails',
        path: `${APP_PREFIX_PATH}/merchants/mer-details`,
        component: lazy(() => import('@/views/merchants/CustomerDetail')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Customer Details',
            headerContainer: true,
        },
    },


    //通道管理面板路由
    {
        key: 'appsChannel.dashboard',
        path: `${APP_PREFIX_PATH}/channel/dashboard`,
        component: lazy(() => import('@/views/channel/Dashboard')),
        authority: [ADMIN, USER],
    },
    //通道渠道设置
    {
        key: 'appsChannel.channelSet',
        path: `${APP_PREFIX_PATH}/channel/channel-set`,
        component: lazy(() => import('@/views/channel/ChannelSet')),
        authority: [ADMIN, USER],
    },
    //支付产品设置
    {
        key: 'appsChannel.paymentSet',
        path: `${APP_PREFIX_PATH}/channel/payment-set`,
        component: lazy(() => import('@/views/order/PaymentSet')),
        authority: [ADMIN, USER],
    },
    //财务面板路由
    {
        key: 'appsFinances.dashboard',
        path: `${APP_PREFIX_PATH}/finances/dashboard`,
        component: lazy(() => import('@/views/finances/Dashboard')),
        authority: [ADMIN, USER],
    },
    {
        key: 'appsFinances.withdraw',
        path: `${APP_PREFIX_PATH}/finances/withdraw`,
        component: lazy(() => import('@/views/finances/Withdraw')),
        authority: [ADMIN, USER],
    },


    {
        key: 'appsAccount.settings',
        path: `/account/settings/:tab`,
        component: lazy(() => import('@/views/account/Settings')),
        authority: [ADMIN, USER],
        meta: {
            header: 'Settings',
            headerContainer: true,
        },
    },

]

export default appsRoute
