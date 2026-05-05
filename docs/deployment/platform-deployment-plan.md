# Vxture 平台部署方案

> 版本：1.0.0 | 日期：2026-05-04
> 基于代码库现状分析，覆盖容器规划、网络拓扑、环境变量矩阵、构建策略和运维考量。

---

## 目录

1. [架构分层总览](#架构分层总览)
2. [容器完整清单（15 个）](#容器完整清单)
3. [基础设施层](#基础设施层)
4. [应用容器详情](#应用容器详情)
5. [服务依赖拓扑](#服务依赖拓扑)
6. [环境变量矩阵](#环境变量矩阵)
7. [构建策略](#构建策略)
8. [启动顺序与健康检查](#启动顺序与健康检查)
9. [部署方案选择](#部署方案选择)
10. [资源规格建议](#资源规格建议)
11. [待建服务说明](#待建服务说明)

---

## 架构分层总览

```
互联网
  │
  ▼
┌─────────────────────────────────┐
│   Nginx / Cloud LB (443/80)     │  ← 生产：云负载均衡；本地：省略
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│   API Gateway (gateway-bff)     │  容器 01 · 端口 8000
│   唯一公共入口，路由三个前缀       │
│   /website-api  → :3011         │
│   /console-api  → :3021         │
│   /admin-api    → :3031         │
└──┬──────┬──────┬────────────────┘
   │      │      │
   ▼      ▼      ▼
 website  console  admin   ← Portal 层（Next.js，端口 3010/3020/3030）
 BFF      BFF      BFF     ← BFF 层（NestJS，端口 3011/3021/3031）
   │      │        │
   └──────┴────┬───┘
               │ 内部 HTTP 调用
   ┌───────────┼───────────────┐
   ▼           ▼               ▼
 service-iam  service-org   service-mail   ← 以 NestJS Module 形式运行于 BFF 容器内
 (在 website-bff 内)                         不单独部署

              │
              ▼
┌─────────────────────────────────┐
│        AI Gateway               │  容器 08 · 端口 3100
│  模型路由 · 额度计量 · 用量统计   │
└─────────────────────────────────┘
              │
   ┌──────────┴──────────┐
   ▼                     ▼
┌──────────────┐  ┌──────────────────────┐
│  Vela Agent  │  │   Ruyin (P0)   │
│  Studio 3120 │  │   Studio  3110 (TBD) │
│  BFF   3121  │  │   BFF     3111       │
│  Server 3122 │  │   Server  3112       │
└──────────────┘  └──────────────────────┘

基础设施
┌─────────────────────────────────────────────────────┐
│  PostgreSQL 5432    Redis 6379    SMTP (外部阿里云)   │
│  7 个 schema        会话/队列/限速  TLS 465           │
└─────────────────────────────────────────────────────┘
```

**核心设计原则：**
- `service-*` 包（iam / organization / billing / subscription / mail / ticket）是 **NestJS Module 库**，
  随宿主 BFF 或 Agent Server 打包，不单独部署，**不计入容器数量**
- Agent Studio（Next.js）独立容器，通过 Vela BFF 接入
- 本地开发由 `gateway-bff` 充当反向代理；生产环境由 Nginx/Cloud LB 替代
- 所有内部通信走内网 HTTP，只有 Gateway 对外暴露

---

## 容器完整清单

共 **15 个容器**（13 个应用 + 2 个基础设施）

### 基础设施容器（2 个）

| # | 容器名 | 镜像 | 端口 | 说明 |
|---|--------|------|------|------|
| I-01 | `vxture-postgres` | postgres:18 | 5432 | 单实例，7 个 schema 共用 |
| I-02 | `vxture-redis` | redis:7-alpine | 6379 | 会话缓存 / 邮件限速 / BullMQ 队列 |

### 网关容器（1 个）

| # | 容器名 | 技术栈 | 端口 | 对外 | 说明 |
|---|--------|--------|------|------|------|
| A-01 | `vxture-gateway` | Node.js 22 | **8000** | ✅ | 纯 HTTP 反代，单文件 main.mjs |

### Platform Portal 容器（6 个）

| # | 容器名 | 技术栈 | 端口 | 包名 | 说明 |
|---|--------|--------|------|------|------|
| A-02 | `vxture-website` | Next.js 15 | 3010 | @vxture/website | 公开营销站点 |
| A-03 | `vxture-website-bff` | NestJS 11 | 3011 | @vxture/bff-website | 含 IAM / Organization / Mail Module |
| A-04 | `vxture-console` | Next.js 15 | 3020 | @vxture/console | 租户工作台 |
| A-05 | `vxture-console-bff` | NestJS 11 | 3021 | @vxture/bff-console | 含 IAM / Subscription Module |
| A-06 | `vxture-admin` | Next.js 15 | 3030 | @vxture/admin | 平台运营后台 |
| A-07 | `vxture-admin-bff` | NestJS 11 | 3031 | @vxture/bff-admin | 含 Billing / Ticket Module（直连 pg） |

### AI Gateway 容器（1 个）

| # | 容器名 | 技术栈 | 端口 | 包名 | 说明 |
|---|--------|--------|------|------|------|
| A-08 | `vxture-ai-gateway` | NestJS 11 | 3100 | @vxture/service-ai-gateway | 模型路由 + Prisma（ai_gateway schema） |

### Vela Agent 容器（3 个）

| # | 容器名 | 技术栈 | 端口 | 包名 | 说明 |
|---|--------|--------|------|------|------|
| A-09 | `vxture-vela-studio` | Next.js 15 | 3120 | @vxture/agent-studio-vela | 智能助手前端 |
| A-10 | `vxture-vela-bff` | NestJS 11 | 3121 | @vxture/bff-vela | SSE 流式代理，含 ioredis |
| A-11 | `vxture-vela-server` | NestJS 11 | 3122 | vela-server | Agent 私有后端，含 Prisma |

### Ruyin 容器（3 个，P0 优先）

| # | 容器名 | 技术栈 | 端口 | 包名 | 状态 |
|---|--------|--------|------|------|------|
| A-12 | `vxture-ruyin-studio` | Next.js 15 | 3110 | — | ⚠️ 待建 |
| A-13 | `vxture-ruyin-bff` | NestJS 11 | 3111 | — | ⚠️ 构建中 |
| A-14 | `vxture-ruyin-server` | NestJS 11 | 3112 | @vxture/agent-server-ruyin | 含 BullMQ |

> 当前可上线容器：**12 个**（A-12 待建，A-13 构建中，暂不部署）

---

## 基础设施层

### PostgreSQL

```
实例数：1（可用托管服务替代：阿里云 PolarDB / RDS / AWS RDS）
版本：PostgreSQL 18+
数据库名：vxture_beta（生产建议：vxture_prod）
连接池：各服务自管（pg.Pool / Prisma connectionLimit）
```

**Schema 分布与管理者：**

| Schema | 表数 | 管理方式 | 用于哪些容器 |
|--------|------|----------|-------------|
| `account` | 6 | Prisma（core-database） | website-bff, console-bff |
| `tenancy` | 9 | Prisma（core-database） | website-bff, console-bff, admin-bff |
| `product` | 7 | Prisma（core-database） | admin-bff, ai-gateway |
| `platform` | 5 | Prisma（core-database） | admin-bff |
| `support` | 2 | Prisma（core-database） | admin-bff, vela-server |
| `commerce` | 9 | Prisma（core-database） | admin-bff, ai-gateway |
| `ai_gateway` | 7 | Prisma（ai-gateway） | ai-gateway |
| `vela`（隐式） | 3 | Prisma（vela-server） | vela-server |

**迁移流程（首次上线）：**
```bash
# 1. 应用 core-database baseline（已有数据库）
npx prisma migrate resolve --applied "0000_baseline" \
  --schema=packages/core/database/prisma/schema.prisma

# 2. 后续变更
pnpm --filter @vxture/core-database migrate:deploy

# 3. AI Gateway 独立 migrate
pnpm --filter @vxture/service-ai-gateway migrate:deploy

# 4. Vela Server 独立 migrate
pnpm --filter vela-server migrate:deploy
```

### Redis

```
实例数：1（可用托管服务：阿里云 Redis / AWS ElastiCache）
版本：Redis 7+
用途：
  - website-bff：登录速率限制
  - vela-bff：对话会话缓存 / SSE 上下文
  - service-mail：邮件发送速率限制
  - ruyin-server：BullMQ 任务队列（须持久化 AOF）
```

**BullMQ 专项配置（ruyin）：**
```
appendonly yes       # AOF 持久化，防队列任务丢失
maxmemory-policy noeviction  # 禁止 key 被驱逐（队列数据不可丢）
```

### 外部依赖（非容器）

| 服务 | 用途 | 配置来源 |
|------|------|---------|
| 阿里云 SMTP | 发送验证码/重置邮件 | SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS |
| 字节跳动 ARK / Doubao | LLM 推理 | ARK_API_KEY / DOUBAO_API_KEY |
| 飞书 OAuth | 租户用户登录 | FEISHU_APP_ID / FEISHU_APP_SECRET |
| 钉钉 OAuth | 租户用户登录 | DINGTALK_APP_KEY / DINGTALK_APP_SECRET |

---

## 应用容器详情

### A-01 `vxture-gateway`

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY bff/gateway-bff/src/main.mjs .
EXPOSE 8000
CMD ["node", "main.mjs"]
```

**路由规则：**
```
/website-api/* → http://vxture-website-bff:3011/*
/console-api/* → http://vxture-console-bff:3021/*
/admin-api/*   → http://vxture-admin-bff:3031/*
/healthz       → { status: "ok" }
```

**生产替代方案：** 用 Nginx upstream 或云 ALB 替换，实现更好的负载均衡与 TLS 终止。

---

### A-02 `vxture-website`（Next.js）

- **构建命令：** `pnpm --filter @vxture/website build`
- **启动命令：** `next start -p 3010`
- **环境变量（构建时注入）：** `NEXT_PUBLIC_API_URL`、`NEXT_PUBLIC_APP_URL`
- **关键特性：** i18n（next-intl）、standalone 模式可裁剪 node_modules

---

### A-03 `vxture-website-bff`（NestJS）

- **启动命令：** `node dist/main.js`
- **包含的 NestJS Module：**
  - `@vxture/service-iam`（账户认证，直连 PostgreSQL）
  - `@vxture/service-organization`（租户组织，直连 PostgreSQL）
  - `@vxture/service-mail`（邮件发送，使用 Redis 限速）
  - `DingtalkOAuthRouter` / `FeishuOAuthRouter`（OAuth 登录）
- **数据库连接：** pg.Pool → PostgreSQL（account / tenancy schema）
- **Redis 连接：** ioredis → 速率限制

---

### A-07 `vxture-admin-bff`（NestJS）

- **特殊性：** 直接使用 `pg.Pool` 访问 `platform.platform_admin`，不通过服务层
- **不包含 OAuth：** Admin 只支持账号密码登录，禁止三方 OAuth
- **含服务 Module：** Billing、Ticket（来自 `services/commerce/billing`、`services/support/ticket`）

---

### A-08 `vxture-ai-gateway`（NestJS + Prisma）

- **职责：** 模型路由、费率计算、额度扣减、用量统计
- **Prisma 管理：** `ai_gateway` schema + `commerce.tenant_usage_*` 三张表
- **上游调用：** 转发至 ARK / Doubao API
- **被调用方：** vela-server、ruyin-server

---

### A-10 `vxture-vela-bff`（NestJS，SSE 关键路径）

- **特殊要求：** SSE 响应需关闭 Nginx 缓冲（已有 `infra/nginx/vela.conf`）
- **ioredis 连接：** 对话上下文缓存
- **Nginx 配置片段：** 见 `infra/nginx/vela.conf`

---

### A-11 `vxture-vela-server`（NestJS + Prisma）

- **Prisma 管理：** `vela_session`、`vela_message`、`vela_audit_log`
- **依赖：** `@vxture/ai-sdk`（LLM 调用）、`@vxture/service-billing`、`@vxture/service-subscription`、`@vxture/service-ticket`
- **仅内网访问：** 仅接受来自 vela-bff 的请求

---

## 服务依赖拓扑

```
外网流量
    │
    ▼
[A-01 gateway :8000]
    │
    ├─/website-api──▶ [A-03 website-bff :3011]
    │                        │
    │                        ├── service-iam (pg account schema)
    │                        ├── service-organization (pg tenancy schema)
    │                        ├── service-mail (nodemailer + Redis)
    │                        ├── DingtalkOAuthRouter
    │                        └── FeishuOAuthRouter
    │
    ├─/console-api──▶ [A-05 console-bff :3021]
    │                        │
    │                        ├── service-iam
    │                        └── service-subscription
    │
    └─/admin-api───▶ [A-07 admin-bff :3031]
                             │
                             ├── service-billing (pg commerce schema)
                             ├── service-ticket (pg support schema)
                             └── pg.Pool (platform schema 直连)

[A-09 vela-studio :3120]
    │
    └─/vela/──────▶ [A-10 vela-bff :3121]
                             │
                             ├── Redis (会话缓存)
                             └── HTTP──▶ [A-11 vela-server :3122]
                                                │
                                                ├── Prisma (vela_* tables)
                                                ├── service-billing
                                                ├── service-subscription
                                                ├── service-ticket
                                                └── HTTP──▶ [A-08 ai-gateway :3100]
                                                                    │
                                                                    ├── Prisma (ai_gateway schema)
                                                                    └── HTTP──▶ ARK/Doubao API

[A-14 ruyin-server :3112]
    ├── BullMQ (Redis)
    ├── service-billing
    ├── service-subscription
    └── HTTP──▶ [A-08 ai-gateway :3100]

基础设施
    [I-01 PostgreSQL :5432] ←── 所有含 pg/Prisma 的容器
    [I-02 Redis :6379] ←──────── website-bff, vela-bff, service-mail, ruyin-server
```

---

## 环境变量矩阵

### 说明
- ✅ 必填（缺失则启动失败）
- ⚪ 可选（有默认值）
- — 不需要

| 环境变量 | gateway | website | website-bff | console | console-bff | admin | admin-bff | ai-gateway | vela-bff | vela-server | ruyin-server |
|---------|---------|---------|-------------|---------|-------------|-------|-----------|------------|----------|-------------|-------------------|
| `DATABASE_URL` | — | — | ✅ | — | ✅ | — | ✅ | ✅ | — | ✅ | ✅ |
| `REDIS_URL` | — | — | ✅ | — | — | — | — | — | ✅ | — | ✅ |
| `JWT_SECRET` | — | — | ✅ | — | ✅ | — | ✅ | — | ✅ | ✅ | — |
| `JWT_ACCESS_EXPIRES_IN` | — | — | ⚪ | — | ⚪ | — | ⚪ | — | — | — | — |
| `JWT_REFRESH_EXPIRES_IN` | — | — | ⚪ | — | ⚪ | — | ⚪ | — | — | — | — |
| `NEXT_PUBLIC_API_URL` | — | ✅ | — | ✅ | — | ✅ | — | — | — | — | — |
| `NEXT_PUBLIC_APP_URL` | — | ✅ | — | — | — | — | — | — | — | — | — |
| `WEBSITE_BFF_PORT` | — | — | ⚪ | — | — | — | — | — | — | — | — |
| `CONSOLE_BFF_PORT` | — | — | — | — | ⚪ | — | — | — | — | — | — |
| `ADMIN_BFF_PORT` | — | — | — | — | — | — | ⚪ | — | — | — | — |
| `VELA_BFF_PORT` | — | — | — | — | — | — | — | — | ⚪ | — | — |
| `VELA_SERVER_PORT` | — | — | — | — | — | — | — | — | — | ⚪ | — |
| `GATEWAY_ALLOWED_ORIGINS` | ✅ | — | — | — | — | — | — | — | — | — | — |
| `WEBSITE_BFF_ORIGIN` | ✅ | — | — | — | — | — | — | — | — | — | — |
| `CONSOLE_BFF_ORIGIN` | ✅ | — | — | — | — | — | — | — | — | — | — |
| `ADMIN_BFF_ORIGIN` | ✅ | — | — | — | — | — | — | — | — | — | — |
| `WEBSITE_BASE_URL` | — | — | ✅ | — | — | — | — | — | — | — | — |
| `CONSOLE_BASE_URL` | — | — | ✅ | — | — | — | — | — | — | — | — |
| `FEISHU_APP_ID` | — | — | ✅ | — | — | — | — | — | — | — | — |
| `FEISHU_APP_SECRET` | — | — | ✅ | — | — | — | — | — | — | — | — |
| `FEISHU_REDIRECT_URI` | — | — | ✅ | — | — | — | — | — | — | — | — |
| `DINGTALK_APP_KEY` | — | — | ✅ | — | — | — | — | — | — | — | — |
| `DINGTALK_APP_SECRET` | — | — | ✅ | — | — | — | — | — | — | — | — |
| `DINGTALK_REDIRECT_URI` | — | — | ✅ | — | — | — | — | — | — | — | — |
| `SMTP_HOST` | — | — | ✅ | — | — | — | — | — | — | — | — |
| `SMTP_PORT` | — | — | ✅ | — | — | — | — | — | — | — | — |
| `SMTP_USER` | — | — | ✅ | — | — | — | — | — | — | — | — |
| `SMTP_PASS` | — | — | ✅ | — | — | — | — | — | — | — | — |
| `SMTP_FROM` | — | — | ⚪ | — | — | — | — | — | — | — | — |
| `ARK_API_KEY` / `DOUBAO_API_KEY` | — | — | — | — | — | — | — | ✅ | — | — | — |
| `AGENT_SERVER_BASE_URL` | — | — | — | — | — | — | — | — | ⚪ | — | — |
| `VELA_PLATFORM_LLM_TENANT_ID` | — | — | — | — | — | — | — | — | ✅ | ✅ | — |
| `VELA_DEFAULT_MODEL_CODE` | — | — | — | — | — | — | — | — | ✅ | ✅ | — |
| `AUTH_COOKIE_DOMAIN` | — | — | ✅ | — | ✅ | — | ✅ | — | ✅ | — | — |

---

## 构建策略

### monorepo 构建原则

所有容器从 **workspace 根目录**构建，利用 pnpm workspace 的依赖图。
`packages/core/*`、`packages/shared`、`packages/design-system` 需要先构建（下游包依赖其 dist）。

### 构建顺序（依赖图）

```
Step 1（并行）：
  pnpm --filter @vxture/shared build
  pnpm --filter @vxture/core-locale build

Step 2（并行，依赖 shared）：
  pnpm --filter @vxture/core-auth build
  pnpm --filter @vxture/core-config build
  pnpm --filter @vxture/core-api build
  pnpm --filter @vxture/core-utils build
  pnpm --filter @vxture/core-tenant build
  pnpm --filter @vxture/core-mail build

Step 3（并行，依赖 core-*）：
  pnpm --filter @vxture/design-system build
  pnpm --filter @vxture/ai-sdk build
  pnpm --filter @vxture/service-iam build
  pnpm --filter @vxture/service-organization build
  pnpm --filter @vxture/service-billing build
  pnpm --filter @vxture/service-subscription build
  pnpm --filter @vxture/service-mail build
  pnpm --filter @vxture/service-ticket build

Step 4（并行，依赖 service-* 和 design-system）：
  pnpm --filter @vxture/website build
  pnpm --filter @vxture/console build
  pnpm --filter @vxture/admin build
  pnpm --filter @vxture/agent-studio-vela build
  pnpm --filter @vxture/bff-website build
  pnpm --filter @vxture/bff-console build
  pnpm --filter @vxture/bff-admin build
  pnpm --filter @vxture/bff-vela build
  pnpm --filter @vxture/service-ai-gateway build
  pnpm --filter vela-server build
  pnpm --filter @vxture/agent-server-ruyin build
```

### Dockerfile 模板（NestJS BFF/Service）

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ── 依赖层（利用缓存）──────────────────────────────────
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
# 只复制必要的 package.json（减少无关 invalidation）
COPY packages/shared/package.json packages/shared/package.json
COPY packages/core/config/package.json packages/core/config/package.json
COPY packages/core/auth/package.json packages/core/auth/package.json
COPY packages/core/api/package.json packages/core/api/package.json
COPY bff/website-bff/package.json bff/website-bff/package.json
# … 按服务调整
RUN pnpm install --frozen-lockfile --prod=false

# ── 构建层 ───────────────────────────────────────────
FROM deps AS builder
COPY . .
RUN pnpm --filter @vxture/shared build \
 && pnpm --filter @vxture/core-config build \
 && pnpm --filter @vxture/core-auth build \
 && pnpm --filter @vxture/service-iam build \
 && pnpm --filter @vxture/bff-website build

# ── 运行层（最小镜像）─────────────────────────────────
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=builder /app/bff/website-bff/dist ./dist
COPY --from=builder /app/bff/website-bff/node_modules ./node_modules
COPY --from=builder /app/bff/website-bff/package.json .
ENV NODE_ENV=production
EXPOSE 3011
CMD ["node", "dist/main.js"]
```

### Dockerfile 模板（Next.js Portal，standalone 模式）

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @vxture/website build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# standalone 输出已包含所有依赖
COPY --from=builder /app/portals/website/.next/standalone ./
COPY --from=builder /app/portals/website/.next/static ./portals/website/.next/static
COPY --from=builder /app/portals/website/public ./portals/website/public
EXPOSE 3010
CMD ["node", "portals/website/server.js"]
```

> 需要在 `portals/website/next.config.js` 中添加 `output: 'standalone'`

---

## 启动顺序与健康检查

### 启动依赖链

```
Phase 1（基础设施就绪）
  I-01 postgres     healthcheck: pg_isready
  I-02 redis        healthcheck: redis-cli ping

Phase 2（数据库迁移）
  migration-job     prisma migrate deploy (三个 schema，一次性 Job)
  depends_on: postgres

Phase 3（核心服务）
  A-08 ai-gateway   depends_on: postgres
  A-07 admin-bff    depends_on: postgres

Phase 4（BFF 层）
  A-03 website-bff  depends_on: postgres, redis, ai-gateway
  A-05 console-bff  depends_on: postgres
  A-11 vela-server  depends_on: postgres, ai-gateway

Phase 5（BFF 上层）
  A-10 vela-bff     depends_on: redis, vela-server
  A-13 ruyin-bff   depends_on: ruyin-server
  A-14 ruyin-server depends_on: redis, ai-gateway

Phase 6（前端与网关）
  A-02 website      depends_on: website-bff（构建时注入 API_URL）
  A-04 console      depends_on: console-bff
  A-06 admin        depends_on: admin-bff
  A-09 vela-studio  depends_on: vela-bff
  A-01 gateway      depends_on: website-bff, console-bff, admin-bff
```

### 健康检查端点

| 容器 | 健康检查路径 | 方法 |
|------|------------|------|
| vxture-gateway | `GET /healthz` | HTTP 200 |
| vxture-website-bff | `GET /api/health` | HTTP 200 |
| vxture-console-bff | `GET /api/health` | HTTP 200 |
| vxture-admin-bff | `GET /api/health` | HTTP 200 |
| vxture-ai-gateway | `GET /api/health` | HTTP 200 |
| vxture-vela-bff | `GET /api/health` | HTTP 200 |
| vxture-vela-server | `GET /health` | HTTP 200 |
| vxture-ruyin-server | `GET /health` | HTTP 200 |
| postgres | `pg_isready -U postgres` | Exit 0 |
| redis | `redis-cli ping` | PONG |

---

## 部署方案选择

### 方案 A：Docker Compose（内测 / 单机）

**适用场景：** 演示、内部测试、小规模试运行（< 100 并发）

```yaml
# docker-compose.yml 骨架
version: '3.9'

services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: vxture_prod
      POSTGRES_USER: vxture
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "vxture"]

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  gateway:
    build: { context: ., dockerfile: bff/gateway-bff/Dockerfile }
    ports: ["8000:8000"]
    environment:
      WEBSITE_BFF_ORIGIN: http://website-bff:3011
      CONSOLE_BFF_ORIGIN: http://console-bff:3021
      ADMIN_BFF_ORIGIN: http://admin-bff:3031

  website-bff:
    build: { context: ., dockerfile: bff/website-bff/Dockerfile }
    environment:
      DATABASE_URL: postgresql://vxture:${POSTGRES_PASSWORD}@postgres:5432/vxture_prod
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    depends_on: [postgres, redis]

  # … 其余服务按相同模式

volumes:
  postgres_data:
  redis_data:
```

**优缺点：**
- ✅ 部署简单，单台 4C8G 机器可运行全套（development/staging）
- ✅ 快速迭代，`docker-compose up --build` 一键更新
- ❌ 无自动故障转移
- ❌ 无水平扩容
- ❌ 下线更新有短暂中断

---

### 方案 B：Kubernetes（生产推荐）

**适用场景：** 正式生产，有高可用和弹性需求

**命名空间规划：**
```
vxture-infra     # postgres, redis（或用 managed services）
vxture-platform  # gateway, website/console/admin 及其 BFF
vxture-agents    # ai-gateway, vela-*, ruyin-*
```

**关键配置：**

```yaml
# 示例：website-bff Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: website-bff
  namespace: vxture-platform
spec:
  replicas: 2          # 至少 2 副本
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0  # 零停机更新
  template:
    spec:
      containers:
      - name: website-bff
        image: registry.cn-xxx/vxture/website-bff:${TAG}
        ports: [{containerPort: 3011}]
        resources:
          requests: {cpu: "250m", memory: "256Mi"}
          limits:   {cpu: "1",    memory: "512Mi"}
        livenessProbe:
          httpGet: {path: /api/health, port: 3011}
          initialDelaySeconds: 15
        readinessProbe:
          httpGet: {path: /api/health, port: 3011}
          initialDelaySeconds: 10
        envFrom:
          - secretRef: {name: vxture-website-bff-secrets}
          - configMapRef: {name: vxture-common-config}
```

**Ingress 规则（Nginx Ingress）：**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: vxture-ingress
  annotations:
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"   # SSE 超时
    nginx.ingress.kubernetes.io/proxy-buffering: "off"      # SSE 禁缓冲
spec:
  rules:
  - host: www.vxture.com
    http:
      paths:
      - path: /website-api
        backend: {service: {name: gateway, port: {number: 8000}}}
  - host: admin.vxture.com
    http:
      paths:
      - path: /
        backend: {service: {name: admin, port: {number: 3030}}}
```

**托管服务替换（生产强烈建议）：**
```
PostgreSQL → 阿里云 RDS PostgreSQL（Multi-AZ）
Redis      → 阿里云 Redis 企业版（主从）
容器注册表  → 阿里云 ACR / 腾讯云 TCR
日志        → 阿里云 SLS / ELK
监控        → Prometheus + Grafana / 阿里云 ARMS
```

---

## 资源规格建议

### 容器资源（单副本）

| 容器 | CPU Request | CPU Limit | Mem Request | Mem Limit | 副本数（Prod） |
|------|-------------|-----------|-------------|-----------|--------------|
| vxture-gateway | 100m | 500m | 64Mi | 256Mi | 2 |
| vxture-website | 200m | 1 | 256Mi | 512Mi | 2 |
| vxture-website-bff | 250m | 1 | 256Mi | 512Mi | 2 |
| vxture-console | 200m | 1 | 256Mi | 512Mi | 2 |
| vxture-console-bff | 250m | 1 | 256Mi | 512Mi | 2 |
| vxture-admin | 100m | 500m | 256Mi | 512Mi | 1 |
| vxture-admin-bff | 100m | 500m | 128Mi | 256Mi | 1 |
| vxture-ai-gateway | 500m | 2 | 512Mi | 1Gi | 2 |
| vxture-vela-studio | 200m | 1 | 256Mi | 512Mi | 2 |
| vxture-vela-bff | 500m | 2 | 512Mi | 1Gi | 2 |
| vxture-vela-server | 1 | 4 | 1Gi | 2Gi | 2 |
| vxture-ruyin-server | 1 | 4 | 1Gi | 2Gi | 2 |

**PostgreSQL：** 生产 4C16G，SSD 存储，主从
**Redis：** 生产 2C4G，主从，AOF 持久化

### 整机估算（Kubernetes 节点）

**最小生产集群（12 app 容器 × 2 副本）：**
```
3 个节点 × 4C16G = 12C48G
实际占用约 8C24G，预留 4C24G 给弹性和系统
```

---

## 待建服务说明

| 服务 | 状态 | 说明 |
|------|------|------|
| `ruyin-studio` (3110) | ⚠️ 待建 | 参考 vela-studio 结构，Next.js + zustand |
| `ruyin-bff` (3111) | ⚠️ 构建中 | NestJS，参考 vela-bff，含 BullMQ 任务状态查询 |
| `gateway` 生产替换 | 📋 规划 | 用 Nginx Ingress 或云 ALB 替换 gateway-bff |
| `service-payment` | 📋 规划 | `services/commerce/payment/`，目录已建，代码待写 |
| `service-invoice` | 📋 规划 | `services/commerce/invoice/`，目录已建，代码待写 |
| `service-workers` | 📋 规划 | `services/support/workers/`，后台任务调度 |

---

## 附录：本地开发快速参考

```
端口汇总（本地）
──────────────────────────────────
3010  website-portal  (Next.js)
3011  website-bff     (NestJS)
3020  console-portal  (Next.js)
3021  console-bff     (NestJS)
3030  admin-portal    (Next.js)
3031  admin-bff       (NestJS)
3100  ai-gateway      (NestJS)
3110  ruyin-studio   (待建)
3111  ruyin-bff      (构建中)
3112  ruyin-server   (NestJS)
3120  vela-studio     (Next.js)
3121  vela-bff        (NestJS + SSE)
3122  vela-server     (NestJS + Prisma)
5432  PostgreSQL
6379  Redis
8000  API Gateway     (统一入口)
8090  Dev Panel       (开发工具)
──────────────────────────────────

启动命令（推荐分步）
pnpm dev:gateway          # 先启动网关
pnpm dev:admin-bff        # admin BFF
pnpm dev:admin            # admin 前端
pnpm dev:website-bff      # website BFF
pnpm dev                  # website 前端
```

---

*文档由 Claude Code 基于代码库分析自动生成，随代码演进需同步更新。*
*下次变更请同步 `docs/ai/port-allocation.md`。*
