// ==================== 审计日志相关类型 ====================

/**
 * 审计日志查询参数
 */
export interface AuditLogQueryParams {
    account_id?: string
    operation_type?: string
    resource?: string
    operator_id?: string
    start_time?: string
    end_time?: string
    limit?: number
    offset?: number
}

/**
 * 审计日志条目
 */
export interface AuditLogEntry {
    id: string
    account_id: string
    operation_type: string
    resource: string
    resource_id: string
    operator_id: string
    before_data?: Record<string, unknown>
    after_data?: Record<string, unknown>
    reason?: string
    ip_address?: string
    timestamp: string
    immutable: boolean
    created_at: string
}

/**
 * 审计日志列表响应
 */
export interface AuditLogListResponse {
    data: AuditLogEntry[]
    total: number
    limit: number
    offset: number
    has_more: boolean
    query_time: string
}
