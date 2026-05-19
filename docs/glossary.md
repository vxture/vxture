# 术语表

> 平台核心概念的权威定义，按字母序排列。
> 遇到不认识的术语时查此文件，不要从上下文猜测。

---

## A

**ADR（Architecture Decision Record）**
架构决策记录。记录重大技术决策的背景、选项、结果和后果。一旦 Accepted 不修改，只能被新 ADR Supersede。见 `docs/decisions/`。

**agent-server**
Agent 私有后端。运行 Tool Use Loop，通过 ai-gateway 调用 LLM，持久化会话和消息。每个 Agent 实例有独立的 agent-server，禁止跨实例 import。

**agent-studio**
Agent 前端（`agent-studio/*`）。Next.js 应用，渲染对话 UI。不同 Agent 的部署模式不同：

| Agent | 部署模式                             | 使用方式                                                          |
| ----- | ------------------------------------ | ----------------------------------------------------------------- |
| Vela  | 嵌入式（iframe / module federation） | 嵌入 console / admin，作为 assistant 使用（侧边栏、浮动栏、全屏） |
| Ruyin | 独立部署                             | 独立域名，超级智能体，类似 claude.ai 的交互体验                   |

**auth-bff**
平台唯一 JWT 签发者（`@vxture/bff-auth`）。Platform BFF 直接在此登录签发；Business BFF 读取已有 Cookie，未授权时跳转 console 登录。其他 BFF 需要签发时通过 `POST /auth/internal/sign` 委托。见 ADR-001。

---

## B

**BCP47**
IETF 语言标签标准（RFC 5646）。本平台使用 `zh-CN`（简体中文）和 `en-US`（美式英语）两个标签，贯穿 URL 路由段、`<html lang>` 属性、`Intl.*` API、翻译文件目录。见 ADR-002。

**BFF（Backend For Frontend）**
专为特定前端定制的后端服务（`bff/*`）。按认证方式分三类：Platform BFF（有独立登录页）、Business BFF（复用 console Cookie）、功能型 BFF（auth / gateway）。不直接调用 LLM，必须通过 ai-gateway。

**business/**
强场景业务应用目录（`business/*`）。当前包含 `business/ruyin`（Ruyin 超级智能体前端）。后续将承载更多垂直场景应用（如无人机监测、地质灾害分析、公安侦查分析等），每个应用都是独立 Agent + 专属前端的组合。

---

## C

**CallerContext**
BFF 层组装的强类型安全上下文，封装"这个请求是谁、被允许做什么"，传给 agent-server 作为可信输入。由 JWT claims + request headers 构建，在 agent-server 中**二次校验**。

```typescript
interface CallerContext {
  surface: string; // 宿主 portal 上下文
  userId: string; // 已认证用户
  tenantId?: string; // 租户用户专属
  allowedTools: string[]; // 白名单工具列表
  dataScope: "global" | "tenant"; // 数据访问边界
}
```

当前在 vela-bff → vela-server 中实现，是所有 Business BFF 的通用模式。禁止从 request body 取任何字段覆盖 CallerContext。

**core 层**
基础设施原语层（`packages/core/*`）。框架无关（无 NestJS、无 Next.js），不含业务逻辑，不引用任何上层依赖。Node.js + 浏览器双端兼容（例外：`core-database` 仅服务端）。

---

## D

**dataScope**
CallerContext 中的数据访问范围。`global`：operator 可访问所有租户数据；`tenant`：tenant_user 只能访问自己所属租户的数据。agent-server 工具执行时必须以此过滤，不可绕过。

**design-system**
UI 组件库和设计令牌（`@vxture/design-system`）。应用侧禁止绕过 DS 自建样式、组件、图标。违反时走 `audit/checklist-ds.md` 审计流程。

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
单仓库多包架构。本项目使用 pnpm workspaces + Turborepo，35+ 个包共存，通过 `workspace:*` 协议本地链接，无需发版即可引用。见 ADR-003。

---

## O

**operator**
运营端用户类型（JWT claim：`userType: "operator"`）。对应 `admin.vxture.com`，`dataScope: global`，可访问所有租户数据。角色由系统配置（非硬编码），预置若干标准角色，具体见 admin 包权限设计。

---

## P

**platform-browser**
`@vxture/platform-browser`。浏览器端第三方 SDK 封装，目前是唯一已实现的 Platform SDK。

**PLG（Product-Led Growth）**
产品驱动增长。首次社交登录自动创建 Personal Tenant 并赋 Free Plan，零摩擦进入产品，无需销售介入。见 ADR-005。

**portal**
平台管理 UI（`portals/*`），包含：`website`（官网）、`admin`（运营后台）、`console`（租户控制台）。迭代节奏慢，设计稳定。

**Prisma**
ORM 工具。DDL 集中在 `@vxture/core-database`（当前 6 个 schema 文件，⚠️ 待大幅重构）。`PrismaClient` 实例只在 service 层 repository 中使用，禁止在 BFF 或更高层直接操作数据库。

---

## R

**RBAC（Role-Based Access Control）**
基于角色的访问控制，覆盖平台全部权限管理逻辑。两套完全隔离的权限域：

| 域          | 对应产品              | 预置角色（可配置）                   |
| ----------- | --------------------- | ------------------------------------ |
| operator 域 | admin（运营后台）     | 预置若干标准角色，系统配置，非硬编码 |
| tenant 域   | console（租户控制台） | 预置 3 类：owner / admin / member    |

见 `docs/design/permissions.md`。

**refresh token**
用于续期 access token 的长效凭证（默认 7 天）。存储在 Redis，logout 时立即删除。operator 和 tenant 各有独立 Redis key 前缀（`refresh:operator:{userId}` vs `refresh:tenant:{surface}:{userId}`）。

**ruyin**
超级智能体产品，独立域名 `ruyin.ai`（已注册，DNS 绑定 worker-02）。类似 claude.ai 的交互体验，通用性强，非嵌入式。三端：`business/ruyin`（前端）+ `agent-server/ruyin`（后端）+ `bff/ruyin-bff`（BFF）。

---

## S

**service 层**
域业务逻辑层（`services/*/*`），按域分组：`ai`、`identity`、`notification`、`commerce`、`support`。NestJS 模块，Prisma 在 repository 子层。禁止跨 service 直接 import，跨服务调用通过 HTTP。

**shared 层**
纯工具层（`@vxture/shared`）。纯 TypeScript，无任何框架或 Node.js/浏览器 API 依赖，全平台共享。禁止引用任何内部包。

**SSE（Server-Sent Events）**
浏览器单向推送协议，基于 HTTP 长连接。Agent 流式回复通过 SSE 实现：`agent-server → BFF → browser`。前端使用 `EventSource` 或 `fetch streaming` 消费。

**surface**
Agent 宿主 portal 的上下文标识，由 HTTP Header `X-{Agent}-Surface` 传递，与 JWT `userType` 联合决定 `dataScope` 和 `allowedTools`。

当前取值：

| 值        | 含义                         | 对应用户类型 |
| --------- | ---------------------------- | ------------ |
| `admin`   | 运营管理端（admin portal）   | operator     |
| `console` | 租户控制端（console portal） | tenant_user  |

> ⚠️ 规划中：surface 将细分为两层。`admin` 域拆分为运营管理子域 + 平台自治子域；`console` 域拆分为管理子域 + 应用子域。命名方案（`admin` 是否更名为 `ops` 等）在下一版本设计时确定。

---

## T

**Tailscale**
零配置 VPN 网格。worker-01 和 worker-02 通过 Tailscale 互通内网（`100.x.x.x` 地址段），服务间 HTTP 调用走 Tailscale，不暴露公网端口。

**tenant**
多租户隔离的数据边界。每个 tenant_user 属于至少一个 tenant，可同时属于多个。

Plan 等级（订阅制）：

| Plan       | 定位         | 说明                                          |
| ---------- | ------------ | --------------------------------------------- |
| Free       | 免费长期版   | 订阅免费计划，持续可用，有功能/用量限制       |
| Pro        | 付费版       | 按周期订阅，功能完整；trial 期为 Pro 试用阶段 |
| Enterprise | 大客户私有版 | 合同定价，私有化或专属资源部署                |

**tenant_user**
租户端用户类型（JWT claim：`userType: "tenant_user"`）。对应 `console.vxture.com` 和 Agent 产品，`dataScope: tenant`，只能访问自己所属租户的数据。

**Tool Use Loop**
AI Agent 的推理循环：LLM 决定调用工具 → 执行工具 → 结果返回 LLM → 继续或终止。在 agent-server 中实现。所有 LLM 调用**必须经过 ai-gateway**（统一计费、配额、授权管控），禁止直接 import provider SDK（Anthropic / Doubao 等），否则绕过管控导致无法计量和审计。

**ToolRegistry**
Agent 工具白名单注册表（`agent-server/*/tools/tool-registry.ts`）。工具执行前必须经过白名单校验，`allowedTools` 来自 CallerContext，不接受前端传入。

---

## V

**vela**
内嵌智能助手（`agent-studio/vela`，@vxture/agent-studio-vela）。嵌入式微前端，载入 admin 和 console，提供对话 UI + Tool Use 反馈展示（侧边栏 / 浮动栏 / 全屏）。三端：`agent-studio/vela` + `agent-server/vela` + `bff/vela-bff`。

---

## @

**@layer**
代码文件头中声明所属架构层的标注（如 `@layer Application`）。是文件头必填字段（见 `docs/ai/03-coding-comments.md`），也是 AI agent 判断文件职责边界的依据。

---

## AI 基础设施

**ai-gateway**
统一 AI 模型接入层（`@vxture/service-ai-gateway`）。所有 LLM 调用的唯一入口，负责：模型路由、计费计量、配额管控、Provider 抽象（当前已接入：Doubao；可扩展：Anthropic 等）。agent-server 通过 ai-gateway 调用 LLM，禁止绕过直连 provider。
