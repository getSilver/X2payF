import ApiService from './ApiService'
import type {
    MerchantRiskQueryParams,
    MerchantRiskQueryResponse,
    MerchantAppealRequest,
    MerchantAppealResponse,
    AppealStatus,
    AppealRecord,
    MerchantRiskLevelResponse,
    RiskLevelHistory,
    OptimizationSuggestion,
    RiskHelpResponse,
    RiskRuleRequest,
    RiskRuleResponse,
    RiskRuleListParams,
} from '@/@types/risk'

// ==================== API 路径配置 ====================

const RISK_API = {
    // 商户风控查询
    MERCHANT_QUERY: '/v1/risk/merchant/query',
    MERCHANT_APPEAL: '/v1/risk/merchant/appeal',
    MERCHANT_HELP: '/v1/risk/merchant/help',
    // 申诉管理
    APPEAL_STATUS: (id: string) => `/v1/risk/merchant/appeal/${id}/status`,
    MERCHANT_APPEALS: (merchantId: string) =>
        `/v1/risk/merchant/${merchantId}/appeals`,
    // 风险等级
    MERCHANT_RISK_LEVEL: (merchantId: string) =>
        `/v1/risk/merchant/${merchantId}/level`,
    MERCHANT_RISK_LEVEL_HISTORY: (merchantId: string) =>
        `/v1/risk/merchant/${merchantId}/level/history`,
    MERCHANT_SUGGESTIONS: (merchantId: string) =>
        `/v1/risk/merchant/${merchantId}/suggestions`,
    // 管理员规则管理
    ADMIN_RULES: '/v1/risk/admin/rules',
    ADMIN_RULE_DETAIL: (id: string) => `/v1/risk/admin/rules/${id}`,
}

// ==================== 商户风控查询 ====================

/**
 * 查询商户交易风控状态
 * @param params 查询参数
 * @returns 风控状态列表
 */
export async function apiQueryMerchantRiskStatus(
    params: MerchantRiskQueryParams
) {
    return ApiService.fetchData<MerchantRiskQueryResponse[]>({
        url: RISK_API.MERCHANT_QUERY,
        method: 'get',
        params,
    })
}

/**
 * 提交商户申诉
 * @param data 申诉请求参数
 * @returns 申诉响应
 */
export async function apiSubmitMerchantAppeal(data: MerchantAppealRequest) {
    return ApiService.fetchData<MerchantAppealResponse, MerchantAppealRequest>({
        url: RISK_API.MERCHANT_APPEAL,
        method: 'post',
        data,
    })
}

/**
 * 获取风控帮助信息
 * @returns 风控帮助信息
 */
export async function apiGetRiskHelp() {
    return ApiService.fetchData<RiskHelpResponse>({
        url: RISK_API.MERCHANT_HELP,
        method: 'get',
    })
}

// ==================== 申诉管理 ====================

/**
 * 获取申诉状态
 * @param appealId 申诉 ID
 * @returns 申诉状态
 */
export async function apiGetAppealStatus(appealId: string) {
    return ApiService.fetchData<AppealStatus>({
        url: RISK_API.APPEAL_STATUS(appealId),
        method: 'get',
    })
}

/**
 * 获取商户申诉历史
 * @param merchantId 商户 ID
 * @param limit 限制数量
 * @param offset 偏移量
 * @returns 申诉记录列表
 */
export async function apiGetAppealHistory(
    merchantId: string,
    limit?: number,
    offset?: number
) {
    return ApiService.fetchData<AppealRecord[]>({
        url: RISK_API.MERCHANT_APPEALS(merchantId),
        method: 'get',
        params: { limit, offset },
    })
}

// ==================== 风险等级 ====================

/**
 * 获取商户风险等级
 * @param merchantId 商户 ID
 * @returns 商户风险等级信息
 */
export async function apiGetMerchantRiskLevel(merchantId: string) {
    return ApiService.fetchData<MerchantRiskLevelResponse>({
        url: RISK_API.MERCHANT_RISK_LEVEL(merchantId),
        method: 'get',
    })
}

/**
 * 获取商户风险等级历史
 * @param merchantId 商户 ID
 * @param limit 限制数量
 * @returns 风险等级历史列表
 */
export async function apiGetMerchantRiskLevelHistory(
    merchantId: string,
    limit?: number
) {
    return ApiService.fetchData<RiskLevelHistory[]>({
        url: RISK_API.MERCHANT_RISK_LEVEL_HISTORY(merchantId),
        method: 'get',
        params: { limit },
    })
}

/**
 * 获取商户优化建议
 * @param merchantId 商户 ID
 * @returns 优化建议列表
 */
export async function apiGetMerchantOptimizationSuggestions(merchantId: string) {
    return ApiService.fetchData<OptimizationSuggestion[]>({
        url: RISK_API.MERCHANT_SUGGESTIONS(merchantId),
        method: 'get',
    })
}

// ==================== 管理员规则管理 ====================

/**
 * 创建风控规则
 * @param data 规则请求参数
 * @returns 规则响应
 */
export async function apiCreateRiskRule(data: RiskRuleRequest) {
    return ApiService.fetchData<RiskRuleResponse, RiskRuleRequest>({
        url: RISK_API.ADMIN_RULES,
        method: 'post',
        data,
    })
}

/**
 * 获取风控规则
 * @param ruleId 规则 ID
 * @returns 规则详情
 */
export async function apiGetRiskRule(ruleId: string) {
    return ApiService.fetchData<RiskRuleResponse>({
        url: RISK_API.ADMIN_RULE_DETAIL(ruleId),
        method: 'get',
    })
}

/**
 * 更新风控规则
 * @param ruleId 规则 ID
 * @param data 规则请求参数
 * @returns 规则响应
 */
export async function apiUpdateRiskRule(ruleId: string, data: RiskRuleRequest) {
    return ApiService.fetchData<RiskRuleResponse, RiskRuleRequest>({
        url: RISK_API.ADMIN_RULE_DETAIL(ruleId),
        method: 'put',
        data,
    })
}

/**
 * 删除风控规则
 * @param ruleId 规则 ID
 * @returns 操作结果
 */
export async function apiDeleteRiskRule(ruleId: string) {
    return ApiService.fetchData<{ message: string; rule_id: string }>({
        url: RISK_API.ADMIN_RULE_DETAIL(ruleId),
        method: 'delete',
    })
}

/**
 * 列出风控规则
 * @param params 查询参数
 * @returns 规则列表
 */
export async function apiListRiskRules(params?: RiskRuleListParams) {
    return ApiService.fetchData<RiskRuleResponse[]>({
        url: RISK_API.ADMIN_RULES,
        method: 'get',
        params,
    })
}
