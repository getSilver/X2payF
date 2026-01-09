import ApiService from './ApiService'
import type { AuditLogQueryParams, AuditLogListResponse } from '@/@types/audit'

// ==================== API 路径配置 ====================

const AUDIT_API = {
    LOGS: '/api/v1/audit-logs',
}

// ==================== 审计日志查询 ====================

/**
 * 查询审计日志
 * @param params 查询参数
 * @returns 审计日志列表
 */
export async function apiQueryAuditLogs(params?: AuditLogQueryParams) {
    return ApiService.fetchData<AuditLogListResponse>({
        url: AUDIT_API.LOGS,
        method: 'get',
        params,
    })
}
