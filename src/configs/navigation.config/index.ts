import appsNavigation from './apps.navigation'
import merNavigation from './mer.navigation'
// import pagesNavigationConfig from './agent.navigation.config'
// import authNavigationConfig from './auth.navigation.config'
import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    ...appsNavigation,
    ...merNavigation,
    // ...agentNavigationConfig,
    // ...authNavigationConfig,
]

export default navigationConfig
