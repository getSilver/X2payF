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
        key: 'merOrders.payOut',
        path: `${MER_PREFIX_PATH}/pay-out`,
        component: lazy(() => import('@/views/merback/PayOut')),
        authority: [],
    },
    //商户财务路由
    {
        key: 'merfinances.dashboard',
        path: `${MER_PREFIX_PATH}/dashboard`,
        component: lazy(() => import('@/views/merback/Dashboard')),
        authority: [],
    },
    {
        key: 'merfinances.finFlow',
        path: `${MER_PREFIX_PATH}/fin-flow`,
        component: lazy(() => import('@/views/merback/FinFlow')),
        authority: [],
    },
    {
        key: 'merfinances.withdraw',
        path: `${MER_PREFIX_PATH}/withdraw`,
        component: lazy(() => import('@/views/merback/Withdraw')),
        authority: [],
    },
]

export default merchantRoute
