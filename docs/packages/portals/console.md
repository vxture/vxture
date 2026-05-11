# @vxture/console

> 架构层参考：[`docs/architecture/index.md`](../../architecture/index.md)

---

## 包信息

| 项 | 值 |
|----|-----|
| 包名 | `@vxture/console` |
| 路径 | `portals/console/` |
| @layer | `Presentation` |
| 框架 | Next.js 15（App Router） |
| 端口 | 3020 |

## 职责

租户工作台：面向租户管理员，管理租户成员、订阅、权限、设置等。
Vela 智能助手嵌入点（console surface），入口文件 `app/[locale]/(console)/ConsoleVelaPanel.tsx`。

## 路由结构

```
app/
├── layout.tsx                        ← 根布局
├── [locale]/
│   ├── (auth)/signin/                ← 登录页
│   └── (console)/
│       ├── layout.tsx                ← Console 布局（含 ConsoleVelaPanel）
│       ├── page.tsx                  ← 首页 / 仪表板
│       ├── billing/                  ← 账单管理
│       ├── iam/                      ← 身份与访问管理
│       ├── invitations/              ← 邀请管理
│       ├── members/                  ← 成员管理
│       ├── model-gateway/            ← 模型网关配置
│       ├── notifications/            ← 通知设置
│       ├── organization/             ← 组织信息
│       ├── personal-tenant/          ← 个人租户设置
│       ├── profile/                  ← 个人资料
│       ├── quotas/                   ← 配额管理
│       ├── roles/                    ← 角色管理
│       ├── security/                 ← 安全设置
│       ├── settings/                 ← 租户设置
│       ├── subscription/             ← 订阅管理
│       ├── tenant-settings/          ← 高级租户配置
│       └── todos/                    ← 待办事项
├── iam/                              ← （根级路由，待确认用途）
└── subscription/                     ← （根级路由，待确认用途）
```

## BFF 接口（console-bff）

| Router 文件 | 职责 |
|-------------|------|
| `auth.router.ts` | 登录 / 登出 / token 刷新 |
| `me.router.ts` | 当前用户信息 |
| `iam.router.ts` | 成员 / 角色 / 权限查询 |
| `billing.router.ts` | 账单信息 |
| `subscription.router.ts` | 订阅信息 / feature 开关 |
| `capabilities.router.ts` | 功能能力列表 |
| `tenant-context.router.ts` | 租户上下文 |
| `phone-auth.router.ts` | 手机号认证 |

## 依赖约束

```typescript
✅ @vxture/design-system / @vxture/shared / @vxture/core-locale
✅ console-bff（HTTP only）
❌ @vxture/service-* / core-auth / core-api / core-config / core-tenant
❌ @vxture/ai-sdk / agent-server/*
```
