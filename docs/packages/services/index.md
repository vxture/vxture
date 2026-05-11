# Services 层通用约束

> `@layer Domain` — 适用于所有 `services/*/*` 包
> 各服务文档只写该服务独有的业务设计，通用约束统一在此定义。

---

## 包结构模板

```
src/
├── module/       ← NestJS Module 定义（对外注册点）
├── service/      ← 业务逻辑
├── repository/   ← Prisma / pg.Pool 数据访问
├── tokens.ts     ← DI Symbol tokens（跨包注入用）
├── types/        ← 类型定义
└── index.ts      ← 公共出口（只导出 module / service / types，不导出 repository）
```

## 跨包引用规则

- **服务间禁止直接 import**（cross-service 通信只走 BFF/Server 层 HTTP）
- 禁止被 `portals/*` / `agent-studio/*` / `business/*` 直接引用
- 可以被 `bff/*` / `agent-server/*` 以 NestJS Module 形式组合使用

## Barrel Export 约束

```typescript
// ✅ src/index.ts 只导出这些
export { XxxModule } from './module/xxx.module'
export { XxxService } from './service/xxx.service'
export type { XxxDto, XxxResult } from './types/xxx.types'

// ❌ 禁止导出 Repository（实现细节，不属于公共契约）
```

## 其他约束

- 服务是 NestJS Module **库**，不是独立应用，不监听端口
- 所有 Prisma 操作封装在 repository 层，service 不直接调用 `prisma.*`
- 禁止 React / Next.js / 浏览器 API
