import { AGENT_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'
import { AGENT } from '@/constants/roles.constant'

const agentNavigation: NavigationTree[] = [
 
            {
                key: 'agent',
                path: `${AGENT_PREFIX_PATH}/dashboard`,
                title: 'Agent Dashboard',
                translateKey: 'nav.merAgents.dashboard',
                icon: 'crm',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [AGENT],
                subMenu: [],
            },
        ]

export default agentNavigation
