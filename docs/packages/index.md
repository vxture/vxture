# 包实现上下文索引

> 各包的实现约束、目录结构、依赖规则。
> 内容迁移自各包原有 `CLAUDE.md`，标注「⚠️ 待大版本重构」的文件以现有内容为准，后续按实际代码核查更新。
>
> 层级架构见 → `docs/architecture/index.md`

---

## Core 层（Infrastructure）

| 文件 | 包名 | 职责摘要 |
|------|------|---------|
| [`core/auth.md`](core/auth.md) | `@vxture/core-auth` | JWT 验证 / session 工具 / 角色类型 |
| [`core/api.md`](core/api.md) | `@vxture/core-api` | 统一 HTTP 客户端 / 拦截器 / 错误标准化 |
| [`core/tenant.md`](core/tenant.md) | `@vxture/core-tenant` | tenantId 解析 / 租户上下文传播 |
| [`core/config.md`](core/config.md) | `@vxture/core-config` | 环境变量 → 强类型配置对象（zod） |
| [`core/locale.md`](core/locale.md) | `@vxture/core-locale` | 服务端语言解析 / 内容本地化 |
| [`core/utils.md`](core/utils.md) | `@vxture/core-utils` | 日志 / 环境判断 / 类型守卫 / 错误类 |
| [`core/database.md`](core/database.md) | `@vxture/core-database` | Prisma DDL 管理（6 个 Schema，唯一入口） |
| [`core/mail.md`](core/mail.md) | `@vxture/core-mail` | 事务邮件发送（nodemailer 封装，无业务模板） |

## AI SDK 层（Infrastructure）

| 文件 | 包名 | 职责摘要 |
|------|------|---------|
| [`ai/ai-sdk.md`](ai/ai-sdk.md) | `@vxture/ai-sdk` | AI Gateway HTTP 客户端（LLM / Embedding / RAG / Workflow） |

## Shared 层

| 文件 | 包名 | 职责摘要 |
|------|------|---------|
| [`shared.md`](shared.md) | `@vxture/shared` | 纯工具 / 类型 / 常量（零业务逻辑） |

## BFF 层（Application）

| 文件 | 包名 | 服务对象 |
|------|------|---------|
| [`bff/auth-bff.md`](bff/auth-bff.md) | `@vxture/bff-auth` | 统一认证网关（唯一 JWT 签发者） |
| [`bff/gateway-bff.md`](bff/gateway-bff.md) | `@vxture/bff-gateway` | 浏览器侧统一 API 入口网关 |
| [`bff/admin-bff.md`](bff/admin-bff.md) | `@vxture/bff-admin` | 运营后台 |
| [`bff/console-bff.md`](bff/console-bff.md) | `@vxture/bff-console` | 租户工作台 |
| [`bff/website-bff.md`](bff/website-bff.md) | `@vxture/bff-website` | 营销站点 |
| [`bff/ruyin-bff.md`](bff/ruyin-bff.md) | `@vxture/bff-ruyin` | Ruyin Agent |
| [`bff/vela-bff.md`](bff/vela-bff.md) | `@vxture/bff-vela` | Vela 智能助手 |

## Service 层（Domain）

| 文件 | 包名 | 业务域 |
|------|------|-------|
| [`services/ai-gateway.md`](services/ai-gateway.md) | `@vxture/service-ai-gateway` | AI 模型注册 / 路由 / 配额计量 |
| [`services/iam.md`](services/iam.md) | `@vxture/service-iam` | 身份与账户认证 |
| [`services/billing.md`](services/billing.md) | `@vxture/service-billing` | 账单 / 计费 |
| [`services/subscription.md`](services/subscription.md) | `@vxture/service-subscription` | 订阅 / Feature Gating |
| [`services/mail.md`](services/mail.md) | `@vxture/service-mail` | 邮件发送 / 验证码 |
| [`services/sms.md`](services/sms.md) | `@vxture/service-sms` | 短信发送 |
| [`services/ticket.md`](services/ticket.md) | `@vxture/service-ticket` | 工单支持 |
| [`services/organization.md`](services/organization.md) | `@vxture/service-organization` | 租户组织只读服务 |

## Agent Server 层

| 文件 | 名称 | 职责摘要 |
|------|------|---------|
| [`agents/vela-server.md`](agents/vela-server.md) | `vela-server` | Vela Tool Use Loop / SSE / 会话持久化 |
| [`agents/ruyin-server.md`](agents/ruyin-server.md) | `ruyin-server` | Ruyin Agent 私有后端 |

## Agent Studio 层（Presentation）

| 文件 | 包名 | 职责摘要 |
|------|------|---------|
| [`agents/vela-studio.md`](agents/vela-studio.md) | `@vxture/agent-studio-vela` | Vela 智能助手前端（嵌入式微前端） |
| [`agents/ruyin-studio.md`](agents/ruyin-studio.md) | `@vxture/ruyin` | Ruyin 智能体独立应用（Next.js） |

## Portal 层（Presentation）

| 文件 | 包名 | 职责摘要 |
|------|------|---------|
| [`portals/website.md`](portals/website.md) | `@vxture/website` | 营销站点（Next.js 15，Content Registry） |
| [`portals/admin.md`](portals/admin.md) | `@vxture/admin` | 运营后台 |
| [`portals/console.md`](portals/console.md) | `@vxture/console` | 租户工作台 |

## 工具

| 文件 | 包名 | 职责摘要 |
|------|------|---------|
| [`tools/dev-panel.md`](tools/dev-panel.md) | `@vxture/dev-panel` | 本地可视化服务控制面板（:8090） |
