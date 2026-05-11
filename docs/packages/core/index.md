# Core 层通用约束

> `@layer Infrastructure` — 适用于所有 `packages/core/*` 包
> 各包的包级文档只写该包独有的内容，通用约束统一在此定义。

---

## 层定义

Core 层是 framework-agnostic 的基础设施原语，为 BFF、Service、Agent Server 提供可复用的底层能力。

## 禁止的依赖（全层适用）

| 禁止 | 原因 |
|------|------|
| NestJS / Passport.js | 属于 BFF/Application 层 |
| Next.js / React / 浏览器专用 API | 属于 Presentation 层（platform-browser 例外） |
| Prisma / Redis / HTTP 客户端 | 属于 Service/Domain 层 |
| `@vxture/service-*` / `bff-*` / `ai-sdk` / `design-system` / `platform-*` | 属于上层包 |

## 允许的内部依赖

- 所有 core 包可以引用 `@vxture/shared`
- `@vxture/core-auth` 可额外引用 `@vxture/core-config`
- **禁止** core 包之间的循环引用

## 其他约束

- 不持久化任何状态（无 Redis 连接，无 DB 连接）
- 需要双端兼容（Node.js + 浏览器），除非包名明确标注 browser-only
- 不包含任何业务逻辑（角色权限判断、价格计算等属于 Service 层）
