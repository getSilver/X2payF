# 前后端接口对照表

## 状态说明
- ✅ 前后端都有
- ⚠️ 后端有，前端缺页面
- ❌ 前端需要，后端缺接口

---

## 1. 认证模块 ✅ 已对接

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 登录 | POST /api/v1/auth/login | SignInForm.tsx | ✅ 已对接 |
| 登出 | POST /api/v1/auth/logout | useAuth.ts | ✅ 已对接 |
| 会话验证 | GET /api/v1/auth/session | AuthService.ts | ✅ 已对接 |
| MFA 验证码 | POST /api/v1/auth/mfa/challenge | useAuth.ts | ✅ 已对接 |
| MFA 验证 | POST /api/v1/auth/mfa/verify | useAuth.ts | ✅ 已对接 |
| 发送 MFA | POST /api/v1/auth/mfa/send | useAuth.ts | ✅ 已对接 |
| 忘记密码 | POST /api/v1/auth/forgot-password | ForgotPasswordForm.tsx | ⏳ 后端待实现 |
| 重置密码 | POST /api/v1/auth/reset-password | ResetPasswordForm.tsx | ⏳ 后端待实现 |

**对接文档**: [认证模块对接完成报告](./AUTH_INTEGRATION_COMPLETE.md)

---

## 2. MFA 管理模块 ✅ 核心功能已对接

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| TOTP 绑定 | POST /api/v1/admin/mfa/totp/enroll | MFAIntegrationDialog.tsx | ✅ 已对接 |
| TOTP 验证 | POST /api/v1/admin/mfa/totp/verify | MFAIntegrationDialog.tsx | ✅ 已对接 |
| 邮箱绑定 | POST /api/v1/admin/mfa/email/enroll | MFAIntegrationDialog.tsx | ⏳ 待对接 |
| 列出因子 | GET /api/v1/admin/mfa/factors | MFAIntegrationDialog.tsx | ✅ 已对接 |
| 解绑因子 | DELETE /api/v1/admin/mfa/factors/:id | MFAIntegrationDialog.tsx | ✅ 已对接 |
| 管理员重置 | DELETE /api/v1/admin/users/:id/mfa | CustomerDetail.tsx | ⏳ 待对接 |
| 管理员查看因子 | GET /api/v1/admin/users/:id/mfa/factors | CustomerDetail.tsx | ⏳ 待对接 |

**对接文档**: [MFA 对接进度报告](./tasks/mfa-integration-progress.md)

---

## 3. 支付模块 ✅ 已对接

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 支付列表（管理后台） | GET /api/v1/admin/payments | Pay.tsx | ✅ 已对接 |
| 查询支付详情（管理后台） | GET /api/v1/admin/payments/:id | PaymentDetails.tsx | | ✅ 已对接 |
| 取消支付（管理后台） | PUT /api/v1/admin/payments/:id/cancel | PaymentDetails.tsx | ✅ 已对接 |
| 关闭支付（管理后台） | PUT /api/v1/admin/payments/:id/close | PaymentDetails.tsx | ✅ 已对接 |
| 创建支付（商户API） | POST /api/v1/payments | - | ⚠️ 商户API |
| 支付列表（商户API） | GET /api/v1/payments | - | ⚠️ 商户API |
| 查询支付（商户API） | GET /api/v1/payments/:id | - | ⚠️ 商户API |
| Dashboard | GET /api/v1/statistics/* | Dashboard.tsx | ⏳ 待对接统计API |

**说明**：
- 管理后台路由（`/api/v1/admin/payments`）使用用户会话认证（Bearer Token）
- 商户 API 路由（`/api/v1/payments`）使用 API Key 认证
- 前端管理后台已对接管理后台路由

**对接文档**: [支付认证问题修复](../goX2pay/docs/fixes/payment-authentication-fix.md)

---

## 4. 退款模块 ✅ 已对接

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 创建退款（管理后台） | POST /api/v1/admin/refunds | PaymentInfo.tsx (RefundDialog) | ✅ 已对接 |
| 创建退款（商户API） | POST /api/v1/refunds | merback/PaymentDetails | ✅ |
| 查询退款（商户API） | GET /api/v1/refunds/:id | merback/PaymentDetails | ❌ 待对接 |

**对接完成说明**：
- ✅ RefundApi.ts - 退款 API 服务已实现
- ✅ refund.ts - 退款类型定义已完成
- ✅ RefundDialog.tsx - 退款对话框组件已实现
- ✅ PaymentInfo.tsx - 支付详情页面已集成退款按钮
- ✅ 管理后台退款功能已完成，只有支付成功的订单才能发起退款
- ❌ 商户后台退款功能待对接（需要使用 API Key 认证）

---

## 5. 渠道模块 ✅ 已对接

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 创建渠道 | POST /api/v1/admin/channels | ChannelNew.tsx | ✅ 已对接 |
| 渠道列表 | GET /api/v1/admin/channels | ChannelList.tsx | ✅ 已对接 |
| 渠道详情 | GET /api/v1/admin/channels/:id | ChannelEdit.tsx | ✅ 已对接 |
| 更新渠道 | PUT /api/v1/admin/channels/:id | ChannelEdit.tsx | ✅ 已对接 |
| 删除渠道 | DELETE /api/v1/admin/channels/:id | ChannelList.tsx | ✅ 已对接 |
| API配置 | POST /api/v1/admin/channels/:id/api-config | ChannelNew.tsx (APIConfigFields) | ✅ 已对接 |
| 费率配置 | POST /api/v1/admin/channels/:id/fee-config | ChannelNew.tsx (PricingFields) | ✅ 已对接 |
| 限额配置 | POST /api/v1/admin/channels/:id/limit-config | ChannelNew.tsx (PricingFields) | ✅ 已对接 |
| 获取配置 | GET /api/v1/admin/channels/:id/config | ChannelEdit.tsx | ✅ 已对接 |
| 更新凭据 | PUT /api/v1/admin/channels/:id/credentials | ChannelEdit.tsx | ✅ 已对接（编辑时自动判断） |
| 更新状态 | PUT /api/v1/admin/channels/:id/status | ChannelList.tsx | ✅ API已对接 |
| 获取状态 | GET /api/v1/admin/channels/:id/status | - | ⚠️ 缺前端页面 |
| 渠道指标 | GET /api/v1/admin/channels/:id/metrics | - | ⚠️ 缺前端页面 | 已经添加部分
| Dashboard | GET /api/v1/statistics/channels/performance | channel/Dashboard.tsx | ⚠️ 需对接统计API |

**对接完成说明**：
- ✅ API 路径已修正为 `/api/v1/admin/channels` 前缀
- ✅ ChannelApi.ts - API 服务已实现完整接口
- ✅ channelListSlice.ts - 渠道列表 Store 已对接真实 API
- ✅ channelEditSlice.ts - 渠道编辑 Store 已对接真实 API
- ✅ ChannelTable.tsx - 表格组件已适配后端数据结构
- ✅ ChannelForm.tsx - 表单组件已适配后端数据结构
- ✅ BasicInformationFields.tsx - 基本信息字段已更新
- ✅ APIConfigFields.tsx (原 OrganizationFields) - API 配置已对接后端
- ✅ PricingFields.tsx - 费率与限额配置已对接后端 API
- ✅ ChannelNew.tsx - 新建渠道页面已对接（含 API 配置、费率和限额配置）
- ✅ ChannelEdit.tsx - 编辑渠道页面已对接

**待完成**：
- 编辑渠道时加载并回显配置（调用 GET /config 接口）
- 渠道状态详情页面
- 渠道性能指标展示
- 热更新凭据功能

---

## 6. 账户/商户模块 ✅ 已对接

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 创建商户 | POST /api/v1/admin/accounts/merchants | CustomerNew.tsx | ✅ 已对接 |
| 创建代理商 | POST /api/v1/admin/accounts/agents | CustomerNew.tsx（类型=代理商） | ✅ 已对接 |
| 创建渠道商 | POST /api/v1/admin/accounts/channel-partners | CustomerNew.tsx（类型=渠道商） | ✅ 已对接 |
| 账户详情 | GET /api/v1/admin/accounts/:id | CustomerDetail.tsx | ✅ 已对接 |
| 更新状态 | PUT /api/v1/admin/accounts/:id/status | CustomerDetail.tsx | ✅ 已对接 |
| 商户列表 | GET /api/v1/admin/merchants | Customers.tsx | ✅ 已对接 |
| 商户详情 | GET /api/v1/admin/merchants/:id/details | CustomerDetail.tsx | ✅ 已对接 |
| 更新商户信息 | PUT /api/v1/admin/merchants/:id | EditCustomerProfile.tsx | ✅ 已对接 |
| 商户应用列表 | GET /api/v1/admin/merchants/:id/applications | CustomerDetail.tsx | ✅ 已对接 |
| 代理商列表 | GET /api/v1/admin/agents | AgentBindDialog.tsx | ✅ 已对接 |
| 代理商商户 | GET /api/v1/admin/agents/:id/merchants | Customers.tsx（筛选） | ✅ 已对接 |
| 绑定代理商 | PUT /api/v1/admin/merchants/:id/agent | EditCustomerProfile.tsx | ✅ 已对接 |
| 解绑代理商 | DELETE /api/v1/admin/merchants/:id/agent | EditCustomerProfile.tsx | ✅ 已对接 |
| Dashboard | GET /api/v1/statistics/merchants/* | merchants/Dashboard.tsx | ⚠️ 需对接统计API |

**对接完成说明**：
- ✅ API 路径已修正为 `/api/v1/admin/` 前缀
- ✅ Store 已从 CrmService（Mock）切换为真实 API
- ✅ customersSlice.ts - 商户列表 Store 已对接
- ✅ customerDetailSlice.ts - 商户详情 Store 已对接
- ✅ CustomersTable.tsx - 表格组件已适配后端数据结构
- ✅ CustomerTableFilter.tsx - 筛选组件已适配后端状态值
- ✅ CustomerEditContent.tsx - 编辑组件已更新
- ✅ 类型定义已补充完整
- ✅ **商户信息更新功能已完成**：
  - 后端实现了 `PUT /api/v1/admin/merchants/:id` 接口
  - 支持更新商户名称（name）和联系邮箱（contact_email）
  - 前端 `EditCustomerProfile.tsx` 已对接真实 API
  - 保存时调用 `apiUpdateMerchant` 更新商户信息
  - 包含完整的错误处理和成功提示
- ✅ **商户-代理商绑定功能已完成**：
  - 在商户详情页的编辑表单中，通过 Agent 输入框输入代理商 ID 来绑定
  - 输入代理商 ID 后保存，自动调用绑定 API
  - 清空 Agent 字段后保存，自动调用解绑 API
  - 修改代理商 ID 后保存，自动调用绑定 API 更换代理商
  - 所有操作都有成功/失败提示

**注意事项**：
- 统计数据：暂时通过商户列表计算（后端无专门统计接口）
- 商户统计数据需要后端提供专门的统计 API
- 支付历史需要对接支付模块的 API
---

## 7. 统计模块 统计页面布置在各模块的仪表板中

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 交易汇总 | GET /api/v1/statistics/transactions/summary | - | ⚠️ 缺前端 |
| 交易趋势 | GET /api/v1/statistics/transactions/trend | - | ⚠️ 缺前端 |
| 收入统计 | GET /api/v1/statistics/finance/revenue | - | ⚠️ 缺前端 |
| 商户概览 | GET /api/v1/statistics/merchants/overview | - | ⚠️ 缺前端 |1
| 渠道性能 | GET /api/v1/statistics/channels/performance | - | ⚠️ 缺前端 |1
| 日报 | GET /api/v1/statistics/reports/daily | - | ⚠️ 缺前端 | 用财务
| 周报 | GET /api/v1/statistics/reports/weekly | - | ⚠️ 缺前端 |用财务
| 月报 | GET /api/v1/statistics/reports/monthly | - | ⚠️ 缺前端 |用财务

---

## 8. 风控模块 已对接

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 商户风控状态 | GET /api/v1/risk/merchant/query | - | ✅ |
| 提交申诉 | POST /api/v1/risk/merchant/appeal | - | ✅ |
| 风控规则管理 | /api/v1/risk/admin/rules/* | risk/Rules.tsx | ✅ |
| 审核队列 | /api/v1/risk/admin/reviews/* | - | ✅ |

---

## 9. 平台设置模块 已对接

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 币种管理 | /api/v1/platform-settings/currencies/* | platform/Settings.tsx | ✅ |
| 时区管理 | /api/v1/platform-settings/timezones/* | platform/Settings.tsx | ✅ |
| 关联管理 | /api/v1/platform-settings/associations/* | platform/Settings.tsx | ✅ |

---

## 10. 商户后台模块 ⚠️ 

### 10.1 支付管理（商户API）

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 创建支付 | POST /api/v1/payments | - | ✅ 后端已实现 |
| 支付列表 | GET /api/v1/payments | merback/PayIn/Pay.tsx | ❌ 待对接 |
| 支付详情 | GET /api/v1/payments/:id | merback/PaymentDetails | ❌ 待对接 |
| 取消支付 | PUT /api/v1/payments/:id/cancel | merback/PaymentDetails | ❌ 不用对接 |
| 关闭支付 | PUT /api/v1/payments/:id/close | merback/PaymentDetails | ❌ 不用对接 |

**说明**：管理后台的Bearer Token
- 后端已实现完整的商户支付API（使用 API Key 认证）
- 前端商户后台目前使用 Mock 数据
- 需要对接真实API并实现 API Key 认证机制

### 10.2 退款管理 

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 创建退款 | POST /api/v1/refunds | merback/PaymentDetails | ✅ |
| 查询退款 | GET /api/v1/refunds/:id | merback/PaymentDetails | ✅ |

### 10.3 应用管理

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 创建应用 | POST /api/v1/applications | ✅ |
| 查询应用 | GET /api/v1/applications/:id | ✅ |

### 10.4 统计分析

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 交易汇总 | GET /api/v1/statistics/transactions/summary | merback/Dashboard | ⚠️ 后端路由已定义，Handler未实现 |
| 交易类型统计 | GET /api/v1/statistics/transactions/by-type | merback/Dashboard | ⚠️ 后端路由已定义，Handler未实现 |
| 交易状态统计 | GET /api/v1/statistics/transactions/by-status | merback/Dashboard | ⚠️ 后端路由已定义，Handler未实现 |
| 交易趋势 | GET /api/v1/statistics/transactions/trend | merback/Dashboard | ⚠️ 后端路由已定义，Handler未实现 |
| 时段统计 | GET /api/v1/statistics/transactions/time-slot | merback/Dashboard | ⚠️ 后端路由已定义，Handler未实现 |
| 峰值分析 | GET /api/v1/statistics/transactions/peak-analysis | merback/Dashboard | ⚠️ 后端路由已定义，Handler未实现 |
| 周期性分析 | GET /api/v1/statistics/transactions/cyclical-analysis | merback/Dashboard | ⚠️ 后端路由已定义，Handler未实现 |
| 商户概览 | GET /api/v1/statistics/merchants/overview | merback/Dashboard | ⚠️ 后端路由已定义，Handler未实现 |
| 应用统计 | GET /api/v1/statistics/merchants/applications | merback/Dashboard | ⚠️ 后端路由已定义，Handler未实现 |
| 商户交易统计 | GET /api/v1/statistics/merchants/transactions | merback/Dashboard | ⚠️ 后端路由已定义，Handler未实现 |
| 日报 | GET /api/v1/statistics/reports/daily | merback/Dashboard | ⚠️ 后端路由已定义，Handler未实现 |
| 周报 | GET /api/v1/statistics/reports/weekly | merback/Dashboard | ⚠️ 后端路由已定义，Handler未实现 | 不用实现
| 月报 | GET /api/v1/statistics/reports/monthly | merback/Dashboard | ⚠️ 后端路由已定义，Handler未实现 | 不用实现
| 数据导出 | GET /api/v1/statistics/export | - | ⚠️ 后端路由已定义，Handler未实现 |
| 聚合数据 | GET /api/v1/statistics/aggregation | - | ⚠️ 后端路由已定义，Handler未实现 |

### 10.5 风控管理 ✅

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 查询风控状态 | GET /api/v1/risk/merchant/query | - | ⚠️ 后端路由已定义，Handler未实现 |
| 提交申诉 | POST /api/v1/risk/merchant/appeal | - | ⚠️ 后端路由已定义，Handler未实现 |
| 获取帮助信息 | GET /api/v1/risk/merchant/help | - | ⚠️ 后端路由已定义，Handler未实现 |
| 获取风险等级 | GET /api/v1/risk/merchant/:merchant_id/level | - | ⚠️ 后端路由已定义，Handler未实现 |
| 获取优化建议 | GET /api/v1/risk/merchant/:merchant_id/suggestions | - | ⚠️ 后端路由已定义，Handler未实现 |
| 风险等级历史 | GET /api/v1/risk/merchant/:merchant_id/level/history | - | ⚠️ 后端路由已定义，Handler未实现 |
| 申诉历史 | GET /api/v1/risk/merchant/:merchant_id/appeals | - | ⚠️ 后端路由已定义，Handler未实现 |
| 申诉状态 | GET /api/v1/risk/merchant/appeal/:appeal_id/status | - | ⚠️ 后端路由已定义，Handler未实现 |
mch_7e9672ea6b0b
---

## 商户后台对接优先级建议

### � 认证实现（第一步）
**前端商户后台使用 Bearer Token 认证（与管理后台相同）**

1. **复用现有认证逻辑**
   - 商户管理员使用账号密码登录
   - 登录接口：POST /api/v1/auth/login
   - 获得会话Token后使用 `Authorization: Bearer {token}`
   - 后端根据用户角色（APP_OWNER、APP_FINANCE等）自动过滤数据

2. **数据隔离**
   - 后端已实现基于角色的数据过滤
   - 商户用户只能看到自己应用的数据
   - 无需前端额外处理权限逻辑

### �🔴 高优先级（核心功能）
1. **支付列表和详情** - 商户查看自己的交易记录
   - GET /api/v1/payments
   - GET /api/v1/payments/:id
   - 使用 Bearer Token 认证（已有）

2. **退款功能** - 商户发起退款 
   - POST /api/v1/refunds
   - GET /api/v1/refunds/:id

3. **基础统计** - Dashboard 核心数据
   - GET /api/v1/statistics/transactions/summary
   - GET /api/v1/statistics/merchants/overview

### 🟡 中优先级（增强功能）
4. **详细统计** - 多维度数据分析
   - GET /api/v1/statistics/transactions/by-type
   - GET /api/v1/statistics/transactions/by-status
   - GET /api/v1/statistics/transactions/trend

5. **应用管理** - 商户管理自己的应用-不对接
   - POST /api/v1/applications
   - GET /api/v1/applications/:id
   - 需要实现 applicationHandler

### 🟢 低优先级（辅助功能）
6. **风控查询** - 商户查看风控状态
   - GET /api/v1/risk/merchant/query
   - POST /api/v1/risk/merchant/appeal

7. **高级统计** - 深度数据分析
   - GET /api/v1/statistics/transactions/peak-analysis
   - GET /api/v1/statistics/transactions/cyclical-analysis

---

## 后端待实现的 Handler

### 必须实现
1. **statisticsHandler** - 统计分析处理器
   - 所有 `/api/v1/statistics/*` 路由的处理函数
   - 需要实现商户级别的数据隔离和权限控制

2. **applicationHandler** - 应用管理处理器
   - CreateApplication - 创建应用
   - GetApplication - 查询应用信息

3. **riskHandler（商户部分）** - 风控查询处理器
   - QueryMerchantRiskStatus - 查询风控状态
   - SubmitMerchantAppeal - 提交申诉
   - 其他风控查询接口

### 实现要点
- 必须实现商户级别的数据隔离（只能查看自己的数据）
- 统计数据需要根据商户的应用ID进行过滤
- 需要实现适当的缓存策略提升性能

---

## 前端待实现的功能

### 商户后台认证 ✅ 无需额外实现
**好消息**：商户后台可以复用管理后台的认证机制！

- ✅ 使用现有的 Bearer Token 认证
- ✅ 使用现有的 AuthService
- ✅ 使用现有的 ApiService
- ✅ 后端自动根据用户角色过滤数据
- ✅ 无需实现 API Key 签名算法

**唯一区别**：
- API路径前缀：`/api/v1/merchant/*`（而不是 `/api/v1/admin/*`）
- 商户后台用户角色：APP_OWNER、APP_FINANCE、APP_CUSTOMER_SERVICE
- 管理后台用户角色：PLATFORM_SUPER_ADMIN、PLATFORM_OPERATIONS_ADMIN等
- 后端会根据角色自动返回对应的数据

### API常量更新
需要在 `api.constant.ts` 中添加商户后台的API常量：

```typescript
// 商户后台端点
export const MERCHANT_BACKEND_API = {
    // 支付管理
    PAYMENTS: '/api/v1/merchant/payments',
    PAYMENT_DETAIL: (id: string) => `/api/v1/merchant/payments/${id}`,
    PAYMENT_CANCEL: (id: string) => `/api/v1/merchant/payments/${id}/cancel`,
    PAYMENT_CLOSE: (id: string) => `/api/v1/merchant/payments/${id}/close`,
    
    // 退款管理
    REFUNDS: '/api/v1/merchant/refunds',
    REFUND_DETAIL: (id: string) => `/api/v1/merchant/refunds/${id}`,
    
    // 统计分析
    STATISTICS_OVERVIEW: '/api/v1/merchant/statistics/overview',
    STATISTICS_SUMMARY: '/api/v1/merchant/statistics/transactions/summary',
} as const
```

### 页面对接
1. **支付列表页面** (merback/PayIn/Pay.tsx)
   - 对接 GET /api/v1/payments
   - 实现分页、筛选、排序

2. **支付详情页面** (merback/PaymentDetails)
   - 对接 GET /api/v1/payments/:id
   - 实现退款功能（POST /api/v1/refunds）
   - 实现取消/关闭支付

3. **Dashboard** (merback/Dashboard)
   - 对接统计API
   - 实现数据可视化
   - 实现时间范围筛选

---

## 切换建议

### 阶段一：基础功能对接（1周）
1. ✅ 认证机制已完成（复用管理后台的 Bearer Token）
2. 🔧 后端创建 `/api/v1/merchant` 路由组
3. 对接支付列表和详情API
4. 实现基础统计Handler

### 阶段二：核心功能完善（2-3周）
4. 实现退款功能
5. 实现应用管理Handler
6. 对接详细统计API

### 阶段三：高级功能（2-3周）
7. 实现风控查询功能
8. 实现高级统计分析
9. 优化性能和用户体验

 后端路由已定义但Handler未实现
应用管理（路由存在，Handler缺失）

POST /api/v1/applications
GET /api/v1/applications/:id
统计分析（15个路由，全部Handler缺失）

交易统计：summary, by-type, by-status, trend, time-slot, peak-analysis, cyclical-analysis
商户统计：overview, applications, transactions
报表：daily, weekly, monthly
数据：export, aggregation
风控管理（8个路由，全部Handler缺失）

风控查询、申诉、帮助、风险等级、优化建议等