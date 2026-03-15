# CLAUDE.md — @vxture/core-api

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/core-api` |
| 路径 | `packages/core/api/` |
| @layer | `Infrastructure` |

---

## 职责

统一 HTTP 请求基础设施：请求封装、拦截器、错误标准化、retry / timeout。
供 BFF、Service、Agent Server 层使用。必须双端可运行（Node.js + 浏览器）。

---

## 目录结构

```
src/
├── client/       # *.client.ts  — 基于 @nestjs/axios 封装，提供类型安全的 HTTP 方法
├── module/       # *.module.ts  — 全局 HTTP 模块，注册 VxHttpClient 供所有模块使用
├── types/        # *.types.ts   — 请求 / 响应类型
├── utils/        # *.utils.ts   — retry、timeout、错误处理等纯函数工具
└── index.ts      # 单一公共出口
```

---

## 技术选型

- HTTP 客户端：@nestjs/axios（服务端专用，与 NestJS DI 集成）
- 运行环境：Node.js only（同样一致：bff、services、agent-server）

## 允许的依赖

- @vxture/shared
- @nestjs/common、@nestjs/core、@nestjs/axios（peerDependencies）
- axios（peerDependency）
- form-data（文件上传）

## 禁止的依赖

- 浏览器 API（fetch、localStorage、window）
- @vxture/service-*、bff-*、ai-sdk、design-system、platform-*
- 业务逻辑

## TypeScript

- 禁止 `any`
- 所有 export 函数必须有完整 JSDoc（`@param` / `@returns` / `@throws`）
- 纯类型导入使用 `import type`
