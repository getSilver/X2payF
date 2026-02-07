export type Currency = {
    label: string
    img: string
    value: string
    rate: number
    // 应用币种扩展字段
    isAppCurrency?: boolean
    appId?: string
    availableBalance?: number
    // 汇率计算相关字段
    baseRate?: number        // 平台基础汇率
    markupPercent?: number   // 加点百分比
}

export type Payment = {
    name: string
    label: string
    value: string
    img: string
}

// 法币图标映射
export const fiatCurrencyIcons: Record<string, string> = {
    BRL: '/img/thumbs/brl.png',
    USD: '/img/thumbs/usd.png',
    CNY: '/img/thumbs/cny.png',
    EUR: '/img/thumbs/eur.png',
    GBP: '/img/thumbs/gbp.png',
    JPY: '/img/thumbs/jpy.png',
    // 默认图标
    DEFAULT: '/img/thumbs/currency-default.png',
}

// 获取币种图标
export const getCurrencyIcon = (currency: string): string => {
    return fiatCurrencyIcons[currency] || fiatCurrencyIcons.DEFAULT
}

export const currencyList: Currency[] = [
    {
        label: 'BTC',
        img: '/img/thumbs/bitcoin.png',
        value: 'BTC',
        rate: 29877.3,
    },
    {
        label: 'ETH',
        img: '/img/thumbs/ethereum.png',
        value: 'ETH',
        rate: 1785.91,
    },
    {
        label: 'USDT',
        img: '/img/thumbs/tether-us.png',
        value: 'USDT',
        rate: 1,
    },
    {
        label: 'SOL',
        img: '/img/thumbs/solana.png',
        value: 'SOL',
        rate: 40.25,
    },
    {
        label: 'DOGE',
        img: '/img/thumbs/doge.png',
        value: 'DOGE',
        rate: 0.07979,
    },
    {
        label: 'DOT',
        img: '/img/thumbs/polkadot.png',
        value: 'DOT',
        rate: 0.07979,
    },
    {
        label: 'TRX',
        img: '/img/thumbs/tron.png',
        value: 'TRX',
        rate: 0.31,
    },
    {
        label: 'AVAX',
        img: '/img/thumbs/avalanche.png',
        value: 'AVAX',
        rate: 24.65,
    },
    {
        label: 'SHIB',
        img: '/img/thumbs/shiba-inu.png',
        value: 'SHIB',
        rate: 24.65,
    },
    {
        label: 'MATIC',
        img: '/img/thumbs/polygon.png',
        value: 'MATIC',
        rate: 0.633,
    },
    {
        label: 'XLM',
        img: '/img/thumbs/stellar-lumens.png',
        value: 'XLM',
        rate: 0.1404,
    },
    {
        label: 'EOS',
        img: '/img/thumbs/eos.png',
        value: 'EOS',
        rate: 1.25,
    },
    {
        label: 'XRP',
        img: '/img/thumbs/ripple.png',
        value: 'XRP',
        rate: 0.34,
    },

]

export const paymentList: Payment[] = [
    {
        name: 'VISA',
        label: 'VISA •••• 6165',
        value: 'VISA',
        img: '/img/others/img-8.png',
    },
    {
        name: 'MASTER',
        label: 'MASTER •••• 6165',
        value: 'MASTER',
        img: '/img/others/img-9.png',
    },
    {
        name: 'Paypal',
        label: 'Paypal cookie_lukie@gmail.com',
        value: 'PAYPAL',
        img: '/img/others/img-10.png',
    },
    {
        name: 'Wallet',
        label: 'Wallet Ballance $26,322,574.87',
        value: 'WALLET',
        img: '/img/others/img-17.png',
    },
]

export default currencyList
