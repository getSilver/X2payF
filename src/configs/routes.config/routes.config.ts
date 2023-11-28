import authRoute from './authRoute'
import appsRoute from './appsRoute'
import merchantRoute from './merchantRoute'
// import agentRoute from './agentRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes = [
    ...appsRoute,
    ...merchantRoute,
    // ...agentRoute,
]