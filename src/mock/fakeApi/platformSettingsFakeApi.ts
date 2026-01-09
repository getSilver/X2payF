import type { Server } from 'miragejs'

type Handler = (schema: any, request: any) => unknown

export default function platformSettingsFakeApi(server: Server, apiPrefix: string) {
    const apiPrefixV1 = `${apiPrefix}/v1`
    const register = (method: 'get' | 'post' | 'put' | 'del', path: string, handler: Handler) => {
        const serverAny = server as any
        serverAny[method](`${apiPrefixV1}${path}`, handler)
    }

    register('get', '/platform-settings/currencies', (schema) => {
        return schema.db.platformCurrenciesData
    })

    register('post', '/platform-settings/currencies', (schema, { requestBody }) => {
        const data = JSON.parse(requestBody)
        const id = data.id || `cur-${Date.now()}`
        const next = { ...data, id }
        schema.db.platformCurrenciesData.insert(next)
        return next
    })

    register('put', '/platform-settings/currencies/:id', (schema, request) => {
        const { id } = request.params
        const data = JSON.parse(request.requestBody)
        schema.db.platformCurrenciesData.update({ id }, { ...data, id })
        return schema.db.platformCurrenciesData.find(id)
    })

    register('del', '/platform-settings/currencies/:id', (schema, request) => {
        const { id } = request.params
        schema.db.platformCurrenciesData.remove({ id })
        return true
    })

    register('get', '/platform-settings/timezones', (schema) => {
        return schema.db.platformTimezonesData
    })

    register('post', '/platform-settings/timezones', (schema, { requestBody }) => {
        const data = JSON.parse(requestBody)
        const id = data.id || `tz-${Date.now()}`
        const next = { ...data, id }
        schema.db.platformTimezonesData.insert(next)
        return next
    })

    register('put', '/platform-settings/timezones/:id', (schema, request) => {
        const { id } = request.params
        const data = JSON.parse(request.requestBody)
        schema.db.platformTimezonesData.update({ id }, { ...data, id })
        return schema.db.platformTimezonesData.find(id)
    })

    register('del', '/platform-settings/timezones/:id', (schema, request) => {
        const { id } = request.params
        schema.db.platformTimezonesData.remove({ id })
        return true
    })

    register('get', '/platform-settings/associations', (schema) => {
        return schema.db.platformAssociationsData
    })

    register('post', '/platform-settings/associations', (schema, { requestBody }) => {
        const data = JSON.parse(requestBody)
        const id = data.id || `assoc-${Date.now()}`
        const next = { ...data, id }
        schema.db.platformAssociationsData.insert(next)
        return next
    })

    register('put', '/platform-settings/associations/:id', (schema, request) => {
        const { id } = request.params
        const data = JSON.parse(request.requestBody)
        schema.db.platformAssociationsData.update({ id }, { ...data, id })
        return schema.db.platformAssociationsData.find(id)
    })

    register('del', '/platform-settings/associations/:id', (schema, request) => {
        const { id } = request.params
        schema.db.platformAssociationsData.remove({ id })
        return true
    })
}
