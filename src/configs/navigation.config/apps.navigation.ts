import { APP_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'

import { PLATFORM_ROLES } from '@/constants/roles.constant'

const appsNavigation: NavigationTree[] = [
    //管理后台
    {
        key: 'apps',
        path: '',
        title: 'APPS',
        translateKey: 'nav.apps',
        icon: 'apps',
        type: NAV_ITEM_TYPE_TITLE,
        authority: PLATFORM_ROLES,
        subMenu: [
            //订单导航
            {
                key: 'apps.orders',
                path: '',
                title: 'Orders',
                translateKey: 'nav.appsOrders.orders',
                icon: 'sales',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: PLATFORM_ROLES,
                subMenu: [
                    //订单
                    {
                        key: 'appsOrder.dashboard',
                        path: `${APP_PREFIX_PATH}/payment/dashboard`,
                        title: 'Dashboard',
                        translateKey: 'nav.appsOrders.dashboard',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: PLATFORM_ROLES,
                        subMenu: [],
                    },
                    {
                        key: 'appsOrders.payment',
                        path: `${APP_PREFIX_PATH}/payment`,
                        title: 'Pay In',
                        translateKey: 'nav.appsOrders.payIn',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: PLATFORM_ROLES,
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
                authority: PLATFORM_ROLES,
                subMenu: [
                    {
                        key: 'appsMerchants.dashboard',
                        path: `${APP_PREFIX_PATH}/merchants/dashboard`,
                        title: 'Dashboard',
                        translateKey: 'nav.appsMer.dashboard',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: PLATFORM_ROLES,
                        subMenu: [],
                    },
                    {
                        key: 'appsMerchants.mgmt',
                        path: `${APP_PREFIX_PATH}/merchants/mgmt`,
                        title: 'Merchants',
                        translateKey: 'nav.appsMer.mgmt',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: PLATFORM_ROLES,
                        subMenu: [],
                    },
                    {
                        key: 'appsMerchants.merDetails',
                        path: `${APP_PREFIX_PATH}/merchants/mer-details?id=8`,
                        title: 'Merchants Details',
                        translateKey: 'nav.appsMer.merDetails',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: PLATFORM_ROLES,
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
                authority: PLATFORM_ROLES,
                subMenu: [
                    {
                        key: 'appsChannel.dashboard',
                        path: `${APP_PREFIX_PATH}/channel/dashboard`,
                        title: 'Dashboard',
                        translateKey: 'nav.appsChannel.dashboard',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: PLATFORM_ROLES,
                        subMenu: [],
                    },
                    {
                        key: 'appsChannel.channel',
                        path: `${APP_PREFIX_PATH}/channel/`,
                        title: 'Channel',
                        translateKey: 'nav.appsChannel.mgmt',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: PLATFORM_ROLES,
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
                authority: PLATFORM_ROLES,
                subMenu: [
                    {
                        key: 'appsFinances.dashboard',
                        path: `${APP_PREFIX_PATH}/finances/dashboard`,
                        title: 'Dashboard',
                        translateKey: 'nav.appsFinances.dashboard',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: PLATFORM_ROLES,
                        subMenu: [],
                    },
                    {
                        key: 'appsFinances.financialFlow',
                        path: `${APP_PREFIX_PATH}/finances/financial-flow`,
                        title: 'Financial Flow',
                        translateKey: 'nav.appsFinances.financialFlow',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: PLATFORM_ROLES,
                        subMenu: [],
                    },
                    {
                        key: 'appsFinances.withdraw',
                        path: `${APP_PREFIX_PATH}/finances/withdraw`,
                        title: 'withdraw',
                        translateKey: 'nav.appsFinances.withdraw',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: PLATFORM_ROLES,
                        subMenu: [],
                    },
                    {
                        key: 'appsFinances.profitSharing',
                        path: `${APP_PREFIX_PATH}/finances/profit-sharing`,
                        title: 'Profit Sharing',
                        translateKey: 'nav.appsFinances.profitSharing',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: PLATFORM_ROLES,
                        subMenu: [],
                    },
                    {
                        key: 'appsFinances.settlement',
                        path: `${APP_PREFIX_PATH}/finances/settlement`,
                        title: 'Settlement',
                        translateKey: 'nav.appsFinances.settlement',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: PLATFORM_ROLES,
                        subMenu: [],
                    },
                ],
            },
            //平台设置导航
            {
                key: 'apps.platform',
                path: '',
                title: 'Platform',
                translateKey: 'nav.appsPlatform.platform',
                icon: 'account',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: PLATFORM_ROLES,
                subMenu: [
                    {
                        key: 'appsPlatform.settings',
                        path: `${APP_PREFIX_PATH}/platform/settings`,
                        title: 'Settings',
                        translateKey: 'nav.appsPlatform.settings',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: PLATFORM_ROLES,
                        subMenu: [],
                    },
                    // {
                    //     key: 'appsAccount.invoice',
                    //     path: `${APP_PREFIX_PATH}/account/invoice/36223`,
                    //     title: 'Invoice',
                    //     translateKey: 'nav.appsAccount.invoice',
                    //     icon: '',
                    //     type: NAV_ITEM_TYPE_ITEM,
                    //     authority: PLATFORM_ROLES,
                    //     subMenu: [],
                    // },
                    // {
                    //     key: 'appsAccount.activityLog',
                    //     path: `${APP_PREFIX_PATH}/account/activity-log`,
                    //     title: 'Activity Log',
                    //     translateKey: 'nav.appsAccount.activityLog',
                    //     icon: '',
                    //     type: NAV_ITEM_TYPE_ITEM,
                    //     authority: PLATFORM_ROLES,
                    //     subMenu: [],
                    // },
                    // {
                    //     key: 'appsAccount.kycForm',
                    //     path: `${APP_PREFIX_PATH}/account/kyc-form`,
                    //     title: 'KYC Form',
                    //     translateKey: 'nav.appsAccount.kycForm',
                    //     icon: '',
                    //     type: NAV_ITEM_TYPE_ITEM,
                    //     authority: PLATFORM_ROLES,
                    //     subMenu: [],
                    // },
                ],
            },
            //风控导航
            {
                key: 'apps.risk',
                path: '',
                title: 'Risk',
                translateKey: 'nav.appsRisk.risk',
                icon: 'risk',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: PLATFORM_ROLES,
                subMenu: [
                    {
                        key: 'appsRisk.rules',
                        path: `${APP_PREFIX_PATH}/risk/rules`,
                        title: 'Rules',
                        translateKey: 'nav.appsRisk.rules',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: PLATFORM_ROLES,
                        subMenu: [],
                    },
                ],
            },
     
        ],

    },
]

export default appsNavigation
