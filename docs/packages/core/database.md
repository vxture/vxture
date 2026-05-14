# @vxture/core-database

> ⚠️ 待大版本重构 | 迁移自 `packages/core/database/CLAUDE.md`
> 架构层参考：[`docs/architecture/03-core-layer.md`](../../architecture/03-core-layer.md)
> 数据库设计：[`docs/db/index.md`](../../db/index.md)

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/core-database` |
| 路径 | `packages/core/database/` |
| @layer | `Infrastructure` |

## 职责

**唯一职责**：用 Prisma 管理平台手动维护的 6 个 PostgreSQL schema 的 DDL（表结构）。

- 不提供 Prisma Client 给业务层（各 service 自行决定是否引入）
- 不包含任何查询逻辑、业务逻辑
- 是所有表结构变更的**唯一入口**

## 覆盖 Schema

| Schema | 表数 |
|--------|------|
| `account` | 6 |
| `tenancy` | 9 |
| `product` | 7 |
| `platform` | 5 |
| `support` | 2 |
| `commerce` | 9 |

**排除**（由 `services/ai/gateway` 独立管理）：`commerce.tenant_subscription_quota` 等

## 常用命令

```bash
# 查看 drift
pnpm --filter @vxture/core-database migrate:dev

# 首次对接已有 DB（执行一次）
npx prisma migrate resolve --applied "0000_baseline" \
  --schema=packages/core/database/prisma/schema.prisma

# 生成 Prisma Client（可选）
pnpm --filter @vxture/core-database generate
```

## 修改规范

1. 只改 `prisma/schema.prisma`，禁止直接手写 migration SQL
2. 改完后运行 `migrate:dev` 让 Prisma 生成 migration 文件
3. 结构性变更必须评估对现有 pg.Pool 查询代码的影响
4. 新增表后，同步更新 `docs/db/` 对应设计文件

## 禁止的依赖

- 任何业务包（`service-*` / `bff-*` / `agent-*`）
- `@vxture/design-system` / `platform-*`
- 浏览器 API
