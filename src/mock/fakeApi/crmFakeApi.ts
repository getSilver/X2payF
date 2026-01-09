import wildCardSearch from '@/utils/wildCardSearch'
import sortBy, { Primer } from '@/utils/sortBy'
import paginate from '@/utils/paginate'
import type { Server } from 'miragejs'

export default function crmFakeApi(server: Server, apiPrefix: string) {
    const apiPrefixV1 = `${apiPrefix}/v1`
    const register = (
        method: 'get' | 'post' | 'put' | 'del',
        path: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: any
    ) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const serverAny = server as any
        serverAny[method](`${apiPrefix}${path}`, handler)
        serverAny[method](`${apiPrefixV1}${path}`, handler)
    }

    register('get', '/crm/dashboard', (schema: any) => {
        return schema.db.crmDashboardData[0]
    })

    register('get', '/crm/calendar', (schema: any) => schema.db.eventsData)

    register('get', '/crm/customers', (schema: any, { queryParams }: any) => {
        const pageIndex = parseInt(queryParams.pageIndex as string) || 1
        const pageSize = parseInt(queryParams.pageSize as string) || 10
        const sort = queryParams.sort ? JSON.parse(queryParams.sort as string) : { order: '', key: '' }
        const query = queryParams.query as string || ''
        const { order, key } = sort
        const users = schema.db.userDetailData
        const sanitizeUsers = users.filter((elm: any) => typeof elm !== 'function')
        let data = sanitizeUsers
        let total = users.length

        if (key && order) {
            if (key !== 'lastOnline') {
                data.sort(
                    sortBy(key, order === 'desc', (a) =>
                        (a as string).toUpperCase()
                    )
                )
            } else {
                data.sort(sortBy(key, order === 'desc', parseInt as Primer))
            }
        }

        if (query) {
            data = wildCardSearch(data, query)
            total = data.length
        }

        data = paginate(data, pageSize, pageIndex)

        const responseData = {
            data: data,
            total: total,
        }
        return responseData
    })

    register('get', '/crm/customers-statistic', () => {
        return {
            totalCustomers: {
                value: 2420,
                growShrink: 17.2,
            },
            activeCustomers: {
                value: 1897,
                growShrink: 32.7,
            },
            newCustomers: {
                value: 241,
                growShrink: -2.3,
            },
        }
    })

    register(
        'get',
        '/crm/mer-details',
        (schema: any, { queryParams }: any) => {
            const id = queryParams.id
            const user = schema.db.userDetailData.find(id)
            return user
        }
    )

    register(
        'del',
        '/crm/customer/delete',
        (schema: any, { requestBody }: any) => {
            const { id } = JSON.parse(requestBody)
            schema.db.userDetailData.remove({ id })
            return {}
        }
    )

    register('post', '/crm/customers', (schema: any, { requestBody }: any) => {
        const data = JSON.parse(requestBody)
        const newId = Math.max(...schema.db.userDetailData.map((user: any) => user.id)) + 1
        const newCustomer = {
            id: newId,
            name: data.name,
            email: data.email,
            img: '',
            role: 'customer',
            lastOnline: Date.now(),
            status: 'active',
            amount: 0,
            personalInfo: {
                location: data.location || '',
                agent: data.agent || '',
                birthday: data.birthday || '',
                phoneNumber: data.phoneNumber || '',
                facebook: '',
                twitter: '',
                pinterest: '',
                linkedIn: '',
            },
            orderHistory: [],
            paymentMethod: [],
            subscription: [],
        }
        schema.db.userDetailData.insert(newCustomer)
        return newCustomer
    })

    register('put', '/crm/customers', (schema: any, { requestBody }: any) => {
        const data = JSON.parse(requestBody)
        const { id } = data
        schema.db.userDetailData.update({ id }, data)
        return {}
    })

    register('get', '/crm/mails', (schema: any, { queryParams }: any) => {
        const { category } = queryParams
        let data = schema.db.mailData

        if (category === 'sentItem') {
            data = schema.db.mailData.where({ group: 'sentItem' })
        }

        if (category === 'deleted') {
            data = schema.db.mailData.where({ group: 'deleted' })
        }

        if (category === 'draft') {
            data = schema.db.mailData.where({ group: 'draft' })
        }

        if (category === 'starred') {
            data = schema.db.mailData.where({ starred: true })
        }

        if (
            category === 'work' ||
            category === 'private' ||
            category === 'important'
        ) {
            data = schema.db.mailData.where({ label: category })
        }

        return data
    })

    register('get', '/crm/mail', (schema: any, { queryParams }: any) => {
        const id = queryParams.id
        const mail = schema.db.mailData.find(id)
        return mail
    })
}
