import { useState, useCallback, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import Spinner from '@/components/ui/Spinner'
import { CgCodeSlash, CgCode, CgCopy } from 'react-icons/cg'
import { HiCheck } from 'react-icons/hi'
import CodeBox from './CodeBox'

export interface CardFooterProps {
    code?: string | object
    mdPath?: string
    mdName?: string
    mdPrefixPath?: string
}

const OpenBox = (props: CardFooterProps) => {
    const { code, mdPath, mdName, mdPrefixPath = 'ui-components' } = props

    const [expand, setExpand] = useState(false)
    const [markdown, setMarkdown] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [loadingMd, setLoadingMd] = useState(false)

    const onExpand = useCallback(() => {
        setExpand(!expand)
    }, [expand])

    const fetchMd = async () => {
        if (code) {
            // 如果code是对象，保持原样；如果是字符串，直接使用
            setMarkdown(code as any)
            setLoadingMd(false)
            return
        }

        setLoadingMd(false)
    }

    useEffect(() => {
        if (expand && !markdown) {
            fetchMd()
        }
        if (copied && markdown) {
            navigator.clipboard.writeText(markdown.replace(/```jsx|```/g, ''))
            if (copied) {
                const copyFeedbackInterval = setTimeout(
                    () => setCopied(false),
                    3000
                )

                return () => {
                    clearTimeout(copyFeedbackInterval)
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code, mdPath, expand, copied])

    const onCodeCopy = async () => {
        if (!markdown) {
            await fetchMd()
        }
        setCopied(true)
    }

    return (
        <div>
            <div className="flex items-center justify-between mr-6">
                <div>{loadingMd && <Spinner />}</div>
                <div>
                    <Tooltip
                        title={copied ? 'Copied' : 'Copy Code'}
                        wrapperClass="mr-1"
                    >
                        <Button
                            variant="plain"
                            shape="circle"
                            size="xs"
                            icon={
                                copied ? (
                                    <HiCheck className="text-emerald-500" />
                                ) : (
                                    <CgCopy />
                                )
                            }
                            onClick={onCodeCopy}
                        />
                    </Tooltip>
                    <Tooltip title={expand ? 'Hide Code' : 'Show Code'}>
                        <Button
                            variant="plain"
                            shape="circle"
                            size="xs"
                            icon={expand ? <CgCode /> : <CgCodeSlash />}
                            onClick={() => onExpand()}
                        />
                    </Tooltip>
                </div>
            </div>
            <div className={expand ? 'block' : 'hidden'}>
                <CodeBox content={markdown as string} />
            </div>
        </div>
    )
}

export default OpenBox
