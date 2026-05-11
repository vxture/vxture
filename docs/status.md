# Vxture 平台待完善任务清单

> 版本：1.2.0 | 更新：2026-05-11
> 优先级：🔴 P0 上线阻塞 / 🟠 P1 上线后短期必补 / 🟡 P2 可迭代
> 此文件跟踪平台功能级任务，文档体系任务见当前对话清单

---

## 🔴 P0 — 上线阻塞

### ~~T01 · 邮件系统~~ ✅ 2026-05-02 已完成（基础版）

**架构：** 阿里云 SMTP（DirectMail）+ Nodemailer，独立包 `@vxture/service-mail`

**已完成：**
- [x] `@vxture/service-mail` 包（`services/notification/mail/`）
- [x] `SmtpMailProvider`（Nodemailer，端口 465 SSL）+ `ConsoleMailProvider`（开发 fallback）
- [x] `MailService`：发送失败自动重试 1 次，支持验证码 / 密码重置两类模板
- [x] `VerifyCodeService`：6 位验证码，Redis TTL 10 分钟，限流（1/分·5/时·10/天）
- [x] `POST /api/send-code` 和 `POST /api/verify-code` 接入 website-bff

**环境变量（填入 `.env.local`）：**
```
SMTP_HOST=smtpdm.aliyun.com
SMTP_PORT=465
SMTP_USER=no-reply@mail.vxture.com
SMTP_PASS=（阿里云控制台生成）
SMTP_FROM="vxture studio" <no-reply@mail.vxture.com>
REDIS_URL=redis://localhost:6379
WEBSITE_BASE_URL=https://vxture.com
```

**待完善（P1）：**
- [x] `requestPasswordReset` 已接入 `MailService.sendPasswordReset`（`bff/website-bff/src/auth/auth.service.ts:81`）
- [ ] 后续接入 `console-bff`（账单通知）、`admin-bff`（公告）

**代码入口：**
- `services/notification/mail/src/` — 核心服务
- `bff/website-bff/src/routers/verifycode.router.ts` — API 路由

---

### ~~T02 · 密码重置流程~~ ✅ 2026-05-02 已完成（含邮件发送）

- [x] `POST /api/auth/forgot-password` → 调用 `MailService.sendPasswordReset` 发送重置邮件
- [x] `POST /api/auth/reset-password`（消费 token，重置密码）
- [x] token 存 DB（`account.password_reset_token`，SHA-256 哈希，15 分钟 TTL，一次性）
- [x] 前端 `LoginForm` 忘记密码面板：成功后显示"邮件已发送"提示（不再透传链接）
- [x] 新建 `/reset-password` 页面（`ResetPasswordForm` 组件）

**代码入口：** `bff/website-bff/src/auth/auth.service.ts` → `requestPasswordReset`

---

### ~~T03 · 租户初始化（注册后绑定租户）~~ ✅ 2026-05-02 已完成

- [x] `POST /api/auth/tenant/init`（参数 `{ type: 'individual' | 'organization' }`）
- [x] `OrganizationReadRepository.createTenant` — 事务：INSERT tenant + INSERT tenant_member(owner)
- [x] `OrganizationReadService.createTenantForAccount` — 业务层封装
- [x] `WebsiteAuthService.initTenant` — 幂等创建 + 重签 JWT（含 tenantId + authScope.TENANT_CONSOLE）
- [x] 前端 `VerifyForm.handleChoose` — 调用接口后 `window.location.href` 跳转 console
- [ ] ⚠️ 尚未实现：为租户分配默认配额（依赖 service-billing，T05 后再补）

**代码入口：**
- `services/tenant/organization/src/repository/pg-organization.repository.ts` → `createTenant`
- `bff/website-bff/src/routers/auth.router.ts` → `POST api/auth/tenant/init`
- `portals/website/src/components/auth/VerifyForm.tsx` → `handleChoose`

---

### ~~T04 · website-bff 租户中间件~~ ✅ 2026-05-02 已完成

- [x] `TenantMiddleware` — 读取 JWT cookie，提取 `tenantId`，挂载到 `req.tenantId`
- [x] `AppModule` — 注册在 `AuthMiddleware` 之后，作用于所有 `api/*` 路由

**代码入口：** `bff/website-bff/src/middleware/tenant.middleware.ts`

---

### T05 · 第三方支付集成

**影响：** 平台无法在线收款，订阅/升级流程无法闭环

- [ ] 确定支付渠道（支付宝 / 微信支付 / Stripe）
- [ ] 在 `bff/admin-bff` 对接支付 SDK，实现下单、回调、对账
- [ ] 前端 billing/orders 页面已有 UI，对接接口即可
- [ ] 如初期走线下对账（企业客户），此项可延后

**代码入口：** `bff/admin-bff/src/routers/payments.router.ts`（当前纯内部数据操作）

---

## 🟠 P1 — 上线后短期必补

### ~~T06 · Vela AI 助手~~ ✅ 一期完成（三端运行中）

- [x] `bff/vela-bff`：中间件 + CallerContext + /vela/chat SSE 透传
- [x] `agent-server/vela`：ToolRegistry + 9 个只读工具 + Tool Use Loop + Prisma
- [x] `agent-studio/vela`：嵌入 admin / console 侧边栏
- [x] Nginx SSE 路由配置 + 环境变量模板

**规格文档：** `docs/product/agents/vela/spec.md`
**二期待做：** 见 `docs/product/agents/vela/status.md`（执行类工具 / 审计日志 / jti 黑名单）

---

### ~~T07 · Admin 三个 Placeholder 页面~~ ✅ 2026-05-11 已完成

- [x] 审计日志页面（`/audit-logs`）— `AuditLogsPage.tsx`，含汇总卡片 / 筛选 / 分页
- [x] 公告管理页面（`/announcements`）— `AnnouncementsPage.tsx`，列表 + 卡片双视图
- [x] 技能管理页面（`/skills`）— `SkillsPage.tsx`，列表 + 卡片双视图

**注：** BFF 路由（`audit-logs.router.ts` / `announcements.router.ts` / `skills.router.ts`）已注册，当前返回空列表；数据层（DB 查询）接入后页面自动生效。

**代码入口：**
- `portals/admin/src/modules/audit-logs/AuditLogsPage.tsx`
- `portals/admin/src/modules/announcements/AnnouncementsPage.tsx`
- `portals/admin/src/modules/skills/SkillsPage.tsx`

---

### T08 · 社交登录接入

**影响：** 注册/登录页「微信 / 钉钉 / 飞书」按钮当前为 stub

- [ ] 接入微信 OAuth2
- [ ] 接入钉钉 OAuth2
- [ ] 接入飞书 OAuth2
- [ ] website-bff 新增对应回调端点

**代码入口：** `portals/website/src/components/auth/LoginForm.tsx` → `SocialLoginButtons`

---

### ~~T09 · 部署配置文档~~ ✅ 2026-05-11 已完成

- [x] 根目录 `.env.example`（统一管理所有共享变量）
- [x] `bff/admin-bff/.env.example`（包级覆盖：`ADMIN_BFF_PORT` / `AI_GATEWAY_URL`）
- [x] `bff/website-bff/.env.example`（包级覆盖：`WEBSITE_BFF_PORT` / OAuth 凭证）
- [x] `bff/console-bff/.env.example`（包级覆盖：`CONSOLE_BFF_PORT`）
- [x] 必填变量已标注：`DATABASE_URL` / `JWT_SECRET` / `AUTH_COOKIE_DOMAIN` / `AUTH_BFF_URL` / `AUTH_INTERNAL_TOKEN` / `AI_GATEWAY_URL`

---

### T10 · console-bff / portals/console 接口对接验证

**影响：** console 页面已有 UI 骨架，但未全面验证 BFF 接口联通

- [ ] 逐模块验证：billing / subscription / members / roles / settings
- [ ] 确认 tenantId 在 JWT 中正确传播

**代码入口：** `bff/console-bff/src/routers/`

---

## 🟡 P2 — 可迭代

### T11 · Vela 执行类工具审计日志

- [ ] `agent-server/vela` 的 `VelaAuditLog` 模型已定义，执行流程未装
- [ ] 上线执行类工具前必须完成

**代码入口：** `agent-server/vela/prisma/schema.prisma:45`（注释标注为二期）

---

### T12 · admin-bff products.router 静态 mock 数据

- [ ] `capabilityProfiles` 常量（53-87 行）为静态配置，确认是否替换为数据库驱动
- [ ] 与产品团队确认产品能力数据的管理方式

**代码入口：** `bff/admin-bff/src/routers/products.router.ts:53`

---

### ~~T13 · BFF Lint 配置~~ ✅ 2026-05-11 已完成

- [x] 创建 `bff/eslint.config.mjs`（ESLint v9 flat config，TypeScript + NestJS 规则）
- [x] 所有 5 个 BFF（admin / website / console / ruyin / vela）`package.json` lint 脚本从 echo 占位改为 `eslint src`
- [x] 根目录 `pnpm lint` 递归调用时自动覆盖所有 BFF

---

### T14 · 注册邮箱验证（二期）

- [ ] 注册后要求验证邮箱才能使用全部功能
- [ ] 依赖 T01（邮件系统）和 T03（租户初始化）
- [ ] 当前注册流程无需验证邮箱，后期可按合规需求开启

---

### T15 · 个人/企业实名认证后台（二期）

- [ ] `/verify` 页面当前选择租户类型后直接生效，无需审核
- [ ] 后期可接入身份证 OCR（个人）/ 工商核验 API（企业）
- [ ] admin 后台需配套审核管理页面

**代码入口：** `portals/website/src/components/auth/VerifyForm.tsx` → `handleChoose`

---

## 附：关键代码入口索引

| 编号 | 文件 | 说明 |
|------|------|------|
| T01 | `bff/website-bff/src/auth/auth.service.ts` | 邮件发送预留点 |
| T02 | `portals/website/src/components/auth/LoginForm.tsx` | 忘记密码 UI 已就绪 |
| T03 | `bff/website-bff/src/routers/auth.router.ts` → `POST /api/auth/tenant/init` | ✅ 已完成 |
| T04 | `bff/website-bff/src/middleware/tenant.middleware.ts` | ✅ 已完成 |
| T05 | `bff/admin-bff/src/routers/payments.router.ts` | 纯内部数据，无 SDK |
| T06 | `docs/product/agents/vela/status.md` | ✅ 一期完成，二期见状态文档 |
| T11 | `agent-server/vela/prisma/schema.prisma:45` | 注释标注二期 |
| T12 | `bff/admin-bff/src/routers/products.router.ts:53` | 静态 mock |
