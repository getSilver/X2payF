import type { Server } from 'miragejs'

export default function riskFakeApi(server: Server, apiPrefix: string) {
    const apiPrefixV1 = `${apiPrefix}/v1`

    server.get(`${apiPrefixV1}/risk/admin/rules`, (schema) => {
        return schema.db.riskRulesData
    })

    server.post(`${apiPrefixV1}/risk/admin/rules`, (schema, { requestBody }) => {
        const data = JSON.parse(requestBody)
        const next = {
            id: `rule-${Date.now()}`,
            created_by: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            priority: 0,
            status: 'active',
            description: '',
            ...data,
        }
        schema.db.riskRulesData.insert(next)
        return next
    })

    server.put(
        `${apiPrefixV1}/risk/admin/rules/:id`,
        (schema, request) => {
            const { id } = request.params
            const data = JSON.parse(request.requestBody)
            schema.db.riskRulesData.update(
                { id },
                { ...data, id, updated_at: new Date().toISOString() }
            )
            return schema.db.riskRulesData.find(id)
        }
    )

    server.del(
        `${apiPrefixV1}/risk/admin/rules/:id`,
        (schema, request) => {
            const { id } = request.params
            schema.db.riskRulesData.remove({ id })
            return true
        }
    )
}
