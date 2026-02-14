import appsNavigation from './apps.navigation'
import merNavigation from './mer.navigation'
import agentNavigation from './agent.navigation'
// import authNavigationConfig from './auth.navigation.config'
import type { NavigationTree } from '@/@types/navigation'
import {
    APP_PREFIX_PATH,
    MER_PREFIX_PATH,
    AGENT_PREFIX_PATH,
} from '@/constants/route.constant'

/**
 * 根据当前路由路径获取对应的导航配置
 * 平台管理后台 (/app/*) 使用 appsNavigation
 * 商户后台 (/mer/*) 使用 merNavigation
 */
export const getNavigationConfig = (
    pathname: string,
    userAuthority: string[] = []
): NavigationTree[] => {
    if (pathname.startsWith(MER_PREFIX_PATH)) {
        return userAuthority.length > 0 ? merNavigation : []
    }
    if (pathname.startsWith(AGENT_PREFIX_PATH)) {
        return userAuthority.length > 0 ? agentNavigation : []
    }
    if (pathname.startsWith(APP_PREFIX_PATH)) {
        return appsNavigation
    }
    // 默认返回平台导航
    return appsNavigation
}

// 保留默认导出以兼容现有代码
const navigationConfig: NavigationTree[] = [
    ...appsNavigation,
    ...merNavigation,
    ...agentNavigation,
    // ...authNavigationConfig,
]

export default navigationConfig
