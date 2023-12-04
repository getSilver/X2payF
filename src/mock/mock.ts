import { createServer } from 'miragejs'
import appConfig from '@/configs/app.config'

import { signInUserData } from './data/authData'
import { eventsData, mailData, crmDashboardData } from './data/crmData'
import { usersData, userDetailData } from './data/usersData'
import {
    productsData,
    ordersData,
    orderDetailsData,
    salesDashboardData,
} from './data/salesData'

import {
    authFakeApi,
    salesFakeApi,
    crmFakeApi
} from './fakeApi'

const { apiPrefix } = appConfig

export function mockServer({ environment = 'test' }) {
    return createServer({
        environment,
        seeds(server) {
            server.db.loadData({
                signInUserData,
                productsData,
                salesDashboardData,
                ordersData,
                orderDetailsData,
                crmDashboardData,
                eventsData,
                mailData,
                usersData,
                userDetailData
            })
        },
        routes() {
            this.urlPrefix = ''
            this.namespace = ''
            this.passthrough((request) => {
                const isExternal = request.url.startsWith('http')
                return isExternal
            })
            this.passthrough()

            authFakeApi(this, apiPrefix)
            salesFakeApi(this, apiPrefix)
            crmFakeApi(this, apiPrefix)
        },
    })
}
