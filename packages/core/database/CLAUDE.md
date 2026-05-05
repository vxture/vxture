# CLAUDE.md — @vxture/core-database

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/core-database` |
| 路径 | `packages/core/database/` |
| @layer | `Infrastructure` |

---

## 职责

**唯一职责**：用 Prisma 管理平台手动维护的 6 个 PostgreSQL schema 的 DDL（表结构）。

- 不提供 Prisma Client 给业务层使用（各 service 自行决定是否引入）
- 不包含任何查询逻辑、业务逻辑
- 是所有表结构变更的**唯一入口**（schema 变更必须通过此包的 migration）

---

## 覆盖 Schema

| Schema | 表数 | 说明 |
|--------|------|------|
| `account` | 6 | 全局账号体系 |
| `tenancy` | 9 | 租户体系 |
| `product` | 7 | 产品目录（Plan / Agent / Feature）|
| `platform` | 5 | 平台管理员 + RBAC |
| `support` | 2 | 工单系统 |
| `commerce` | 9 | 商业化（账单 / 订阅 / 支付 / 退款）|

**排除**（已由 `services/ai/gateway/prisma/schema.prisma` 管理）：
- `commerce.tenant_subscription_quota`
- `commerce.tenant_usage_event`
- `commerce.tenant_usage_summary`

---

## 常用命令

```bash
# 查看当前 schema 与 DB 的 drift
pnpm --filter @vxture/core-database migrate:dev

# 基线：将 0000_baseline 标记为已应用（首次对接已有 DB 时执行一次）
npx prisma migrate resolve --applied "0000_baseline" --schema=prisma/schema.prisma

# 生成 Prisma Client（可选，通常只需要 migrate）
pnpm --filter @vxture/core-database generate
```

---

## 修改规范

1. **只改 `prisma/schema.prisma`**，禁止直接手写 migration SQL
2. 改完后运行 `migrate:dev` 让 Prisma 生成 migration 文件
3. 结构性变更（删列、改类型）必须评估对现有 pg.Pool 查询代码的影响
4. 新增表后，同步更新 `docs/vxture-db-design/` 对应 SQL 设计文件

---

## 禁止的依赖

- 任何业务包（`service-*`、`bff-*`、`agent-*`）
- `@vxture/design-system`、`platform-*`
- 浏览器 API
