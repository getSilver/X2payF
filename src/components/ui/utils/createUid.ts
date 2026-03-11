import { secureRandomString } from '@/utils/secureRandom'

const createUID = (len = 10) => {
    return secureRandomString(len)
}

export default createUID
