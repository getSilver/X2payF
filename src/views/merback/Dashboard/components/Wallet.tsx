import { useEffect } from 'react'
// import classNames from 'classnames'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
// import Input from '@/components/ui/Input'
// import Tooltip from '@/components/ui/Tooltip'
// import Notification from '@/components/ui/Notification'
// import toast from '@/components/ui/toast'
// import Skeleton from '@/components/ui/Skeleton'
// import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import ActionColumn from './ActionColumn'
import GrowShrinkTag from '@/components/shared/GrowShrinkTag'
import { getWalletData, useAppSelector, useAppDispatch } from '../store'
// import useThemeClass from '@/utils/hooks/useThemeClass'
// import { HiOutlineDuplicate, HiOutlinePlus } from 'react-icons/hi'
import { NumericFormat } from 'react-number-format'
import type { Wallet } from '../store'

const WalletCard = ({ data = {} }: { data: Partial<Wallet> }) => {
    // const { textTheme } = useThemeClass()

    // const handleCopyClick = (address = '') => {
    //     navigator.clipboard.writeText(address)
    //     toast.push(
    //         <Notification title="Copied" type="success" duration={1000} />,
    //         {
    //             placement: 'top-center',
    //         }
    //     )
    // }

    return (
        <Card>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar
                        className="bg-transparent"
                        src={data.icon}
                        shape="circle"
                    />
                    <h4 className="font-bold">代收</h4>
                </div>
                <div className="text-right rtl:text-left">
                    <h5 className="mb-2">
                        <NumericFormat
                            displayType="text"
                            value={data.fiatValue}
                            // suffix={data.symbol}
                            thousandSeparator={true}
                        />
                    </h5>
                    <GrowShrinkTag value={data.growshrink} suffix="%" />
                </div>
            </div>
            <div className="my-5">
                <h5 className="font-bold"><NumericFormat
                    displayType="text"
                    value={data.coinValue} suffix={data.symbol}
                    thousandSeparator={true}
                />
                </h5>
            </div>
        </Card>
    )
}

const Wallet = () => {
    const dispatch = useAppDispatch()

    const data = useAppSelector((state) => state.cryptoWallets.data.walletsData)

    const loading = useAppSelector((state) => state.cryptoWallets.data.loading)
    useEffect(() => {
        dispatch(getWalletData())
    }, [dispatch])

    return (
        <div className="grid lg:grid-cols-3 2xl:grid-cols-3 gap-4">
            {!loading && (
                <>
                    {data.map((wallet) => (
                        <WalletCard key={wallet.symbol} data={wallet} />
                    ))}
                    <Card>
                        <div className="flex">
                            <Button size="sm" variant="solid" block >
                                交易
                            </Button>
                        </div>
                    </Card>
                </>
            )}
        </div>

    )
}

export default Wallet
