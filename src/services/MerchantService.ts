/**
 * 商户管理服务
 * 封装商户相关的业务逻辑
 */
import {
    apiListMerchants,
    apiGetMerchant,
    apiCreateMerchant,
    apiGetMerchantApplications,
    apiGetAgentMerchants,
    apiUpdateAccountStatus,
} from './api/AccountApi'
import type {
    ListMerchantsParams,
    ListMerchantsResponse,
    Merchant,
    CreateMerchantRequest,
    MerchantApplication,
    UpdateAccountStatusRequest,
    AccountStatus,
} from '@/@types/account'

// ==================== 商户列表管理 ====================

/**
 * 获取商户列表（支持分页和筛选）
 */
export async function getMerchantList(params?: ListMerchantsParams) {
    return apiListMerchants(params)
}

/**
 * 搜索商户（按名称）
 */
export async function searchMerchants(keyword: string, page = 1, pageSize = 20) {
    return apiListMerchants({
        name: keyword,
        page,
        page_size: pageSize,
    })
}

/**
 * 按状态筛选商户
 */
export async function getMerchantsByStatus(
    status: AccountStatus,
    page = 1,
    pageSize = 20
) {
    return apiListMerchants({
        status,
        page,
        page_size: pageSize,
    })
}

/**
 * 获取代理商下的商户列表
 */
export async function getMerchantsByAgent(agentId: string) {
    return apiGetAgentMerchants(agentId)
}

// ==================== 商户详情管理 ====================

/**
 * 获取商户详情
 */
export async function getMerchantDetails(merchantId: string) {
    return apiGetMerchant(merchantId)
}

/**
 * 获取商户应用列表
 */
export async function getMerchantApplications(merchantId: string) {
    return apiGetMerchantApplications(merchantId)
}

/**
 * 获取商户完整信息（包含应用列表）
 */
export async function getMerchantFullInfo(merchantId: string) {
    const [merchant, applications] = await Promise.all([
        apiGetMerchant(merchantId),
        apiGetMerchantApplications(merchantId),
    ])

    return {
        merchant,
        applications,
    }
}

// ==================== 商户创建 ====================

/**
 * 创建商户
 */
export async function createMerchant(data: CreateMerchantRequest) {
    return apiCreateMerchant(data)
}

/**
 * 创建商户（带验证）
 */
export async function createMerchantWithValidation(data: CreateMerchantRequest) {
    // 前端验证
    if (!data.name || data.name.trim().length === 0) {
        throw new Error('商户名称不能为空')
    }

    if (!data.contact_email || !isValidEmail(data.contact_email)) {
        throw new Error('请输入有效的邮箱地址')
    }

    if (!data.request_id || data.request_id.trim().length === 0) {
        throw new Error('请求ID不能为空')
    }

    return apiCreateMerchant(data)
}

// ==================== 商户状态管理 ====================

/**
 * 更新商户状态
 */
export async function updateMerchantStatus(
    merchantId: string,
    status: AccountStatus,
    reason: string
) {
    return apiUpdateAccountStatus(merchantId, { status, reason })
}

/**
 * 锁定商户
 */
export async function lockMerchant(merchantId: string, reason: string) {
    return updateMerchantStatus(merchantId, 'Locked', reason)
}

/**
 * 解锁商户
 */
export async function unlockMerchant(merchantId: string, reason: string) {
    return updateMerchantStatus(merchantId, 'Normal', reason)
}

/**
 * 冻结商户
 */
export async function freezeMerchant(merchantId: string, reason: string) {
    return updateMerchantStatus(merchantId, 'Frozen', reason)
}

/**
 * 暂停商户
 */
export async function suspendMerchant(merchantId: string, reason: string) {
    return updateMerchantStatus(merchantId, 'Suspended', reason)
}

/**
 * 禁用商户
 */
export async function disableMerchant(merchantId: string, reason: string) {
    return updateMerchantStatus(merchantId, 'Disabled', reason)
}

/**
 * 激活商户
 */
export async function activateMerchant(merchantId: string, reason: string) {
    return updateMerchantStatus(merchantId, 'Normal', reason)
}

// ==================== 数据转换和格式化 ====================

/**
 * 格式化商户状态显示文本
 */
export function formatMerchantStatus(status: AccountStatus): string {
    const statusMap: Record<AccountStatus, string> = {
        Normal: '正常',
        Locked: '锁定',
        Frozen: '冻结',
        Suspended: '暂停',
        Disabled: '禁用',
        Deleted: '已删除',
    }
    return statusMap[status] || status
}

/**
 * 获取商户状态颜色
 */
export function getMerchantStatusColor(status: AccountStatus): string {
    const colorMap: Record<AccountStatus, string> = {
        Normal: 'green',
        Locked: 'orange',
        Frozen: 'blue',
        Suspended: 'yellow',
        Disabled: 'red',
        Deleted: 'gray',
    }
    return colorMap[status] || 'default'
}

/**
 * 格式化商户应用状态
 */
export function formatAppStatus(status: string): string {
    const statusMap: Record<string, string> = {
        active: '激活',
        inactive: '停用',
        suspended: '暂停',
    }
    return statusMap[status] || status
}

/**
 * 获取应用状态颜色
 */
export function getAppStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
        active: 'green',
        inactive: 'gray',
        suspended: 'orange',
    }
    return colorMap[status] || 'default'
}

/**
 * 格式化金额（分转元）
 */
export function formatAmount(amountInCents: number): string {
    return (amountInCents / 100).toFixed(2)
}

/**
 * 格式化金额带货币符号
 */
export function formatAmountWithCurrency(
    amountInCents: number,
    currency = 'CNY'
): string {
    const amount = formatAmount(amountInCents)
    const currencySymbol: Record<string, string> = {
        CNY: '¥',
        USD: '$',
        EUR: '€',
        GBP: '£',
    }
    return `${currencySymbol[currency] || currency} ${amount}`
}

/**
 * 解析应用配置（JSON字符串转对象）
 */
export function parseAppConfig(config: string | object): object {
    if (typeof config === 'string') {
        try {
            return JSON.parse(config)
        } catch (e) {
            console.error('解析应用配置失败:', e)
            return {}
        }
    }
    return config
}

/**
 * 解析IP白名单（JSON字符串转数组）
 */
export function parseIPWhitelist(ipWhitelist: string): string[] {
    if (!ipWhitelist) return []
    try {
        return JSON.parse(ipWhitelist)
    } catch (e) {
        console.error('解析IP白名单失败:', e)
        return []
    }
}

// ==================== 数据统计 ====================

/**
 * 计算商户列表统计信息
 */
export function calculateMerchantStats(merchants: Merchant[]) {
    const total = merchants.length
    const statusCount: Record<AccountStatus, number> = {
        Normal: 0,
        Locked: 0,
        Frozen: 0,
        Suspended: 0,
        Disabled: 0,
        Deleted: 0,
    }

    merchants.forEach((merchant) => {
        if (merchant.status in statusCount) {
            statusCount[merchant.status]++
        }
    })

    return {
        total,
        statusCount,
        normalRate: total > 0 ? (statusCount.Normal / total) * 100 : 0,
    }
}

/**
 * 计算应用列表统计信息
 */
export function calculateAppStats(applications: MerchantApplication[]) {
    const total = applications.length
    const activeCount = applications.filter((app) => app.status === 'active').length
    const totalBalance = applications.reduce(
        (sum, app) => sum + app.balance_amount,
        0
    )

    return {
        total,
        activeCount,
        inactiveCount: total - activeCount,
        totalBalance,
        averageBalance: total > 0 ? totalBalance / total : 0,
    }
}

// ==================== 工具函数 ====================

/**
 * 验证邮箱格式
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * 生成请求ID
 */
export function generateRequestId(prefix = 'req'): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    return `${prefix}_${timestamp}_${random}`
}

/**
 * 检查商户是否可以操作
 */
export function canOperateMerchant(status: AccountStatus): boolean {
    return status === 'Normal'
}

/**
 * 检查商户是否被锁定
 */
export function isMerchantLocked(status: AccountStatus): boolean {
    return ['Locked', 'Frozen', 'Suspended', 'Disabled', 'Deleted'].includes(
        status
    )
}

/**
 * 获取可用的状态转换选项
 */
export function getAvailableStatusTransitions(
    currentStatus: AccountStatus
): AccountStatus[] {
    const transitions: Record<AccountStatus, AccountStatus[]> = {
        Normal: ['Locked', 'Frozen', 'Suspended', 'Disabled'],
        Locked: ['Normal', 'Frozen', 'Disabled'],
        Frozen: ['Normal', 'Locked', 'Disabled'],
        Suspended: ['Normal', 'Disabled'],
        Disabled: ['Normal'],
        Deleted: [], // 已删除的账户不能恢复
    }
    return transitions[currentStatus] || []
}

// ==================== 导出所有服务 ====================

export default {
    // 列表管理
    getMerchantList,
    searchMerchants,
    getMerchantsByStatus,
    getMerchantsByAgent,

    // 详情管理
    getMerchantDetails,
    getMerchantApplications,
    getMerchantFullInfo,

    // 创建
    createMerchant,
    createMerchantWithValidation,

    // 状态管理
    updateMerchantStatus,
    lockMerchant,
    unlockMerchant,
    freezeMerchant,
    suspendMerchant,
    disableMerchant,
    activateMerchant,

    // 格式化
    formatMerchantStatus,
    getMerchantStatusColor,
    formatAppStatus,
    getAppStatusColor,
    formatAmount,
    formatAmountWithCurrency,
    parseAppConfig,
    parseIPWhitelist,

    // 统计
    calculateMerchantStats,
    calculateAppStats,

    // 工具
    generateRequestId,
    canOperateMerchant,
    isMerchantLocked,
    getAvailableStatusTransitions,
}
