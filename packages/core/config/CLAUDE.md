# CLAUDE.md — @vxture/core-config

AI 编码指南。每次修改本包前必须阅读。

---

## 职责边界

本包做且只做一件事：**把 `process.env` 解析成强类型的配置对象，通过 NestJS DI 注入给消费方。**

### 允许
- 在 `src/schemas/` 新增域 schema（zod）
- 修改 `VxConfigService` 新增类型 getter
- 修改 `VxConfigModule` 注册新域 token
- 导出 schema 推导出的 TypeScript 类型

### 禁止
- ❌ 引入运行时可变配置（无 `set()` / `remove()` / `clear()`）
- ❌ 实现事件系统、订阅、watch 机制
- ❌ 自己实现 deepMerge / deepClone（在 `@vxture/shared` 里）
- ❌ 引入数据库、Redis、HTTP 客户端等运行时依赖
- ❌ 在 schema 里读取数据库或远程配置（仅读 `process.env`）
- ❌ 导入 `@vxture/service-*`、`@vxture/ai-sdk`、任何前端包
- ❌ 使用 `any` 类型

---

## 新增配置域（标准流程）

假设要新增 `storage` 域（OSS 配置）：

**步骤 1** — 新建 schema 文件：
```
src/schemas/storage.schema.ts
```
```ts
import { z } from 'zod';

export const storageSchema = z.object({
  OSS_ENDPOINT: z.string().url(),
  OSS_BUCKET:   z.string().min(1),
  OSS_ACCESS_KEY: z.string().min(1),
  OSS_SECRET_KEY: z.string().min(1),
  OSS_REGION: z.string().default('cn-hangzhou'),
});

export type StorageConfig = z.infer<typeof storageSchema>;
```

**步骤 2** — 在 `src/schemas/index.ts` 追加导出：
```ts
export type { StorageConfig } from './storage.schema';
export { storageSchema } from './storage.schema';
```

**步骤 3** — 在 `src/types/config.types.ts` 的 `VxConfig` 接口追加：
```ts
import type { StorageConfig } from '../schemas';

export interface VxConfig {
  // ...existing
  storage: StorageConfig;  // 新增
}
```

追加 token：
```ts
export const CONFIG_TOKEN = {
  // ...existing
  STORAGE: Symbol('VX_CONFIG_STORAGE'),  // 新增
} as const;
```

**步骤 4** — 在 `src/module/config.module.ts` 的 `CONFIG_DOMAINS` 数组追加：
```ts
{ token: CONFIG_TOKEN.STORAGE, schema: storageSchema, name: 'storage' },
```

**步骤 5** — 在 `src/service/config.service.ts` 追加注入和 getter：
```ts
@Optional() @Inject(CONFIG_TOKEN.STORAGE) private readonly _storage: StorageConfig,

get storage(): StorageConfig {
  this.assertLoaded(this._storage, 'storage');
  return this._storage;
}
```

**步骤 6** — 在 `src/index.ts` 追加导出：
```ts
export { storageSchema } from './schemas';
export type { StorageConfig } from './schemas';
```

完成。消费方在 `VxConfigModule.register({ domains: ['app', ..., 'storage'] })` 后即可注入。

---

## 依赖规则

```
@vxture/core-config
  ✅ zod（唯一运行时依赖）
  ✅ @nestjs/common（peerDependency）
  ✅ @nestjs/core（peerDependency）
  ❌ @vxture/shared（本包不需要，utils 已移除）
  ❌ @vxture/service-*
  ❌ @vxture/ai-sdk
  ❌ 任何数据库 / HTTP 客户端
```

---

## 测试规范

- 单元测试中使用 `{ provide: CONFIG_TOKEN.XXX, useValue: mockConfig }` 覆盖，不读真实 env
- `strict: false` 仅用于测试场景，避免 `process.exit(1)` 中断测试进程
- 每个 schema 文件对应一个测试文件，覆盖：必填缺失、类型强转（string→number）、默认值、非法值

---

## 不在本包实现的能力

| 能力 | 正确位置 |
|------|---------|
| `deepMerge` / `deepClone` | `@vxture/shared` |
| 租户级别配置 | `@vxture/core-tenant` |
| 功能开关 / Feature Flag | 未来独立包 |
| 远程配置中心（Consul、Nacos） | 未来扩展，通过新 schema 或独立包 |
| 数据库连接 URL 拼接 | 各消费方的 `prisma.service.ts` |
