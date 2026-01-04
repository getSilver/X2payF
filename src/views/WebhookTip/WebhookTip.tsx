import CardFooter from './OpenBox'
import type { CardFooterProps } from './OpenBox'

export interface DemoCardProps extends Omit<CardFooterProps, 'mdPath' | 'mdName' | 'mdPrefixPath'> {
    id?: string
    hideFooter?: boolean
    cardClass?: string
}

const WebhookTip = (props: DemoCardProps) => {
    const { id, hideFooter, code, ...rest } = props

    return (
        <div
            id={id}
            className="bg-white dark:bg-gray-800 "
        >
            {/* Only footer functionality remains */}
            {!hideFooter && (
                <div className="bg-gray-50 dark:bg-gray-700 pb-2 pt-2 rounded-lg">
                    <CardFooter code={code} {...rest} />
                </div>
            )}
        </div>
    )
}

export default WebhookTip
