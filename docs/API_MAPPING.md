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

## 4. 退款模块 ✅ 已对接（管理后台）

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 创建退款| POST /api/v1/admin/refunds | PaymentInfo.tsx (RefundDialog) | ✅ 已对接 |
| 创建退款（商户API） | POST /api/v1/refunds | src\views\merback\PaymentDetails\components\PaymentInfo.tsx | ⚠️ 待对接 |
| 查询退款 | GET /api/v1/refunds/:id | OrderFilter | ⚠️ 待对接 |

**对接完成说明**：
- ✅ RefundApi.ts - 退款 API 服务已实现
- ✅ refund.ts - 退款类型定义已完成
- ✅ RefundDialog.tsx - 退款对话框组件已实现
- ✅ PaymentInfo.tsx - 支付详情页面已集成退款按钮
- ✅ 管理后台退款功能已完成，只有支付成功的订单才能发起退款
- ⚠️ 商户后台退款功能待后续对接

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
| 商户应用列表 | GET /api/v1/admin/merchants/:id/applications | CustomerDetail.tsx | ✅ 已对接 |
| 代理商商户 | GET /api/v1/admin/agents/:id/merchants | Customers.tsx（筛选） | ✅ 已对接 |
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

注意事项
统计数据：暂时通过商户列表计算（后端无专门统计接口）
后端暂不支持修改商户基本信息，只支持状态更新
商户统计数据需要后端提供专门的统计 API
支付历史需要对接支付模块的 API
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

## 需要补充的后端接口

前端 Mock 使用但后端缺失的接口：

| Mock API | 用途 | 建议 |
|----------|------|------|
| GET /api/sales/dashboard | 支付 Dashboard | 用统计接口替代 |
| GET /api/crm/dashboard | 商户 Dashboard | 用统计接口替代 |
| GET /api/crm/customers | 商户列表 | 添加 GET /api/v1/merchants |

---

## 切换建议

1. **第一阶段**：先对接已有的后端接口（认证、渠道管理）
2. **第二阶段**：后端补充列表查询接口（支付列表、商户列表）
3. **第三阶段**：前端补充管理页面（MFA、风控、平台设置）
4. **第四阶段**：Dashboard 对接统计接口
