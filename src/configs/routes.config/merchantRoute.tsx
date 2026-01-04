import { lazy } from 'react'
import { MER_PREFIX_PATH } from '@/constants/route.constant'
import type { Routes } from '@/@types/routes'

const merchantRoute: Routes = [
    //商户订单路由
    {
        key: 'merOrder.dashboard',
        path: `${MER_PREFIX_PATH}/dashboard`,
        component: lazy(() => import('@/views/merback/Dashboard')),
        authority: [],
    },
    {
        key: 'merOrders.payIn',
        path: `${MER_PREFIX_PATH}/pay-in`,
        component: lazy(() => import('@/views/merback/PayIn')),
        authority: [],
    },
    {
        key: 'merPayment.paymentDetails',
        path: `${MER_PREFIX_PATH}/merback/payment-details/:orderId`,
        component: lazy(() => import('@/views/merback/PaymentDetails')),
        authority: [],
    },
]

export default merchantRoute
