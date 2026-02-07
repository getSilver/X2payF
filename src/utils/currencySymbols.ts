/**
 * 币种符号映射工具
 * 根据币种代码返回对应的货币符号
 */

// 币种代码到符号的映射
const CURRENCY_SYMBOLS: Record<string, string> = {
    // 主要货币
    'USD': '$',      // 美元
    'EUR': '€',      // 欧元
    'GBP': '£',      // 英镑
    'JPY': '¥',      // 日元
    'CNY': '¥',      // 人民币
    'CHF': 'CHF',    // 瑞士法郎
    'CAD': 'C$',     // 加拿大元
    'AUD': 'A$',     // 澳大利亚元
    'NZD': 'NZ$',    // 新西兰元
    'HKD': 'HK$',    // 港币
    'SGD': 'S$',     // 新加坡元
    
    // 拉丁美洲货币
    'BRL': 'R$',     // 巴西雷亚尔
    'MXN': 'MX$',    // 墨西哥比索
    'ARS': 'AR$',    // 阿根廷比索
    'CLP': 'CL$',    // 智利比索
    'COP': 'CO$',    // 哥伦比亚比索
    'PEN': 'S/',     // 秘鲁索尔
    
    // 亚洲货币
    'KRW': '₩',      // 韩元
    'INR': '₹',      // 印度卢比
    'THB': '฿',      // 泰铢
    'IDR': 'Rp',     // 印尼盾
    'MYR': 'RM',     // 马来西亚林吉特
    'PHP': '₱',      // 菲律宾比索
    'VND': '₫',      // 越南盾
    'TWD': 'NT$',    // 新台币
    
    // 欧洲货币
    'SEK': 'kr',     // 瑞典克朗
    'NOK': 'kr',     // 挪威克朗
    'DKK': 'kr',     // 丹麦克朗
    'PLN': 'zł',     // 波兰兹罗提
    'CZK': 'Kč',     // 捷克克朗
    'HUF': 'Ft',     // 匈牙利福林
    'RUB': '₽',      // 俄罗斯卢布
    'TRY': '₺',      // 土耳其里拉
    
    // 中东和非洲货币
    'SAR': 'SR',     // 沙特里亚尔
    'AED': 'د.إ',    // 阿联酋迪拉姆
    'ILS': '₪',      // 以色列新谢克尔
    'ZAR': 'R',      // 南非兰特
    'EGP': 'E£',     // 埃及镑
    'NGN': '₦',      // 尼日利亚奈拉
}

/**
 * 根据币种代码获取货币符号
 * @param currencyCode 币种代码（如 'USD', 'BRL'）
 * @param defaultSymbol 默认符号（当找不到对应符号时返回）
 * @returns 货币符号
 */
export function getCurrencySymbol(currencyCode?: string, defaultSymbol: string = '$'): string {
    if (!currencyCode) {
        return defaultSymbol
    }
    
    const upperCode = currencyCode.toUpperCase()
    return CURRENCY_SYMBOLS[upperCode] || defaultSymbol
}

/**
 * 检查币种代码是否支持
 * @param currencyCode 币种代码
 * @returns 是否支持
 */
export function isSupportedCurrency(currencyCode?: string): boolean {
    if (!currencyCode) {
        return false
    }
    return currencyCode.toUpperCase() in CURRENCY_SYMBOLS
}

/**
 * 获取所有支持的币种代码列表
 * @returns 币种代码数组
 */
export function getSupportedCurrencies(): string[] {
    return Object.keys(CURRENCY_SYMBOLS)
}

/**
 * 格式化金额显示（带币种符号）
 * @param amount 金额
 * @param currencyCode 币种代码
 * @param options 格式化选项
 * @returns 格式化后的字符串
 */
export function formatCurrencyAmount(
    amount: number,
    currencyCode?: string,
    options?: {
        decimals?: number
        thousandSeparator?: boolean
        symbolPosition?: 'prefix' | 'suffix'
    }
): string {
    const {
        decimals = 2,
        thousandSeparator = true,
        symbolPosition = 'prefix'
    } = options || {}
    
    const symbol = getCurrencySymbol(currencyCode)
    const formattedAmount = amount.toFixed(decimals)
    const parts = formattedAmount.split('.')
    
    // 添加千位分隔符
    if (thousandSeparator) {
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    
    const amountStr = parts.join('.')
    
    // 根据位置返回
    return symbolPosition === 'prefix' 
        ? `${symbol}${amountStr}`
        : `${amountStr}${symbol}`
}

export default {
    getCurrencySymbol,
    isSupportedCurrency,
    getSupportedCurrencies,
    formatCurrencyAmount,
}
