# CLAUDE.md — @vxture/core-config

AI 编码指南。每次修改本包前必须阅读。

---

## 职责边界

本包做且只做一件事：**把 `process.env` 解析成强类型的配置对象，通过 NestJS DI 注入给消费方。**

### 禁止
- ❌ 引入运行时可变配置（无 `set()` / `remove()` / `clear()`）
- ❌ 实现事件系统、订阅、watch 机制
- ❌ 自己实现 deepMerge / deepClone（在 `@vxture/shared` 里）
- ❌ 引入数据库、Redis、HTTP 客户端等运行时依赖
- ❌ 在 schema 里读取数据库或远程配置（仅读 `process.env`）
- ❌ 导入 `@vxture/service-*`、`@vxture/ai-sdk`、任何前端包
- ❌ 使用 `any` 类型

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

## 不在本包实现的能力

| 能力 | 正确位置 |
|------|---------|
| `deepMerge` / `deepClone` | `@vxture/shared` |
| 租户级别配置 | `@vxture/core-tenant` |
| 功能开关 / Feature Flag | 未来独立包 |
| 远程配置中心（Consul、Nacos） | 未来扩展，通过新 schema 或独立包 |
| 数据库连接 URL 拼接 | 各消费方的 `prisma.service.ts` |
