# DemoCard 组件使用指南

DemoCard 是一个专门用于展示代码的卡片组件，包含展开/收起和复制功能。

## 基本用法

```tsx
import DemoCard from '@/views/DemoCard'

const MyComponent = () => {
    // 方式1: 传递JSON对象（自动格式化）
    const jsonData = {
        name: "example",
        version: "1.0"
    }

    return <DemoCard code={jsonData} />
}
```

```tsx
// 方式2: 传递代码字符串
const codeString = `const example = {
    name: "Demo",
    version: "1.0"
}`

return <DemoCard code={codeString} />
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `code` | `string \| object` | - | 要展示的代码内容，支持字符串或对象 |
| `id` | `string` | - | 卡片容器的ID |
| `hideFooter` | `boolean` | `false` | 是否隐藏页脚功能 |
| `cardClass` | `string` | - | 额外的CSS类名 |

## 功能特性

- ✅ **自动格式化**: 传递对象时自动转为格式化的JSON
- ✅ **语法高亮**: 支持多种编程语言
- ✅ **展开/收起**: 点击按钮切换代码显示
- ✅ **一键复制**: 复制代码到剪贴板
- ✅ **响应式设计**: 支持深色/浅色主题
- ✅ **加载状态**: 显示加载指示器

## 完整示例

```tsx
import DemoCard from '@/views/DemoCard'

const ExamplePage = () => {
    const configData = {
        "extends": "./tsconfig.json",
        "compilerOptions": {
            "noEmit": true
        },
        "include": ["src/**/*"],
        "exclude": ["node_modules"]
    }

    return (
        <div className="p-6">
            <h1>配置文件示例</h1>
            <DemoCard code={configData} />
        </div>
    )
}

export default ExamplePage
```</contents>
</xai:function_call">Write contents to src/views/DemoCard/README.md.
