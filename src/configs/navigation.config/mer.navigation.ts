import { MER_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE,
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'
import { MERCHANT_ROLES } from '@/constants/roles.constant'

const merNavigation: NavigationTree[] = [
        {
            key: 'merOrder.dashboard',
            path: `${MER_PREFIX_PATH}/dashboard`,
            title: 'Dashboard',
            translateKey: 'nav.dashboard',
            icon: 'crm',
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
]
        


export default merNavigation
