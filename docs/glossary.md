# 术语表

> 平台核心概念的权威定义，按字母序排列。
> 遇到不认识的术语时查此文件，不要从上下文猜测。

---

## A

**ADR（Architecture Decision Record）**
架构决策记录。记录重大技术决策的背景、选项、结果和后果。一旦 Accepted 不修改，只能被新 ADR Supersede。见 `docs/decisions/`。

**agent-server**
Agent 私有后端。运行 Tool Use Loop，通过 `@vxture/ai-sdk` 调用 LLM，持久化会话和消息。每个 Agent 实例有独立的 agent-server，禁止跨实例 import。

**agent-studio**
Agent 前端（`agent-studio/*`）。Next.js 应用，渲染对话 UI，通过 SSE 消费对应 BFF 的流式响应。可以嵌入式（iframe/module federation）或独立部署。

**auth-bff**
平台唯一 JWT 签发者（`@vxture/bff-auth`）。所有登录/OAuth 流程最终在此签发 access + refresh token pair。其他 BFF 通过 `POST /auth/internal/sign` 委托签发，不持有签发密钥。见 ADR-001。

---

## B

**BCP47**
IETF 语言标签标准（RFC 5646）。本平台使用 `zh-CN`（简体中文）和 `en-US`（美式英语）两个标签，贯穿 URL 路由段、`<html lang>` 属性、`Intl.*` API、翻译文件目录。见 ADR-002。

**BFF（Backend For Frontend）**
专为特定前端定制的后端服务（`bff/*`）。职责：JWT 验证、tenantId 解析、RBAC 守卫、请求聚合、响应塑形。不直接调用 LLM，不持有业务数据库写权限，不签发 JWT（auth-bff 除外）。

**business/**
业务产品目录，当前包含 `business/ruyin`（@vxture/ruyin，Ruyin Agent 前端）。区别于 `portals/`（平台管理 UI）和 `agent-studio/`（嵌入式 AI 产品）。

---

## C

**CallerContext**
vela-bff 构建的请求安全上下文，包含：`surface`、`userId`、`tenantId`、`allowedTools`、`dataScope`。在 vela-bff 中由 JWT + Surface Header 构建，透传给 vela-server 并在其中**二次校验**。禁止从 request body 取任何字段覆盖。

**core 层**
基础设施原语层（`packages/core/*`）。框架无关（无 NestJS、无 Next.js），不含业务逻辑，不引用任何上层依赖。Node.js + 浏览器双端兼容（例外：`core-database` 仅服务端）。

---

## D

**dataScope**
CallerContext 中的数据访问范围枚举。`global`：operator 可访问所有租户数据；`tenant`：tenant_user 只能访问 `tenantId` 对应租户的数据。service 层工具在执行时必须以此过滤。

**design-system**
UI 组件库和设计令牌（`@vxture/design-system`）。应用侧禁止绕过 DS 自建样式、组件、图标。违反时走 `checklist-ds.md` 流程审计。

---

## G

**gateway-bff**
浏览器侧 API 网关（`@vxture/bff-gateway`，端口 8000）。按路径前缀将前端请求分发到对应专属 BFF。零业务逻辑，零鉴权，零聚合。

---

## J

**jti（JWT ID）**
JWT 唯一标识符（claim：`jti`）。auth-bff 使用 `crypto.randomUUID()` 生成。logout 时将 jti 写入 Redis 黑名单（TTL = access token 剩余有效期），实现有状态 token 吊销。

---

## M

**monorepo**
单仓库多包架构。本项目使用 pnpm workspaces，35+ 个包共存，通过 `workspace:*` 协议本地链接，无需发版即可引用。见 ADR-003。

---

## O

**operator**
运营端用户类型（JWT claim：`userType: "operator"`）。对应 `admin.vxture.com`，`dataScope: global`，可访问所有租户数据。角色：`super_admin`、`admin`。

---

## P

**platform-browser**
`@vxture/platform-browser`。浏览器端第三方 SDK 封装（地图、分析等），目前是唯一已实现的 Platform SDK。

**PLG（Product-Led Growth）**
产品驱动增长。首次社交登录自动创建 Personal Tenant 并赋 Trial Plan，零摩擦进入产品，无需销售介入。见 ADR-005。

**portal**
平台管理 UI（`portals/*`），包含：`website`（官网，Next.js 15）、`admin`（运营后台）、`console`（租户控制台）。迭代节奏慢，设计稳定。

**Prisma**
ORM 工具。DDL 集中在 `@vxture/core-database`（6 个 schema 文件）。`PrismaClient` 实例只在 service 层 repository 中使用，禁止在 BFF 或更高层直接操作数据库。

---

## R

**RBAC（Role-Based Access Control）**
基于角色的访问控制。平台有两套完全隔离的权限域：operator 域（`super_admin / admin`）和 tenant 域（`owner / admin / member`）。见 `docs/design/permissions.md`。

**refresh token**
用于续期 access token 的长效凭证（默认 7 天）。存储在 Redis。logout 时立即从 Redis 删除，不可续期。operator 和 tenant 各有独立 Redis key 前缀（`refresh:operator:{userId}` vs `refresh:tenant:{surface}:{userId}`）。

**ruyin**
独立 AI Agent 产品，有独立域名 `ruyin.ai`。三端：`business/ruyin`（@vxture/ruyin，前端）+ `agent-server/ruyin`（后端）+ `bff/ruyin-bff`（BFF）。

---

## S

**service 层**
域业务逻辑层（`services/*/*`），按域分组：`ai`、`identity`、`notification`、`commerce`、`support`。NestJS 模块，Prisma 在 repository 子层。禁止跨 service 直接 import，跨服务调用通过 HTTP。

**shared 层**
纯工具层（`@vxture/shared`）。纯 TypeScript，无任何框架或 Node.js/浏览器 API 依赖，全平台共享。禁止引用任何内部包。

**SSE（Server-Sent Events）**
浏览器单向推送协议，基于 HTTP 长连接。Agent 流式回复通过 SSE 实现：`vela-server → vela-bff → browser`。前端使用 `EventSource` 或 `fetch` streaming 消费。

**surface**
Vela Agent 的宿主 portal 上下文（取值：`admin` 或 `console`）。由 HTTP Header `X-Vela-Surface` 传递，与 JWT `userType` 联合决定 `dataScope` 和 `allowedTools`。

---

## T

**Tailscale**
零配置 VPN 网格。worker-01 和 worker-02 通过 Tailscale 互通内网（`100.x.x.x` 地址段），服务间 HTTP 调用走 Tailscale，不暴露公网端口。

**tenant**
多租户隔离的数据边界。每个 tenant_user 属于至少一个 tenant，可同时属于多个。Plan 等级：Trial → Pro / Enterprise。

**tenant_user**
租户端用户类型（JWT claim：`userType: "tenant_user"`）。对应 `console.vxture.com` 和 Agent 产品，`dataScope: tenant`，只能访问自己所属租户的数据。

**Tool Use Loop**
AI Agent 的推理循环：LLM 决定调用工具 → 执行工具 → 结果返回 LLM → 继续或终止。在 agent-server 中实现，通过 `@vxture/ai-sdk/llm` 调用，禁止直接 import Anthropic/Doubao SDK。

**ToolRegistry**
Agent 工具白名单注册表（`agent-server/*/tools/tool-registry.ts`）。工具执行前必须经过白名单校验，`allowedTools` 来自 CallerContext，不接受前端传入。

---

## V

**vela**
内嵌智能助手（`agent-studio/vela`，@vxture/agent-studio-vela）。以嵌入式微前端形式载入 admin 和 console，对话 UI + Tool Use 反馈展示。三端：`agent-studio/vela` + `agent-server/vela` + `bff/vela-bff`。

---

## @

**@layer**
代码文件头中声明所属架构层的标注（如 `@layer Application`）。是文件头必填字段（见 `docs/ai/03-coding-comments.md`），也是 AI agent 判断文件职责边界的依据。
