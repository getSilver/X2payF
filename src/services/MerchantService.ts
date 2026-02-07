import ApiService from './ApiService'

// ==================== 商户日报相关类型 ====================

// 商户日报单条数据（匹配后端 MerchantDailySummaryItem）
export type MerchantDailyReport = {
    date: string
    total_amount: number
    total_count: number
    success_amount: number
    success_count: number
    failed_amount: number
    failed_count: number
    pending_amount: number
    pending_count: number
}

// 商户日报响应（匹配后端 MerchantDailySummaryResponse）
export type MerchantDailyReportResponse = {
    data: MerchantDailyReport[]
    total: number
}

// ==================== 商户订单相关类型 ====================

// 商户订单数据类型
export type MerchantOrder = {
    payment_id: string
    merchant_tx_id: string
    amount: number
    currency: string
    status: string
    transaction_type: string
    channel_code?: string
    payment_method?: string
    subject?: string
    created_at: string
    updated_at: string
}

// 商户订单响应（匹配后端 ListPaymentsResponse）
export type MerchantOrderResponse = {
    list: MerchantOrder[]   // 后端返回的是 list 不是 data
    total: number
    page: number
    page_size: number
}

// ==================== 商户提款相关类型 ====================

// 商户提款数据类型（匹配后端 WithdrawalDetailResponse）
export type MerchantWithdrawal = {
    id: string
    app_id: string
    merchant_id: string
    request_id: string
    amount: number           // 提款金额，单位：分
    fee: number              // 手续费，单位：分
    actual_amount: number    // 实际到账金额，单位：分
    currency: string
    status: string           // PENDING, APPROVED, COMPLETED, REJECTED, CANCELLED
    note?: string
    applicant_id: string
    applied_at: string
    approver_id?: string
    approved_at?: string
    approval_note?: string
    completed_by?: string
    completed_at?: string
    completion_note?: string
    cancelled_by?: string
    cancelled_at?: string
    cancel_reason?: string
    extra?: string           // 扩展信息（JSON格式，包含提款收款地址等）
    created_at: string
    updated_at: string
}

// 商户提款响应（匹配后端 ListWithdrawalsResponse）
export type MerchantWithdrawalResponse = {
    list: MerchantWithdrawal[]
    total: number
    page: number
    page_size: number
}

// 创建提款请求参数
export type CreateWithdrawalRequest = {
    request_id: string       // 请求ID（用于幂等性检查）
    app_id: string           // 应用ID
    amount: number           // 提款金额，单位：分
    currency: string         // 币种代码
    note?: string            // 提款备注
}

// 创建提款响应
export type CreateWithdrawalResponse = {
    withdrawal_id: string
    request_id: string
    app_id: string
    amount: number
    fee: number
    actual_amount: number
    currency: string
    status: string
    created_at: string
}

// 提款手续费配置
export type WithdrawalFeeConfig = {
    id: string
    app_id?: string          // 应用ID，为空表示默认配置
    fee_type: 'FIXED' | 'PERCENTAGE'  // 手续费类型
    fee_value: number        // 手续费值（固定金额为分，百分比为万分之）
    min_fee: number          // 最低手续费，单位：分
    max_fee: number          // 最高手续费，单位：分
    currency: string         // 币种
    status: string           // 状态
}

// ==================== 商户概览相关类型 ====================

// 商户概览数据
export type MerchantOverview = {
    total_amount: number
    total_count: number
    success_rate: number
    pay_in_amount: number
    pay_in_count: number
    pay_out_amount: number
    pay_out_count: number
}

// 商户钱包数据
export type MerchantWallet = {
    currency: string
    available_balance: number
    frozen_balance: number
    total_balance: number
}

// 商户钱包响应
export type MerchantWalletResponse = {
    wallets: MerchantWallet[]
}

// ==================== 查询参数类型 ====================

export type MerchantQueryParams = {
    page?: number
    page_size?: number
    query?: string
    start_date?: string
    end_date?: string
}

export type MerchantOverviewParams = {
    start_time?: string
    end_time?: string
}

export type MerchantTrendParams = {
    start_time?: string
    end_time?: string
    granularity?: 'hour' | 'day' | 'week' | 'month'
}

// ==================== 商户应用相关类型 ====================

// 应用配置类型
export type MerchantAppConfig = {
    pay_in_percentage_fee?: number   // 代收百分比费率
    pay_in_fixed_fee?: number        // 代收固定费用（分）
    pay_out_percentage_fee?: number  // 代付百分比费率
    pay_out_fixed_fee?: number       // 代付固定费用（分）
    currency?: string
    timezone?: string
    channels?: string[]
    payment_methods?: string[]
    default_payment_method?: string
    single_txn_min?: number
    single_txn_max?: number
    daily_limit?: number
    monthly_limit?: number
    settlement_limit?: number
    withdrawal_address?: string      // 提款收款地址（如 USDT TRC-20 地址）
    withdrawal_fee_percent?: number  // 提款手续费百分比
    exchange_rate_sell?: number      // 汇率卖出加点
    exchange_rate_buy?: number       // 汇率买入加点
}

// 商户应用数据（匹配后端 ApplicationResponse）
export type MerchantApplication = {
    id: string               // 后端返回 id
    name: string             // 后端返回 name
    merchant_id?: string
    status: string
    currency: string
    timezone?: string
    balance?: number
    frozen_amount?: number
    available_amount?: number
    api_key?: string         // API Key
    api_secret?: string      // API Secret（仅创建时返回）
    config?: MerchantAppConfig | string  // 应用配置（可能是对象或 JSON 字符串）
    created_at: string
    updated_at: string
}

// 商户应用响应
export type MerchantApplicationResponse = {
    data: MerchantApplication[]
    total: number
}

// ==================== 商户交易统计相关类型 ====================

// 商户交易汇总（匹配后端 TransactionSummaryResponse）
export type MerchantTransactionSummary = {
    total_transaction_count: number                    // 总交易笔数
    total_transaction_amount: Record<string, number>   // 总交易金额（按币种分组，如 {"USD": 1000, "CNY": 5000}）
    success_transaction_count: number                  // 成功交易笔数
    success_transaction_amount: Record<string, number> // 成功交易金额（按币种分组）
}

// 商户交易趋势数据点
export type MerchantTrendDataPoint = {
    time: string
    date?: string
    amount: number
    count: number
}

// 商户交易趋势
export type MerchantTransactionTrend = {
    data: MerchantTrendDataPoint[]
    granularity?: string
}

// 交易类型统计
export type TransactionByType = {
    pay_in_amount: number
    pay_in_count: number
    pay_out_amount: number
    pay_out_count: number
}

// ==================== 商户报表相关类型 ====================

// 商户周报数据
export type MerchantWeeklyReport = {
    week_start: string
    week_end: string
    total_amount: number
    total_count: number
    success_rate: number
    pay_in_amount: number
    pay_out_amount: number
}

// 商户周报响应
export type MerchantWeeklyReportResponse = {
    data: MerchantWeeklyReport[]
    total: number
}

// 商户月报数据
export type MerchantMonthlyReport = {
    month: string
    total_amount: number
    total_count: number
    success_rate: number
    pay_in_amount: number
    pay_out_amount: number
}

// 商户月报响应
export type MerchantMonthlyReportResponse = {
    data: MerchantMonthlyReport[]
    total: number
}

// ==================== 应用统计相关类型 ====================

// 应用统计数据
export type ApplicationStatistics = {
    app_id: string
    app_name: string
    total_amount: number
    total_count: number
    success_rate: number
}

// 应用统计响应
export type ApplicationStatisticsResponse = {
    data: ApplicationStatistics[]
}

// ==================== API 函数 ====================

/**
 * 获取商户日报数据
 * 路径：/api/v1/merchant/statistics/reports/daily
 * 使用 Bearer Token 认证，后端根据用户角色自动过滤数据
 */
export async function apiGetMerchantDailyReport(params: MerchantQueryParams) {
    return ApiService.fetchData<MerchantDailyReportResponse>({
        url: '/api/v1/merchant/statistics/reports/daily',
        method: 'get',
        params,
    })
}

/**
 * 获取商户订单列表
 * 路径：/api/v1/merchant/payments
 * 使用 Bearer Token 认证，后端根据用户角色自动过滤数据
 */
export async function apiGetMerchantOrders(params: MerchantQueryParams) {
    return ApiService.fetchData<MerchantOrderResponse>({
        url: '/api/v1/merchant/payments',
        method: 'get',
        params,
    })
}

/**
 * 获取商户提款记录
 * 路径：/api/v1/merchant/withdrawals（待后端实现）
 * 使用 Bearer Token 认证，后端根据用户角色自动过滤数据
 */
export async function apiGetMerchantWithdrawals(params: MerchantQueryParams) {
    return ApiService.fetchData<MerchantWithdrawalResponse>({
        url: '/api/v1/merchant/withdrawals',
        method: 'get',
        params,
    })
}

/**
 * 获取商户概览统计
 * 路径：/api/v1/merchant/statistics/overview
 * 使用 Bearer Token 认证，后端根据用户角色自动过滤数据
 */
export async function apiGetMerchantOverview(params?: MerchantOverviewParams) {
    return ApiService.fetchData<MerchantOverview>({
        url: '/api/v1/merchant/statistics/overview',
        method: 'get',
        params,
    })
}

/**
 * 获取商户应用列表
 * 路径：/api/v1/merchant/applications
 * 使用 Bearer Token 认证，后端根据用户角色自动过滤数据
 */
export async function apiGetMerchantApplications(params?: MerchantQueryParams) {
    return ApiService.fetchData<MerchantApplicationResponse>({
        url: '/api/v1/merchant/applications',
        method: 'get',
        params,
    })
}

/**
 * 获取商户应用详情
 * 路径：/api/v1/merchant/applications/:id
 * 使用 Bearer Token 认证
 */
export async function apiGetMerchantApplicationDetail(id: string) {
    return ApiService.fetchData<MerchantApplication>({
        url: `/api/v1/merchant/applications/${id}`,
        method: 'get',
    })
}

/**
 * 获取商户交易汇总
 * 路径：/api/v1/merchant/statistics/transactions/summary
 * 使用 Bearer Token 认证
 */
export async function apiGetMerchantTransactionSummary(params?: MerchantOverviewParams) {
    return ApiService.fetchData<MerchantTransactionSummary>({
        url: '/api/v1/merchant/statistics/transactions/summary',
        method: 'get',
        params,
    })
}

/**
 * 获取商户交易类型统计
 * 路径：/api/v1/merchant/statistics/transactions/by-type
 * 使用 Bearer Token 认证
 */
export async function apiGetMerchantTransactionByType(params?: MerchantOverviewParams) {
    return ApiService.fetchData<TransactionByType>({
        url: '/api/v1/merchant/statistics/transactions/by-type',
        method: 'get',
        params,
    })
}

/**
 * 获取商户交易趋势
 * 路径：/api/v1/merchant/statistics/transactions/trend
 * 使用 Bearer Token 认证
 */
export async function apiGetMerchantTransactionTrend(params?: MerchantTrendParams) {
    return ApiService.fetchData<MerchantTransactionTrend>({
        url: '/api/v1/merchant/statistics/transactions/trend',
        method: 'get',
        params,
    })
}

/**
 * 获取商户周报
 * 路径：/api/v1/merchant/statistics/reports/weekly
 * 使用 Bearer Token 认证
 */
export async function apiGetMerchantWeeklyReport(params?: MerchantQueryParams) {
    return ApiService.fetchData<MerchantWeeklyReportResponse>({
        url: '/api/v1/merchant/statistics/reports/weekly',
        method: 'get',
        params,
    })
}

/**
 * 获取商户月报
 * 路径：/api/v1/merchant/statistics/reports/monthly
 * 使用 Bearer Token 认证
 */
export async function apiGetMerchantMonthlyReport(params?: MerchantQueryParams) {
    return ApiService.fetchData<MerchantMonthlyReportResponse>({
        url: '/api/v1/merchant/statistics/reports/monthly',
        method: 'get',
        params,
    })
}

/**
 * 获取应用统计
 * 路径：/api/v1/merchant/statistics/applications
 * 使用 Bearer Token 认证
 */
export async function apiGetApplicationStatistics(params?: MerchantOverviewParams) {
    return ApiService.fetchData<ApplicationStatisticsResponse>({
        url: '/api/v1/merchant/statistics/applications',
        method: 'get',
        params,
    })
}

/**
 * 创建提款申请
 * 路径：/api/v1/merchant/withdrawals
 * 使用 Bearer Token 认证
 */
export async function apiCreateWithdrawal(data: CreateWithdrawalRequest) {
    return ApiService.fetchData<CreateWithdrawalResponse>({
        url: '/api/v1/merchant/withdrawals',
        method: 'post',
        data,
    })
}

/**
 * 获取提款手续费配置
 * 路径：/api/v1/withdrawal-fee-configs/effective
 * 使用 Bearer Token 认证
 */
export async function apiGetWithdrawalFeeConfig(appId: string, currency: string) {
    return ApiService.fetchData<WithdrawalFeeConfig>({
        url: '/api/v1/withdrawal-fee-configs/effective',
        method: 'get',
        params: { app_id: appId, currency },
    })
}

// ==================== 应用 Secret 相关类型 ====================

// 生成 Secret 响应
export type GenerateSecretResponse = {
    app_id: string
    api_key: string
    api_secret: string
}

/**
 * 生成/轮换应用的 API Secret
 * 路径：/api/v1/merchant/applications/:id/secret
 * 使用 Bearer Token 认证
 * 注意：每次调用都会生成新的 Secret，旧的 Secret 将立即失效
 * Secret 仅在此次响应中返回，请妥善保存
 */
export async function apiGenerateSecret(appId: string) {
    return ApiService.fetchData<GenerateSecretResponse>({
        url: `/api/v1/merchant/applications/${appId}/secret`,
        method: 'post',
    })
}

/**
 * 更新应用配置（商户端）
 * 路径：/api/v1/merchant/applications/:id
 * 使用 Bearer Token 认证
 * 商户只能更新自己的应用配置
 */
export async function apiUpdateMerchantApplicationConfig(appId: string, config: Partial<MerchantAppConfig>) {
    return ApiService.fetchData<{ app_id: string; message: string }>({
        url: `/api/v1/merchant/applications/${appId}`,
        method: 'put',
        data: { config },
    })
}

// Generate a short request id for idempotent operations
