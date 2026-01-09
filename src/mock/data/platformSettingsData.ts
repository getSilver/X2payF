export const platformCurrenciesData = [
    {
        id: 'cur-1',
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        status: 'active',
    },
    {
        id: 'cur-2',
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        status: 'active',
    },
    {
        id: 'cur-3',
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        status: 'inactive',
    },
]

export const platformTimezonesData = [
    {
        id: 'tz-1',
        name: 'UTC',
        offset: '+00:00',
        region: 'Global',
        status: 'active',
    },
    {
        id: 'tz-2',
        name: 'Asia/Shanghai',
        offset: '+08:00',
        region: 'Asia',
        status: 'active',
    },
    {
        id: 'tz-3',
        name: 'America/New_York',
        offset: '-05:00',
        region: 'North America',
        status: 'inactive',
    },
]

export const platformAssociationsData = [
    {
        id: 'assoc-1',
        currency_id: 'cur-1',
        timezone_id: 'tz-1',
        status: 'active',
    },
    {
        id: 'assoc-2',
        currency_id: 'cur-2',
        timezone_id: 'tz-2',
        status: 'active',
    },
    {
        id: 'assoc-3',
        currency_id: 'cur-3',
        timezone_id: 'tz-3',
        status: 'inactive',
    },
]
