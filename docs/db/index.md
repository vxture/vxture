# 数据库设计索引

> Vxture 使用单一 PostgreSQL 实例，通过多 Schema 隔离不同业务域。
> DDL 由 `@vxture/core-database`（Prisma）统一管理。

---

## Schema 分布

| Schema | 表数 | 管理包 | 主要消费方 |
|--------|------|--------|-----------|
| `account` | 6 | `@vxture/core-database` | website-bff, console-bff |
| `tenancy` | 9 | `@vxture/core-database` | website-bff, console-bff, admin-bff |
| `product` | 7 | `@vxture/core-database` | admin-bff, ai-gateway |
| `platform` | 5 | `@vxture/core-database` | admin-bff |
| `support` | 2 | `@vxture/core-database` | admin-bff, vela-server |
| `commerce` | 9 | `@vxture/core-database` | admin-bff, ai-gateway |
| `ai_gateway` | 7 | `services/ai/gateway`（独立 Prisma） | ai-gateway |
| `vela`（隐式） | 3 | `agent-server/vela`（独立 Prisma） | vela-server |

---

## DDL 文件

历史设计 SQL 文件位于 [`schemas/`](schemas/)，迁移记录位于 [`migrations/`](migrations/)。

> ⚠️ SQL 文件为设计参考，以 `packages/core/database/prisma/schema.prisma` 为权威。

---

## 变更流程

```bash
# 1. 修改 packages/core/database/prisma/schema.prisma
# 2. 生成迁移文件
pnpm --filter @vxture/core-database migrate:dev

# 3. 首次对接已有 DB（执行一次）
npx prisma migrate resolve --applied "0000_baseline" \
  --schema=packages/core/database/prisma/schema.prisma
```

详见 `docs/packages/core/database.md`。
