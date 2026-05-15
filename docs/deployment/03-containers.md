# 容器构建规范

> Dockerfile 模板、构建顺序、服务调用拓扑、资源规格
> 更新：2026-05-15

相关文档：[架构总览](overview.md) · [Compose 编排](services.md) · [端口分配](../ai/port-allocation.md) · [环境变量](environments.md)

---

## 一、服务调用拓扑

```
外网流量
    │
    ▼
[Cloudflare WAF / Proxy]
    │
    ├── vxture.com / admin / console / api
    │       │
    │       ▼
    │   [vx-nginx :443  worker-01]
    │       │
    │       ├──▶ vx-website  :3010  (Next.js)
    │       ├──▶ vx-console  :3020  (Next.js)
    │       ├──▶ vx-admin    :3030  (Next.js)
    │       └──▶ vx-gateway-bff :8000
    │                   │
    │            /website-api ──▶ vx-website-bff :3011
    │            /console-api ──▶ vx-console-bff :3021
    │            /admin-api   ──▶ vx-admin-bff   :3031
    │
    └── ruyin.vxture.com
            │
            ▼
        [CF Tunnel vxture-worker-H01]
            │
            ▼
        vx-ruyin-bff-prod :3111  (worker-02)

──── worker-01 内部（vx-platform 网络）──────────────────────────

[vx-website-bff / vx-console-bff / vx-admin-bff]
    ├──▶ vx-platform-pg    :5432  (identity/iam/tenant/commerce/product/model/ops/support schema)
    ├──▶ vx-platform-redis :6379  (会话/限流/Token)
    └──▶ vx-auth-bff       :3090  (JWT 签发，同网络直连)

──── worker-02 → worker-01 跨节点（Tailscale）────────────────────

[vx-vela-bff / vx-ruyin-bff]
    └──▶ vx-auth-bff  100.100.197.42:3090  (JWT 验证，Tailscale)

──── worker-02 业务内部（各业务独立网络）──────────────────────────

[vx-vela-bff :3121]
    ├──▶ vx-vela-pg-prod  :5432
    ├──▶ vx-vela-redis-prod :6379
    └──▶ vx-vela-server :3122
              ├──▶ vx-vela-pg-prod  :5432  (vela_* tables)
              └──▶ vx-ai-gateway    :3100  (host.docker.internal)

[vx-ruyin-bff :3111]
    ├──▶ vx-ruyin-pg-prod   :5432
    ├──▶ vx-ruyin-redis-prod :6379
    └──▶ vx-ruyin-server :3112
              ├──▶ vx-ruyin-pg-prod    :5432
              ├──▶ vx-ruyin-redis-prod :6379  (BullMQ 任务队列)
              └──▶ vx-ai-gateway       :3100  (host.docker.internal)

[vx-ai-gateway :3100]
    ├──▶ vx-ai-gateway-pg :5432  (ai_gateway schema)
    └──▶ ARK / Doubao API (公网 HTTPS)
```

---

## 二、外部依赖（非容器）

| 依赖 | 用途 | 相关服务 | 关键环境变量 |
|------|------|---------|------------|
| 阿里云 SMTP | 验证码/重置邮件（465 SSL） | website-bff | `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` |
| ARK / Doubao API | LLM 推理 | ai-gateway | `ARK_API_KEY` / `DOUBAO_API_KEY` |
| 飞书 OAuth | 租户用户登录 | website-bff | `FEISHU_APP_ID` / `FEISHU_APP_SECRET` |
| 钉钉 OAuth | 租户用户登录 | website-bff | `DINGTALK_APP_KEY` / `DINGTALK_APP_SECRET` |
| Tailscale | worker 跨节点通信 / SSH | 全部 | 节点 IP 见 [overview.md § 节点信息](overview.md) |

---

## 三、构建顺序

所有容器从 **workspace 根目录**构建，利用 pnpm workspace 依赖图。

```
Step 1（并行）
  @vxture/shared
  @vxture/core-locale

Step 2（并行，依赖 shared）
  @vxture/core-auth
  @vxture/core-config
  @vxture/core-api
  @vxture/core-utils
  @vxture/core-tenant
  @vxture/core-mail

Step 3（并行，依赖 core-*）
  @vxture/design-system
  @vxture/ai-sdk
  @vxture/service-iam
  @vxture/service-organization
  @vxture/service-billing
  @vxture/service-subscription
  @vxture/service-mail
  @vxture/service-ticket

Step 4（并行，依赖 service-* / design-system）
  @vxture/website          @vxture/bff-website
  @vxture/console          @vxture/bff-console
  @vxture/admin            @vxture/bff-admin
  @vxture/agent-studio-vela  @vxture/bff-vela
  @vxture/service-ai-gateway
  vela-server
  @vxture/agent-server-ruyin
```

---

## 四、Dockerfile 模板

### NestJS BFF / Server

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ── 依赖层（利用缓存）
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
# 仅复制目标服务及其依赖的 package.json（减少无关 cache miss）
COPY packages/shared/package.json             packages/shared/
COPY packages/core/config/package.json        packages/core/config/
COPY packages/core/auth/package.json          packages/core/auth/
COPY packages/core/api/package.json           packages/core/api/
COPY bff/website-bff/package.json             bff/website-bff/
# … 按服务调整
RUN pnpm install --frozen-lockfile

# ── 构建层
FROM deps AS builder
COPY . .
RUN pnpm --filter @vxture/shared build \
 && pnpm --filter @vxture/core-config build \
 && pnpm --filter @vxture/core-auth build \
 && pnpm --filter @vxture/service-iam build \
 && pnpm --filter @vxture/bff-website build

# ── 运行层（最小镜像）
FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/bff/website-bff/dist         ./dist
COPY --from=builder /app/bff/website-bff/node_modules ./node_modules
COPY --from=builder /app/bff/website-bff/package.json .
ENV NODE_ENV=production
EXPOSE 3011
CMD ["node", "dist/main.js"]
```

### Next.js Portal（standalone 模式）

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
# standalone 输出已包含所有运行时依赖
COPY --from=builder /app/portals/website/.next/standalone            ./
COPY --from=builder /app/portals/website/.next/static                ./portals/website/.next/static
COPY --from=builder /app/portals/website/public                      ./portals/website/public
EXPOSE 3010
CMD ["node", "portals/website/server.js"]
```

> `next.config.js` 中需声明 `output: 'standalone'`，否则 standalone 目录不会生成。

---

## 五、健康检查约定

| 服务 | 路径 | 预期响应 |
|------|------|---------|
| vx-gateway-bff | `GET /health` | HTTP 200 |
| vx-auth-bff | `GET /health` | HTTP 200 |
| vx-website-bff | `GET /health` | HTTP 200 |
| vx-console-bff | `GET /health` | HTTP 200 |
| vx-admin-bff | `GET /health` | HTTP 200 |
| vx-ai-gateway | `GET /health` | HTTP 200 |
| vx-vela-bff | `GET /health` | HTTP 200 |
| vx-vela-server | `GET /health` | HTTP 200 |
| vx-ruyin-bff | `GET /health` | HTTP 200 |
| vx-ruyin-server | `GET /health` | HTTP 200 |
| vx-website / vx-console / vx-admin | `GET /api/health` | HTTP 200 |
| postgres | `pg_isready -U <user>` | exit 0 |
| redis | `redis-cli ping` | PONG |

所有 NestJS 服务统一使用 `/health`；Next.js 门户使用 `/api/health`（Next.js Route Handler）。

---

## 六、资源规格

### worker-01（2C 2G，平台层）

> 内存紧张，建议开启 2G swap。详见 [infrastructure.md § 内存优化](infrastructure.md)。

| 容器 | `--memory` 上限 |
|------|----------------|
| vx-platform-pg | 400MB |
| vx-platform-redis | 128MB |
| vx-nginx | 64MB |
| vx-website / vx-console / vx-admin | 各 256MB |
| vx-website-bff / vx-console-bff / vx-admin-bff | 各 192MB |
| vx-auth-bff | 128MB |
| vx-gateway-bff | 64MB |
| **合计** | **~2,100MB** |

### worker-02（8C 24G，业务层）

| 容器 | `--memory` 上限 | 备注 |
|------|----------------|------|
| vx-ai-gateway | 1GB | |
| vx-ai-gateway-pg | 512MB | |
| vx-vela-bff-prod | 512MB | |
| vx-vela-server-prod | 2GB | LLM 编排，内存峰值较高 |
| vx-vela-pg-prod | 512MB | |
| vx-vela-redis-prod | 256MB | |
| vx-ruyin-bff-prod | 512MB | |
| vx-ruyin-server-prod | 2GB | BullMQ + LLM |
| vx-ruyin-pg-prod | 512MB | |
| vx-ruyin-redis-prod | 512MB | `noeviction`（BullMQ 禁逐出） |
| **prod 合计** | **~8.8GB** | beta 再加约 4GB，总 ~13GB，低于 24GB |

**Ruyin Redis 专项配置（BullMQ 场景）：**
```
appendonly yes           # AOF 持久化，防任务丢失
maxmemory-policy noeviction  # 禁止 key 被驱逐
```

---

## 七、数据库迁移

每个数据库实例独立执行迁移，互不干扰。

```bash
# 平台数据库（worker-01 vx-platform-pg）
pnpm --filter @vxture/core-database migrate:deploy

# AI Gateway 数据库（worker-02 vx-ai-gateway-pg）
pnpm --filter @vxture/service-ai-gateway migrate:deploy

# Vela 数据库（worker-02 vx-vela-pg-prod/beta）
pnpm --filter vela-server migrate:deploy

# Ruyin 数据库（worker-02 vx-ruyin-pg-prod/beta）
pnpm --filter @vxture/agent-server-ruyin migrate:deploy
```

首次上线平台数据库时，如已有历史数据，需先 resolve baseline：

```bash
npx prisma migrate resolve --applied "0001_schema_migration" \
  --schema=packages/core/database/prisma/schema.prisma
```
