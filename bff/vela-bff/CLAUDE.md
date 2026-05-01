# CLAUDE.md — @vxture/bff-vela

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/bff-vela` |
| 路径 | `bff/vela-bff/` |
| @layer | `Application` |
| 服务对象 | `agent-studio/vela`（admin 和 console 两个 surface）|

---

## 职责

Vela 智能助手的专属 BFF，唯一职责：

1. 验证 JWT（来自宿主 portal 的 Cookie）
2. 校验 `X-Vela-Surface` Header × JWT `userType` 合法性
3. 构造 `CallerContext`（surface、userId、tenantId、allowedTools、dataScope）
4. 将 `/vela/chat` 请求透传给 `agent-server/vela`，SSE 流式回传

**不做**：登录/登出、业务数据聚合、直接调用 LLM、操作数据库。

---

## ⚠️ 核心约束（违反破坏安全隔离）

1. Surface 校验**只在 `surface.middleware.ts`** 做，router 不得重复校验
2. `tenantId` 只从 JWT payload 取，禁止从 request body / query 读取
3. 不得依赖 `admin-bff` / `console-bff`，vela-bff 自行验证 JWT
4. `allowedTools` 只能来自 `ADMIN_TOOLS` / `CONSOLE_TOOLS` 常量，不接受前端传入

---

## 合法的 Surface × userType 矩阵

| X-Vela-Surface | JWT userType | 结果 |
|---------------|-------------|------|
| `admin` | `operator` | ✅ CallerContext.dataScope = global |
| `admin` | `tenant_user` | ❌ 403 SURFACE_FORBIDDEN |
| `console` | `tenant_user` | ✅ CallerContext.dataScope = tenant |
| `console` | `operator` | ❌ 403 SURFACE_FORBIDDEN |

---

## 目录结构

```
src/
├── main.ts
├── app.module.ts
├── middleware/
│   ├── auth.middleware.ts        # JWT 验证，挂载 req.user
│   └── surface.middleware.ts     # Surface 校验，构造 req.callerContext
├── routers/
│   ├── chat.router.ts            # POST /vela/chat（SSE 透传）
│   └── health.router.ts
├── tools/
│   └── tool-whitelist.const.ts   # ADMIN_TOOLS / CONSOLE_TOOLS 白名单
├── types/
│   ├── caller-context.types.ts   # CallerContext、VelaSurface、VelaUserType
│   └── chat.types.ts             # 请求 DTO、VelaRequest 接口
└── index.ts
```

---

## 允许的依赖

- `@vxture/core-auth`（JWT 类型，不引入签发逻辑）
- `@vxture/core-config`（读取 JWT_SECRET、VELA_SERVER_INTERNAL_URL）
- `@vxture/shared`（AUTH_CONSTANTS 等）
- NestJS / `@nestjs/jwt` / `cookie-parser`

## 严格禁止

- `@vxture/ai-sdk`（LLM 调用在 agent-server）
- `@vxture/service-*`（数据查询在 agent-server）
- `@vxture/design-system` / `platform-*`
- 跨 BFF 导入（`bff-admin`、`bff-console` 等）
- JWT 签发逻辑（只验证，不签发）

---

## 中间件执行顺序

```
请求 → AuthMiddleware → SurfaceMiddleware → ChatRouter
```

两个中间件只应用于 `vela/*` 路由，`/health` 不经过中间件。
