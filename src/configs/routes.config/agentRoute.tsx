import { lazy } from 'react'
import { AGENT_PREFIX_PATH } from '@/constants/route.constant'
import { AGENT } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const agentRoute: Routes = [
    {
        key: 'agent.dashboard',
        path: `${AGENT_PREFIX_PATH}/dashboard`,
        component: lazy(() => import('@/views/merback/AgentDashboard')),
        authority: [AGENT],
    },
]

export default agentRoute
