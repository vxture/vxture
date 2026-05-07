# CLAUDE.md — @vxture/bff-admin

> 包级 AI 编码指南。全局规范见根目录 CLAUDE.md，本文件只描述本包特有约束。

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/bff-admin` |
| 路径 | `bff/admin-bff/` |
| @layer | `Application` |
| 服务对象 | `portals/admin` |

---

## 职责

服务 portals/admin 的 BFF：平台运营后台的认证、租户管理、计费、用户等数据聚合。
对接多个 @vxture/service-* 服务，domain 较多，router 模块数量最多的 BFF。

### JWT 认证架构（重构 v1.4）

本 BFF **不签发 JWT**。认证流程如下：
1. 本地执行：IP+账号双维度限速 → 滑块验证码校验 → DB 密码验证
2. 验证通过后，通过 HTTP 调用 `auth-bff` 的 `POST /api/auth/internal/sign` 委托签发 Cookie
3. 登出同样委托 auth-bff 完成
4. JWT 验证（auth middleware 使用）保留本地 `JwtService.verify`，共享 `JWT_SECRET`

---

## 目录结构

```
src/
├── routers/        # *.router.ts（user / tenant / billing / subscription 等）
├── aggregators/    # *.aggregator.ts
├── middleware/     # auth.middleware.ts / tenant.middleware.ts
├── types/          # *.types.ts
└── index.ts
```

---

## 允许的依赖

- `@vxture/core-auth` / `@vxture/core-tenant` / `@vxture/core-*`
- `@vxture/shared`
- `@vxture/service-billing` / `@vxture/service-subscription` / `@vxture/service-ticket`
- NestJS / Passport.js / class-validator / @nestjs/swagger

## 严格禁止

- `@vxture/ai-sdk`
- `@vxture/design-system` / `platform-*`
- 跨 BFF 导入
- React / Next.js / 浏览器 API
- 业务逻辑（属于 service 层）

---

## 文件头模板

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/bff-admin
 *
 * Description: 详细说明
 *
 * @author AI-Generated
 * @date YYYY-MM-DD
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Router | Aggregator | Middleware | Types
 */
```

---

## 域扩展规则

需要新增业务域时，在 `routers/` 新增 `{domain}.router.ts`。
不得新建 BFF 包来承载额外的域。

---

## 关键约束

- 每个 router 独立 try/catch，错误不冒泡
- middleware 执行顺序：auth → tenant → router
- 响应做字段投影，不透传后端原始结构
- 禁止 any，响应 DTO 类型明确
