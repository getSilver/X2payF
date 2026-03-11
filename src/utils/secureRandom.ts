const DEFAULT_ALPHABET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function getCryptoOrThrow(): Crypto {
    if (typeof globalThis === 'undefined' || !globalThis.crypto?.getRandomValues) {
        throw new Error('Secure random generator is unavailable in this environment')
    }
    return globalThis.crypto
}

export function secureRandomInt(maxExclusive: number): number {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
        throw new Error('maxExclusive must be a positive integer')
    }

    const cryptoRef = getCryptoOrThrow()
    const maxUint32 = 0x100000000
    const limit = Math.floor(maxUint32 / maxExclusive) * maxExclusive
    const buffer = new Uint32Array(1)

    let value = 0
    do {
        cryptoRef.getRandomValues(buffer)
        value = buffer[0]
    } while (value >= limit)

    return value % maxExclusive
}

export function secureRandomString(
    length: number,
    alphabet: string = DEFAULT_ALPHABET
): string {
    if (!Number.isInteger(length) || length <= 0) {
        throw new Error('length must be a positive integer')
    }
    if (!alphabet || alphabet.length === 0) {
        throw new Error('alphabet must not be empty')
    }

    let result = ''
    for (let i = 0; i < length; i++) {
        result += alphabet.charAt(secureRandomInt(alphabet.length))
    }
    return result
}

export function secureRandomFloat(): number {
    const cryptoRef = getCryptoOrThrow()
    const buffer = new Uint32Array(1)
    cryptoRef.getRandomValues(buffer)
    return buffer[0] / 0x100000000
}

