import { combineReducers } from '@reduxjs/toolkit'
import walletsReducers, { SLICE_NAME, CryptoWalletsState } from './walletsSlice'
import { useSelector } from 'react-redux'

import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState } from '@/store'

const reducer = combineReducers({
    data: walletsReducers,
})

export const useAppSelector: TypedUseSelectorHook<
    RootState & {
        [SLICE_NAME]: {
            data: CryptoWalletsState
        }
    }
> = useSelector

export * from './walletsSlice'
export { useAppDispatch } from '@/store'
export default reducer
