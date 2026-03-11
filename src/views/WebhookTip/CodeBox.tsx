interface CodeBoxProps {
    content: string | object
    language?: string
}

const CodeBox = ({ content }: CodeBoxProps) => {
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
            <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                <code>{formattedContent}</code>
            </pre>
        </div>
    )
}

export default CodeBox
