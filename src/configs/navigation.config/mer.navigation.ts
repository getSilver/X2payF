import { MER_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'

import { MERCHANT_ROLES, BUSINESS_ROLES } from '@/constants/roles.constant'

const merNavigation: NavigationTree[] = [
    //商户后台
    {
        key: 'mer',
        path: '',
        title: 'Merchants',
        translateKey: 'nav.merchants',
        icon: 'crm',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [...MERCHANT_ROLES, ...BUSINESS_ROLES],
        subMenu: [
            {
                key: 'mer.merchants',
                path: '',
                title: 'Merchants',
                translateKey: 'nav.merMerchants.merchants',
                icon: 'crm',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [...MERCHANT_ROLES, ...BUSINESS_ROLES],
                subMenu: [
                    //订单
                    {
                        key: 'merOrder.dashboard',
                        path: `${MER_PREFIX_PATH}/dashboard`,
                        title: 'Dashboard',
                        translateKey: 'nav.merOrder.dashboard',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: MERCHANT_ROLES,
                        subMenu: [],
                    },
                    {
                        key: 'merOrders.payIn',
                        path: `${MER_PREFIX_PATH}/payment`,
                        title: 'Finances Flow',
                        translateKey: 'nav.merOrders.PayIn',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: MERCHANT_ROLES,
                        subMenu: [],
                    },
                    {
                        key: 'merAgents.dashboard',
                        path: `${MER_PREFIX_PATH}/agent-dashboard`,
                        title: 'Agent Dashboard',
                        translateKey: 'nav.merAgents.dashboard',
                        icon: '',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [...MERCHANT_ROLES, ...BUSINESS_ROLES],
                        subMenu: [],
                    },
                    
                ],
            },
            // //商户财务
            // {
            //     key: 'mer.finances',
            //     path: ``,
            //     title: 'Finances',
            //     translateKey: 'nav.merfinances.finances',
            //     icon: 'wallet',
            //     type: NAV_ITEM_TYPE_COLLAPSE,
            //     authority: MERCHANT_ROLES,
            //     subMenu: [
            //         {
            //             key: 'merfinances.dashboard',
            //             path: `${MER_PREFIX_PATH}/dashboard`,
            //             title: 'Dashboard',
            //             translateKey: 'nav.appsFinances.dashboard',
            //             icon: '',
            //             type: NAV_ITEM_TYPE_ITEM,
            //             authority: MERCHANT_ROLES,
            //             subMenu: [],
            //         },
            //         {
            //             key: 'merfinances.finFlow',
            //             path: `${MER_PREFIX_PATH}/fin-flow`,
            //             title: 'Finances Flow',
            //             translateKey: 'nav.merFinances.finFlow',
            //             icon: '',
            //             type: NAV_ITEM_TYPE_ITEM,
            //             authority: MERCHANT_ROLES,
            //             subMenu: [],
            //         },
            //         {
            //             key: 'merfinances.withdraw',
            //             path: `${MER_PREFIX_PATH}/withdraw`,
            //             title: 'Withdraw',
            //             translateKey: 'nav.merFinances.withdraw',
            //             icon: '',
            //             type: NAV_ITEM_TYPE_ITEM,
            //             authority: MERCHANT_ROLES,
            //             subMenu: [],
            //         },

            //     ],
            // },
        ],

    },
]

export default merNavigation
