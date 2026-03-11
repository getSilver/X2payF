import { Server, Response } from 'miragejs'
import uniqueId from 'lodash/uniqueId'
import isEmpty from 'lodash/isEmpty'

export default function authFakeApi(server: Server, apiPrefix: string) {
    const mfaFactors: Array<{
        id: string
        factor_type: 'totp' | 'email'
        status: 'verified'
        friendly_name: string
        email?: string
        created_at: string
        last_used_at?: string
    }> = []

    // 新版登录 API（匹配后端 /api/v1/auth/login）
    server.post(`${apiPrefix}/v1/auth/login`, (schema, { requestBody }) => {
        const { username, password } = JSON.parse(requestBody)
        const user = schema.db.signInUserData.findBy({
            accountUserName: username,
            password,
        })
        console.log('user', user)
        if (user) {
            const { avatar, userName, email, authority } = user
            // 返回新格式的响应
            return {
                requires_mfa: false,
                session: {
                    session_token: 'wVYrxaeNa9OxdnULvde1Au5m5w63',
                    user_id: user.id || 'user_1',
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                },
                message: '登录成功',
            }
        }
        return new Response(
            401,
            { some: 'header' },
            { message: '用户名或密码错误' }
        )
    })

    // 新版登出 API
    server.post(`${apiPrefix}/v1/auth/logout`, () => {
        return { message: '登出成功' }
    })

    // 新版会话验证 API
    server.get(`${apiPrefix}/v1/auth/session`, () => {
        return {
            valid: true,
            user_id: 'user_1',
            username: 'admin',
            email: 'admin@example.com',
        }
    })

    server.post(`${apiPrefix}/v1/auth/change-password`, () => {
        return { message: '密码修改成功' }
    })

    server.get(`${apiPrefix}/v1/auth/mfa/factors`, () => {
        return { data: mfaFactors }
    })

    server.post(`${apiPrefix}/v1/auth/mfa/totp/enroll`, () => {
        return {
            data: {
                factor_id: 'mfa_factor_totp',
                secret: 'MOCKSECRET123456',
                qr_code_uri: 'otpauth://totp/X2Pay:demo?secret=MOCKSECRET123456&issuer=X2Pay',
                friendly_name: '我的验证器',
            },
        }
    })

    server.post(`${apiPrefix}/v1/auth/mfa/totp/verify-enrollment`, () => {
        const exists = mfaFactors.some((factor) => factor.id === 'mfa_factor_totp')
        if (!exists) {
            mfaFactors.push({
                id: 'mfa_factor_totp',
                factor_type: 'totp',
                status: 'verified',
                friendly_name: '我的验证器',
                created_at: new Date().toISOString(),
            })
        }
        return { data: { message: 'TOTP 绑定验证成功', factor_id: 'mfa_factor_totp' } }
    })

    server.post(`${apiPrefix}/v1/auth/mfa/email/enroll`, (schema, { requestBody }) => {
        const { email } = JSON.parse(requestBody)
        const id = uniqueId('mfa_email_')
        mfaFactors.push({
            id,
            factor_type: 'email',
            status: 'verified',
            friendly_name: `邮箱 ${email}`,
            email,
            created_at: new Date().toISOString(),
        })
        return { data: { id, factor_type: 'email', status: 'verified', friendly_name: `邮箱 ${email}`, email, created_at: new Date().toISOString() } }
    })

    server.delete(`${apiPrefix}/v1/auth/mfa/factors/:id`, (schema, request) => {
        const factorId = request.params.id
        const index = mfaFactors.findIndex((factor) => factor.id === factorId)
        if (index >= 0) {
            mfaFactors.splice(index, 1)
        }
        return { data: { message: 'MFA 因子解绑成功', factor_id: factorId } }
    })

    // 兼容旧版登录 API
    server.post(`${apiPrefix}/sign-in`, (schema, { requestBody }) => {
        const { userName, password } = JSON.parse(requestBody)
        const user = schema.db.signInUserData.findBy({
            accountUserName: userName,
            password,
        })
        console.log('user', user)
        if (user) {
            const { avatar, userName, email, authority } = user
            return {
                user: { avatar, userName, email, authority },
                token: 'wVYrxaeNa9OxdnULvde1Au5m5w63',
            }
        }
        return new Response(
            401,
            { some: 'header' },
            { message: 'Invalid email or password!' }
        )
    })

    server.post(`${apiPrefix}/sign-out`, () => {
        return true
    })

    server.post(`${apiPrefix}/sign-up`, (schema, { requestBody }) => {
        const { userName, password, email } = JSON.parse(requestBody)
        const userExist = schema.db.signInUserData.findBy({
            accountUserName: userName,
        })
        const emailUsed = schema.db.signInUserData.findBy({ email })
        const newUser = {
            avatar: '/img/avatars/thumb-1.jpg',
            userName,
            email,
            authority: ['admin', 'user'],
        }
        if (!isEmpty(userExist)) {
            const errors = [
                { message: '', domain: 'global', reason: 'invalid' },
            ]
            return new Response(
                400,
                { some: 'header' },
                { errors, message: 'User already exist!' }
            )
        }

        if (!isEmpty(emailUsed)) {
            const errors = [
                { message: '', domain: 'global', reason: 'invalid' },
            ]
            return new Response(
                400,
                { some: 'header' },
                { errors, message: 'Email already used' }
            )
        }

        schema.db.signInUserData.insert({
            ...newUser,
            ...{ id: uniqueId('user_'), password, accountUserName: userName },
        })
        return {
            user: newUser,
            token: 'wVYrxaeNa9OxdnULvde1Au5m5w63',
        }
    })

    server.post(`${apiPrefix}/forgot-password`, () => {
        return true
    })

    server.post(`${apiPrefix}/reset-password`, () => {
        return true
    })
}
