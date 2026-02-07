import { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthority from '@/utils/hooks/useAuthority'
import { PLATFORM_ROLES, MERCHANT_ROLES } from '@/constants/roles.constant'

type AuthorityGuardProps = PropsWithChildren<{
    userAuthority?: string[]
    authority?: string[]
}>

const AuthorityGuard = (props: AuthorityGuardProps) => {
    const { userAuthority = [], authority = [], children } = props
    const location = useLocation()

    const roleMatched = useAuthority(userAuthority, authority)

    if (!roleMatched) {
        // 如果用户没有任何角色，跳转到登录页
        if (userAuthority.length === 0) {
            return <Navigate to="/sign-in" replace />
        }

        // 根据用户角色跳转到对应的默认页面
        const hasPlatformRole = userAuthority.some(role => PLATFORM_ROLES.includes(role))
        const hasMerchantRole = userAuthority.some(role => MERCHANT_ROLES.includes(role))
        
        // 如果用户只有商户角色，跳转到商户后台
        if (hasMerchantRole && !hasPlatformRole) {
            return <Navigate to="/mer/dashboard" replace />
        }
        
        // 如果用户只有平台角色，跳转到平台后台
        if (hasPlatformRole && !hasMerchantRole) {
            return <Navigate to="/app/payment/dashboard" replace />
        }
        
        // 其他情况（可能同时拥有两种角色或其他角色）跳转到登录页
        return <Navigate to="/sign-in" replace />
    }

    return <>{children}</>
}

export default AuthorityGuard
