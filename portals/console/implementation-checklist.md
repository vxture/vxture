# Console MVP 实施清单

## 已落地

- `portals/console` Next.js 应用骨架
- 统一控制台壳层：`Header`、`Sidebar`、`Breadcrumb`
- 会话恢复 provider 与 `console-bff` API 适配器
- capability 驱动菜单过滤
- `overview`、`iam`、`subscription` 三个页面入口
- `organization`、`pricing` 等后续模块注册位

## 下一步

- 新增 `bff/console-bff` NestJS 骨架
- 打通 `/api/me`、`/api/capabilities`、`/api/tenant-context`
- 让前端从 mock fallback 切到真实 BFF 返回
- 在根工作区加入 `console` 与 `console-bff` 的脚本/引用
- 明确旧 `admin/tenant` 入口迁移策略
