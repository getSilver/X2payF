# 前后端接口对照表

## 状态说明
- ✅ 前后端都有
- ⚠️ 后端有，前端缺页面
- ❌ 前端需要，后端缺接口

---

## 1. 认证模块

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 登录 | POST /api/v1/auth/login | SignInForm.tsx | ✅ |
| 登出 | POST /api/v1/auth/logout | useAuth.ts | ✅ |
| 会话验证 | GET /api/v1/auth/session | AuthService.ts | ✅ |
| MFA 验证码 | POST /api/v1/auth/mfa/challenge | useAuth.ts | ✅ |
| MFA 验证 | POST /api/v1/auth/mfa/verify | useAuth.ts | ✅ |
| 忘记密码 | POST /api/v1/auth/forgot-password | ForgotPasswordForm.tsx | ✅ |
| 重置密码 | POST /api/v1/auth/reset-password | ResetPasswordForm.tsx | ✅ |

---

## 2. MFA 管理模块

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| TOTP 绑定 | POST /api/v1/mfa/totp/enroll | MFAIntegrationDialog.tsx | ✅  |
| TOTP 验证 | POST /api/v1/mfa/totp/verify | MFAIntegrationDialog.tsx | ✅  |
| 邮箱绑定 | POST /api/v1/mfa/email/enroll | Profile.tsx | ✅ email: Yup |
| 列出因子 | GET /api/v1/mfa/factors | MFAIntegrationDialog.tsx | ✅  |
| 解绑因子 | DELETE /api/v1/mfa/factors/:id | MFAIntegrationDialog.tsx | ✅ |
| 管理员重置 | DELETE /api/v1/admin/users/:id/mfa | CustomerDetail.tsx | ✅  |

---

## 3. 支付模块

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 创建支付 | POST /api/v1/payments | 商户API调用 | ✅ 无需页面 |
| 查询支付 | GET /api/v1/payments/:id | PaymentDetails.tsx | ✅ |
| 取消支付 | PUT /api/v1/payments/:id/cancel | PaymentDetails.tsx | ✅ 需加按钮 |
| 关闭支付 | PUT /api/v1/payments/:id/close | PaymentDetails.tsx | ✅ 需加按钮 |
| 支付列表 | GET /api/v1/payments | PayIn.tsx | ⚠️ 后端需暴露接口 |
| Dashboard | GET /api/v1/statistics/* | Dashboard.tsx | ⚠️ 需对接统计API |

---

## 4. 退款模块

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 创建退款 | POST /api/v1/refunds | PaymentDetails.tsx | ✅ 按钮 |
| 查询退款 | GET /api/v1/refunds/:id | OrderFilter | ✅ 筛选 |

---

## 5. 渠道模块

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 创建渠道 | POST /api/v1/channels | ChannelNew.tsx | ✅ |
| 渠道列表 | GET /api/v1/channels | ChannelList.tsx | ✅ |
| 渠道详情 | GET /api/v1/channels/:id | ChannelEdit.tsx | ✅ |
| 更新渠道 | PUT /api/v1/channels/:id | ChannelEdit.tsx | ✅ |
| 删除渠道 | DELETE /api/v1/channels/:id | ChannelList.tsx | ✅ |
| API配置 | POST /api/v1/channels/:id/api-config | OrganizationFields.tsx/component={Input} | ✅ 表格输入 |
| 费率配置 | POST /api/v1/channels/:id/fee-config | PricingFields.tsx/NumericFormatInput | ✅ 表格输入 |
| 限额配置 | POST /api/v1/channels/:id/limit-config | PricingFields.tsx/NumericFormatInput | ✅ 表格输入 |
| 获取配置 | GET /api/v1/channels/:id/config | - | ⚠️ 缺前端 |
| 更新凭据 | PUT /api/v1/channels/:id/credentials | ChannelTable.tsx | ⚠️ 缺前端 |
| 更新状态 | PUT /api/v1/channels/:id/status | ChannelTable.tsx / onClick={status} |✅ 点击事件|
| 获取状态 | GET /api/v1/channels/:id/status | ChannelTable.tsx / sortable: true, | ✅ 表格排序|
| 渠道指标 | GET /api/v1/channels/:id/metrics | ChannelTable.tsx | ✅ 表格展示 |
| Dashboard | GET /api/v1/statistics/channels/performance | channel/Dashboard.tsx|⚠️ 需对接统计API |

---

## 6. 账户/商户模块

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 创建商户 | POST /api/v1/accounts/merchants | CustomerNew.tsx | ✅ |
| 创建代理商 | POST /api/v1/accounts/agents | CustomerNew.tsx（类型=代理商） | ✅ |
| 创建渠道商 | POST /api/v1/accounts/channel-partners | CustomerNew.tsx（类型=渠道商） | ✅ |
| 账户详情 | GET /api/v1/accounts/:id | CustomerDetail.tsx | ✅ |
| 更新状态 | PUT /api/v1/accounts/:id/status | CustomerDetail.tsx | ✅ 需加按钮 |
| 商户详情 | GET /api/v1/merchants/:id/details | CustomerDetail.tsx | ✅ |
| 商户列表 | GET /api/v1/merchants | Customers.tsx | ⚠️ 需确认后端 |
| 代理商商户 | GET /api/v1/agents/:id/merchants | Customers.tsx（筛选） | ✅ |
| Dashboard | GET /api/v1/statistics/merchants/* | merchants/Dashboard.tsx | ⚠️ 需对接统计API |

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

## 8. 风控模块

| 功能 | 后端 API | 前端页面/服务 | 状态 |
|------|----------|---------------|------|
| 商户风控状态 | GET /api/v1/risk/merchant/query | - | ⚠️ 缺前端 |
| 提交申诉 | POST /api/v1/risk/merchant/appeal | - | ⚠️ 缺前端 |
| 风控规则管理 | /api/v1/risk/admin/rules/* | risk/Rules.tsx | ✅ |
| 审核队列 | /api/v1/risk/admin/reviews/* | - | ⚠️ 缺前端 |

---

## 9. 平台设置模块

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
