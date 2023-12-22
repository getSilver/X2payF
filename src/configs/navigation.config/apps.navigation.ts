import { APP_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'

import { ADMIN, USER } from '@/constants/roles.constant'//模拟权限演示

const appsNavigation: NavigationTree[] = [
    //管理后台
    {
        key: 'apps',
        path: '',
        title: 'APPS',
        translateKey: 'nav.apps',
        icon: 'apps',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        subMenu: [
            //订单导航
            {
                key: 'apps.orders',
                path: '',
                title: 'Orders',
                translateKey: 'nav.appsOrders.orders',
                icon: 'sales',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                subMenu: [
                    //订单
                    {
                        key: 'appsOrder.dashboard',
                        path: `${APP_PREFIX_PATH}/orders/dashboard`,
                        title: 'Dashboard',
                        translateKey: 'nav.appsOrders.dashboard',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                    {
                        key: 'appsOrders.payIn',
                        path: `${APP_PREFIX_PATH}/orders/pay-in`,
                        title: 'Pay In',
                        translateKey: 'nav.appsOrders.payIn',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                    {
                        key: 'appsOrders.payOut',
                        path: `${APP_PREFIX_PATH}/orders/pay-out`,
                        title: 'Pay Out',
                        translateKey: 'nav.appsOrders.payOut',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                ],
            },
            //商户导航
            {
                key: 'apps.merchants',
                path: ``,
                title: 'Mer Mgmt',
                translateKey: 'nav.appsMer.merchants',
                icon: 'crm',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                subMenu: [
                    {
                        key: 'appsMerchants.dashboard',
                        path: `${APP_PREFIX_PATH}/merchants/dashboard`,
                        title: 'Dashboard',
                        translateKey: 'nav.appsMer.dashboard',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                    {
                        key: 'appsMerchants.mgmt',
                        path: `${APP_PREFIX_PATH}/merchants/mgmt`,
                        title: 'Merchants',
                        translateKey: 'nav.appsMer.mgmt',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                    {
                        key: 'appsMerchants.merDetails',
                        path: `${APP_PREFIX_PATH}/merchants/mer-details?id=8`,
                        title: 'Merchants Details',
                        translateKey: 'nav.appsMer.merDetails',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                ],
            },
            //通道导航
            {
                key: 'apps.channel',
                path: ``,
                title: 'Channel',
                translateKey: 'nav.appsChannel.channel',
                icon: 'channel',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                subMenu: [
                    {
                        key: 'appsChannel.dashboard',
                        path: `${APP_PREFIX_PATH}/channel/dashboard`,
                        title: 'Dashboard',
                        translateKey: 'nav.appsChannel.dashboard',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                    {
                        key: 'appsChannel.payment',
                        path: `${APP_PREFIX_PATH}/channel/payment`,
                        title: 'Payment Set',
                        translateKey: 'nav.appsChannel.paymentSet',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                    {
                        key: 'appsChannel.channel',
                        path: `${APP_PREFIX_PATH}/channel/`,
                        title: 'Channel',
                        translateKey: 'nav.appsChannel.mgmt',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },

                ],
            },
            // 财务导航
            {
                key: 'apps.finances',
                path: ``,
                title: 'Finances',
                translateKey: 'nav.appsFinances.finances',
                icon: 'wallet',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                subMenu: [
                    {
                        key: 'appsFinances.dashboard',
                        path: `${APP_PREFIX_PATH}/finances/dashboard`,
                        title: 'Dashboard',
                        translateKey: 'nav.appsFinances.dashboard',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                    {
                        key: 'appsFinances.financialFlow',
                        path: `${APP_PREFIX_PATH}/finances/financial-flow`,
                        title: 'Financial Flow',
                        translateKey: 'nav.appsFinances.financialFlow',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                    {
                        key: 'appsFinances.withdraw',
                        path: `${APP_PREFIX_PATH}/finances/withdraw`,
                        title: 'withdraw',
                        translateKey: 'nav.appsFinances.withdraw',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                ],
            },
        ],

    },
]

export default appsNavigation
