# 数据库设计索引

> Vxture 采用**多 PostgreSQL 容器**架构，按部署节点和业务域隔离。
> 平台控制面数据由 `@vxture/core-database`（Prisma）统一管理；
> 每个业务数据面维护独立的 PostgreSQL 容器，各自持有独立 Prisma schema。

---

## 容器分布

| 容器 | 节点 | 数据库名 | 管理方 |
|------|------|---------|--------|
| `vx-platform-pg` | worker-01 | `vxturestudio_platform_main` | `@vxture/core-database` |
| `vx-ai-gateway-pg` | worker-02 | `vxturebiz_aigateway_main` | `services/ai/gateway`（独立 Prisma） |
| `vx-vela-pg` | worker-02 | `vxturebiz_vela_main` | `agent-server/vela`（独立 Prisma） |
| `vx-ruyin-pg` | worker-02 | `vxturebiz_ruyin_main` | `agent-server/ruyin`（独立 Prisma） |

---

## 平台库 Schema 分布（`vx-platform-pg`）

| Schema | 表数 | 主要消费方 |
|--------|------|-----------|
| `account` | 6 | website-bff, console-bff |
| `tenancy` | 9 | website-bff, console-bff, admin-bff |
| `product` | 7 | admin-bff, ai-gateway |
| `platform` | 5 | admin-bff |
| `support` | 2 | admin-bff, vela-server |
| `commerce` | 9 | admin-bff, ai-gateway |

권위参考：`packages/core/database/prisma/schema.prisma`

---

## 业务库 Schema（各自独立容器）

| 容器 | Schema | 主要消费方 |
|------|--------|-----------|
| `vx-ai-gateway-pg` | `ai_gateway` | ai-gateway 服务 |
| `vx-vela-pg` | `vela` | agent-server/vela |
| `vx-ruyin-pg` | `ruyin` | agent-server/ruyin |

业务库不存储平台数据（用户、订阅、支付等），只保留 `tenant_id` / `user_id` 用于关联。

---

## 架构原则

**平台库只有 Prod**：订阅、支付、租户、权限数据不允许双份。

**业务库支持 beta/prod 双环境**：每个业务的 beta 数据库与 prod 完全隔离，beta 数据可清理归档。

**禁止跨容器 JOIN**：跨库关联通过 BFF 聚合层（application code），禁止 DB 层跨容器 JOIN。

---

## 平台库变更流程

```bash
# 1. 修改 packages/core/database/prisma/schema.prisma
# 2. 生成并应用迁移
pnpm --filter @vxture/core-database migrate:dev

# 首次对接已有 DB（一次性）
npx prisma migrate resolve --applied "0000_baseline" \
  --schema=packages/core/database/prisma/schema.prisma
```

详见 [`docs/packages/core/database.md`](../packages/core/database.md)。

业务库（vela / ruyin / ai-gateway）迁移命令见各自 `agent-server/` 或 `services/` 目录内的 Prisma 配置。

---

## 完整部署架构

见 [`docs/deployment/services.md`](../deployment/services.md) — 包含各 PostgreSQL 容器的 Compose 配置、网络隔离和资源规格。
