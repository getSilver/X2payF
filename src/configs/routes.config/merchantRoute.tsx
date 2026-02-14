import { lazy } from 'react'
import { MER_PREFIX_PATH } from '@/constants/route.constant'
import type { Routes } from '@/@types/routes'
import { MERCHANT_ROLES } from '@/constants/roles.constant'

const merchantRoute: Routes = [
    //商户订单路由
    {
        key: 'merOrder.dashboard',
        path: `${MER_PREFIX_PATH}/dashboard`,
        component: lazy(() => import('@/views/merback/Dashboard')),
        authority: MERCHANT_ROLES,
    },
    {
        key: 'merOrders.payIn',
        path: `${MER_PREFIX_PATH}/payment`,
        component: lazy(() => import('@/views/merback/PayIn')),
        authority: MERCHANT_ROLES,
    },
    {
        key: 'merPayment.paymentDetails',
        path: `${MER_PREFIX_PATH}/merback/payment-details/:orderId`,
        component: lazy(() => import('@/views/merback/PaymentDetails')),
        authority: MERCHANT_ROLES,
    },

    {
        key: 'merAccount.settings',
        path: `${MER_PREFIX_PATH}/account/settings/:tab`,  // /mer/account/settings/:tab
        component: lazy(() => import('@/views/account/Settings')),
        authority: MERCHANT_ROLES,
        meta: {
            header: 'Settings',
            headerContainer: true,
        },
    }


]

export default merchantRoute
