// ==================== 风控相关类型 ====================

/**
 * 风险等级
 */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

/**
 * 商户风控查询参数
 */
export interface MerchantRiskQueryParams {
    merchant_id: string
    transaction_id?: string
    application_id?: string
    start_time?: string
    end_time?: string
    limit?: number
    offset?: number
}

/**
 * 商户风控查询响应
 */
export interface MerchantRiskQueryResponse {
    transaction_id: string
    risk_score: number
    risk_level: RiskLevel
    disposition: string
    block_reason?: string
    triggered_rules?: string[]
    processed_at: string
    review_status?: string
    review_comment?: string
}

/**
 * 商户申诉请求
 */
export interface MerchantAppealRequest {
    transaction_id: string
    merchant_id: string
    appeal_reason: string
    description?: string
    contact_info?: string
}

/**
 * 商户申诉响应
 */
export interface MerchantAppealResponse {
    appeal_id: string
    transaction_id: string
    status: string
    submitted_at: string
    message: string
}

/**
 * 申诉状态
 */
export interface AppealStatus {
    appeal_id: string
    status: string
    reviewer_id?: string
    review_comment?: string
    reviewed_at?: string
    created_at: string
}

/**
 * 申诉记录
 */
export interface AppealRecord {
    appeal_id: string
    transaction_id: string
    merchant_id: string
    appeal_reason: string
    description?: string
    status: string
    reviewer_id?: string
    review_comment?: string
    submitted_at: string
    reviewed_at?: string
}

/**
 * 商户风险等级响应
 */
export interface MerchantRiskLevelResponse {
    merchant_id: string
    current_risk_level: RiskLevel
    previous_risk_level: RiskLevel
    risk_trend: string
    recent_risk_events: number
    last_risk_score: number
    updated_at: string
    recommendations: string[]
}

/**
 * 风险等级历史
 */
export interface RiskLevelHistory {
    id: string
    merchant_id: string
    old_level: RiskLevel
    new_level: RiskLevel
    reason: string
    changed_at: string
}

/**
 * 优化建议
 */
export interface OptimizationSuggestion {
    category: string
    title: string
    description: string
    priority: string
}

/**
 * 风控帮助信息
 */
export interface RiskHelpResponse {
    risk_rules: RiskRuleInfo[]
    optimization_tips: OptimizationTip[]
    contact_info: ContactInfo
}

/**
 * 风控规则信息
 */
export interface RiskRuleInfo {
    rule_type: string
    description: string
    threshold: string
    suggestion: string
}

/**
 * 优化提示
 */
export interface OptimizationTip {
    category: string
    title: string
    description: string
    priority: string
}

/**
 * 联系信息
 */
export interface ContactInfo {
    support_email: string
    support_phone: string
    working_hours: string
}

// ==================== 风控规则管理（管理员） ====================

/**
 * 风控规则请求
 */
export interface RiskRuleRequest {
    name: string
    type: string
    conditions: Record<string, unknown>
    actions: Record<string, unknown>
    priority?: number
    status?: string
    description?: string
}

/**
 * 风控规则响应
 */
export interface RiskRuleResponse {
    id: string
    name: string
    type: string
    conditions: Record<string, unknown>
    actions: Record<string, unknown>
    priority: number
    status: string
    description: string
    created_by: string
    created_at: string
    updated_at: string
}

/**
 * 风控规则列表查询参数
 */
export interface RiskRuleListParams {
    type?: string
    status?: string
    created_by?: string
    start_time?: string
    end_time?: string
    limit?: number
    offset?: number
}
