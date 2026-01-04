import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

interface CodeBoxProps {
    content: string | object
    language?: string
}

const CodeBox = ({ content, language = 'json' }: CodeBoxProps) => {
    // 格式化内容：如果是对象，自动转为格式化的JSON字符串
    const formatContent = (input: string | object): string => {
        if (typeof input === 'object') {
            return JSON.stringify(input, null, 2)
        }
        return input
    }

    const formattedContent = formatContent(content)

    return (
        <div className="px-10 pb-6">
            <SyntaxHighlighter className="text-base" language={language}>
                {formattedContent}
            </SyntaxHighlighter>
        </div>
    )
}

export default CodeBox
