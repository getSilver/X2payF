import { lazy } from 'react'
import { LAYOUT_TYPE_BLANK } from '@/constants/theme.constant'
import type { Routes } from '@/@types/routes'

const cashierRoute: Routes = [
    {
        key: 'cashier.page',
        path: '/cashier/:token',
        component: lazy(() => import('@/views/cashier')),
        authority: [],
        meta: {
            layout: LAYOUT_TYPE_BLANK,
        },
    },
]

export default cashierRoute
