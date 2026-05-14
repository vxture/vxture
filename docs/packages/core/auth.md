# @vxture/core-auth

> ⚠️ 待大版本重构 | 迁移自 `packages/core/auth/AGENTS.md`
> 架构层参考：[`docs/architecture/03-core-layer.md`](../../architecture/03-core-layer.md)

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/core-auth` |
| 路径 | `packages/core/auth/` |
| @layer | `Infrastructure` |

## 职责

平台级认证原语：JWT token 验证、session 工具、角色权限基础类型。
只提供平台基础设施，不包含任何业务级权限逻辑（业务权限属于 Service 层）。

## 目录结构

```
src/
├── client/       # *.client.ts  — token 验证、session 工具
├── types/        # *.types.ts   — 认证相关类型（TokenPayload、Role 等）
├── utils/        # *.utils.ts   — token 解析、权限工具函数
└── index.ts      # 单一公共出口
```

## 依赖约束

**允许：**
- `@vxture/shared`
- `jsonwebtoken` + `@types/jsonwebtoken`

**禁止：**
- NestJS / Passport.js（属于上层 BFF）
- Next.js / React / Prisma / Redis
- `@vxture/service-*` / `bff-*` / `ai-sdk` / `design-system` / `platform-*`
- 业务级权限逻辑（如「是否有购买权限」属于 service-billing）

## 文件命名

| 类型 | 规范 |
|------|------|
| 认证客户端 | `*.client.ts` |
| 类型定义 | `*.types.ts` |
| 工具函数 | `*.utils.ts` |

## 核心设计约束

- token 验证返回标准 `TokenPayload` 类型，不返回原始 decoded 对象
- 角色类型只定义平台级角色枚举（`PlatformRole`），业务角色在 service 层定义
- 不持久化任何状态（无 Redis、无 DB）

## Barrel Export 规则

```typescript
// src/index.ts
export { verifyToken, signToken } from './client/token.client'
export type { TokenPayload, PlatformRole } from './types/auth.types'
export { extractBearerToken } from './utils/token.utils'
```
