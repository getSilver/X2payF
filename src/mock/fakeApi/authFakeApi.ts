import { Server, Response } from 'miragejs'
import uniqueId from 'lodash/uniqueId'
import isEmpty from 'lodash/isEmpty'

export default function authFakeApi(server: Server, apiPrefix: string) {
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
