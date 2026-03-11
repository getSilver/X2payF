import View from '@/views'
import SidePanel from '@/components/template/SidePanel'
import { setPanelExpand, useAppSelector, useAppDispatch } from '@/store'
import { HiOutlineCog } from 'react-icons/hi'
import classNames from 'classnames'
import { useLocation } from 'react-router-dom'

const ConfiguratorToggle = () => {
    const dispatch = useAppDispatch()
    const themeColor = useAppSelector((state) => state.theme.themeColor)
    const primaryColorLevel = useAppSelector(
        (state) => state.theme.primaryColorLevel
    )

    return (
        <div
            className={classNames(
                'fixed ltr:right-0 rtl:left-0 top-96 p-3 ltr:rounded-tl-md ltr:rounded-bl-md rtl:rounded-tr-md rtl:rounded-br-md text-white text-xl cursor-pointer select-none',
                `bg-${themeColor}-${primaryColorLevel}`
            )}
            onClick={() => {
                dispatch(setPanelExpand(true))
            }}
        >
            <HiOutlineCog />
        </div>
    )
}

const BlankLayout = () => {
    const location = useLocation()
    const isCashierPage = location.pathname.startsWith('/cashier/')

    return (
        <div className="app-layout-blank flex flex-auto flex-col h-[100vh]">
            <View />
            {!isCashierPage && (
                <>
                    <ConfiguratorToggle />
                    <SidePanel className="hidden" />
                </>
            )}
        </div>
    )
}

export default BlankLayout
