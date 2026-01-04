import { createServer } from 'miragejs'
import appConfig from '@/configs/app.config'

import { signInUserData } from './data/authData'
import { eventsData, mailData, crmDashboardData } from './data/crmData'
import { chDashboardData } from './data/chData'
import { usersData, userDetailData } from './data/usersData'
import {
    productsData,
    ordersData,
    orderDetailsData,
    salesDashboardData,
} from './data/salesData'
import {
    settingData,
    settingIntergrationData,
    settingBillingData,
    invoiceData,
    logData,
    accountFormData,
} from './data/accountData'
import {
    portfolioData,
    walletsData,
    marketData,
    transactionHistoryData,
    cryptoDashboardData,
} from './data/cryptoData'

import {
    authFakeApi,
    salesFakeApi,
    crmFakeApi,
    cryptoFakeApi,
    channelFakeApi,
    accountFakeApi,
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
                chDashboardData,
                eventsData,
                mailData,
                usersData,
                userDetailData,
                settingData,
                settingIntergrationData,
                settingBillingData,
                invoiceData,
                logData,
                accountFormData,
                portfolioData,
                walletsData,
                marketData,
                transactionHistoryData,
                cryptoDashboardData,
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
            cryptoFakeApi(this, apiPrefix)
            channelFakeApi(this, apiPrefix)
            accountFakeApi(this, apiPrefix)
        },
    })
}
